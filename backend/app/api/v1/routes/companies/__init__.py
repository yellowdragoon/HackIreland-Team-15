from fastapi import APIRouter 
from .companies import router as companies_router 
from .breach_type import router as breach_types_router 

router = APIRouter()
router.include_router(companies_router)
router.include_router(breach_types_router,prefix="/companies")