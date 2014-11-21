/*jslint devel:true*/
/*global tizen  */

/**
 * @class Model
 */
var Model = function Model() {
	'use strict';
};

(function () { // strict mode wrapper
	'use strict';
	Model.prototype = {

		/**
		 * @type Long
		 */
		listenerId: 0,
		/**
		 * Model module initialisation
		 */
		init: function Model_init(app) {
			this.app = app;
			this.addEventListener();
		},

		/**
		 * Creates a TimeDuration object corresponding to the given duration
		 * in minutes
		 *
		 * @param {int} minutes Duration in minutes
		 * @return {TimeDuration}
		 */
		getTimeDuration: function Model_getTimeDuration(minutes) {
			if (minutes === 0) {
				return new tizen.TimeDuration(minutes, "MINS");
			}
			if (minutes % 1440 === 0) {
				return new tizen.TimeDuration(minutes / 1440, "DAYS");
			}
			if (minutes % 60 === 0) {
				return new tizen.TimeDuration(minutes / 60, "HOURS");
			}
			return new tizen.TimeDuration(minutes, "MINS");
		},

		/**
		 * Creates a CalendarAlarm with the given duration
		 *
		 * @param {int} minutes Alarm duration in minutes
		 * @returns {CalendarAlarm}
		 */
		getCalendarAlarm: function Model_getCalendarAlarm(minutes, description) {
			var timeDuration,
				calendarAlarm;

			timeDuration = this.getTimeDuration(minutes);
			calendarAlarm = new tizen.CalendarAlarm(timeDuration, "DISPLAY", description);
			return calendarAlarm;
		},

		/**
		 * Create a new event and add it to the default calendar
		 *
		 * @param {Object} calendarItemInit
		 * @config {TZDate} [startDate]
		 * @config {bool} [isAllDay]
		 * @config {TimeDuration} [duration]
		 * @config {string} [summary]
		 * @config {string} [description]
		 * @config {string} [location]
		 */
		addEventToDefaultCalendar: function Model_addEventToDefaultCalendar(calendarItemInit) {
			var calendar = null,
				event = null;


			calendar = this.getCalendar();
			event = new tizen.CalendarEvent(calendarItemInit);
			calendar.add(event);
		},

		getCalendar: function Model_getCalendar() {
			return tizen.calendar.getDefaultCalendar("EVENT"); // get the default calendar
		},

		/**
		 * Find all events in the default calendar on the given date
		 *
		 * @param {string} date date (in local time)
		 * @param {function} onSuccess success callback
		 * @param {function} onError error callback
		 */
		getEventsFromDefaultCalendar: function Model_getEventsFromDefaultCalendar(date, onSuccess, onError) {
			var calendar = null, filter = null;

			calendar = this.getCalendar();

			// show all events
			filter = this.getStartDateFilter(app.homeDateFilter);

			calendar.find(onSuccess, onError, filter);
		},

		/**
		 * Create a startDate attribute range filter for the given day
		 *
		 * @param {Date} date
		 * @returns {AttributeRangeFilter}
		 */
		getStartDateFilter: function Model_getStartDateFilter(date) {
			var today    = new tizen.TZDate(date.getFullYear(), date.getMonth(), date.getDate()),
				tomorrow = new tizen.TZDate(date.getFullYear(), date.getMonth(), date.getDate()+1);
			return new tizen.CompositeFilter(
				"UNION",
				[
					new tizen.CompositeFilter(
						"INTERSECTION",
						[
							new tizen.AttributeFilter("isAllDay", "EXACTLY", false),
							new tizen.AttributeRangeFilter("startDate", null, tomorrow),
							new tizen.AttributeRangeFilter("endDate", today, null)
						]
					),
					new tizen.CompositeFilter(
						"INTERSECTION",
						[
							new tizen.AttributeFilter("isAllDay", "EXACTLY", true),
							new tizen.AttributeRangeFilter("startDate", tomorrow, tomorrow),
						]
					)
				]
			);
		},

		isEventExists: function(event_id, success, error) {
			var myCalendar = this.getCalendar();
			error = error || new Function;
			success = success || new Function;
			try {
				myCalendar.get(new tizen.CalendarEventId(event_id));
				success();
			} catch(e) {
				error(e);
			}
		},

		/**
		 * @param {string} event_id
		 */
		deleteEvent: function Model_deleteEvent(event_id) {
			var myCalendar = this.getCalendar();
			myCalendar.remove(new tizen.CalendarEventId(event_id));
			this.app.loadEvents(); // reload the list
		},

		/**
		 * @param {string} event_id
		 */
		editEvent: function Model_editEvent(event_id) {
			var myCalendar = this.getCalendar();
			return myCalendar.get(new tizen.CalendarEventId(event_id));
		},

		/**
		 * @param {string} event_id
		 * @param {Object} new_values
		 */
		updateEvent: function Model_updateEvent(event_id, new_values) {
			var myCalendar = this.getCalendar(), new_event, prop,
				event = myCalendar.get(new tizen.CalendarEventId(event_id));

			for (prop in new_values) {
				if (new_values.hasOwnProperty(prop)) {
					event[prop] = new_values[prop]; // copy new values into the event object
				}
			}

			myCalendar.update(event, false); // save to myCalendar
		},

		/**
		 * @param {Date} date
		 * @returns {TZDate} date with timezone info
		 */
		createTZDateFromDate: function Model_createTZDateFromDate(date) {
			return new tizen.TZDate(date);
		},

		/**
		 * Add event change listener
		 */
		addEventListener: function Model_addEventListener () {
			var myCalendar = this.getCalendar(),
				listener = {
				onitemsadded: function(items) {
					this.app.loadEvents(); // reload the list
				},
				onitemsupdated: function(items) {
					this.app.loadEvents(); // reload the list
				},
				onitemsremoved: function(ids) {
					this.app.loadEvents(); // reload the list
				}
			};
			this.listenerId = myCalendar.addChangeListener(listener);
		},
		/**
		 * Exit from the application
		 */
		exit: function () {
			var myCalendar = this.getCalendar();

			tizen.application.getCurrentApplication().exit();
			myCalendar.removeChangeListener(this.listenerId);
		}
	};
}());


