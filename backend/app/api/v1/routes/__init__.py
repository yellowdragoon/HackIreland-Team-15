from fastapi import APIRouter 
from .users import router as users_router 
from .companies import router as companies_router 

router = APIRouter()
router.include_router(users_router)
router.include_router(companies_router)