from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime
from bson import ObjectId
from app.models.company.breach_type.breach_type import BreachTypeEnum

class BreachEvent(BaseModel):
    id: Optional[Any] = Field(None, alias='_id')
    user_id: str
    company_id: str
    breach_type_id: str
    breach_type: Optional[BreachTypeEnum] = None
    severity: int = 0  # 0-10 scale
    description: str
    created_at: datetime = Field(default_factory=datetime.now)
    resolved: bool = False
    resolution_notes: Optional[str] = None
    resolution_timestamp: Optional[datetime] = None

    def model_dump(self, *args, **kwargs):
        data = super().model_dump(*args, **kwargs)
        if '_id' in data and isinstance(data['_id'], ObjectId):
            data['_id'] = str(data['_id'])
        return data

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "user_id": "user123",
                "company_id": "company123",
                "breach_type_id": "breach_type123",
                "severity": 5,
                "description": "Suspicious login attempt from unknown device"
            }
        }
