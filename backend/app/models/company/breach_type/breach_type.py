from enum import Enum
from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class BreachTypeEnum(str, Enum):
    VIOLATING_TERMS = "VIOLATING_TERMS"
    FRAUD = "FRAUD"
    DEFAULT = "DEFAULT"
    SUSPICIOUS_ACTIVITY = "SUSPICIOUS_ACTIVITY"
    ILLEGAL_ACTIVITY = "ILLEGAL_ACTIVITY"
    DATA_LEAK = "DATA_LEAK"
    
    @classmethod
    def get_default_effect_score(cls, breach_type: 'BreachTypeEnum') -> int:
        """Get the default effect score for a breach type."""
        default_scores = {
            cls.VIOLATING_TERMS: 50,
            cls.FRAUD: 75,
            cls.DEFAULT: 30,
            cls.SUSPICIOUS_ACTIVITY: 40,
            cls.ILLEGAL_ACTIVITY: 90,
            cls.DATA_LEAK: 85
        }
        return default_scores.get(breach_type, 50)  # Default to 50 if type not found

class CompanyBreachType(BaseModel):
    breach_type: BreachTypeEnum
    effect_score: int
    description: str
    timestamp: datetime = datetime.now()

    class Config:
        json_schema_extra = {
            "example": {
                "breach_type": "DATA_LEAK",
                "effect_score": 75,
                "description": "Test breach",
                "timestamp": "2025-02-23T00:54:48Z"
            }
        }
