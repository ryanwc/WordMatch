"""utils.py - File for collecting general utility functions."""

import hashlib, hmac
import logging
from google.appengine.ext import ndb
import endpoints

from models import User, Language, Game, Score

def get_by_urlsafe(urlsafe, model):
    """Returns an ndb.Model entity that the urlsafe key points to. Checks
        that the type of entity returned is of the correct kind. Raises an
        error if the key String is malformed or the entity is of the incorrect
        kind
    Args:
        urlsafe: A urlsafe key string
        model: The expected entity kind
    Returns:
        The entity that the urlsafe Key string points to or None if no entity
        exists.
    Raises:
        ValueError:"""
    try:
        key = ndb.Key(urlsafe=urlsafe)
    except TypeError:
        raise endpoints.BadRequestException('Invalid Key')
    except Exception, e:
        if e.__class__.__name__ == 'ProtocolBufferDecodeError':
            raise endpoints.BadRequestException('Invalid Key')
        else:
            raise

    entity = key.get()
    if not entity:
        return None
    if not isinstance(entity, model):
        raise ValueError('Incorrect Kind')
    return entity

### helper functions

def ndb_Model_to_Dict(modelInstance):
    ''' Use in place of ndbEntity.to_dict() so can serialize unserializable 
    ndb properties (like GeoPtProperty, BlobProperty, and KeyProperty)
    '''
    dict = {}
    properties = None

    # get proper set of properties
    if type(modelInstance) is User:
        properties = User._properties
    elif type(modelInstance) is Language:
        properties = Language._properties
    elif type(modelInstance) is Game:
        properties = Game._properties
    elif type(modelInstance) is Score:
        properties = Score._properties

    for property in properties:

        if getattr(modelInstance, property):

            if type(properties[property]) is ndb.GeoPtProperty:

                dict[property] = str(getattr(modelInstance, property))
            elif type(properties[property]) is ndb.BlobProperty:

                dict[property] = getattr(modelInstance, property).\
                    encode('base64')
            elif type(properties[property]) is ndb.KeyProperty:

                thisKeyProperty = getattr(modelInstance, property)
                serializedKeyProperty = None

                if type(thisKeyProperty) is list:

                    serializedKeyProperty = []

                    for keyModelInstance in thisKeyProperty:
                        # guard against nones
                        if keyModelInstance:
                            thisKeyArray = []
                            keyKind = keyModelInstance.kind()
                            keyId = keyModelInstance.id()
                            thisKeyArray.append(keyKind)
                            thisKeyArray.append(keyId)
                            serializedKeyProperty.append(thisKeyArray)

                else:
                    # guard against nones
                    if thisKeyProperty:
                        serializedKeyProperty = thisKeyProperty.pairs()

                dict[property] = serializedKeyProperty
            else:

                dict[property] = getattr(modelInstance, property)
        else:

            dict[property] = None

    # apparently 'key' is not in Model._properties
    thisKey = []
    thisKeyKind = modelInstance.key.kind()
    thisKeyId = modelInstance.key.id()
    thisKey.append(thisKeyKind)
    thisKey.append(thisKeyId)
    dict["key"] = thisKey

    return dict

SECRET = 'examplesecret'

def hash_str(s):
    ''' Return string hashed with a secret
    '''
    return hmac.new(SECRET, s).hexdigest()

def make_secure_val(s):
    ''' Create secure value from a string to hash(string+secret)
    '''
    return "%s|%s" % (s, hash_str(s))

# allows for '|' in the value
def check_secure_val(h):
    ''' Check if a value holds a string and hash(string+secret)
    Would mean this value is (basically) 
    secure if we know we kept the secret between us and client/user
    '''
    li = h.split("|")
    HASH = li[len(li)-1]
    s = ""

    for x in range(len(li)-1):
        s += li[x]

        if x < (len(li)-2):
            s += "|"

    if hash_str(s) == HASH:
        return s
    else:
        return None

def getUserFromSecureCookie(username_cookie_val):
    ''' Check if "user logged in" cookie is secure
    '''
    username = None

    if username_cookie_val:
        username_cookie_val = check_secure_val(username_cookie_val)
        if username_cookie_val:
            username = username_cookie_val

    return username
