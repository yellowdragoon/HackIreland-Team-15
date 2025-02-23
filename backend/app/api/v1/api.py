from fastapi import APIRouter
from app.api.v1.routes.users.users import router as users_router
from app.api.v1.routes.users.events.breach_events import router as breach_events_router
from app.api.v1.routes.companies.companies import router as companies_router

router = APIRouter()

router.include_router(users_router)
router.include_router(breach_events_router)
router.include_router(companies_router)
