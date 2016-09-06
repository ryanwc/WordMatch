# -*- coding: utf-8 -*-

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


class Language(ndb.Model):
    """Language Object
    Drastically reduce calls to datastore by holding cards as a 
    dictionary within a Language Object instead of generating unique 
    entities for each card"""
    name = ndb.StringProperty(required=True)
    cards = ndb.PickleProperty(required=True)
    '''
    cards are stored as pickled list of dicts, where each dict is a card:
    [{'id':uniqueID, 'front':'front string', 'back':'back string'}, ... etc]
    '''


class Game(ndb.Model):
    """Game object"""
    possible_matches = ndb.IntegerProperty(required=True)
    successful_matches = ndb.IntegerProperty(required=True)
    num_match_attempts = ndb.IntegerProperty(required=True)
    match_attempts = ndb.PickleProperty(required=True)
    max_attempts = ndb.IntegerProperty(required=True)
    game_over = ndb.BooleanProperty(required=True)
    demerits = ndb.IntegerProperty(required=True)
    language = ndb.KeyProperty(required=True, kind='Language')
    user = ndb.KeyProperty(required=True, kind='User')

    @classmethod
    def new_game(user, language, size, match_attempt_goal):
        """Creates and returns a new game"""

        spanish = unicode(u"Español", "utf-8")
        german = unicode(u"Deutsche", "utf-8")
        thai = unicode(u"ภาษาไทย", "utf-8")
        
        if not language in [spanish, german, thai]:
            raise ValueError('Language must be Spanish, German, or Thai')

        if possible_matches > 50 or possible_matches < 1:
            raise ValueError('Possible matches must be at least '\
                             '1 and at most 50')

        if not max_attempts >= total_matches:
            raise ValueError('Max attempts must be greater '\
                             'than or equal to possible matches')

        game = Game(user=user,
                    possible_matches=possible_matches,
                    language=language,
                    successful_matches=0,
                    num_match_attempts=0,
                    match_attempts=[],
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
        form.language = self.language.get().name
        form.successful_matches = self.successful_matches
        form.num_match_attempts = self.num_match_attempts
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
    language = ndb.KeyProperty(required=True, kind='Language')
    date = ndb.DateProperty(required=True)
    won = ndb.BooleanProperty(required=True)
    percentage_matched = ndb.FloatProperty(required=True)
    difficulty = ndb.FloatProperty(required=True)
    demerits = ndb.IntegerProperty(required=True)

    def to_form(self):
        return ScoreForm(user_name=self.user.get().name, won=self.won,
                         date=str(self.date), 
                         language_name=self.language.get().name,
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
    num_match_attempts = messages.IntegerField(9, required=True)
    match_attempts = messages.StringField(10, required=True)
    max_attempts = messages.IntegerField(11, required=True)
    demerits = messages.IntegerField(12, required=True)


class NewGameForm(messages.Message):
    """Used to create a new game"""
    user_name = messages.StringField(1, required=True)
    possible_matches = messages.IntegerField(2, required=True)
    max_attempts = messages.IntegerField(3, required=True)
    language = messages.StringField(4, required=True)


class MakeMoveForm(messages.Message):
    """Used to make a move in an existing game"""
    this_text_id = messages.IntegerField(1, required=True)
    is_second = messages.BooleanField(2, required=True)


class ScoreForm(messages.Message):
    """ScoreForm for outbound Score information"""
    user_name = messages.StringField(1, required=True)
    date = messages.StringField(2, required=True)
    won = messages.BooleanField(3, required=True)
    percentage_matched = messages.FloatField(4, required=True)
    difficulty = messages.FloatField(5, required=True)
    demerits = messages.FloatField(6, required=True)
    language = messages.StringField(7, required=True)


class ScoreForms(messages.Message):
    """Return multiple ScoreForms"""
    items = messages.MessageField(ScoreForm, 1, repeated=True)


class StringMessage(messages.Message):
    """StringMessage-- outbound (single) string message"""
    message = messages.StringField(1, required=True)


# populate the datastore with the Anki cards if nothing is there yet
if not Language.query().get():

    languages = ["German", "Thai", "Spanish"]

    for language in languages:

        with open("Raw_"+language+".txt", "r") as raw_file:

            card_id_counter = 0
            cards = []

            for line in raw_file:

                cardDict = {}
                card = line.split("\t")
                cardDict["id"] = card_id_counter
                cardDict["front"] = card[0]
                cardDict["back"] = card[1]

                cards.append(cardDict)
                card_id_counter += 1

            languageEntity = Language(name=language, cards=cards)
            languageEntity.put()


