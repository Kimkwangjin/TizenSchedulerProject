/*global tizen  */

/**
 * @class Config
 */
function Config() {
    'use strict';
}

(function () { // strict mode wrapper
    'use strict';
    Config.prototype = {

        properties: {
            'systemContactImageDirPath': '/opt/data/contacts-svc/img/',
            'defaultAvatarUrl': 'images/default.jpg',
            'templateDir': 'templates',
            'localstorageConfigKey': 'configData',
            'templateExtension': '.tpl',
            'convertedPhotoUrl': 'file:///opt/media/Images/output.png'
        },

        /**
         * Returns config value
         */
        get: function (value, defaultValue) {
            defaultValue = defaultValue || '';

            if (this.properties.hasOwnProperty(value)) {
                return this.properties[value];
            } else {
                return defaultValue;
            }
        }
    };
}());