from mongoengine import *
from app.models.base_model import BaseDocument

class User(BaseDocument):
    passport_string = StringField(required=True, unique=True)
    name = StringField(required=True)
    ref_score = IntField(default=0, min_value=0, max_value=100)

    meta = {
        'collection': 'users'
    }
