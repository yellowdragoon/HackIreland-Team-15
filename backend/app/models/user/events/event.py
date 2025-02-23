from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime
from enum import Enum
from bson import ObjectId
from app.models.company.breach_type.breach_type import BreachTypeEnum

class SeverityEnum(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"

class StatusEnum(str, Enum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"

class BreachEvent(BaseModel):
    id: Optional[Any] = Field(None, alias='_id')
    user_id: str
    company_id: str
    breach_type: BreachTypeEnum
    severity: SeverityEnum
    status: StatusEnum
    description: str
    timestamp: datetime
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
                "user_id": "TEST123",
                "company_id": "COMP123",
                "breach_type": "DATA_LEAK",
                "severity": "HIGH",
                "status": "OPEN",
                "description": "Test breach event",
                "timestamp": "2025-02-23T00:54:48Z"
            }
        }
