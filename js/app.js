/*
*   Client-side WordMatch application.
*
*   Written with the KnockoutJS framework.
*
*/

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

var User = function (data) {

    var self = this;

    self.key = ko.observable(data["key"]);
    self.name = ko.observable(data["name"]);
}

var Language = function(data) {

    var self = this;

    self.key = ko.observable(data["key"]);
    self.name = ko.observable(data["name"]);
}

var Game = function(data) {

    var self = this;

    self.user = ko.observable(data["user"]);
    self.language = ko.observable(data["language"]);
    self.possible_matches = ko.observable(data["possible_matches"]);
    self.successful_matches = ko.observable(0);
    self.match_attempts = ko.observable(0);
    self.max_attempts = ko.observable(data["max_attempts"]);
    self.game_over = ko.observable(data["game_over"]);
    self.cards = ko.observableArray(data["cards"]);
    self.demerits = ko.computedObservable(function() {

        // is this expensive?
        total = self.cards().reduce(function(previousValue().demerits(), 
            currentValue().demerits(), currentIndex, array) {
            return previousValue + currentValue;
        });

        return total;
    });
}

var Card = function (data) {

    var self = this;

    self.id = ko.observable(data["key"]);
    self.front = ko.observable(data["front"]));
    self.front_position = ko.observable(data["front_position"]);
    self.front_demerits = ko.observable(0);
    self.back = ko.observable(data["back"]);
    self.back_position = ko.observable(data["back_position"]);
    self.back_demerits = ko.observable(0);

    self.demerits = ko.computedObservable(function() {

        return self.front_demerits() + self.back_demerits();
    });
}

var Score = funtion (data) {

    var self = this;

    self.key = ko.observable(data["key"]);
    self.player = ko.observable(data["player"]);
    self.language = ko.observable(data["date"]);
    self.date = ko.observable(data["date"]);
    self.won = ko.observable(data["won"]);
    self.percentage_matched = ko.observable(data["percentage_matched"]);
    self.difficulty = ko.observable(data["difficulty"]);
    self.demerits = ko.observable(data["demerits"]);
}

/*
*
*   ViewModel
*
*/
var ViewModel = function () {

    var self = this;

    self.user = ko.observable();
    self.cards = ko.observableArray([]);

    self.optionLanguages = ko.observableArray([]);
    self.selectedLanguage = ko.observable();

    self.currentScore = ko.observable();
    self.highScores = ko.observableArray([]);

    // track all currently executing ajax requests
    self.currentAjaxCalls = {"word":{}};

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
