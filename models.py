"""models.py - This file contains the class definitions for the Datastore
entities used by the Game. Because these classes are also regular Python
classes they can include methods (such as 'to_form' and 'new_game')."""

import random
from datetime import date
from protorpc import messages
from google.appengine.ext import ndb


class User(ndb.Model):
    """User profile"""
    name = ndb.StringProperty(required=True)
    email = ndb.StringProperty()


class Game(ndb.Model):
    """Game object"""
    possible_matches = ndb.IntegerProperty(required=True)
    language = ndb.StringProperty(require=True)
    successful_matches = ndb.IntegerProperty(required=True)
    match_attempts = ndb.IntegerProperty(required=True)
    max_attempts = ndb.IntegerProperty(required=True)
    game_over = ndb.BooleanProperty(required=True, default=False)
    demerits = ndb.IntegerProperty(required=True)
    user = ndb.KeyProperty(required=True, kind='User')

    @classmethod
    def new_game(user, language, size, match_attempt_goal):
        """Creates and returns a new game"""
        if not language in ["Español", "Deutsche", "ภาษาไทย"]:
            raise ValueError('Language must be Spanish, German, or Thai')

        if possible_matches > 50 or possible_matches < 1:
            raise ValueError('Possible matches must at least 1 and at most 50')           

        if not max_attempts >= total_matches:
            raise ValueError('Max attempts must be greater '\
                             'than or equal to possible matches')

        game = Game(user=user,
                    possible_matches=possible_matches,
                    language=language,
                    successful_matches=0,
                    match_attempts=0,
                    max_attempts=max_attempts,
                    game_over=False)
        game.put()
        return game

    def to_form(self, message):
        """Returns a GameForm representation of the Game"""
        form = GameForm()
        form.urlsafe_key = self.key.urlsafe()
        form.user_name = self.user.get().name
        form.possible_matches = self.possible_matches
        form.language = self.language
        form.successful_matches = self.successful_matches
        form.match_attempts = self.match_attempts
        form.max_attempts = self.max_attempts
        form.game_over = self.game_over
        form.demerits = self.demerits
        form.message = message
        return form

    def end_game(self, won=False):
        """Ends the game - if won is True, the player won. - if won is False,
        the player lost."""
        self.game_over = True
        self.put()
        # Add the game to the score 'board'
        score = Score(user=self.user, date=date.today(), won=won,
            possible_matches=self.possible_matches,
            percentage_matched=(self.successful_matches/self.possible_matches),
            difficulty=(1-((self.max_attempts-self.possible_matches)/self.possible_matches)))
        score.put()


class Score(ndb.Model):
    """Score object"""
    user = ndb.KeyProperty(required=True, kind='User')
    date = ndb.DateProperty(required=True)
    won = ndb.BooleanProperty(required=True)
    percentage_matched = ndb.FloatProperty(required=True)
    difficulty = ndb.FloatProperty(required=True)
    demerits = ndb.IntegerProperty(required=True)

    def to_form(self):
        return ScoreForm(user_name=self.user.get().name, won=self.won,
                         date=str(self.date),
                         percentage_matched=self.percentage_matched,
                         difficulty=self.difficulty, demerits=self.demerits)


class GameForm(messages.Message):
    """GameForm for outbound game state information"""
    urlsafe_key = messages.StringField(1, required=True)
    language = messages.IntegerField(2, required=True)
    game_over = messages.BooleanField(3, required=True)
    message = messages.StringField(4, required=True)
    user_name = messages.StringField(5, required=True)
    language = messages.StringField(6, required=True)
    possible_matches = messages.IntegerField(7, required=True)
    successful_matches = messages.IntegerField(8, required=True)
    match_attempts = messages.IntegerField(9, required=True)
    max_attempts = messages.IntegerField(10, required=True)
    demerits = messages.IntegerField(11, required=True)

class NewGameForm(messages.Message):
    """Used to create a new game"""
    user_name = messages.StringField(1, required=True)
    possible_matches = messages.IntegerField(2, required=True)
    max_attempts = messages.IntegerField(3, required=True)
    language = messages.StringField(4, required=True)


class MakeMoveForm(messages.Message):
    """Used to make a move in an existing game"""
    this_text_key = messages.StringField(1, required=True)
    card_key = messages.StringField(1, required=True)
    is_second = messages.BooleanField(2, required=True)


class ScoreForm(messages.Message):
    """ScoreForm for outbound Score information"""
    user_name = messages.StringField(1, required=True)
    date = messages.StringField(2, required=True)
    won = messages.BooleanField(3, required=True)
    percentage_matched = messages.FloatField(4, required=True)
    difficulty = messages.FloatField(5, required=True)
    demerits = messages.FloatField(6, required=True)

class ScoreForms(messages.Message):
    """Return multiple ScoreForms"""
    items = messages.MessageField(ScoreForm, 1, repeated=True)


class StringMessage(messages.Message):
    """StringMessage-- outbound (single) string message"""
    message = messages.StringField(1, required=True)
