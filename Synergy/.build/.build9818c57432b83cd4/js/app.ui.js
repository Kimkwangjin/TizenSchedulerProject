/*jslint devel: true*/
/*global $, app, tizen, TemplateManager */

/**
 * @class Ui
 */
function Ui() {
	'use strict';
}

(function () { // strict mode wrapper
	'use strict';
	Ui.prototype = {

		templateManager: null,

		monthNames: ([
			"January", "February", "March", "April", "May", "June",
			"July", "August", "September", "October", "November", "December"
		]),
		/**
		 * UI module initialisation
		 */
		init: function UI_init(app) {
			this.app = app;
			this.templateManager = new TemplateManager();
			$(document).ready(this.domInit.bind(this));

			// init inner objects
			this.home.context = this;
			this.alarm.context = this;
			this.new_event.context = this;
		},

		/**
		 * When DOM is ready, initialise it
		 */
		domInit: function UI_domInit() {
			this.templateManager.loadToCache(['home', 'alarm', 'new_event', 'event', 'all_day_event'], this.initPages.bind(this));
			// Disable text selection
			$.mobile.tizen.disableSelection(document);
		},

		/**
		 * Append pages to body and initialise them
		 */
		initPages: function UI_initPages() {
			var pages = [];

			pages.push(this.templateManager.get('home'));
			pages.push(this.templateManager.get('alarm'));
			pages.push(this.templateManager.get('new_event'));

			$('body').append(pages.join(''));
			this.fixContentHeight();

			this.home.init();
			this.alarm.init();

			if (!app.ui.new_event.initialized) {
				app.ui.new_event.init();
			}

			$(":jqmData(role='tabbar')").first().delegate( "a", "vmouseup", function ( event ) {
				$(this).removeClass( $.mobile.activeBtnClass );
			});

			$("#new_event").on('pagebeforeshow', function () {
				app.ui.new_event.updateDateFormat();
				app.ui.new_event.setStartDate();
				app.ui.new_event.setEndDate();
				$('#add-event-btn').removeClass('disabled');
				// workaround for N_SE-43733
				$(".ui-datefield-selected").removeClass('ui-datefield-selected');
				$(".ui-popupwindow").hide();
			});

			$(document).ready(function () {
				if ($('input[type=radio]:checked').val() !== 'Yes') {
					$("#customDuration")
						.val("")
						.addClass('ui-disabled')
						.prop('disabled', true)
						.data("placeholder", "0");
				}

				$('input[type=radio]').change( function () {
					if ($(this).val() === 'Yes') {
						$("#customDuration").removeClass('ui-disabled');
						$("#customDuration").prop('disabled', false);
						$("#customDuration").focus();
					} else {
						$("#customDuration").blur();
						$("#customDuration").addClass('ui-disabled')
							.data("placeholder", "0");
						$("#customDuration").prop('disabled', true);
					}
				});

				$('#customDuration').on('blur', function () {
					if ($('input[type=radio]:checked').val() === 'Yes') {
						var value = Math.abs(parseInt($(this).val()));
						if (isNaN(value)) {
							value = 0;
						}
						$(this).val(value);
					}
					$('input[type=radio]').checkboxradio('refresh');
				});
			});
			$(".customDuration, #customDuration").on("click change", function (e) {
				if ($(this).attr("checked")) {
					$("#yes_1").attr('checked', true).checkboxradio('refresh');
					$.each($('#new_alarm input:radio'), function () {
						$(this).attr('checked', $(this).val() === 'Yes')
							.checkboxradio('refresh');
					});
					$("#customDuration")
						.removeClass('ui-disabled')
						.prop('disabled', false)
						.trigger("focus");
				}
			});

			$( window ).resize(function (event) {
				if($.mobile.activePage.attr('id') == "new_alarm") {
					var content = $("#new_alarm [data-role=content]"),
						customDuration = $("#customDuration"),
						size = customDuration.position().top + customDuration.outerHeight();
					content.scrollview('scrollTo', 0, -1 * size, 0);
				}
			});

			document.addEventListener('webkitvisibilitychange', function (event) {
				app.ui.new_event.updateDateFormat(true);
				if (document.webkitVisibilityState === 'visible') {
					if ($.mobile.activePage.attr('id') === "new_event"
						|| $.mobile.activePage.attr('id') === "new_alarm" ) {
						if (app.eventId !== 0) {
							app.model.isEventExists(app.eventId, null, function () {
								$.mobile.changePage('#home');
							});
						}
					}
				}
			});

			$("input#customDuration").on("keypress",function (e) {
				if(/[^0-9]/.test(String.fromCharCode(e.keyCode))) {
					e.preventDefault();
					e.stopPropagation();
				}
			});
			$("input#customDuration").on("input keyup", function (e) {
				var val = parseInt($(this).val(), 10),
					max = parseInt($(this).attr("max"), 10),
					min = 0;

				if (val > max){
					$(this).val(max);
				} else if (val < min) {
					$(this).val(min);
				}
			});

			window.addEventListener('tizenhwkey', function(e) {
				if (e.keyName == "back") {
					if ($.mobile.activePage.attr('id') === 'home') {
						tizen.application.getCurrentApplication().exit();
					} else if ($.mobile.activePage.attr('id') === 'new_event') {
						$.mobile.changePage("#home");
					} else {
						history.back();
					}
				}
			});

			$.mobile.changePage('#home', 'pop', false, true);
		},

		/**
		 * Contains methods related to the #home page
		 * @namespace
		 */
		home: {
			init: function UI_home_init() {
				var app = this.context.app, self = this, alarm = this.context.alarm;

				$("#demo-date-1, #demo-date-2").datetimepicker();
				$("#allDay").slider();

				$('#exit_btn').on('click', app.exit.bind(app));
				$("input:radio").checkboxradio();
				alarm.setValue(-1);
				alarm.updateDurationLabel();

				// buttons in the events list
				$('#events_list').on('click', '.remove_event_btn', function () {
					var eventId = $(this).parents('.event').data('eventid');
					app.ui.popup('Are you sure?', {
						'No': function () {
							$("#popup").popup('close');
						},
						'Yes': function () {
							app.model.isEventExists(eventId, function () {
								app.model.deleteEvent(eventId);
								$("#popup").popup('close');
							}, function () {
								app.ui.popup("Selected event does not exist.", {
									'OK': function () {
										$("#popup").popup('close');
									}
								});
							});
						}
					});
				});

				$('#events_list').on('click', '.edit_event_btn', function () {
					var eventId = $(this).parents('.event').data('eventid'),
						event = app.model.editEvent(eventId),
						field,
						date,
						duration,
						key,
						properties = ['summary', 'startDate', 'endDate'];

					$("#demo-date-1").datetimepicker();
					$("#demo-date-2").datetimepicker();
					app.eventId = eventId;
					properties.forEach(function(element){
						if (event.hasOwnProperty(element)) {
							field = $('#new_event input[name="' + element + '"]');

							if (field.length !== 0) {
								if (field.attr('type') === 'datetime') {
									date = self.TZD2Date(event[element]);
									field.datetimepicker('value', date);
								} else {
									field.val(event[element]);
								}
							}
						}
					});

					$('#new_event h1').text('Edit event');

					if (event.alarms.length !== 0) {
						if (event.alarms[0].before !== null) {
							duration = app.retrieveTimeDurationInMinutes(event.alarms[0].before);
						} else {
							duration = 0;
						}
					}

					if(typeof duration == "undefined") {
						duration = -1;
					}
					alarm.setValue(duration);
					alarm.updateDurationLabel();

					$.mobile.changePage("#new_event");
					// set select allDay property
					app.ui.new_event.setSelectAllDay(event.isAllDay);
					app.ui.new_event.updateDateFormat();
				});

				$('#newEventBtn').on('click', function () {
					app.eventId = 0;
					$("#demo-date-1").datetimepicker("value", new Date());
					$("#demo-date-2").datetimepicker("value", new Date());
					// workaround - if just initied once again, datepickers remembers the date
					$('#new_event h1').text('New event');
					$('#title').val('');
					app.ui.new_event.setSelectAllDay(false);
					app.ui.new_event.updateDateFormat();
					alarm.setValue(0);
					alarm.updateDurationLabel();
				});

				$("#homeDateFilter").change(function () {
					$("#exit_btn").blur();
					app.homeDateFilter =
						app.ui.new_event.getDateFromPicker($(this));
					app.loadEvents();
				});

				this.loadEvents();
			},

			TZD2Date: function (tzdate) {
				return new Date(
					tzdate.getFullYear(),
					tzdate.getMonth(),
					tzdate.getDate(),
					tzdate.getHours(),
					tzdate.getMinutes(),
					tzdate.getSeconds(),
					tzdate.getMilliseconds()
				);
			},

			/**
			 * Get start date value from the form (#demo-date-1 field)
			 *
			 * @returns {string}
			 */
			getStartDate: function UI_home_getStartDate() {
				var startDate = $('#demo-date-1').attr('data-date');
				return startDate;
			},

			/**
			 * Get info if event is allDay event
			 *
			 * @returns {boolean}
			 */
			getAllDayInfo: function UI_home_getAllDayInfo() {
				var isAllDay = $('select#allDay').val() == '1' ? true : false;
				return isAllDay;
			},
			/**
			 * Get end date value from the form (#demo-date-2 field)
			 *
			 * @returns {string}
			 */
			getEndDate: function UI_home_getEndDate() {
				var endDate = $('#demo-date-2').attr('data-date');
				return endDate;
			},
			/**
			 * Get the title from the form (#title field)
			 *
			 * @returns {string}
			 */
			getTitle: function UI_home_getTitle() {
				return $('#title').val();
			},
			/**
			 * Get the description from the form (#des field)
			 *
			 * @returns {string}
			 */
			getDescription: function UI_home_getDescription() {
				return $('#des').val();
			},
			/**
			 * Get the location from the form (#location field)
			 *
			 * @returns {string}
			 */
			getLocation: function UI_home_getLocation() {
				return $('#location').val();
			},
			/**
			 * Wrapper for app.loadEvents
			 * @param {Object} e event
			 * @param {Date} date selected date
			 */
			loadEvents: function UI_home_loadEvents(e, date) {
				this.context.app.loadEvents(date);
			},

			/**
			 * Returns text for separating list items with events
			 * Skips repeated values
			 *
			 * @param {Object} event
			 * @returns {string}
			 */
			getSeparatorText: function UI_home_getSeparatorText(event) {
				var previous = '';

				// redefine itself
				this.getSeparatorText = function (event) {
					if (event === undefined) {
						previous = '';
						return undefined;
					}

					var startDate = event.startDate,
						str = this.formatLongDate(startDate);

					if (previous === str) {
						return ''; // skip it - already returned
					}
					previous = str; // store in the closure for future comparison

					return str;
				};

				return this.getSeparatorText(event);
			},

			/**
			 * Format long date (D. MMMM YYYY)
			 * @param {TZDate} date
			 * @returns {string}
			 */
			formatLongDate: function UI_home_formatLongDate(date) {
				return date.getDate() + " " + app.ui.monthNames[date.getMonth()] + " " + date.getFullYear();
			},

			/**
			 * Format short date (YYYY/MM/DD)
			 * @param {TZDate} date
			 * @returns {string}
			 */
			formatDate: function UI_home_formatDate(date) {
				return date.getFullYear() + '/' + this.pad(date.getMonth()+1) + '/' + this.pad(date.getDate());
			},

			/**
			 * Format date and time (YYYY/MM/DD hh:mm)
			 * @param {TZDate} date
			 * @returns {string}
			 */
			formatDateTime: function UI_home_formatDateTime(date) {
				return date.getFullYear() + '/' + this.pad(date.getMonth()+1) + '/' + this.pad(date.getDate()) +
					' ' + this.pad(date.getHours()) + ':' + this.pad(date.getMinutes());
			},

			/**
			 * Zero-pads a positive number to 2 digits
			 */
			pad: function UI_home_pad(number) {
				return number < 10 ? '0' + number : number;
			},

			/**
			 * Creates HTML representing the given array of alarms
			 *
			 * @param {Alarm[]} alarms
			 * @returns {string}
			 */
			getAlarmsHtml: function UI_home_getAlarmsHtml(alarms) {
				var alarm = '', j, len;

				len = alarms.length;

				if (len) {
					alarm += '<p class="ui-li-aside ui-li-desc"><img src="img/clock.png"/>';

					for (j = 0; j < len; j += 1) {
						if (alarms[j].before !== null) {
							alarm += alarms[j].before.length;
							alarm += ' ' + alarms[j].before.unit;
						}
					}
					alarm += '</p>';
				}
				return alarm;
			},

			/**
			 * Load the events into the #event_popup.
			 *
			 * Callback function for app.loadEvents.
			 * @param {Array} events
			 */
			onEventSearchSuccess: function UI_home_onEventSearchSuccess(events) {
				var i = 0, j = 0,
					str = "",
					event,
					alarm = '',
					dividerText = '',
					templateParameters = {},
					tmplName;

				var compareTZDates = function(a, b) {
					if (a.getFullYear() !== b.getFullYear())
						return a.getFullYear() < b.getFullYear() ? 1 : -1;
					if (a.getMonth() !== b.getMonth())
						return a.getMonth() < b.getMonth() ? 1 : -1;
					if (a.getDate() !== b.getDate())
						return a.getDate() < b.getDate() ? 1 : -1;
					return 0;
				};

				var compareTZTimes = function(a, b) {
						return a.getHours() < b.getHours() ? -1 : 1;
					if (a.getMinutes() !== b.getMinutes())
						return a.getMinutes() < b.getMinutes() ? -1 : 1;
					return 0;
				};

				events = events.sort(
					function(a, b) {
						var result;
						result = compareTZDates(a.startDate, b.startDate);
						if (result !== 0) {
							return result;
						}
						if (a.isAllDay !== b.isAllDay) {
							return a.isAllDay ? 1 : -1;
						}
						var result = compareTZTimes(a.startDate, b.startDate);
						if (result !== 0) {
							return result;
						}
						var result = compareTZDates(a.endDate, b.endDate);
						if (result !== 0) {
							return result;
						}
						var result = compareTZTimes(a.endDate, b.endDate);
						if (result !== 0) {
							return result;
						}
						if (a.name !== b.name)
							return a.name < b.name ? -1 : 1;
						return 0;
					}
				);

				// content
				str = '';
				if (events.length !== 0) {
					for (i = 0; i < events.length; i += 1) {
						event = events[i];

						dividerText = this.getSeparatorText(event);

						if (dividerText) {
							str += '<li data-role="list-divider">'
								+ dividerText + '</li>';
						}

						alarm = this.getAlarmsHtml(event.alarms);

						templateParameters = {
							uid: event.id.uid,
							startDate: this.formatDate(event.startDate),
							startDateTime: this.formatDateTime(event.startDate),
							endDateTime: this.formatDateTime(event.endDate),
							summary: event.summary || '[ no title ]',
							location: event.location,
							description: event.description,
							alarm: alarm
						};

						tmplName = event.isAllDay ? 'all_day_event' : 'event';
						str += this.context.templateManager.get(tmplName,
							templateParameters);
					}
				} else {
					dividerText = this.getSeparatorText({
						startDate: app.homeDateFilter
					});

					if (dividerText) {
						str += '<li data-role="list-divider">'
							+ dividerText + '</li>';
					}

					str += '<li>No events found</li>';
				}
				this.getSeparatorText(); // clear the separator state

				$('#events_list ul').html(str);
				$('#events_list ul').listview();
				$('#events_list ul').data('listview').refresh();
				$('#events_list ul input.edit_event_btn').button();
				$('#events_list ul input.remove_event_btn').button();

				// scroll to top
				$("#home [data-role=content]").scrollview('scrollTo', 100, 0, 0);
			},

			/**
			 * Error handler for event search
			 */
			onEventSearchError: function UI_home_onEventSearchError() {
				console.error("event search error");
			},

			updateHomeDateFilter: function () {
				$("#homeDateFilter")
					.datetimepicker("value", app.homeDateFilter);
			}
		},

		/**
		 * Contains methods related to the #alarm page
		 * @namespace
		 */
		alarm: {
			init: function UI_alarm_init() {
				$("#customDuration").val("").data("placeholder", "0");
			},

			setValue: function (duration) {
				if(typeof duration == "undefined") {
					duration = 0;
				}

				app.setAlarm(duration);

				$.each($('#new_alarm input:radio'), function () {
					$(this).attr('checked', parseInt($(this).val(), 10) === duration)
						.checkboxradio('refresh');
				});

				if (!$("#new_alarm input[type=radio]:checked").val()) {
					$('#yes_1').attr('checked', true).checkboxradio('refresh');
					$("#customDuration").val(duration);
					$("#customDuration")
					.removeClass('ui-disabled').prop('disabled', false).trigger("focus");
				} else {
					$("#customDuration")
						.val("")
						.addClass('ui-disabled')
						.data("placeholder", "0");
				}
				return duration;
			},

			getValue: function () {
				var value = parseInt($("#new_alarm input[type=radio]:checked").val(), 10);
				if(isNaN(value))
				{
					value = Math.abs(parseInt($("#customDuration").val()));
					if (isNaN(value)) {
						value = "";
					}
				} else {
					this.disableCustomDuration();
				}
				return value;
			},

			disableCustomDuration: function () {
				$("#customDuration").val("").addClass('ui-disabled').data("placeholder", "0");
			},

			getStoredValue: function () {
				return parseInt($('#alarm').attr("data-minutes"));
			},

			/**
			 * Reads and sets alarm duration label
			 */
			updateDurationLabel: function (eventAndAlarm) {
				var value = this.getValue(), unit, label;
				app.ui.alarm.setValue(value === 0 ? 0 : (value || -1));
				$('#alarm').attr("data-minutes", value);
				if (value === -1) {
					label = 'Off';
				} else if (value === 0) {
					label = 'On time';
				} else {
					unit = 'minute';
					if (value % 10080 === 0) {
						value /= 10080;
						unit = 'week';
					} else if (value % 1440 === 0) {
						value /= 1440;
						unit = 'day';
					} else if (value % 60 === 0) {
						value /= 60;
						unit = 'hour';
					}
					label = value + ' ' + unit + (value > 1 ? 's' : '') + ' before';
				}
				$('#alarm').text(label);
			}
		},

		/**
		 * Contains methods related to the new event page
		 * @namespace
		 */
		new_event: {
			initialized: false,
			animateStatus: false,

			init: function () {
				this.assignFields();
				this.updateDateFormat();
				this.setStartDate();
				this.setEndDate();
				this.addEvents();
				this.initialized = true;
			},

			addEvents: function () {
				var self = this, alarm;

				this.allday.change(this.updateDateFormat.bind(this));
				this.start.change(this.validStart.bind(this));
				this.end.change(this.validEnd.bind(this));

				$("#new_event.html").on('pageshow', function () {
					self.animateStatusChange.bind(self)();
				});

				/* old events */
				$('#add-event-btn').on('click', this.addEvent.bind(this));
				$('#add-event-cancel-btn').on('click', this.cancel.bind(this));
				//alarm selection confirm
				$('#add-alarm').on('click', app.switchAlarm.bind(app));
				// go to alarm selection
				$('#set-alarm').on('click', function (e) {
					app.ui.alarm.setValue(app.ui.alarm.getStoredValue());
					$.mobile.changePage('#new_alarm');
				});
			},

			animateStatusChange: function () {
				var self = this;
				this.end.next().find('span').not('.ui-datefield-seperator')
					.off('click')
					.on('click', function (e) {
						self.animateStatus =
							$(e.target).hasClass('ui-btn-picker');
				});
			},

			validStart: function () {
				this.setStartDate();
				if (this.startDate > this.endDate) {
					this.end.datetimepicker("value", this.startDate);
					this.setEndDate();
				}
			},

			validEnd: function () {
				if (this.startDate > this.getDateFromPicker(this.end)) {
					this.setDateValue(this.end, this.endDate)
					this.showWarning(
						'End date cannot be earlier than initial date.',
						function () {
							$("#demo-date-2").datetimepicker();
						}
					);
				} else {
					this.setEndDate();
				}
			},

			validAll: function () {
				this.validStart();
				this.validEnd();
			},

			showWarning: function (text, successCallback) {
				if (successCallback instanceof Function) {
					$("#popup").one('popupafterclose', successCallback)
				}
				this.lockTabKey();
				app.ui.popup(text, {
					'OK': function () {
						$("#popup").popup('close');
					}
				});
				this.popup.one("popupafterclose", function () {
					$(document).off('keydown');
				});
			},

			lockTabKey: function () {
				$(document).on('keydown', function(event) {
					if (event.keyCode === 9) {
						event.preventDefault();
					}
				});
			},

			assignFields: function () {
				this.allday = $("#allDay");
				this.start = $("#demo-date-1");
				this.end = $("#demo-date-2");
				this.popup = $("#popup");
			},

			updateDateFormat: function (fast) {
				var date = tizen.time.getDateFormat(true),
				time = tizen.time.getTimeFormat();
				if (this.allday.val() === '1') {
					this.format = "MMM dd yyyy";
					this.end.parent().parent().hide();
					this.end.parent().parent().prev().hide();
				} else {
					if (time === "h:m:s") {
						this.format = "MMM dd yyyy HH:mm";
					} else {
						this.format = "MMM dd yyyy hh:mm tt";
					}
					this.end.parent().parent().show();
					this.end.parent().parent().prev().show();
				}
				if (fast) {
					this.start.datetimepicker("option", "format", this.format);
					this.end.datetimepicker("option", "format", this.format);
				} else {
					$("#title").blur();
					this.start.datetimepicker("option", "format", this.format)
					.datetimepicker();
					this.end.datetimepicker("option", "format", this.format)
					.datetimepicker();
				}
				$("#demo-date-1").datetimepicker();
				$("#demo-date-2").datetimepicker();
			},

			setDateValue: function (field, date) {
				var sp = field.next().find('span').not('.ui-datefield-seperator');
				field.datetimepicker("value", date);
				if (this.animateStatus) {
					sp.animationComplete(function () {
						setTimeout(function () {
							field.datetimepicker("value", date);
						}, 700);
						sp.off('webkitAnimationEnd');
						sp.off('animationend');
					});
				}
			},

			setStartDate: function () {
				this.startDate = this.getDateFromPicker(this.start);
			},

			setEndDate: function () {
				this.endDate = this.getDateFromPicker(this.end);
			},

			getDateFromPicker: function (field) {
				return field.data('datetimepicker').options.date;
			},

			/* methods before new event refactor */

			setSelectAllDay: function (value) {
				value = value ? 1 : 0;
				app.ui.new_event.allday.find("option")
					.attr('selected', false);
				app.ui.new_event.allday.find("option[value='" + value + "']")
					.attr('selected', true);
					app.ui.new_event.allday.slider("refresh");
			},

			addEvent: function Ui_newEvent_addEvent(e) {
				e.preventDefault();
				e.stopPropagation();
				var button = $('#add-event-btn');
				if (!button.hasClass('disabled')) {
					button.addClass('disabled');
					if (app.eventId === 0) {
						this.context.app.addEvent(e, function(){
							$.mobile.changePage('#home');
						});
					} else {
						this.context.app.updateEvent(e, function(){
							$.mobile.changePage('#home');
						});
					}
				}
			},

			cancel: function Ui_newEvent_cancel(e) {
				e.preventDefault();
				e.stopPropagation();
				$.mobile.changePage('#home');
			}
		},

		fixContentHeight: function Ui_fixContentHeight() {
			var contentHeight = screen.availHeight - $('div[data-role="header"]').outerHeight() - $('div[data-role="footer"]').outerHeight();
			$('div[data-role="content"]').css('height', contentHeight);
		}
	};

	Ui.prototype.popup = function (text, buttons) {
		var i, popup = $("#popup"), popupNumber = Object.keys(buttons).length;

		if(!popup.hasClass('ui-popup')) {
			popup.popup();
		}

		if (!buttons) {
			buttons =  {'OK': function () { $("#popup").popup('close') }};
		}

		$(".ui-popup-button-bg", popup).empty();

		popup[0].className = popup[0].className.replace(/\bcenter_basic.*?\b/g, '');
		popup.addClass("center_basic_"+popupNumber+"btn");

		for (i in buttons) {
			if (buttons.hasOwnProperty(i)) {
				if (buttons[i]) {
					$('<a/>')
						.text(i)
						.attr({'data-role': 'button', 'data-inline': 'true'})
						.bind('click', buttons[i])
						.appendTo($(".ui-popup-button-bg", popup));
				}
			}
		}
		$(".ui-popup-text p", popup).text(text);

		popup.trigger("create");
		popup.popup('open', {positionTo: 'window'});
	};
}());
