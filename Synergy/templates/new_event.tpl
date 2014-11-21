	<!-- Start of the new event form: #new_event -->
	<div data-role="page" id="new_event">

		<div data-role="header" data-position="fixed">
			<h1>New event</h1>
		</div><!-- /header -->

		<div data-role="content">

			<fieldset>
				<label for="title">Title</label>
				<div><input type="text" name="summary" id="title" /></div>

				<label for="dataAllDay">Type</label>
				<div id="dataAllDay" data-role="dataAllDay">
					<span class="allDaySwitcher">
					<select id="allDay" data-role="slider">
						<option value="1">All day</option>
						<option value="0">Period</option>
					</select>
				</div>

				<label for="demo-date-1">Start</label>
				<div id="date-1">
					<span class="ui-li-text-main">
						<input type="datetime" name="startDate" id="demo-date-1" data-format="MMM dd yyyy HH:mm"/>
					</span>
				</div>

				<label for="demo-date-2">End</label>
				<div id="date-2">
					<span class="ui-li-text-main">
						<input type="datetime" name="endDate" id="demo-date-2" data-format="MMM dd yyyy HH:mm"/>
					</span>
				</div>

				<label for="alarm">Alarm</label>
				<div>
					<a id="set-alarm" data-inline="true" data-role="button">Set</a>
					<span id="alarm">0 minutes before</span>
				</div>

			</fieldset>

		</div><!-- /content -->

		<div data-role="footer" data-position="fixed">
			<div data-role="tabbar" data-style="tabbar">
				<ul>
					<li><a id="add-event-cancel-btn" data-inline="true">Cancel</a></li>
					<li><a id="add-event-btn" data-inline="true">Save</a></li>
				</ul>
			</div><!-- /controlbar -->
		</div><!-- /footer -->
	</div><!-- /new_event -->
