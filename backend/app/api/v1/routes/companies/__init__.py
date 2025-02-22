from fastapi import APIRouter 
from .companies import router as companies_router 


router = APIRouter()
router.include_router(companies_router)