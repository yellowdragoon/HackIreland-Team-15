from pydantic import BaseModel

class User(BaseModel):
    name: str
    passport_string: str
    ref_score: int = 0
