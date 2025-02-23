from typing import List 
from bson import ObjectId 
from app.core.db.db import MongoDB 
from app.utils.logger.logger import Logger 

class BreachEventsService: 
    collection_name = "breach_events"

    @classmethod
    async def get_breach_events_for_user(cls,user_id:str) -> List[dict]:
        try: 
            events = await MongoDB.db[cls.collection_name].find({'user_id':ObjectId(user_id)}).to_list(None)
            return events 
        except Exception as e: 
            Logger.error(f"Failed to fetch breach events for user {user_id}: {e}")
            return []
        

        