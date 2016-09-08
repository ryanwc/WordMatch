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
    self.demerits = ko.computed(function() {

        var totalDemerits = 0;

        for (var i = 0; i < self.cards().length; i++) {

            totalDemerits += self.cards()[i].demerits();
        }

        return totalDemerits;
    });
}

var Card = function (data) {

    var self = this;

    self.id = ko.observable(data["key"]);
    self.front = ko.observable(data["front"]);
    self.front_position = ko.observable(data["front_position"]);
    self.front_demerits = ko.observable(0);
    self.back = ko.observable(data["back"]);
    self.back_position = ko.observable(data["back_position"]);
    self.back_demerits = ko.observable(0);

    self.demerits = ko.computed(function() {

        return self.front_demerits() + self.back_demerits();
    });
}

var Score = function (data) {

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
    self.signinMessage = ko.observable("Not signed in.");
    self.userGoogleID = ko.observable();

    self.cards = ko.observableArray([]);

    // track user input (game options)
    self.optionLanguages = ko.observableArray([]);
    self.inputLanguage = ko.observable();
    self.inputMatches = ko.observable();
    self.inputMaxAttempts = ko.observable();

    self.showBadLanguageMessage = ko.computed(function() {
        // to implement if needed
        return false;
    }); 

    self.showBadMatchesMessage = ko.computed(function() {

        if (typeof self.inputMatches() == 'undefined') {

            return false;
        }
        else if (isNaN(self.inputMatches())) {

            return true;
        }
        else {

            if (parseInt(self.inputMatches()) < 1 || 
                parseInt(self.inputMatches()) > 36 ||
                parseInt(self.inputMatches()) % 1 != 0) {
            
                return true;
            }
            else {

                return false;
            }
        }
    }); 

    self.showBadMaxAttemptsMessage = ko.computed(function() {

        if (typeof self.inputMaxAttempts() == 'undefined') {

            return false;
        }
        else if (isNaN(self.inputMaxAttempts())) {

            return true;
        }
        else {

            if (parseInt(self.inputMaxAttempts()) < self.inputMatches() || 
                parseInt(self.inputMaxAttempts()) % 1 != 0) {
            
                return true;
            }
            else {

                return false;
            }
        }
    }); 

    self.currentScore = ko.observable();
    self.highScores = ko.observableArray([]);

    /* helper
    */

    // empty

    /* Custom listeners for selection changes
    */

    self.inputLanguage.subscribe(function(newSelection) {

        if (newSelection) {
            
            self.resetGame(newSelection.name());
        }
    });

    self.userGoogleID.subscribe(function(newName) {
        // userGoogleID set by OAuth flow, so now set the user

        // set user by creating or getting from datastore
    });

    self.resetGame = function (language) {
  
        self.resetWords(newSelection.name());
        self.currentScore(0);
    };

    /* Modify options based on selections
    */

    self.resetGame = function() {
        // 

    };

    /* Start game logic
    */

    self.createGame = function() {

        // TO-DO: start game logic
    };

    /* API Calls
    */

    self.populateLanguageOptions = function() {
        // populate language options with all available languages

        gapi.client.quoteendpoint.get_languages().execute(function(resp) {

            if (!resp.code) {

                /*
                var dataJSON = JSON.parse(data);

                for (var i = 0; i < dataJSON.length; i++) {
                
                    language = new Language(dataJSON[i]);
                    self.optionLanguages.push(language);
                }
                self.optionLanguages.sort();
                console.log(self.optionLanguages());
                */

                resp.items = resp.items || [];

                console.log(resp.items);
            }
        });
    };

    self.loadEndpointsAPI = function() {

        gapi.client.load('word_match', 'v1', self.populateLanguageOptions, 'http://localhost:8080/_ah/api');
    }

    /* Initialization
    */
    (function() {

        include("https://apis.google.com/js/client.js", self.loadEndpointsAPI);
        include("https://apis.google.com/js/api.js", handleClientLoad);
    })();
}

/*
*
*   OAuth (not handled by KnockoutJS)
*
*/

var apiKey = 'AIzaSyDjHnyHtyK_tM8N8VTznuITwakfO5DBYNo';
var clientId = '510381281726-4dbug0nd52nj5eq6q1mopccr6ggs542u.apps.googleusercontent.com';
var scopes = 'profile';
var signinButton = document.getElementById('signin-button');
var signoutButton = document.getElementById('signout-button');

function initAuth() {

    gapi.client.setApiKey(apiKey);
    gapi.auth2.init({
        
        client_id: clientId,
        scope: scopes
    }).then(function () {

        signinButton.addEventListener("click", handleSigninClick);
        signoutButton.addEventListener("click", handleSignoutClick);
    });
}

// Get authorization from the user to access profile info
function handleSigninClick(event) {
    
    gapi.auth2.getAuthInstance().signIn().then(function() {
        
        console.log(gapi.auth2.getAuthInstance());
        console.log(gapi.auth2.getAuthInstance().isSignedIn.Ab);

        updateSigninStatus();
    });
}

function handleSignoutClick(event) {

    gapi.auth2.getAuthInstance().signOut().then(function() {

        updateSigninStatus();
        viewModel.signinMessage("Not signed in.");
        viewModel.userGoogleID(null);       
    });
}

function handleClientLoad() {

    gapi.load('client:auth2', initAuth);
}


function updateSigninStatus() {

    var isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.Ab;
    console.log("is signed in: " + isSignedIn);

    if (isSignedIn) {

        var userName = gapi.auth2.getAuthInstance().currentUser.Ab.w3.ig;
        var googleID = gapi.auth2.getAuthInstance().currentUser.Ab.El;

        signinButton.style.display = 'none';
        signoutButton.style.display = 'block';
        viewModel.signinMessage("Signed in as " + userName);
        viewModel.userGoogleID(userName);
    } 
    else {
        
        signinButton.style.display = 'block';
        signoutButton.style.display = 'none';
    }
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

function include(filename, onload) {

    console.log(filename);
    console.log(onload);
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.src = filename;
    script.type = 'text/javascript';
    script.onload = script.onreadystatechange = function() {

        if (script.readyState) {

            if (script.readyState === 'complete' || script.readyState === 'loaded') {

                script.onreadystatechange = null;                                                  
                onload();
            }
        } 
        else {

            onload();          
        }
    };

    head.appendChild(script);
}

/*
*
*   Initialize and run the app
*
*/
// enable the KnockoutJS framework
viewModel = new ViewModel;
ko.applyBindings(viewModel);
