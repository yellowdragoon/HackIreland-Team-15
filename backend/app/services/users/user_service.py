from app.models.user.user import User
from app.utils.logger.logger import Logger
from app.core.db.db import MongoDB
from app.services.users.info.ipcheck import IPCheckResult
from app.services.users.info.user_info import UserInfoService
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
    async def create_user(cls, user: User, ip_address: str) -> Optional[User]:
        try:
            existing_user = await cls.get_user(user.passport_string)
            if existing_user:
                await UserInfoService.add_device(str(existing_user.id), ip_address)
                return existing_user

            user_dict = user.model_dump(exclude={'id'})
            result = await MongoDB.db[cls.collection_name].insert_one(user_dict)

            created_user_dict = await MongoDB.db[cls.collection_name].find_one(
                {'_id': result.inserted_id}
            )
            if not created_user_dict:
                return None

            # Convert ObjectId to string before validation
            if '_id' in created_user_dict:
                created_user_dict['_id'] = str(created_user_dict['_id'])
            created_user = User.model_validate(created_user_dict)

            await UserInfoService.add_device(str(created_user.id), ip_address)
            return created_user
        except Exception as e:
            Logger.error(f'Error creating user: {str(e)}')
            return None

    @classmethod
    async def get_user(cls, passport_string: str, ip_address: Optional[str] = None) -> Optional[User]:
        try:
            user_data = await MongoDB.db[cls.collection_name].find_one({'passport_string': passport_string})
            if user_data:
                # Convert ObjectId to string before validation
                if '_id' in user_data:
                    user_data['_id'] = str(user_data['_id'])
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
                if '_id' in user:
                    user['_id'] = str(user['_id'])
                users.append(User.model_validate(user))
            return users
        except Exception as e:
            Logger.error(f'Error listing users: {str(e)}')
            return []

    @classmethod
    async def update_user(cls, passport_string: str, user: User, ip_address: Optional[str] = None) -> Optional[User]:
        try:
            user_data = await MongoDB.db[cls.collection_name].find_one({'passport_string': passport_string})
            if not user_data:
                return None
            if '_id' in user_data:
                user_data['_id'] = str(user_data['_id'])
            update_data = user.model_dump(exclude={'id', 'passport_string'})
            await MongoDB.db[cls.collection_name].update_one(
                {'passport_string': passport_string},
                {'$set': update_data}
            )
            updated_user_data = await MongoDB.db[cls.collection_name].find_one({'passport_string': passport_string})
            if not updated_user_data:
                return None
            if '_id' in updated_user_data:
                updated_user_data['_id'] = str(updated_user_data['_id'])

            updated_user = User.model_validate(updated_user_data)
            if ip_address:
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
            user_data = await MongoDB.db[cls.collection_name].find_one({'passport_string': passport_string})
            if not user_data:
                return None

            user_data['_id'] = str(user_data['_id'])
            user = User.model_validate(user_data)

            if ip_address:
                await UserInfoService.add_device(str(user.id), ip_address)

            risk_score = await UserInfoService.get_risk_score(str(user.id))
            devices = await UserInfoService.get_user_devices(str(user.id))

            return {
                "user": user.model_dump(),
                "risk_score": risk_score,
                "devices": devices
            }
        except Exception as e:
            Logger.error(f'Error getting user with risk score: {str(e)}')
            return None
