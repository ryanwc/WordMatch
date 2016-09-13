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
var myGAPI;

/*
*
*   Models
*
*/

var User = function (data) {

    var self = this;

    self.key = ko.observable(data["key"]);
    self.name = ko.observable(data["name"]);
    self.google_id = ko.observable(data["google_id"]);
    self.email = ko.observable(data["email"]);
}

var Language = function(data) {

    var self = this;

    self.key = ko.observable(data["key"]);
    self.name = ko.observable(data["name"]);
    self.cards = ko.observable(data["cards"]);
}

var Game = function(data) {

    var self = this;

    self.urlsafe_key = ko.observable(data["urlsafe_key"]);
    self.user_name = ko.observable(data["user_name"]);
    self.language = ko.observable(data["language"]);
    self.possible_matches = ko.observable(data["possible_matches"]);
    self.successful_matches = ko.observable(0);
    self.num_match_attempts = ko.observable(0);
    self.match_attempts = ko.observable([]);
    self.max_attempts = ko.observable(data["max_attempts"]);
    self.game_over = ko.observable(data["game_over"]);
    self.cards = ko.observableArray([]);
}

var Card = function (data) {

    var self = this;

    self.id = ko.observable(data["id"]);
    self.text = ko.computed(function() {

        if (data["front"]) {

            return data["front"];
        }
        else if (data["back"]) {

            return data["back"];
        }
    });
    self.isFront = ko.computed(function() {

        return data["front"] ? true : false;
    });
    self.isSelected = ko.observable(false);
    self.position = ko.observable(data["position"]);
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
}

/*
*
*   ViewModel
*
*/
var ViewModel = function () {

    var self = this;

    self.anonUser = ko.observable(new User({"key":"-1", name:"Default User"}))

    self.user = ko.observable(self.anonUser());

    self.signinMessage = ko.computed(function() {

        if (self.user().key() != "-1") {

            return "Signed in as " + self.user().name();
        }
        else {

            return "Not signed in.";
        }
    });

    self.game = ko.observable();
    self.selectingGame = ko.observable(true);

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
                parseInt(self.inputMatches()) > 20 ||
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

    self.signoutUser = function () {

        self.user(new User({"key":"-1", name:"Default User"}));
    }

    self.signinUserFromGoogle = function (google_user_name, google_id, email) {

        self.signoutUser();

        var id_resource = {'resource': {'user_google_id': google_id}};

        gapi.client.word_match.get_user_from_google_id(id_resource).execute(function(resp) {

            if (resp.name) {
                // user already created in server

                user = new User(resp);

                self.user(user);
            }
            else {
                // create user on server
                
                var user_resource = {'resource': {'user_name': google_user_name, 
                                                  'user_google_id': google_id,
                                                  'email': email}
                                    }

                gapi.client.word_match.create_user_from_google(user_resource).execute(function(resp) {
                
                    if (resp.name) {

                        user = new User(resp);

                        self.user(user);
                    }
                });
            }
        });
    }

    /* Custom listeners for selection changes
    */

    self.inputLanguage.subscribe(function(newSelection) {

        if (newSelection) {
            
            self.resetGame(newSelection.name());
        }
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

        var game_resource = {'resource': {'language': self.inputLanguage().name(), 
                                          'possible_matches': self.inputMatches(),
                                          'max_attempts': self.inputMaxAttempts(),
                                          'user_key': self.user().key()}
                            }

        gapi.client.word_match.create_game(game_resource).execute(function(resp) {

            if (!resp.code) {

                resp.cards = JSON.parse(resp.cards);

                var modelCards = [];

                for (var i = 0; i < resp.cards.length; i++) {

                    var newCard = new Card(resp.cards[i]);
                    modelCards.push(newCard);
                }

                var modelGame = new Game(resp);
                modelGame.cards(modelCards);
                self.game(modelGame);
                console.log(self.game().cards());
                self.selectingGame(false);
            }           
        });
    };

    /* Initialization
    */

    self.populateLanguageOptions = function() {
        // populate language options with all available languages
        
        gapi.client.word_match.get_languages().execute(function(resp) {

            if (!resp.code) {

                resp.items = resp.items || [];
                
                for (var i = 0; i < resp.items.length; i++) {

                    language = new Language(resp.items[i]);
                    self.optionLanguages.push(language);
                }

                self.optionLanguages.sort();
            }
        });
    };

    self.loadEndpointsAPI = function() {

        gapi.client.load('word_match', 'v1', self.populateLanguageOptions, '/_ah/api');
    };

    (function() {
        // run on instance creation

        // nothing to do

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

        updateSigninStatus();
    });
}

function handleSignoutClick(event) {

    gapi.auth2.getAuthInstance().signOut().then(function() {

        updateSigninStatus();  
    });
}

function initOAuth() {

    gapi.load('client:auth2', initAuth);
}


function updateSigninStatus() {

    var isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.Ab;

    if (isSignedIn) {

        var google_user_name = gapi.auth2.getAuthInstance().currentUser.Ab.w3.ig;
        var google_id = gapi.auth2.getAuthInstance().currentUser.Ab.El;
        var email = gapi.auth2.getAuthInstance().currentUser.Ab.w3.U3;

        viewModel.signinUserFromGoogle(google_user_name, google_id, email);

        signinButton.style.display = 'none';
        signoutButton.style.display = 'block';
    } 
    else {
        
        viewModel.signoutUser();
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

function initEndpointsAPI() {

    viewModel.loadEndpointsAPI();
}

/*
*
*   Initialize and run the app
*
*/
// enable the KnockoutJS framework
viewModel = new ViewModel;
ko.applyBindings(viewModel);
