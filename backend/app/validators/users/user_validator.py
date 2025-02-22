from typing import Dict, Any
from app.utils.logger.logger import Logger

class UserValidator:
    @staticmethod
    def validate_user_data(data: Dict[str, Any], partial: bool = False) -> Dict[str, str]:
        Logger.info(f'Validating user data: {data}')
        errors = {}
        passport_string = data.get('passport_string')
        if not partial and not passport_string:
            Logger.warning('Validation failed: Passport string is required')
            errors['passport_string'] = 'Passport string is required'
        elif passport_string and len(passport_string) < 5:
            Logger.warning(f'Validation failed: Passport string too short - {passport_string}')
            errors['passport_string'] = 'Passport string must be at least 5 characters'
        name = data.get('name')
        if not partial and not name:
            Logger.warning('Name validation failed: Name is required')
            errors['name'] = 'Name is required'
        elif name and len(name) < 2:
            Logger.warning(f'Name validation failed: Too short - {name}')
            errors['name'] = 'Name must be at least 2 characters'
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
