from fastapi import APIRouter 
from .users import router as users_router 
router = APIRouter()
router.include(users_router)