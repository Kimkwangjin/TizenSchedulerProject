<!-- Start of second page: #alarm -->
<div data-role="page" id="new_alarm" data-add-back-btn="false">

	<div data-role="header" data-position="fixed">
		<h1>Set alarm</h1>
	</div><!-- /header -->

	<div data-role="content">
		<input type="radio" name="radio-choice" id="radio-choice-0" value="-1" />
		<label for="radio-choice-0">Off</label>

		<input type="radio" name="radio-choice" id="radio-choice-1" value="0" checked />
		<label for="radio-choice-1">On time</label>

		<input type="radio" name="radio-choice" id="radio-choice-2" value="5" />
		<label for="radio-choice-2">5 minutes before</label>

		<input type="radio" name="radio-choice" id="radio-choice-3" value="15" />
		<label for="radio-choice-3">15 minutes before</label>

		<input type="radio" name="radio-choice" id="radio-choice-4" value="60" />
		<label for="radio-choice-4">1 hour before</label>

		<input type="radio" name="radio-choice" id="radio-choice-5" value="1440" />
		<label for="radio-choice-5">1 day before</label>

		<input type="radio" name="radio-choice" id="radio-choice-6" value="2880" />
		<label for="radio-choice-6">2 days before</label>

		<input type="radio" name="radio-choice" id="radio-choice-7" value="10080" />
		<label for="radio-choice-7">1 week before</label>

		<input type="radio" class="customDuration" name="radio-choice" id="yes_1" value="Yes" >
		<label for="yes_1">custom time:</label>
		<span class="customDetails">
			<!-- max = 99 weeks (9*7*24*60 minutes) -->
			<input placeholder="0" class="customDuration" type="number" name="radio-choice" min="0" max="997920" id="customDuration"/>
			minutes before
		</span>
	</div><!-- /content -->

	<div data-role="footer" data-position ="fixed">
		<div data-role="tabbar" data-style="tabbar" >
			<ul>
				<li><a  id="add-alarm">Save alarm</a></li>
			</ul>
		</div>
	</div><!-- /footer -->

</div><!-- /page alarm -->