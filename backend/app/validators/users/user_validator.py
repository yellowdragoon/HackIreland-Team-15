from typing import Dict, Any
from app.utils.logger.logger import Logger
import re

class UserValidator:
    @staticmethod
    def validate_user_data(data: Dict[str, Any]) -> Dict[str, str]:
        Logger.info(f'Validating user data: {data}')
        errors = {}
        
        # Validate email
        email = data.get('email')
        if not email:
            Logger.warning('Email validation failed: Email is required')
            errors['email'] = 'Email is required'
        elif not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            Logger.warning(f'Email validation failed: Invalid format - {email}')
            errors['email'] = 'Invalid email format'

        # Validate password
        password = data.get('password')
        if not password:
            Logger.warning('Password validation failed: Password is required')
            errors['password'] = 'Password is required'
        elif len(password) < 6:
            Logger.warning('Password validation failed: Too short')
            errors['password'] = 'Password must be at least 6 characters'

        # Validate name
        name = data.get('name')
        if not name:
            Logger.warning('Name validation failed: Name is required')
            errors['name'] = 'Name is required'
        elif len(name) < 2:
            Logger.warning(f'Name validation failed: Too short - {name}')
            errors['name'] = 'Name must be at least 2 characters'

        # Validate ref_score
        ref_score = data.get('ref_score')
        if ref_score is not None:
            if not isinstance(ref_score, int):
                Logger.warning(f'Ref score validation failed: Not an integer - {ref_score}')
                errors['ref_score'] = 'Ref score must be an integer'
            elif not (0 <= ref_score <= 100):
                Logger.warning(f'Ref score validation failed: Out of range - {ref_score}')
                errors['ref_score'] = 'Ref score must be between 0 and 100'

        if errors:
            Logger.warning(f'Validation failed with errors: {errors}')
        else:
            Logger.info('Validation successful')
        return errors
