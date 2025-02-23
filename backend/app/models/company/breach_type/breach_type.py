from enum import Enum
from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class BreachTypeEnum(str, Enum):
    VIOLATING_TERMS = "violating_terms"
    FRAUD = "fraud"
    DEFAULT = "default"
    SUSPICIOUS_ACTIVITY = "suspicious_activity"
    ILLEGAL_ACTIVITY = "illegal_activity"
    DATA_LEAK = "data_leak"

class CompanyBreachType(BaseModel):
    breach_type: BreachTypeEnum
    effect_score: int
    description: str
    timestamp: datetime

    class Config:
        json_schema_extra = {
            "example": {
                "breach_type": "DATA_LEAK",
                "effect_score": 75,
                "description": "Test breach",
                "timestamp": "2025-02-23T00:54:48Z"
            }
        }
