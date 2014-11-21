	<!-- Start of first page: #home -->
	<div data-role="page" id="home" data-add-back-btn="false">
		<div data-role="header">
			<h1>Event manager</h1>
			<div id="homeDateFilterContainer" data-position="fixed">
				<input type="date" id="homeDateFilter"/>
			</div>
		</div>
		<div data-role="content">

			<div id="events_list">
				<ul data-role="listview" data-inset="true">
				</ul>
			</div>

		</div><!-- /content -->

		<div data-role="footer" data-position="fixed">
			<div data-role="tabbar" data-style="tabbar" >
				<ul>
					<li><a href="#new_event" id="newEventBtn">Add New Event</a></li>
					<li><a href="javascript:void(0)" id="exit_btn">Exit</a></li>
				</ul>
			</div>
		</div><!-- /footer -->
	</div><!-- /home -->
