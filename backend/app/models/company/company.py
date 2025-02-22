from pydantic import BaseModel
from app.models.company.breach_type.breach_type import CompanyBreachType
from typing import Optional
class Company(BaseModel):
    name: str
    breach: Optional[CompanyBreachType] = None
