/*jslint devel:true*/
/*global Config, Model, Ui, app*/

var App = null;

(function () { // strict mode wrapper
	'use strict';

	/**
	 * Creates a new application object
	 *
	 * @class Application
	 */
	App = function App() {};

	App.prototype = {
		/**
		 * @type Array
		 */
		requires: ['js/app.config.js', 'js/app.model.js', 'js/app.ui.js', 'js/app.ui.templateManager.js', 'js/app.ui.templateManager.modifiers.js'],
		/**
		 * @type Config
		 */
		config: null,
		/**
		 * @type Model
		 */
		model: null,
		/**
		 * @type Ui
		 */
		ui: null,
		/**
		 * @type bool
		 */
		fullDay: false,
		/**
		 * @type bool
		 */
		alarm: false,
		/**
		 * @type CalendarAlarm
		 */
		alarmN: null,
		/**
		 * @type Date
		 */
		lastDateLoaded: null,
		/**
		 * @type Integer
		 */
		eventId: 0,

		homeDateFilter: new Date(),

		/**
		 * Initialisation function
		 */
		init: function init() {
			// instantiate the libs
			this.config = new Config();
			this.model = new Model();
			this.ui = new Ui();

			// initialise the modules
			this.model.init(this);
			this.ui.init(this);

			return this;
		},

		/**
		 * Application exit from model
		 */
		exit: function exit() {
			this.model.exit();
		},

		/**
		 * Toggle this.fullDay
		 * @returns {boolean} variable state after the toggle
		 */
		switchFullDay: function switchFullDay() {
			this.fullDay = !this.fullDay;
			return this.fullDay;
		},

		/**
		 * read initial alarm setting
		 */
		setAlarm: function setAlarm(duration) {
			if (duration != -1) {
				this.alarmN = this.model.getCalendarAlarm(duration, "EventManager Reminder");
				this.alarm = true;
			} else {
				this.alarmN = [];
				this.alarm = false;
			}
		},

		/**
		 * Read the radio buttons and set this.alarm and this.alarmN accordingly
		 */
		switchAlarm: function switchAlarm() {
			var duration = -1;
			duration = this.ui.alarm.getValue();
			this.setAlarm(duration);
			app.ui.alarm.updateDurationLabel();
			$.mobile.changePage('#new_event');
		},

		retrieveTimeDurationInMinutes: function(duration) {
			switch (duration.unit) {
			case "MSECS":
				return (duration.length / (60 * 1000));
			case "SECS":
				return (duration.length / 60);
			case "MINS":
				return duration.length;
			case "HOURS":
				return (duration.length * 60);
			case "DAYS":
				return (duration.length * 60 * 24);
			}
			return duration.length;
		},

		/**
		 * Create a new event in the default calendar,
		 * based on values found in #title, #des, #location
		 * and this.fullDay variable
		 */
		addEvent: function addEvent(e, callback) {
			var selectedDate = '',
				eventDate = null,
				duration = 0,
				calendarItemInit = null,
				fullDay = false;

			fullDay = this.ui.home.getAllDayInfo();
			selectedDate = this.ui.home.getStartDate();

			duration = this.calculateDuration(
				selectedDate,
				this.ui.home.getEndDate(),
				fullDay
			);

			eventDate = this.createTZDateFromString(selectedDate);

			calendarItemInit = {
				startDate: eventDate,
				isAllDay: fullDay,
				duration: duration,
				summary: this.ui.home.getTitle()
			};
			this.calendarItemInit = calendarItemInit;

			if (this.alarmN) {
				calendarItemInit.alarms = [this.alarmN];
			}
			try {
				this.model.addEventToDefaultCalendar(calendarItemInit);
			} catch (ex) {
				console.error(ex.message);
			}

			this.changeHomeDateFilter(new Date(selectedDate));
			this.loadEvents(eventDate);
			if (typeof callback === 'function'){
				callback();
			}
		},

		updateEvent: function (e, callback) {
			var new_values, selectedDate, duration, fullDay;

			selectedDate = this.ui.home.getStartDate();
			fullDay = this.ui.home.getAllDayInfo();

			duration = this.calculateDuration(
				selectedDate,
				this.ui.home.getEndDate(),
				fullDay
			);

			new_values = {
				startDate: this.createTZDateFromString(selectedDate),
				duration: duration,
				summary: this.ui.home.getTitle(),
				isAllDay: fullDay,
				alarms: []
			};

			if (this.alarmN) {
				new_values.alarms = [this.alarmN];
			}
			this.model.updateEvent(app.eventId, new_values);

			this.changeHomeDateFilter(new Date(selectedDate));
			this.loadEvents();
			if (typeof callback === 'function'){
				callback();
			}
		},

		changeHomeDateFilter: function (date) {
			this.homeDateFilter = date;
			app.ui.home.updateHomeDateFilter();
		},

		/**
		 * Calculates time duration
		 *
		 * If fullDay, then duration  The duration must be n*60*24 minutes for an event lasting n days.
		 *
		 * @param {string} startDate
		 * @param {string} endDate
		 * @param {bool=} fullDay 'false' by default
		 * @returns {TimeDuration}
		 */
		calculateDuration: function calculateDuration(startDate, endDate, fullDay) {
			if (fullDay) {
				return new tizen.TimeDuration(24*60-1, "MINUTES");
			}
			startDate = new Date(startDate);
			endDate = new Date(endDate);
			// duration in minutes
			return this.model.getTimeDuration(
				Math.round((endDate.getTime() - startDate.getTime()) / 60000)
			);
		},

		/**
		 * Create a TZDate object for the given date string, all assuming
		 * using the local timezone
		 *
		 * @param {string} dateString Local date/datetime
		 */
		createTZDateFromString: function (dateString) {
			var date = null,
				tzDate = null;
			date = new Date(dateString);
			tzDate = this.model.createTZDateFromDate(date);
			return tzDate;
		},

		/**
		 * Load all scheduled events
		 */
		loadEvents: function loadEvents() {
			this.model.getEventsFromDefaultCalendar(
				undefined, // we always load all events now
				this.ui.home.onEventSearchSuccess.bind(this.ui.home), // Load events into the UI
				this.ui.home.onEventSearchError.bind(this.ui.home)
			);
		}

	};
}());