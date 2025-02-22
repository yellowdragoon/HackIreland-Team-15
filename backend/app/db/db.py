from motor.motor_asyncio import AsyncIOMotorClient
from contextlib import asynccontextmanager
import os
from typing import Optional

class MongoDB:
    client: Optional[AsyncIOMotorClient] = None
    db = None

    @classmethod
    async def initialize(cls, db_name: str = 'app_db'):
        try:
            mongodb_url = os.getenv('MONGODB_URL')
            if mongodb_url:
                cls.client = AsyncIOMotorClient(mongodb_url)
                cls.db = cls.client[db_name]
                await cls.client.admin.command('ping')
                print('✅ Successfully connected to MongoDB!')
            else:
                print('⚠️ No MongoDB URL provided')
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
