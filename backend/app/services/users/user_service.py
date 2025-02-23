from app.models.user.user import User
from app.utils.logger.logger import Logger
from app.core.db.db import MongoDB
from app.services.users.info.ipcheck import IPCheckResult
from app.services.users.info.user_info import UserInfoService
from app.services.users.breach_event_service import BreachEventsService
from app.services.users.scoring.scoring import calculate_risk_score
from typing import Optional, List
from bson import ObjectId

class UserService:
    collection_name = 'users'

    @classmethod
    async def check_if_record_exists(cls, passport_string: str) -> bool:
        try:
            user = await MongoDB.db[cls.collection_name].find_one({'passport_string': passport_string})
            return user is not None
        except Exception as e:
            Logger.error(f'Error checking if user exists: {str(e)}')
            return False

    @classmethod
    async def create_user(cls, user: User, ip_address: str):
        try:
            user_dict = user.model_dump()
            existing_user = await cls.get_user(user.passport_string)
            if existing_user:
                await UserInfoService.add_device(str(existing_user.id), ip_address)
                return existing_user
            result = await MongoDB.db[cls.collection_name].insert_one(user_dict)
            created_user = await MongoDB.db[cls.collection_name].find_one(
                {'_id': result.inserted_id}
            )
            created_user['_id'] = str(created_user['_id'])
            await UserInfoService.add_device(str(result.inserted_id), ip_address)

            return created_user
        except Exception as e:
            Logger.error(f'Error creating user: {str(e)}')
            return None

    @classmethod
    async def get_user(cls, passport_string: str, ip_address: Optional[str] = None) -> Optional[User]:
        try:
            user_data = await MongoDB.db[cls.collection_name].find_one({'passport_string': passport_string})
            if user_data:
                if ip_address:
                    await UserInfoService.add_device(str(user_data['_id']), ip_address)
                return User.model_validate(user_data)
            return None
        except Exception as e:
            Logger.error(f'Error getting user: {str(e)}')
            return None

    @classmethod
    async def list_users(cls) -> List[User]:
        try:
            cursor = MongoDB.db[cls.collection_name].find()
            users = []
            async for user in cursor:
                users.append(User.model_validate(user))
            return users
        except Exception as e:
            Logger.error(f'Error listing users: {str(e)}')
            return []

    @classmethod
    async def update_user(cls, passport_string: str, user: User, ip_address: Optional[str] = None) -> Optional[User]:
        try:
            update_data = user.model_dump(by_alias=True, exclude={'_id', 'passport_string'})
            result = await MongoDB.db[cls.collection_name].update_one(
                {'passport_string': passport_string},
                {'$set': update_data}
            )
            if result.modified_count == 0:
                return None

            updated_user = await cls.get_user(passport_string)
            if ip_address and updated_user:
                await UserInfoService.add_device(str(updated_user.id), ip_address)
            return updated_user
        except Exception as e:
            Logger.error(f'Error updating user: {str(e)}')
            return None

    @classmethod
    async def delete_user(cls, passport_string: str) -> bool:
        try:
            user = await cls.get_user(passport_string)
            if user:
                await UserInfoService.delete_user_devices(str(user.id))
                result = await MongoDB.db[cls.collection_name].delete_one({'passport_string': passport_string})
                return result.deleted_count > 0
            return False
        except Exception as e:
            Logger.error(f'Error deleting user: {str(e)}')
            return False

    @classmethod
    async def get_user_with_risk_score(cls, passport_string: str, ip_address: Optional[str] = None) -> Optional[dict]:
        try:
            user = await cls.get_user(passport_string)
            if not user:
                return None

            if ip_address:
                await UserInfoService.add_device(str(user.id), ip_address)

            risk_score = await UserInfoService.get_risk_score(str(user.id))
            devices = await UserInfoService.get_user_devices(str(user.id))

            return {
                "user": user,
                "risk_score": risk_score,
                "devices": devices
            }
        except Exception as e:
            Logger.error(f'Error getting user with risk score: {str(e)}')
            return None
        
    @classmethod 
    async def set_user_risk_score(cls,user_id: str):
        user = await cls.get_user_by_id(user_id)
        if not user: 
            return None 
        
        breach_events = await BreachEventsService.get_breach_events_for_user(user_id)
        num_devices = await UserInfoService.get_user_devices(user_id)
        new_score = calculate_risk_score(user_id,breach_events,num_devices)
        user.risk_score = new_score 
        await user.save()

        return new_score 
