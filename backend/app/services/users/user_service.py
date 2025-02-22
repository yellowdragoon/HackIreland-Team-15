from app.models.user.user import User
from app.validators.users.user_validator import UserValidator
from app.utils.logger.logger import Logger
from typing import Optional, Dict, Any, Tuple

class UserService:
    @staticmethod
    def create_user(email: str, password: str, name: str, ref_score: int = 0) -> Tuple[Optional[User], Dict[str, str]]:
        Logger.info(f'Attempting to create user with email: {email}')
        
        errors = UserValidator.validate_user_data({
            'email': email,
            'password': password,
            'name': name,
            'ref_score': ref_score
        })

        if errors:
            Logger.warning(f'Validation failed for user creation: {errors}')
            return None, errors

        if User.objects(email=email).first():
            Logger.warning(f'User creation failed: Email already exists - {email}')
            return None, {'email': 'Email already exists'}

        try:
            user = User(
                email=email,
                password=password,
                name=name,
                ref_score=ref_score
            )
            saved_user = user.save()
            Logger.info(f'Successfully created user: {email}')
            return saved_user, {}
        except Exception as e:
            Logger.error(f'Error creating user {email}: {str(e)}')
            return None, {'error': str(e)}

    @staticmethod
    def get_user(email: str) -> Optional[User]:
        Logger.info(f'Fetching user with email: {email}')
        user = User.objects(email=email).first()
        if not user:
            Logger.warning(f'User not found: {email}')
        return user

    @staticmethod
    def update_user(email: str, **update_data) -> Tuple[Optional[User], Dict[str, str]]:
        Logger.info(f'Attempting to update user: {email}')
        
        errors = UserValidator.validate_user_data(update_data)
        if errors:
            Logger.warning(f'Validation failed for user update: {errors}')
            return None, errors

        user = User.objects(email=email).first()
        if not user:
            Logger.warning(f'Update failed: User not found - {email}')
            return None, {'error': 'User not found'}

        try:
            for key, value in update_data.items():
                setattr(user, key, value)
            updated_user = user.save()
            Logger.info(f'Successfully updated user: {email}')
            return updated_user, {}
        except Exception as e:
            Logger.error(f'Error updating user {email}: {str(e)}')
            return None, {'error': str(e)}

    @staticmethod
    def delete_user(email: str) -> Tuple[bool, Dict[str, str]]:
        Logger.info(f'Attempting to delete user: {email}')
        
        user = User.objects(email=email).first()
        if not user:
            Logger.warning(f'Delete failed: User not found - {email}')
            return False, {'error': 'User not found'}

        try:
            user.delete()
            Logger.info(f'Successfully deleted user: {email}')
            return True, {}
        except Exception as e:
            Logger.error(f'Error deleting user {email}: {str(e)}')
            return False, {'error': str(e)}

    @staticmethod
    def list_users():
        Logger.info('Fetching all users')
        return User.objects()
