from pydantic import BaseModel, Field
from app.models.company.breach_type.breach_type import CompanyBreachType
from typing import Optional, Any

class Company(BaseModel):
    id: str
    name: str
    industry: str
    breach: Optional[CompanyBreachType] = None

    class Config:
        json_schema_extra = {
            "example": {
                "id": "COMP123",
                "name": "Test Company",
                "industry": "Technology",
                "breach": None
            }
        }
