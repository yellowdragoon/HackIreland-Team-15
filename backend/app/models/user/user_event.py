from typing import Optional
from pydantic import Field
from app.models.base_model import MongoBaseModel
from enum import Enum

class UserEventType(str, Enum):
    LOGIN = "login"
    LOGOUT = "logout"
    PASSWORD_CHANGE = "password_change"
    PROFILE_UPDATE = "profile_update"
    ACCOUNT_CREATED = "account_created"
    ACCOUNT_DELETED = "account_deleted"

class UserEvent(MongoBaseModel):
    user_id: str = Field(..., description="ID of the user")
    event_type: UserEventType
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    metadata: Optional[dict] = Field(default_factory=dict)

    class Config:
        collection_name = "user_events"
        indexes = [
            {"fields": [("user_id", 1)]},
            {"fields": [("event_type", 1)]},
            {"fields": [("created_at", -1)]}
        ]