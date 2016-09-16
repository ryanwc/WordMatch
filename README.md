# Word Match

Word Match is a memory game. Each game consists of flipping pairs of cards to get a match.  Each card in the game corresponds to either the "front" or the "back" of a flashcard, and the flashcards are drawn from three decks: German, Thai, and Spanish vocabulary words, with the "front" being in the relevant language and the "back" being in English.  A flipped pair of cards matches if one of the cards is the "front" and one of the cards is the "back" of the same flashcard.

Users can either use the default User account, or can sign in with their Google account to create their own User record.  Many different Word Match games can be played by many different Users at any given time.

The app makes use of cron jobs and task queues, and will send a reminder email every 24 hours to each user with incomplete games.

# Game Rules and Instructions for Playing

1. A player selects the following to create a game:
    - German, Thai, or Spanish decks
    - the number of total matches for the game
    - the number of allowed match attempts.
2. After the player creates the game, he tries to match cards that come from the same flashcard in the selected language deck.
    - All cards start face down.
    - In the front-end packaged in this repo, this is represented by clicking on cards to flip them over.
3. One 'complete turn' consists of 1) flipping over one card then 2) flipping over a second card.
    - After two cards are flipped, if there is a match, the cards stay face up.  If not, the cards return to being face down.
4. It is illegal to flip a card that is already face up.
5. The player can cancel the game before it ends to destroy the record of the game.
6. The player wins the game if he matches all cards (flips all of them face up) within the allotted attempts, losing otherwise.

# Scoring and Rankings

The 'score' of a game is determined by the percentage of cards matched in that game.  For example, if there are 8 matches (16 cards), and the player makes 4 matches before hitting the alotted attempts, then the game ends and the percetange matched is 4/8=50%.  The higher the percentage matched, the better the score.

Ties in percentage matched are broken by the difficulty of the game.  Difficulty is calcualted as (possible_matches / max_attemps).  The higher the difficulty, the better the score.  Here is an example:

    - Game 1: 8 possible_matches, 8 max_attempts, 4 successful_matches = 50% matched and 100% difficulty
    - Game 2: 4 possible_matches, 8 max_attempts, 2 successful_matches = 50% matched and 50% difficulty

In the example above, Game 1 has a higher score because it has higher difficulty (even though they both have same matched percent).

User rankings, on the other hand, are determined by win percentage (user's won games / user's total games).  Ties between users with the same win percentage are broken by the average (mean) difficulty of the user's games.

# Technologies Used

This Google App Engine project uses Google Cloud Endpoints to make the game mechanics and data available to any front-end.  The version in this repository also uses an HTML/CSS/JavaScript front end to make the game playable in a web browser.  Important technologies used include includes:

- Google App Engine with NDB datastore
- Google Cloud Endpoints
- Python
- JavaScript
- HTML
- CSS
- KnockoutJS
- Jinja2

# Documentation

This section helps developers understand how to use the Google Cloud Endpoints to design their own front-end for the game and how to use/interpret most other files in this repo.

## Important Files Included

 - api.py: Contains endpoints and game playing logic.
 - app.py: Contains handlers for taskqueue and running Word Match as a web application
 - app.yaml: Google App configuration.
 - cron.yaml: Cronjob configuration.
 - models.py: Entity and message definitions including helper methods.
 - utils.py: Helper functions (some of which may not be used or needed at this point), including for retrieving ndb.Models by urlsafe Key string.
 - app.js: Client-side application using KockoutJS.  Calls Google Cloud Endpoints to enact all game logic.
 - home.css: General styles for the front end.
 - base.html: An HTML template.
 - home.html: The main game page.  Extends base.html.

## Google Cloud Endpoints Documentation

 - **create_user_from_google**
    - Path: 'user'
    - Method: POST
    - Parameters: user_name, user_google_id, email (optional)
    - Returns: A UserForm representing the created user.
    - Description: Creates a new User. Provided user_google_id must be unique. Will 
    raise a ConflictException if a User with that user_google_id already exists.

 - **get_user_from_google**
    - Path: 'getuser'
    - Method: 'POST'
    - Parameters: user_google_id
    - Returns: A UserForm representing the requested user.
    - Description: Gets the user that has the provided user_google_id.  Raises a
    NotFoundException if there is no user with that user_google_id.

 - **get_user_games**
    - Path: 'getusergames'
    - Method: 'POST'
    - Parameters: urlsafe_user_key, active (optional)
    - Returns: A list of GameForms that represent the requested user's games.
    - Description: Gets a list of a user's games.  If the 'active' parameter is provided,
    returns only the games that are active (incomplete).  Raises a
    NotFoundException if there is no user with the provided urlsafe_user_key.

 - **create_game**
    - Path: 'game'
    - Method: 'POST'
    - Parameters: language, possible_matches, max_attempts, urlsafe_user_key
    - Returns: A GameForm representing the created game.
    - Description: Creates a game for the provided user with the provided language,
    possible matches, and max_attempts.
    Raises a ForbiddenException if there is no user with the provided urlsafe_user_key.
    Raises a ForbiddenException if possible_matches is more than 20 or less than 1.   
    Raises a ForbiddenException if max_attempts is less than possible_matches.
    Raises a NotFoundException if there is no Language with the provided name.

 - **get_game**
    - Path: 'getgame'
    - Method: 'POST'
    - Parameters: urlsafe_game_key
    - Returns: A GameForm representing the requested game.
    - Description: Gets a game that is stored on the server by the urlsafe_game_key.
    Raises a NotFoundException if there is no Game with the provided key.

 - **get_game_history**
    - Path: 'getgamehistory'
    - Method: 'POST'
    - Parameters: urlsafe_game_key
    - Returns: A GameForm representing the requested game.
    - Description: This just calls get_game with the provided paramters -- this is because 
    Udacity seemed to required a method called "get_game_history", but all of the game
    history (and more) is already contained in the GameForm returned from get_game.
    Raises a NotFoundException if there is no Game with the provided key.
    NOTE: The game history is the Game.matches attribute, which shows the position of the
    card that was selected for each move.  The Game's history can therefore be viewed like 
    a chess match replay by putting cards in position (order) and flipping over the position
    indicated for each move in the history.  
    For example, if Cards.matches = [[1,2],[2,3]], on the first 'turn' the player flipped
    the card at position 1 then the card at position 2, and on the second turn the player
    flipped card 2 then flipped card 3.  Exactly what the implication are for scoring
    (e.g., was a turn a match?) can be easily extracted by using the rest of the game data
    (e.g., looking up cards at position 2 and 3 and seeing if they match.)

 - **cancel_game**
    - Path: 'cancelgame'
    - Method: 'POST'
    - Parameters: urlsafe_game_key
    - Returns: A string saying that the game was cancelled.
    - Description: Deletes an in-progress game.  Cannot delete a completed game.
    Raises a ForbiddenException if the game is already completed.
    Raises a NotFoundException if there is no Game with the provided key.
    
 - **make_move**
    - Path: 'makemove'
    - Method: 'PUT'
    - Parameters: urlsafe_game_key, flipped_card_position
    - Returns: A GameForm with updated game state.
    - Description: Takes a 'flipped_card_position' and returns the updated state of the game 
    based on 1) whether a card is already flipped and 2) if so, whether the card matches the
    already-flipped card.
    If this causes a game to end, a corresponding Score entity will be created.
    Raises a NotFoundException if the urlsafe_game_key does not correspond to a Game.
    Raises a ForbiddenException if the game is already over.
    Raises a ForbiddenException if the card at flipped_card_position is already face up.

 - **get_high_scores**
    - Path: 'highscores'
    - Method: 'POST'
    - Parameters: limit (optional)
    - Returns: ScoreForms representing scores of games.
    - Description: By default, returns all Scores in the database ordered from best to worst.
    If the limit parameter is provided, returns the first {limit} Scores ordered from best to worst.
    NOTE: Score ranking is determined by 'percent_match', with ties broken by 'difficulty'
    (with higher being better in both attributes).
    Raises a NotFoundException if there are no scores yet.
    
 - **get_user_scores**
    - Path: 'getuserscores'
    - Method: 'POST'
    - Parameters: urlsafe_user_key
    - Returns: A list of ScoreForms representing the provided user's scores. 
    - Description: Returns all Scores recorded by the provided player (unordered).
    Raises a NotFoundException if the User does not exist.
    Raises a NotFoundException if the User has no scores yet.
    
 - **get_user_rankings**
    - Path: 'getrankings'
    - Method: 'GET'
    - Parameters: {no pramaters}
    - Returns: A list of UserForms representing the 'leaderboard'. 
    - Description: Returns all Users ordered by best ranking to worst ranking.  Ranking
    is determined by User.win_percentage first (higher is better), and ties are broken
    by User.average_difficulty (higher is better).
    Raises a NotFoundException no Users exist.

 - **get_languages**
    - Path: 'languages'
    - Method: 'GET'
    - Parameters: {no pramaters}
    - Returns: A list of LanguagesForms representing each Language in the datastore. 
    - Description: Returns a list of all Languages in the datastore.

 - **get_average_attempts**
    - Path: 'games/average_attempts'
    - Method: GET
    - Parameters: {no parameters}
    - Returns: StringMessage
    - Description: Gets the average number of match attempts in every completed
    game of stored in the datastore from a previously cached memcache key.

## Models Included

 - **User**
    - Stores unique google_id, required name, and optional email.
    win_percentage and average_difficulty are optional but are calculated and stored
    automatically when a User finishes a game.

 - **Language**
    - Stores cards for a language.   

 - **Game**
    - Stores unique game states. Associated with User model and Language model via KeyProperty.
    
 - **Score**
    - Records completed games. Associated with User model and Game model via KeyProperty.
    
## Forms Included

 - **UserForm**
    - Representation of a User (urlsafe_key, name, google_id, email, 
    win_percentage, and average_difficulty)
 - **UserForms**
    - Multiple UserForm container.
 - **GameForm**
    - Representation of a Game's state (urlsafe_key, language, user_name, possible_matches,
    successful_matches, num_match_attempts, match_attemps, max_attempts, game_over,
    cards, match_in_progress, selected_card).
 - **ScoreForm**
    - Representation of a completed game's Score (urlsafe_key, user_name, date, won flag,
    percentage_matched, difficulty).
 - **ScoreForms**
    - Multiple ScoreForm container.
 - **LanguageForm**
    - Representation of a Language (urlsafe_key, name, cards).
 - **LanguageForms**
    - Multiple LanguageForm container.
 - **StringMessage**
    - General purpose String container.

# Using the App

To get started using the app, you can go to the live website, or you can download this repo and run the program locally.  In either case, you can use the front-end that comes with the game or you can use just the Google Cloud Endpoints.

To run the website locally, you need to have both of the following installed: 1) Python 2.7 and 2) the Google App Engine SDK for Python.  Here are complete instructions for running the app locally:

1. Ensure you have Python 2.7 installed and active on your machine (don't use a higher version of Python -- you can download Python 2.7 from the [Python website](https://www.python.org/download/releases/2.7.4)).
2. If you are working on a Linux or Mac OS X machine and do not already have the Google App Engine SDK for Python installed:
    1. Download [the Mac/Linux version of the Google App Engine SDK for Python](https://storage.googleapis.com/appengine-sdks/featured/google_appengine_1.9.40.zip).
    2. Unzip the App Engine SDK file you downloaded (google_appengine_1.9.40.zip).  One way to do it is with the following command line command: `unzip google_appengine_1.9.40.zip`.  There is no App Engine installation script that you need to run after unzipping the files.
    3. Add the google_appengine directory to your PATH with the following command line command: `export PATH=$PATH:/path/to/google_appengine/
    4. Make sure Python 2.7 is installed on your machine using the following command line command: `/usr/bin/env python -V`.  The output should look like this: `Python 2.7.<number>`. If Python 2.7 isn't installed, install it now (as stated in the first step) using the installation instructions for your Mac/Linux distribution for Python 2.7 [here](https://www.python.org/download/releases/2.7.4).
3. If you are working on a Windows machine and do not already have the Google App Engine SDK for Python installed:
    1. Download [the Windows version of the Google App Engine SDK for Python](https://storage.googleapis.com/appengine-sdks/featured/GoogleAppEngine-1.9.40.msi).
    2. Double-click the SDK file you downloaded (GoogleAppEngine-1.9.40.msi) and follow the prompts to install the SDK.
    3. You will need Python 2.7 to use the App Engine SDK, because the [Development Server](https://cloud.google.com/appengine/docs/php/tools/devserver) is a Python application. As stated in the first step above, you can download Python 2.7 [here](https://www.python.org/download/releases/2.7.4).
4. Download all of the files in this repo into the same directory.
5. Navigate to that folder on the command line.
6. At the command line, run the command `dev_appserver.py .` (note the space followed by a '.').
7. In a web browser, navigate to http://localhost:8080/home
8. To test the Google Cloud Endpoints in the API Explorer, go to localhost:8080/_ah/api/explorer.  You might have to use the command 

If you have trouble installing ths Google App Engine SDK for Python, you can view the documentation [here](https://cloud.google.com/appengine/downloads#Google_App_Engine_SDK_for_Python).

To visit the live website, go to the following address: https://word-match.appspot.com/home

To test the live Google Cloud Endpoints, go to the following address: https://word-match.appspot.com/_ah/api/explorer

Any feedback about your experience using the app is welcome.  Please send feedback to [ryanwc13@gmail.com](mailto:ryanwc13@gmail.com).

# License

Created by Ryan William Connor in September 2016.
Copyright © 2016 Ryan William Connor. All rights reserved.