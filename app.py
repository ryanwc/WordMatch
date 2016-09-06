#!/usr/bin/env python
"""
Server-side WordMatch application.

Written for Google App Engine. Persist data to Google Datastore.

This file also contains handlers that are called by taskqueue and/or
cronjobs.
"""

import os, webapp2, jinja2, re, hashlib, hmac, random, datetime, json
from datetime import date
import string, ast
from webapp2 import redirect_to

from google.appengine.ext import ndb
from google.appengine.api import mail, app_identity

import logging

from api import WordMatchApi

from models import User, Language, Score, Game
from utils import ndb_Model_to_Dict

import bleach

template_dir = os.path.join(os.path.dirname(__file__), "templates")
jinja_env = jinja2.Environment(loader=jinja2.FileSystemLoader(template_dir),
    autoescape=True, auto_reload=True)
jinja_env.globals['url_for'] = webapp2.uri_for


class Handler(webapp2.RequestHandler):
    ''' Handle HTTP requests and serve appropriate pages/code
    '''
    def write(self, *a, **kw):
        ''' Write a response
        '''
        self.response.out.write(*a, **kw)

    def render_str(self, template, **params):
        ''' Render a jinja template
        '''
        t = jinja_env.get_template(template)
        return t.render(params)

    def render(self, template, **kw):
        ''' Render a jinja template to browser by writing it to response
        '''
        self.write(self.render_str(template, **kw))


class SendReminderEmail(webapp2.RequestHandler):
    def get(self):
        """Send a reminder email to each User with an email about games.
        Called every hour using a cron job"""
        app_id = app_identity.get_application_id()
        users = User.query(User.email != None)
        for user in users:
            subject = 'This is a reminder!'
            body = 'Hello {}, try out Guess A Number!'.format(user.name)
            # This will send test emails, the arguments to send_mail are:
            # from, to, subject, body
            mail.send_mail('noreply@{}.appspotmail.com'.format(app_id),
                           user.email,
                           subject,
                           body)


class UpdateAverageMovesRemaining(webapp2.RequestHandler):
    def post(self):
        """Update game listing announcement in memcache."""
        WordMatchApi._cache_average_attempts()
        self.response.set_status(204)


# define template servers
class Home(Handler):
    ''' Serve the homepage
    '''
    def get(self):
        ''' Respond to get request and render the homepage
        '''
        #
        # only do after datastore clear to re-populate defaults
        #

        self.render("home.html")

# Ajax handlers 
class GetScores(Handler):
    ''' Handle requests for gems
    '''
    def get(self):

        queryParams = self.request.headers["queryParams"]
        getHighScores = self.request.headers["getHighScores"]
        queryDict = {}
        
        scores = Score.query()
        properties = Gem._properties

        # filter iteratively
        if getHighScores:
            
            scores = scores.order()
        elif queryParams:
            
            queryDict = ast.literal_eval(queryParams)

            for param in queryDict:

                property = properties[param]
                gems = gems.filter(property = queryDict[param])

        scores = scores.fetch()
        self.response.write(json.\
            dumps([ndb_Model_to_Dict(score) for score in scores]))

class GetLanguages(Handler):
    ''' Handle requests for all kinds of locales
    '''
    def get(self):

        name = None
        languages = None

        if "name" in self.request.headers:
            name = self.request.headers["name"]
            languages = Language.query("name =", name).fetch()
        else:
            languages = Language.query().fetch()

        self.response.write(json.\
            dumps([ndb_Model_to_Dict(language) for language in languages]))

class GetInstanceByKey(Handler):
    ''' Handle requests to get datastore entity by key
    Should automatically use memcache if entity already queried
    '''
    def get(self):

        keyArray = self.request.headers["key"].split(",")

        key = ndb.Key(keyArray[0], int(keyArray[1]))

        entity = key.get()

        if entity:
            self.response.write(json.dumps(ndb_Model_to_Dict(entity)))
        else:
            self.response.write(None)

app = webapp2.WSGIApplication([
    ('/crons/send_reminder', SendReminderEmail),
    ('/tasks/cache_average_attempts', UpdateAverageMovesRemaining),
    webapp2.Route("/", handler=Home, name="index"),
    webapp2.Route("/home", handler=Home, name="index"),
    webapp2.Route("/home/", handler=Home, name="index"), 
    webapp2.Route("/GetLanguages", handler=GetLanguages, name="getlangauges"),
    webapp2.Route("/GetScores", handler=GetScores, name="getscores"),
    webapp2.Route("/GetByKey", handler=GetInstanceByKey, 
        name="getinstancebykey")
], debug=True)