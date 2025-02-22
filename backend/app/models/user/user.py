from mongoengine import *
from app.models.base_model import BaseDocument

class User(BaseDocument):
    email = EmailField(required=True, unique=True)
    password = StringField(required=True)
    name = StringField(required=True)
    ref_score = IntField(min_value=0, max_value=100)

    meta = {
        'collection': 'users'
    }
 