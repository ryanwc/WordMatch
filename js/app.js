/*
*   Client-side WordRain application.
*
*   Written with the KnockoutJS framework.
*
*/

/*
*
*   CSS manupilation that should not be done in .css file
*
*/
setMapDivHeight();
window.onresize = function(event) {
    
    setMapDivHeight();
    setLocationLoadingPosition();
};

/*
*
*   Helpful global vars
*
*/

var viewModel;

/*
*
*   Models
*
*/

var Player = function (data) {

    var self = this;

    self.key = ko.observable(data["key"]);
    self.name = ko.observable(data["name"]);
}

var Word = function (data) {

    var self = this;

    self.key = ko.observable(data["key"]);
    self.text = ko.observable(data["text"]));
    self.definition = ko.observable(data["definition"]);
    self.language = ko.observable(data["language"]);
}

var Score = funtion (data) {

    var self = this;

    self.key = ko.observable(data["key"]);
    self.player = ko.observable(data["key"]);
    self.date = ko.observable(data["date"]);
    self.value = ko.observable(data["value"]);
}

/*
*
*   ViewModel
*
*/
var ViewModel = function () {

    var self = this;

    self.loadedWords = {};
    self.currentGameWords = {};
    self.seenWords = {};
    self.completedWords = {};
    self.activeWords = {};
    self.currentScore = ko.observable(0);

    self.currentPlayer = ko.observable();

    // track all currently executing ajax requests
    self.currentAjaxCalls = {"word":{}};

    // track current user selections
    self.optionLanguages = ko.observable();
    self.optionSpeeds = ko.observable();

    self.selectedLanguage = ko.observable();
    self.selectedSpeed = ko.observable();

    self.highScores = ko.observableArray([]);

    /* helpers
    */

    self.abortAjaxCalls = function (type) {

        if (type == "word") {

            for (var key in self.currentAjaxCalls[type]) {

                if (typeof key == "") {

                    self.abortAjaxCall(self.currentAjaxCalls[type][key]);
                    delete self.currentAjaxCalls[type][key];
                }
            }
        }
    }

    self.abortAjaxCall = function (jqXHRObject) {

        jqXHRObject.abort();
    }

    self.getLoadedGemName = function (gemKey) {

        return self.loadedGems[gemKey].name();
    }

    /* Custom listeners for selection changes
    */

    self.selectedLanguage.subscribe(function(newSelection) {

        self.resetGame(newSelection.name());
    });

    self.resetGame = function (language) {

        self.abortAjaxCalls("word");
        self.abortAjaxCalls("word");
        self.resetWords(newSelection.name());
        self.currentScore(0);
    }

    /* Modify options based on selections
    */

    self.resetWords = function () {
        // 

    };

    /* Start game logic
    */

    self.startRaining() {

        // TO-DO: start game logic
    }

    /* API Calls
    */


    /* Initialization
    */
    (function() {

        // TO-DO: init page logic
    })();
}

/*
*
*   Helper functions
*
*/
function setGameBoxHeight() {

    var width = $("#gameboxdiv").width();
    $("#gameboxpdiv").css({"height":width+"px"});
}

/*
*
*   Initialize and run the app
*
*/
// enable the KnockoutJS framework
viewModel = new ViewModel;
ko.applyBindings(viewModel);
