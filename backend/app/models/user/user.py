from pydantic import BaseModel, Field
from typing import Optional, Any
from bson import ObjectId

class User(BaseModel):
    id: Optional[Any] = Field(None, alias='_id')
    name: str
    passport_string: str
    ref_score: int = Field(default=0, description="User's reference score")

    def model_dump(self, *args, **kwargs):
        data = super().model_dump(*args, **kwargs)
        if '_id' in data and isinstance(data['_id'], ObjectId):
            data['_id'] = str(data['_id'])
        return data

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "name": "John Doe",
                "passport_string": "ABC123",
                "ref_score": 0
            }
        }
