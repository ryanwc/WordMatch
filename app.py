#!/usr/bin/env python
"""
Server-side WordMatch application.

Written for Google App Engine. Persist data to Google Datastore.
"""

import os, webapp2, jinja2, json

from google.appengine.ext import ndb
from google.appengine.api import mail, app_identity

import logging

from api import WordMatchApi

from models import User, Game

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

#
# define handlers that are called by taskqueue and/or cronjobs.
#
class SendIncompleteReminderEmail(webapp2.RequestHandler):
    def get(self):
        '''Send a reminder email to each User with an email about games.
        Called every 24 hours using a cron job
        '''
        app_id = app_identity.get_application_id()
        users = User.query(User.email != None)

        usersWithIncompletes = []

        for user in users:

            games = Game.query(Game.user == user.key)

            for game in games:

                if game.game_over == False:

                    usersWithIncompletes.append(user)
                break


        for user in usersWithIncompletes:
            subject = 'Reminder from WordMatch!'
            body = 'Hello {}, you have at least one incomplete Game!' +\
                ' Vist WordMatch to complete the game(s)'.format(user.name)
            # This will send test emails, the arguments to send_mail are:
            # from, to, subject, body
            mail.send_mail('noreply@{}.appspotmail.com'.format(app_id),
                           user.email,
                           subject,
                           body)

class UpdateAverageMovesRemaining(webapp2.RequestHandler):
    def post(self):
        '''Update game listing announcement in memcache.
        '''
        WordMatchApi._cache_average_attempts()
        self.response.set_status(204)

#
# define template servers
#
class Home(Handler):
    '''Serve the homepage
    '''
    def get(self):
        '''Respond to get request and render the homepage
        '''

        self.render("home.html")


app = webapp2.WSGIApplication([
    ('/crons/send_incomplete_reminder', SendIncompleteReminderEmail),
    ('/tasks/cache_average_attempts', UpdateAverageMovesRemaining),
    webapp2.Route("/", handler=Home, name="index"),
    webapp2.Route("/home", handler=Home, name="index"),
    webapp2.Route("/home/", handler=Home, name="index")
], debug=True)
