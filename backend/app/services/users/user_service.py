from app.models.user.user import User
from app.validators.users.user_validator import UserValidator
from app.utils.logger.logger import Logger
from typing import Optional, Dict, Any, Tuple, List

class UserService:
    @staticmethod
    def create_user(passport_string: str, name: str, ref_score: int = 0) -> Tuple[Optional[User], Dict[str, str]]:
        Logger.info(f'Attempting to create user with passport: {passport_string}')
        
        errors = UserValidator.validate_user_data({
            'passport_string': passport_string,
            'name': name,
            'ref_score': ref_score
        })

        if errors:
            Logger.warning(f'Validation failed for user creation: {errors}')
            return None, errors

        if User.objects(passport_string=passport_string).first():
            Logger.warning(f'User creation failed: Passport already exists - {passport_string}')
            return None, {'passport_string': 'Passport already exists'}

        try:
            user = User(
                passport_string=passport_string,
                name=name,
                ref_score=ref_score
            )
            saved_user = user.save()
            Logger.info(f'Successfully created user with passport: {passport_string}')
            return saved_user, {}
        except Exception as e:
            Logger.error(f'Error creating user {passport_string}: {str(e)}')
            return None, {'error': str(e)}

    @staticmethod
    def get_user(passport_string: str) -> Optional[User]:
        Logger.info(f'Fetching user with passport: {passport_string}')
        user = User.objects(passport_string=passport_string).first()
        if not user:
            Logger.warning(f'User not found: {passport_string}')
        return user

    @staticmethod
    def list_users() -> List[User]:
        Logger.info('Fetching all users')
        return list(User.objects.all())

    @staticmethod
    def update_user(passport_string: str, **update_data) -> Tuple[Optional[User], Dict[str, str]]:
        Logger.info(f'Attempting to update user: {passport_string}')
        
        user = User.objects(passport_string=passport_string).first()
        if not user:
            Logger.warning(f'Update failed: User not found - {passport_string}')
            return None, {'error': 'User not found'}

        # Validate update data
        errors = UserValidator.validate_user_data(update_data, partial=True)
        if errors:
            Logger.warning(f'Update validation failed: {errors}')
            return None, errors

        try:
            for key, value in update_data.items():
                setattr(user, key, value)
            user.save()
            Logger.info(f'Successfully updated user: {passport_string}')
            return user, {}
        except Exception as e:
            Logger.error(f'Error updating user {passport_string}: {str(e)}')
            return None, {'error': str(e)}

    @staticmethod
    def delete_user(passport_string: str) -> Tuple[bool, Dict[str, str]]:
        Logger.info(f'Attempting to delete user: {passport_string}')
        
        user = User.objects(passport_string=passport_string).first()
        if not user:
            Logger.warning(f'Delete failed: User not found - {passport_string}')
            return False, {'error': 'User not found'}

        try:
            user.delete()
            Logger.info(f'Successfully deleted user: {passport_string}')
            return True, {}
        except Exception as e:
            Logger.error(f'Error deleting user {passport_string}: {str(e)}')
            return False, {'error': str(e)}
