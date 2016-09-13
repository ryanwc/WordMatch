# -*- coding: utf-8 -*-`
"""api.py - Create and configure the Game API exposing the resources.
Concerned primarily with communication to/from the API's users."""

import logging
import endpoints
import json, random
from protorpc import remote, messages
from google.appengine.api import memcache
from google.appengine.api import taskqueue

from models import User, Game, Score, Language
from models import StringMessage, NewGameForm, GameForm, MakeMoveForm,\
    ScoreForms, LanguageForm, LanguageForms, UserForm
from utils import get_by_urlsafe

NEW_GAME_REQUEST = endpoints.ResourceContainer(
    language = messages.StringField(1),
    possible_matches = messages.IntegerField(2),
    max_attempts = messages.IntegerField(3),
    user_key = messages.StringField(4),)
GET_GAME_REQUEST = endpoints.ResourceContainer(
        urlsafe_game_key=messages.StringField(1),)
MAKE_MOVE_REQUEST = endpoints.ResourceContainer(
    MakeMoveForm,
    urlsafe_game_key=messages.StringField(1),)
USER_REQUEST = endpoints.ResourceContainer(user_name=messages.StringField(1),
                                           user_google_id=messages.StringField(2),
                                           email=messages.StringField(3),)
GET_USER_REQUEST = endpoints.ResourceContainer(user_google_id=messages.StringField(1),)


MEMCACHE_MATCH_ATTEMPTS = 'MATCH_ATTEMPTS'

@endpoints.api(name='word_match', version='v1')
class WordMatchApi(remote.Service):
    """Game API"""
    @endpoints.method(request_message=USER_REQUEST,
                      response_message=UserForm,
                      path='user',
                      name='create_user_from_google',
                      http_method='POST')
    def create_user_from_google(self, request):
        """Create a User from Google account info. 
        Requires a unique Google account id."""

        if User.query(User.google_id == request.user_google_id).get():
            raise endpoints.ConflictException(
                    'A User with that google id already exists!')

        user = User(name=request.user_name, email=request.email,
                    google_id=request.user_google_id)
        user.put()

        # if i do return 'UserForm(user.to_form())', it fails with the message:
        # '__init__() takes exactly 1 argument, received 2'.
        # returning LanguageForms (repeated LangueageForm) works fine
        return UserForm(urlsafe_key=user.key.urlsafe(),
                        name=user.name,
                        google_id=user.google_id,
                        email=user.email)

    @endpoints.method(request_message=GET_USER_REQUEST,
                      response_message=UserForm,
                      path='getuser',
                      name='get_user_from_google_id',
                      http_method='POST')
    def get_user_from_google_id(self, request):
        """Get a user by the user's google account ID"""
        user = User.query(User.google_id == request.user_google_id).get()
        
        if not user:
            message = 'No user with the id "%s" exists.' % request.user_google_id
            raise endpoints.NotFoundException(message)

        # if i do return 'UserForm(user.to_form())', it fails with the message:
        # '__init__() takes exactly 1 argument, received 2'.
        # returning LanguageForms (repeated LangueageForm) works fine
        return UserForm(urlsafe_key=user.key.urlsafe(),
                        name=user.name,
                        google_id=user.google_id,
                        email=user.email)

    @endpoints.method(request_message=NEW_GAME_REQUEST,
                      response_message=GameForm,
                      path='game',
                      name='create_game',
                      http_method='POST')
    def create_game(self, request):
        """Creates new game"""
        user = None
        if request.user_key == "-1":
          user = User.query(User.google_id == "-1").get()
        else:
          user = get_by_urlsafe(request.user_key, User)

        if not user:
            raise endpoints.NotFoundException(
                    'No user selected!')

        language = Language.query(Language.name == request.language).get()

        if not language.name in ["Spanish", "German", "Thai"]:
            raise ValueError('Language must be Spanish, German, or Thai')

        if request.possible_matches > 20 or request.possible_matches < 1:
            raise ValueError('Possible matches must be at least '\
                             '1 and at most 20')

        if not request.max_attempts >= request.possible_matches:
            raise ValueError('Max attempts must be greater '\
                             'than or equal to possible matches')

        cards = language.cards

        card_ids = {}

        # generate random card ids to pick for the game
        for x in range(0, request.possible_matches):

            idToUse = random.randint(0, len(cards)/2)

            while idToUse in card_ids:

                idToUse = random.randint(0, len(cards)/2)

            card_ids[str(idToUse)] = True

        print "card ids to get:"
        print card_ids

        game_cards = []

        # get the cards
        for x in range(0, len(cards)):

            if str(cards[x]["id"]) in card_ids:

                print "found:"
                print cards[x]
                game_cards.append(cards[x])

        random.shuffle(game_cards)

        print "game cards:"
        print game_cards

        # assign the position for board layout
        for x in range(0, len(game_cards)):

            game_cards[x]["position"] = x

        print "game cards:"
        print game_cards

        game = Game(user=user.key,
                    possible_matches=request.possible_matches,
                    language=language.key,
                    cards=game_cards,
                    successful_matches=0,
                    num_match_attempts=0,
                    match_attempts=[],
                    max_attempts=request.max_attempts,
                    game_over=False)
        game.put()

        # Use a task queue to update the average words typed.
        # This operation is not needed to complete the creation of a new game
        # so it is performed out of sequence.
        taskqueue.add(url='/tasks/cache_average_attempts')
        return GameForm(urlsafe_key = game.key.urlsafe(),
          language = language.name,
          cards = json.dumps(game.cards),
          user_name = user.name,
          possible_matches = game.possible_matches,
          successful_matches = game.successful_matches,
          num_match_attempts = game.num_match_attempts,
          match_attempts = json.dumps(game.match_attempts),
          max_attempts = game.max_attempts,
          game_over = game.game_over)

    @endpoints.method(request_message=GET_GAME_REQUEST,
                      response_message=GameForm,
                      path='game/{urlsafe_game_key}',
                      name='get_game',
                      http_method='GET')
    def get_game(self, request):
        """Return the current game state."""
        game = get_by_urlsafe(request.urlsafe_game_key, Game)
        if game:
            return game.to_form('Time to match some words!')
        else:
            raise endpoints.NotFoundException('Game not found!')

    @endpoints.method(request_message=MAKE_MOVE_REQUEST,
                      response_message=GameForm,
                      path='game/{urlsafe_game_key}',
                      name='make_move',
                      http_method='PUT')
    def make_move(self, request):
        """Handler for attempted match. Returns a game state with message."""
        game = get_by_urlsafe(request.urlsafe_game_key, Game)
        if game.game_over:
            return game.to_form('Game already over!')

        game.match_attempts += 1

        if request.first_tile_card == game.second_tile_card:

            msg = 'It\'s a match!'
            game.matches_remaining -= 1
        else:

            msg = 'No match...'

        if game.matches_remaining < 1:

            game.end_game(False)
            return game.to_form(msg + ' Game over!')
        else:

            game.put()
            return game.to_form(msg)

    @endpoints.method(response_message=ScoreForms,
                      path='scores',
                      name='get_scores',
                      http_method='GET')
    def get_scores(self, request):
        """Return all scores"""
        return ScoreForms(items=[score.to_form() for score in Score.query()])

    @endpoints.method(request_message=USER_REQUEST,
                      response_message=ScoreForms,
                      path='scores/user/{user_name}',
                      name='get_user_scores',
                      http_method='GET')
    def get_user_scores(self, request):
        """Returns all of an individual User's scores"""
        user = User.query(User.name == request.user_name).get()
        if not user:
            raise endpoints.NotFoundException(
                    'A User with that name does not exist!')
        scores = Score.query(Score.user == user.key)
        return ScoreForms(items=[score.to_form() for score in scores])

    @endpoints.method(response_message=StringMessage,
                      path='games/average_attempts',
                      name='get_average_attempts_remaining',
                      http_method='GET')
    def get_average_attempts(self, request):
        """Get the cached average moves remaining"""
        return StringMessage(message=memcache.\
            get(MEMCACHE_MATCH_ATTEMPTS) or '')

    @endpoints.method(response_message=LanguageForms,
                      path='languages',
                      name='get_languages',
                      http_method='GET')
    def get_languages(self, request):
        """Returns all available languages"""
        return LanguageForms(items=[language.to_form() for language in Language.query()])

    @staticmethod
    def _cache_average_attempts():
        """Populates memcache with the average match attempts of Game"""
        games = Game.query(Game.game_over == False).fetch()
        if games:
            count = len(games)
            total_match_attempts = sum([game.num_match_attempts
                                        for game in games])
            average = float(total_match_attempts)/count
            memcache.set(MEMCACHE_MATCH_ATTEMPTS,
                         'The average match attempts is {:.2f}'.format(average))


api = endpoints.api_server([WordMatchApi])
