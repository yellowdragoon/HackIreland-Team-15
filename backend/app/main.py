from fastapi import FastAPI
import uvicorn
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.routes.users.users import router as user_router
from app.api.v1.routes.companies.companies import router as company_router
from app.api.v1.routes.companies.breach_types import router as breach_router
from app.utils.logger.logger import Logger
from app.db.db import get_db
import os
from app.core.middleware import ErrorHandlingMiddleware

load_dotenv()

app = FastAPI(
    title="HackIreland API",
    description="API for HackIreland Team 15 project",
    lifespan=get_db,
    version="1.0.0"
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

# Include API routes
app.include_router(user_router, prefix="/api/v1")
app.include_router(company_router, prefix="/api/v1")
app.include_router(breach_router, prefix="/api/v1")

@app.get('/')
async def read_root():
    Logger.info('Root endpoint accessed')
    from app.db.db import MongoDB
    if MongoDB.client:
        try:
            await MongoDB.client.admin.command('ping')
            Logger.info('Database connection successful')
            return {"message": "Welcome to the API", "database": "connected"}
        except Exception as e:
            Logger.error(f'Database connection error: {str(e)}')
            return {"message": "Welcome to the API", "database": "error"}
    Logger.warning('Database not configured')
    return {"message": "Welcome to the API", "database": "not configured"}

@app.get('/health')
async def health_check():
    from app.db.db import MongoDB
    if MongoDB.client:
        try:
            await MongoDB.client.admin.command('ping')
            return {"status": "healthy", "mongodb": "connected"}
        except Exception:
            return {"status": "healthy", "mongodb": "error"}
    return {"status": "healthy", "mongodb": "not configured"}

if __name__ == '__main__':
    uvicorn.run(app, host='0.0.0.0', port=8080)
