var backEventListener = null;

var app = null;

(function () { // strict mode wrapper
    'use strict';

    ({
        /**
         * Loader init - load the App constructor
         */
        init: function init() {
            var self = this;
             $.getScript('js/app.js')
                .done(function onAppLoaded() {
                    // once the app is loaded, create the app object
                    // and load the libraries
                    app = new App();
                    self.loadLibs();
                })
                .fail(this.onGetScriptError);
        },
        /**
         * Load dependencies
         */
        loadLibs: function loadLibs() {
            var loadedLibs = 0;
            if ($.isArray(app.requires)) {
                $.each(app.requires, function onLibLoaded(index, filename) {
                    $.getScript(filename)
                        .done(function () {
                            loadedLibs += 1;
                            if (loadedLibs >= app.requires.length) {
                                // All dependencies are loaded - initialise the app
                                app.init();
                            }
                        })
                        .fail(function (e) {
                            console.error('Loading libs failed');
                        });
                });
            }
        },
        /**
         * Handle ajax errors
         */
        onGetScriptError: function onGetScriptError(e, jqxhr, setting, exception) {
            alert('An error occurred: ' + e.message);
        }
    }).init(); // run the loader

}());

function checkbox1(){
    if($("#checkbox1").is(":checked")==true){
     }
    else{
     }
 }
 function checkbox2(){
    if($("#checkbox2").is(":checked")==true){
     }
    else{
     }
 }
 
 
 
var unregister = function() {
    if ( backEventListener !== null ) {
        document.removeEventListener( 'tizenhwkey', backEventListener );
        backEventListener = null;
        window.tizen.application.getCurrentApplication().exit();
    }
}

//Initialize function
var init = function () {
    // register once
    if ( backEventListener !== null ) {
        return;
    }
    
    // TODO:: Do your initialization job
    console.log("init() called");
    
    var backEvent = function(e) {
        if ( e.keyName == "back" ) {
            try {
                if ( $.mobile.urlHistory.activeIndex <= 0 ) {
                    // if first page, terminate app
                    unregister();
                } else {
                    // move previous page
                    $.mobile.urlHistory.activeIndex -= 1;
                    $.mobile.urlHistory.clearForward();
                    window.history.back();
                }
            } catch( ex ) {
                unregister();
            }
        }
    }
    
    // add eventListener for tizenhwkey (Back Button)
    document.addEventListener( 'tizenhwkey', backEvent );
    backEventListener = backEvent;
};

$(document).bind( 'pageinit', init );
$(document).unload( unregister );