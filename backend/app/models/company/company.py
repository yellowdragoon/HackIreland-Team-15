from typing import Optional, List
from pydantic import Field, EmailStr
from app.models.base_model import MongoBaseModel
from enum import Enum

class CompanyStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"

class CompanySize(str, Enum):
    SMALL = "small"  # 1-50 employees
    MEDIUM = "medium"  # 51-250 employees
    LARGE = "large"  # 251-1000 employees
    ENTERPRISE = "enterprise"  # 1000+ employees

class Company(MongoBaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(default=None, max_length=500)
    size: CompanySize = Field(...)
    status: CompanyStatus = Field(default=CompanyStatus.ACTIVE)
    industry: Optional[str] = Field(default=None)
    website: Optional[str] = Field(default=None)
    primary_contact_email: EmailStr
    primary_contact_phone: Optional[str] = Field(default=None)
    address: Optional[dict] = Field(default_factory=dict)
    breach_types: List[str] = Field(default_factory=list)  # List of breach type IDs
    metadata: Optional[dict] = Field(default_factory=dict)

    class Config:
        collection_name = "companies"
        indexes = [
            {"fields": [("name", 1)], "unique": True},
            {"fields": [("status", 1)]},
            {"fields": [("size", 1)]},
            {"fields": [("industry", 1)]}
        ]

class CompanyCreate(MongoBaseModel):
    name: str
    description: Optional[str] = None
    size: CompanySize
    industry: Optional[str] = None
    website: Optional[str] = None
    primary_contact_email: EmailStr
    primary_contact_phone: Optional[str] = None
    address: Optional[dict] = None
    breach_types: List[str] = Field(default_factory=list)

class CompanyUpdate(MongoBaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    size: Optional[CompanySize] = None
    status: Optional[CompanyStatus] = None
    industry: Optional[str] = None
    website: Optional[str] = None
    primary_contact_email: Optional[EmailStr] = None
    primary_contact_phone: Optional[str] = None
    address: Optional[dict] = None
    breach_types: Optional[List[str]] = None