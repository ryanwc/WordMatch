# -*- coding: utf-8 -*-

"""models.py - This file contains the class definitions for the Datastore
entities used by the Game. Because these classes are also regular Python
classes they can include methods (such as 'to_form' and 'new_game')."""

import json
from datetime import date
from protorpc import messages
from google.appengine.ext import ndb


class User(ndb.Model):
    """User profile"""
    name = ndb.StringProperty(required=True)
    google_id = ndb.StringProperty(required=True)
    email = ndb.StringProperty(required=True)

    def to_form(self):
        """Returns a UserForm representation of the User"""
        return UserForm(urlsafe_key=self.key.urlsafe(),
                        name=self.name,
                        google_id=self.google_id,
                        email=self.email)

class Language(ndb.Model):
    """Language Object
    Drastically reduce calls to datastore by holding cards as a 
    dictionary within a Language Object instead of generating unique 
    entities for each card"""
    name = ndb.StringProperty(required=True)
    cards = ndb.PickleProperty(required=True)
    # cards are stored as pickled list of dicts, where each dict is a card:
    # [{'id':uniqueID, 'front':'front string'},{'id':uniqueID, 'back':'back string'}, ... etc]

    def to_form(self):
        """Returns a LanguageForm representation of the Language"""
        return LanguageForm(urlsafe_key=self.key.urlsafe(),
                            name=self.name,
                            cards=json.dumps(self.cards))

class Game(ndb.Model):
    """Game object"""
    possible_matches = ndb.IntegerProperty(required=True)
    successful_matches = ndb.IntegerProperty(required=True)
    num_match_attempts = ndb.IntegerProperty(required=True)
    match_attempts = ndb.PickleProperty(required=True)
    match_in_progress = ndb.BooleanProperty(required=True)
    selected_card = ndb.PickleProperty(required=True)
    cards = ndb.PickleProperty(required=True)
    max_attempts = ndb.IntegerProperty(required=True)
    game_over = ndb.BooleanProperty(required=True)
    language = ndb.KeyProperty(required=True, kind='Language')
    user = ndb.KeyProperty(required=True, kind='User')

    def to_form(self):
        """Returns a GameForm representation of the Game"""
        return GameForm(urlsafe_key=self.key.urlsafe(),
                        user_name=self.user.get().name,
                        possible_matches=self.possible_matches,
                        language=self.language.get().name,
                        successful_matches=self.successful_matches,
                        match_in_progress=self.match_in_progress,
                        selected_card=json.dumps(self.selected_card),
                        num_match_attempts=self.num_match_attempts,
                        match_attempts=json.dumps(self.match_attempts),
                        max_attempts=self.max_attempts,
                        game_over=self.game_over,
                        cards=json.dumps(self.cards))

    def end_game(self, won=False):
        """Ends the game - if won is True, the player won. - if won is False,
        the player lost."""
        self.game_over = True
        self.put()
        # Add the game to the score 'board'
        score = Score(game=self.key, date=date.today(), won=won,
            percentage_matched=(self.successful_matches/(self.possible_matches*1.0)),
            difficulty=(self.possible_matches*1.0)/self.max_attempts)
        score.put()


class Score(ndb.Model):
    """Score object"""
    game = ndb.KeyProperty(required=True, kind='Game')
    date = ndb.DateProperty(required=True)
    won = ndb.BooleanProperty(required=True)
    percentage_matched = ndb.FloatProperty(required=True)
    difficulty = ndb.FloatProperty(required=True)

    def to_form(self):
        return ScoreForm(urlsafe_key=self.key.urlsafe(),
                         won=self.won,
                         date=str(self.date), 
                         percentage_matched=self.percentage_matched,
                         difficulty=self.difficulty)


class UserForm(messages.Message):
    """UserForm for outbound user information"""
    urlsafe_key = messages.StringField(1, required=True)
    name = messages.StringField(2, required=True)
    google_id = messages.StringField(3, required=True)
    email = messages.StringField(4, required=True)

class GameForm(messages.Message):
    """GameForm for outbound game state information"""
    urlsafe_key = messages.StringField(1, required=True)
    language = messages.StringField(2, required=True)
    user_name = messages.StringField(3, required=True)
    possible_matches = messages.IntegerField(4, required=True)
    successful_matches = messages.IntegerField(5, required=True)
    num_match_attempts = messages.IntegerField(6, required=True)
    match_attempts = messages.StringField(7, required=True)
    max_attempts = messages.IntegerField(8, required=True)
    game_over = messages.BooleanField(9, required=True)
    cards = messages.StringField(10, required=True)
    match_in_progress = messages.BooleanField(11, required=True)
    selected_card = messages.StringField(12, required=True)


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
    urlsafe_key = messages.StringField(1, required=True)
    user_name = messages.StringField(2, required=True)
    date = messages.StringField(3, required=True)
    won = messages.BooleanField(4, required=True)
    percentage_matched = messages.FloatField(5, required=True)
    difficulty = messages.FloatField(6, required=True)
    language = messages.StringField(7, required=True)


class ScoreForms(messages.Message):
    """Return multiple ScoreForms"""
    items = messages.MessageField(ScoreForm, 1, repeated=True)


class LanguageForm(messages.Message):
    """Language for outbound Language information"""
    urlsafe_key = messages.StringField(1, required=True)
    name = messages.StringField(2, required=True)
    cards = messages.StringField(3, required=True)


class LanguageForms(messages.Message):
    """Return multiple Languages"""
    items = messages.MessageField(LanguageForm, 1, repeated=True)


class StringMessage(messages.Message):
    """StringMessage-- outbound (single) string message"""
    message = messages.StringField(1, required=True)


# populate the datastore with the Anki cards
# and a default user if nothing is there yet
if not Language.query().get():

    languages = ["German", "Thai", "Spanish"]

    for language in languages:

        with open("Raw_"+language+".txt", "r") as raw_file:

            card_id_counter = 0
            cards = []

            for line in raw_file:

                frontDict = {}
                backDict = {}
                card = line.split("\t")
                frontDict["id"] = card_id_counter
                frontDict["front"] = card[0]
                backDict["id"] = card_id_counter
                backDict["back"] = card[1]

                cards.append(frontDict)
                cards.append(backDict)
                card_id_counter += 1

            languageEntity = Language(name=language, cards=cards)
            languageEntity.put()

if not User.query().get():

    defaultUser = User(name="Default User", google_id="-1", email="None")
    defaultUser.put()
