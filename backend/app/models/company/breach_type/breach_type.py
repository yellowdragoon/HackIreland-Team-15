from enum import Enum
from typing import Optional
from pydantic import BaseModel
class BreachTypeEnum(str, Enum):
    VIOLATING_TERMS = "violating_terms"
    FRAUD = "fraud"
    DEFAULT = "default"
    SUSPICIOUS_ACTIVITY = "suspicious_activity"
    ILLEGAL_ACTIVITY = "illegal_activity"
class CompanyBreachType(BaseModel):
    name: BreachTypeEnum
    effect: int
    description: Optional[str] = None 
