from motor.motor_asyncio import AsyncIOMotorClient
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from typing import Optional
import os
load_dotenv()
class MongoDB:
    client: Optional[AsyncIOMotorClient] = None
    db = None

    @classmethod
    async def initialize(cls, db_name: str = 'team15'):
        try:
            cls.client = AsyncIOMotorClient(os.getenv('MONGODB_URL'))
            cls.db = cls.client[db_name]
            await cls.client.admin.command('ping')
            print('✅ Successfully connected to MongoDB!')
        except Exception as e:
            print(f'⚠️ MongoDB connection failed: {e}')
            if cls.client:
                cls.client.close()
            cls.client = None
            cls.db = None

    @classmethod
    def close(cls):
        if cls.client:
            cls.client.close()
            cls.client = None
            cls.db = None
            print('🔒 MongoDB connection closed')

@asynccontextmanager
async def get_db(app):
    try:
        await MongoDB.initialize()
        yield {"mongodb": MongoDB}
    finally:
        MongoDB.close()
