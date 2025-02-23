from fastapi import FastAPI
import uvicorn
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from bson import ObjectId
from app.api.v1.routes.users.users import router as user_router
from app.api.v1.routes.companies.companies import router as company_router
from app.api.v1.routes.companies.breach_types import router as breach_router
from app.api.v1.routes.users.info.user_info import router as user_info_router
from app.api.v1.routes.users.events.breach_events import router as breach_events_router
from app.utils.logger.logger import Logger
from app.core.db.db import get_db, MongoDB
from app.core.middleware import ErrorHandlingMiddleware
from app.utils.json_encoder import CustomJSONEncoder

load_dotenv()

app = FastAPI(
    title="HackIreland API",
    default_response_class=JSONResponse,
    json_encoders={ObjectId: str},
    description="""### API for HackIreland Team 15 project

    This API provides endpoints for managing users, companies, and breach events.

    Key Features:
    * User Management
    * Company Management
    * Breach Event Tracking
    * User Information Management

    ### Authentication
    Most endpoints require authentication. Use the authentication token in the Authorization header.

    ### Rate Limiting
    API calls are rate-limited to prevent abuse.
    """,
    version="1.0.0",
    lifespan=get_db,
    openapi_tags=[
        {
            "name": "users",
            "description": "Operations with users. Create, read, update, and delete users."
        },
        {
            "name": "companies",
            "description": "Company management endpoints. Handle company data and settings."
        },
        {
            "name": "breach-types",
            "description": "Manage different types of breaches that can be reported."
        },
        {
            "name": "user-info",
            "description": "Handle additional user information and preferences."
        },
        {
            "name": "breach-events",
            "description": "Track and manage security breach events."
        }
    ],
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware
app.add_middleware(ErrorHandlingMiddleware)

# routes
app.include_router(user_router, prefix="/api/v1")
app.include_router(company_router, prefix="/api/v1")
app.include_router(breach_router, prefix="/api/v1")
app.include_router(user_info_router, prefix="/api/v1")
app.include_router(breach_events_router, prefix="/api/v1")

@app.get('/')
async def read_root():
    Logger.info('Root endpoint accessed')
    if MongoDB.client:
        try:
            await MongoDB.client.admin.command('ping')
            Logger.info('Database connection successful')
            return {"message": "Welcome to the API", "database": "connected"}
        except Exception as e:
            Logger.error(f'Database connection error: {str(e)}')
            return {"message": "Welcome to the API", "database": "error"}
    Logger.warning('Database not configured')
    return {"message": "Welcome to the API", "database": "not connected"}

@app.get('/health')
async def health_check():
    from app.core.db import MongoDB
    if MongoDB.client:
        try:
            await MongoDB.client.admin.command('ping')
            return {"status": "healthy", "mongodb": "connected"}
        except Exception:
            return {"status": "healthy", "mongodb": "error"}
    return {"status": "healthy", "mongodb": "not configured"}

if __name__ == '__main__':
    uvicorn.run(app, host='0.0.0.0', port=8080)
