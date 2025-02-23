from app.models.company.company import Company
from app.models.company.breach_type.breach_type import CompanyBreachType, BreachTypeEnum
from app.utils.logger.logger import Logger
from app.core.db.db import MongoDB
from typing import Optional, List
from bson import ObjectId
from app.services.companies.company_service import CompanyService

class CompanyBreachService:
    collection_name = "company_breaches"

    @classmethod
    async def create_breach_record(cls, company_id: str, breach: CompanyBreachType):
        try:
            company_exists = await CompanyService.check_if_record_exists(company_id)
            if not company_exists:
                Logger.error(f'Company {company_id} not found')
                return None
            existing_breach = await cls.get_breach_by_company(company_id)
            if existing_breach:
                Logger.warning(f'Breach record already exists for company {company_id}')
                return existing_breach

            breach_dict = breach.model_dump()
            breach_dict['company_id'] = ObjectId(company_id)

            result = await MongoDB.db[cls.collection_name].insert_one(breach_dict)

            created_breach = await MongoDB.db[cls.collection_name].find_one(
                {'_id': result.inserted_id}
            )
            created_breach['_id'] = str(created_breach['_id'])
            return created_breach
        except Exception as e:
            Logger.error(f'Error creating breach record: {str(e)}')
            return None

    @classmethod
    async def get_breach_by_company(cls, company_id: str) -> Optional[CompanyBreachType]:
        try:
            breach = await MongoDB.db[cls.collection_name].find_one(
                {'company_id': ObjectId(company_id)}
            )
            if breach:
                breach['_id'] = str(breach['_id'])
                breach['company_id'] = str(breach['company_id'])
                return CompanyBreachType.model_validate(breach)
            return None
        except Exception as e:
            Logger.error(f'Error getting breach record: {str(e)}')
            return None

    @classmethod
    async def get_breach_type(cls, breach_type: str) -> Optional[CompanyBreachType]:
        try:
            breach_type_lower = breach_type.lower()
            for enum_member in BreachTypeEnum:
                if enum_member.value == breach_type_lower:
                    return CompanyBreachType(name=enum_member, effect=5)
            return None
        except Exception as e:
            Logger.error(f'Error getting breach type: {str(e)}')
            return None

    @classmethod
    async def update_breach(cls, company_id: str, breach: CompanyBreachType):
        try:
            breach_dict = breach.model_dump(exclude={'id'})
            result = await MongoDB.db[cls.collection_name].update_one(
                {'company_id': ObjectId(company_id)},
                {'$set': breach_dict}
            )
            if result.modified_count > 0:
                return await cls.get_breach_by_company(company_id)
            return None
        except Exception as e:
            Logger.error(f'Error updating breach record: {str(e)}')
            return None

    @classmethod
    async def delete_breach(cls, company_id: str) -> bool:
        try:
            result = await MongoDB.db[cls.collection_name].delete_one(
                {'company_id': ObjectId(company_id)}
            )
            return result.deleted_count > 0
        except Exception as e:
            Logger.error(f'Error deleting breach record: {str(e)}')
            return False

    @classmethod
    async def get_companies_by_breach_type(cls, breach_type: BreachTypeEnum) -> List[str]:
        try:
            breaches = await MongoDB.db[cls.collection_name].find(
                {'name': breach_type}
            ).to_list(length=None)
            return [str(breach['company_id']) for breach in breaches]
        except Exception as e:
            Logger.error(f'Error getting companies by breach type: {str(e)}')
            return []

    @classmethod
    async def get_high_impact_breaches(cls, effect_threshold: int = 70) -> List[dict]:
        try:
            breaches = await MongoDB.db[cls.collection_name].find(
                {'effect': {'$gte': effect_threshold}}
            ).to_list(length=None)
            for breach in breaches:
                breach['_id'] = str(breach['_id'])
                breach['company_id'] = str(breach['company_id'])

            return breaches
        except Exception as e:
            Logger.error(f'Error getting high impact breaches: {str(e)}')
            return []
