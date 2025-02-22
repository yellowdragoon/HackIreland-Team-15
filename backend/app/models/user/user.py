from typing import Optional, List
from pydantic import Field, EmailStr
from app.models.base_model import MongoBaseModel
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    USER = "user"
    COMPANY_ADMIN = "company_admin"

class UserStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"

class User(MongoBaseModel):
    email: EmailStr = Field(..., description="User's email address")
    hashed_password: str = Field(..., description="Hashed password")
    first_name: str = Field(..., min_length=1, max_length=50)
    last_name: str = Field(..., min_length=1, max_length=50)
    role: UserRole = Field(default=UserRole.USER)
    status: UserStatus = Field(default=UserStatus.ACTIVE)
    company_id: Optional[str] = Field(default=None)
    phone_number: Optional[str] = Field(default=None)
    last_login: Optional[str] = Field(default=None)

    class Config:
        collection_name = "users"
        indexes = [
            {"fields": [("email", 1)], "unique": True},
            {"fields": [("company_id", 1)]},
            {"fields": [("role", 1)]}
        ]

class UserCreate(MongoBaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    first_name: str
    last_name: str
    role: UserRole = UserRole.USER
    company_id: Optional[str] = None
    phone_number: Optional[str] = None

class UserUpdate(MongoBaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    role: Optional[UserRole] = None
    status: Optional[UserStatus] = None
    company_id: Optional[str] = None