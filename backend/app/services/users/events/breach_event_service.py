from typing import List, Optional, Dict, Any
from datetime import datetime
from bson import ObjectId
from app.core.db.db import MongoDB
from app.models.user.events.event import BreachEvent
from app.utils.logger.logger import Logger
from app.services.companies.breach_type.breach_type_service import CompanyBreachService
from app.models.company.breach_type.breach_type import BreachTypeEnum

class BreachEventService:
    collection_name = "breach_events"

    @classmethod
    async def create_breach_event(cls, event: BreachEvent) -> Optional[Dict[str, Any]]:
        try:
            event_dict = event.model_dump(exclude={'id'})
            result = await MongoDB.db[cls.collection_name].insert_one(event_dict)
            
            created_event = await MongoDB.db[cls.collection_name].find_one(
                {'_id': result.inserted_id}
            )
            if not created_event:
                return None

            # Convert ObjectId to string
            created_event['_id'] = str(created_event['_id'])
            
            # Return as plain dict
            return dict(created_event)
        except Exception as e:
            Logger.error(f"Error creating breach event: {str(e)}")
            return None

    @classmethod
    async def get_breach_event(cls, event_id: str) -> Optional[Dict[str, Any]]:
        try:
            event = await MongoDB.db[cls.collection_name].find_one(
                {'_id': ObjectId(event_id)}
            )
            if not event:
                return None

            # Convert ObjectId to string
            event['_id'] = str(event['_id'])
            
            # Return as plain dict
            return dict(event)
        except Exception as e:
            Logger.error(f"Error getting breach event: {str(e)}")
            return None

    @classmethod
    async def get_user_breach_events(cls, user_id: str) -> List[Dict[str, Any]]:
        try:
            events = await MongoDB.db[cls.collection_name].find(
                {'user_id': user_id}
            ).sort('created_at', -1).to_list(None)
            # Convert ObjectId to string for each event
            for event in events:
                event['_id'] = str(event['_id'])
            return events
        except Exception as e:
            Logger.error(f"Error getting user breach events: {str(e)}")
            return []

    @classmethod
    async def get_company_breach_events(cls, company_id: str) -> List[BreachEvent]:
        try:
            events = await MongoDB.db[cls.collection_name].find(
                {'company_id': company_id}
            ).sort('created_at', -1).to_list(None)
            return [BreachEvent.model_validate(event) for event in events]
        except Exception as e:
            Logger.error(f"Error getting company breach events: {str(e)}")
            return []

    @classmethod
    async def resolve_breach_event(cls, event_id: str, resolution_notes: str) -> Optional[BreachEvent]:
        try:
            result = await MongoDB.db[cls.collection_name].update_one(
                {'_id': event_id},
                {
                    '$set': {
                        'resolved': True,
                        'resolution_notes': resolution_notes,
                        'resolution_timestamp': datetime.now()
                    }
                }
            )
            if result.modified_count == 0:
                return None

            return await cls.get_breach_event(event_id)
        except Exception as e:
            Logger.error(f"Error resolving breach event: {str(e)}")
            return None

    @classmethod
    async def get_unresolved_events(cls) -> List[BreachEvent]:
        try:
            events = await MongoDB.db[cls.collection_name].find(
                {'resolved': False}
            ).sort('created_at', -1).to_list(None)
            return [BreachEvent.model_validate(event) for event in events]
        except Exception as e:
            Logger.error(f"Error getting unresolved events: {str(e)}")
            return []
