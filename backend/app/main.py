from fastapi import FastAPI
import uvicorn
from dotenv import load_dotenv
from app.db.db import get_db
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI(lifespan=get_db)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get('/')
async def read_root():
    from app.db.db import MongoDB
    if MongoDB.client:
        try:
            await MongoDB.client.admin.command('ping')
            return {"message": "Welcome to the API", "database": "connected"}
        except Exception:
            return {"message": "Welcome to the API", "database": "error"}
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
