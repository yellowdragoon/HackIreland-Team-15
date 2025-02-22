from fastapi import APIRouter 
from .breach_types import router as breach_types_router 

router = APIRouter()
router.include_router(breach_types_router)