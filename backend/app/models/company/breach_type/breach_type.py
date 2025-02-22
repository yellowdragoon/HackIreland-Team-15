from typing import Optional, List
from pydantic import Field
from app.models.base_model import MongoBaseModel
from enum import Enum

class BreachSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class BreachCategory(str, Enum):
    DATA_LEAK = "data_leak"
    UNAUTHORIZED_ACCESS = "unauthorized_access"
    MALWARE = "malware"
    PHISHING = "phishing"
    DDOS = "ddos"
    INSIDER_THREAT = "insider_threat"
    PHYSICAL_SECURITY = "physical_security"
    OTHER = "other"

class BreachType(MongoBaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., max_length=500)
    severity: BreachSeverity
    category: BreachCategory
    estimated_impact: Optional[str] = Field(default=None)
    recommended_actions: List[str] = Field(default_factory=list)
    metadata: Optional[dict] = Field(default_factory=dict)

    class Config:
        collection_name = "breach_types"
        indexes = [
            {"fields": [("name", 1)], "unique": True},
            {"fields": [("severity", 1)]},
            {"fields": [("category", 1)]}
        ]

class BreachTypeCreate(MongoBaseModel):
    name: str
    description: str
    severity: BreachSeverity
    category: BreachCategory
    estimated_impact: Optional[str] = None
    recommended_actions: List[str] = Field(default_factory=list)

class BreachTypeUpdate(MongoBaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[BreachSeverity] = None
    category: Optional[BreachCategory] = None
    estimated_impact: Optional[str] = None
    recommended_actions: Optional[List[str]] = None