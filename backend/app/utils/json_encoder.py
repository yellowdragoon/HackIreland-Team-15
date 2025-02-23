from datetime import datetime
from bson import ObjectId
from fastapi.encoders import jsonable_encoder
from typing import Any

class CustomJSONEncoder:
    @staticmethod
    def encode(obj: Any) -> Any:
        if isinstance(obj, ObjectId):
            return str(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        return jsonable_encoder(obj)
