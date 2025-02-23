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
    async def get_all_breach_events(cls) -> List[Dict[str, Any]]:
        try:
            Logger.info(f"Getting all breach events from collection: {cls.collection_name}")
            events = await MongoDB.db[cls.collection_name].find().sort('timestamp', -1).to_list(None)
            Logger.info(f"Found {len(events) if events else 0} events in database")
            if not events:
                Logger.info("No events found in database")
                return []
            
            # Log each event for debugging
            for event in events:
                Logger.info(f"Event found: {event}")
            
            return [BreachEvent.model_validate(event).model_dump(by_alias=True) for event in events]
        except Exception as e:
            Logger.error(f"Error getting all events: {str(e)}")
            raise e
    
    @classmethod
    async def create_breach_event(cls, event: Dict[str, Any] | BreachEvent) -> Optional[Dict[str, Any]]:
        try:
            # Convert to dict if it's a Pydantic model
            if hasattr(event, 'model_dump'):
                event_dict = event.model_dump(exclude={'id'} if hasattr(event, 'id') else None)
            else:
                event_dict = event.copy()
            
            # For manual entries, we don't need to check company breach records
            if event_dict.get('manual_entry'):
                result = await MongoDB.db[cls.collection_name].insert_one(event_dict)
            else:
                # Try to get the company's breach record for the effect score
                company_breach = await CompanyBreachService.get_breach_by_company(event_dict.get('company_id'))
                if company_breach:
                    # If company has a breach record, verify the type matches
                    if company_breach.breach_type != event_dict.get('breach_type'):
                        Logger.warning(
                            f"Event breach type {event_dict.get('breach_type')} doesn't match company breach type "
                            f"{company_breach.breach_type}. Using default score."
                        )
                        event_dict['effect_score'] = BreachTypeEnum.get_default_effect_score(event_dict.get('breach_type'))
                    else:
                        # Use company's custom score
                        event_dict['effect_score'] = company_breach.effect_score
                else:
                    # No company breach record, use default score
                    Logger.info(f"No breach record found for company {event_dict.get('company_id')}. Using default score.")
                    event_dict['effect_score'] = BreachTypeEnum.get_default_effect_score(event_dict.get('breach_type'))
                
                result = await MongoDB.db[cls.collection_name].insert_one(event_dict)

            created_event = await MongoDB.db[cls.collection_name].find_one(
                {'_id': result.inserted_id}
            )
            if not created_event:
                return None
            return BreachEvent.model_validate(created_event).model_dump(by_alias=True)
        except Exception as e:
            Logger.error(f"Error creating breach event: {str(e)}")
            raise e

    @classmethod
    async def get_breach_event(cls, event_id: str) -> Optional[Dict[str, Any]]:
        try:
            event = await MongoDB.db[cls.collection_name].find_one(
                {'_id': ObjectId(event_id)}
            )
            if not event:
                return None
            return BreachEvent.model_validate(event).model_dump(by_alias=True)
        except Exception as e:
            Logger.error(f"Error getting breach event: {str(e)}")
            raise e

    @classmethod
    async def get_user_breach_events(cls, user_id: str) -> List[Dict[str, Any]]:
        try:
            # Try to find events by user_id
            events = await MongoDB.db[cls.collection_name].find(
                {'user_id': user_id}
            ).sort('timestamp', -1).to_list(None)
            
            if not events:
                # If no events found, try to find by ObjectId
                try:
                    events = await MongoDB.db[cls.collection_name].find(
                        {'user_id': ObjectId(user_id)}
                    ).sort('timestamp', -1).to_list(None)
                except:
                    pass
            
            if not events:
                return []
                
            return [BreachEvent.model_validate(event).model_dump(by_alias=True) for event in events]
        except Exception as e:
            Logger.error(f"Error getting user breach events: {str(e)}")
            return []  # Return empty list instead of raising

    @classmethod
    async def get_company_breach_events(cls, company_id: str) -> List[Dict[str, Any]]:
        try:
            events = await MongoDB.db[cls.collection_name].find(
                {'company_id': company_id}
            ).sort('timestamp', -1).to_list(None)
            if not events:
                return []
            return [BreachEvent.model_validate(event).model_dump(by_alias=True) for event in events]
        except Exception as e:
            Logger.error(f"Error getting company breach events: {str(e)}")
            raise e

    @classmethod
    async def update_breach_event(cls, event_id: str, event: BreachEvent) -> Optional[Dict[str, Any]]:
        try:
            existing_event = await cls.get_breach_event(event_id)
            if not existing_event:
                return None
            event_dict = event.model_dump(exclude={'id'})
            result = await MongoDB.db[cls.collection_name].update_one(
                {'_id': ObjectId(event_id)},
                {'$set': event_dict}
            )

            if result.modified_count > 0:
                return await cls.get_breach_event(event_id)
            return None
        except Exception as e:
            Logger.error(f"Error updating breach event: {str(e)}")
            return None

    @classmethod
    async def delete_breach_event(cls, event_id: str) -> bool:
        try:
            result = await MongoDB.db[cls.collection_name].delete_one(
                {'_id': ObjectId(event_id)}
            )
            return result.deleted_count > 0
        except Exception as e:
            Logger.error(f"Error deleting breach event: {str(e)}")
            return False

    @classmethod
    async def resolve(cls, event_id: str, resolution_notes: str) -> Optional[Dict[str, Any]]:
        try:
            oid = ObjectId(event_id)
        except:
            return None
            
        update = {
            'status': 'CLOSED',
            'resolution_notes': resolution_notes,
            'resolution_timestamp': datetime.now()
        }
        
        try:
            await MongoDB.db[cls.collection_name].update_one({'_id': oid}, {'$set': update})
            event = await MongoDB.db[cls.collection_name].find_one({'_id': oid})
            if event:
                event['_id'] = str(event['_id'])
            return event
        except:
            return None

    @classmethod
    async def get_unresolved_events(cls) -> List[Dict[str, Any]]:
        try:
            Logger.info("Getting unresolved breach events")
            query = {'status': {'$ne': 'CLOSED'}}
            Logger.info(f"Query: {query}")
            
            events = await MongoDB.db[cls.collection_name].find(query).sort('timestamp', -1).to_list(None)
            Logger.info(f"Found {len(events) if events else 0} unresolved events")
            
            if not events:
                Logger.info("No unresolved events found")
                return []
                
            # Log each unresolved event for debugging
            for event in events:
                Logger.info(f"Unresolved event found: {event}")
                
            return [BreachEvent.model_validate(event).model_dump(by_alias=True) for event in events]
        except Exception as e:
            Logger.error(f"Error getting unresolved events: {str(e)}")
            raise e
