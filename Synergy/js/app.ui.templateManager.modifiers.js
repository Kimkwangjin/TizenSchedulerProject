/*global $*/
/**
 * @class ModifierManager
 */
function ModifierManager() {
	'use strict';
	this.init();
}

(function () {
	'use strict';
	ModifierManager.prototype = {

		/**
		 * UI module initialisation
		 */
		init: function () {
		},

		/**
		 * @return modifiers object
		 */
		getAll: function () {
			return this.modifiers;
		},

		/**
		 * modifiers definitions
		 */
		modifiers: {
			escape: function (str) {
				return $('<span>').text(str).html();
			}
		}
	};
}());