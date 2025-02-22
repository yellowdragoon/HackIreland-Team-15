from app.models.user.user import User
from app.utils.logger.logger import Logger
from app.db.db import MongoDB
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
    async def create_user(cls, user: User):
        try:
            user_dict = user.model_dump()
            if await cls.check_if_record_exists(user.passport_string):
                return await cls.get_user(user.passport_string)
            result = await MongoDB.db[cls.collection_name].insert_one(user_dict)
            created_user = await MongoDB.db[cls.collection_name].find_one(
                {'_id': result.inserted_id}
            )
            created_user['_id'] = str(created_user['_id'])
            return created_user
        except Exception as e:
            Logger.error(f'Error creating user: {str(e)}')
            return None

    @classmethod
    async def get_user(cls, passport_string: str) -> Optional[User]:
        try:
            user_data = await MongoDB.db[cls.collection_name].find_one({'passport_string': passport_string})
            if user_data:
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
    async def update_user(cls, passport_string: str, user: User) -> Optional[User]:
        try:
            # Don't update passport_string
            update_data = user.model_dump(by_alias=True, exclude={'_id', 'passport_string'})
            result = await MongoDB.db[cls.collection_name].update_one(
                {'passport_string': passport_string},
                {'$set': update_data}
            )
            if result.modified_count == 0:
                return None
            return await cls.get_user(passport_string)
        except Exception as e:
            Logger.error(f'Error updating user: {str(e)}')
            return None

    @classmethod
    async def delete_user(cls, passport_string: str) -> bool:
        try:
            result = await MongoDB.db[cls.collection_name].delete_one({'passport_string': passport_string})
            return result.deleted_count > 0
        except Exception as e:
            Logger.error(f'Error deleting user: {str(e)}')
            return False


