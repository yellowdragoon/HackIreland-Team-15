from mongoengine import *
from datetime import datetime

class BaseDocument(Document):
    meta = {
        'abstract': True,
        'ordering': ['-created_at']
    }

    created_at = datetime.now()
