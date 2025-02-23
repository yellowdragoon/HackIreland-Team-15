from app.models.user.user import User
from app.utils.logger.logger import Logger
from app.core.db.db import MongoDB
from app.services.users.info.ipcheck import IPCheckResult
from app.services.users.info.user_info import UserInfoService
from app.services.users.events.breach_event_service import BreachEventService
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
    async def create_user(cls, user: User, ip_address: str) -> Optional[User]:
        try:
            Logger.info(f'Creating user with passport_string: {user.passport_string}')
            # First try to get existing user
            existing_user = await cls.get_user(user.passport_string)
            if existing_user:
                Logger.info(f'User already exists with passport_string: {user.passport_string}')
                await UserInfoService.add_device(str(existing_user.id), ip_address)
                return existing_user

            user_dict = user.model_dump(exclude={'id'})
            Logger.info(f'Creating new user with data: {user_dict}')
            try:
                result = await MongoDB.db[cls.collection_name].insert_one(user_dict)
            except Exception as e:
                if 'duplicate key error' in str(e):
                    # Race condition - user was created between our check and insert
                    Logger.info(f'Duplicate key detected, fetching existing user')
                    existing_user = await cls.get_user(user.passport_string)
                    if existing_user:
                        await UserInfoService.add_device(str(existing_user.id), ip_address)
                        return existing_user
                raise

            created_user_dict = await MongoDB.db[cls.collection_name].find_one(
                {'_id': result.inserted_id}
            )
            if not created_user_dict:
                Logger.error('Failed to find created user')
                return None

            # Convert ObjectId to string before validation
            if '_id' in created_user_dict:
                created_user_dict['_id'] = str(created_user_dict['_id'])
            created_user = User.model_validate(created_user_dict)
            Logger.info(f'Successfully created user: {created_user}')

            await UserInfoService.add_device(str(created_user.id), ip_address)
            return created_user
        except Exception as e:
            Logger.error(f'Error creating user: {str(e)}')
            return None

    @classmethod
    async def get_user(cls, passport_string: str, ip_address: Optional[str] = None) -> Optional[User]:
        try:
            Logger.info(f'Getting user with passport_string: {passport_string}')
            user_data = await MongoDB.db[cls.collection_name].find_one({'passport_string': passport_string})
            if not user_data:
                Logger.info(f'User not found by passport_string, trying ObjectId')
                try:
                    user_data = await MongoDB.db[cls.collection_name].find_one({'_id': ObjectId(passport_string)})
                except:
                    Logger.info('Invalid ObjectId format')
                    pass

            if user_data:
                Logger.info(f'Found user data: {user_data}')
                if '_id' in user_data:
                    user_data['_id'] = str(user_data['_id'])
                if ip_address:
                    await UserInfoService.add_device(str(user_data['_id']), ip_address)
                return User.model_validate(user_data)
            Logger.info('User not found')
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

    @classmethod
    async def get_user_by_id(cls, user_id: str) -> Optional[User]:
        try:
            # First try to find by passport_string
            user_data = await MongoDB.db[cls.collection_name].find_one({'passport_string': user_id})
            if not user_data:
                # If not found, try by ObjectId
                try:
                    user_data = await MongoDB.db[cls.collection_name].find_one({'_id': ObjectId(user_id)})
                except:
                    return None
                if not user_data:
                    return None
            user_data['_id'] = str(user_data['_id'])
            return User.model_validate(user_data)
        except Exception as e:
            Logger.error(f'Error getting user by ID: {str(e)}')
            return None

    @classmethod
    async def set_user_risk_score(cls, user_id: str) -> Optional[float]:
        try:
            user = await cls.get_user_by_id(user_id)
            if not user:
                return None

            breach_events = await BreachEventService.get_user_breach_events(user_id)
            if breach_events is None:
                return None

            # Calculate score based on breach events severity
            severity_weights = {
                'LOW': 0.25,
                'MEDIUM': 0.5,
                'HIGH': 0.75,
                'CRITICAL': 1.0
            }

            total_weight = 0
            for event in breach_events:
                total_weight += severity_weights.get(event.get('severity', 'LOW'), 0.25)

            # Normalize score between 0 and 1
            num_events = len(breach_events)
            new_score = total_weight / (num_events * 1.0) if num_events > 0 else 0

            # Update user's reference score
            user.ref_score = int(new_score * 100)  # Store as percentage
            await cls.update_user(user.passport_string, user)

            return new_score
        except Exception as e:
            Logger.error(f"Error setting user risk score: {str(e)}")
            return None
