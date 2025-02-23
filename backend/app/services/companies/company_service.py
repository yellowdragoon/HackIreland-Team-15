from app.models.company.company import Company
from app.utils.logger.logger import Logger
from app.core.db.db import MongoDB
from typing import Optional
from bson import ObjectId

class CompanyService:
    collection_name = "companies"

    @classmethod
    async def check_if_record_exists(cls, company_id: str) -> bool:
        try:
            company = await MongoDB.db[cls.collection_name].find_one({'id': company_id})
            return company is not None
        except Exception as e:
            Logger.error(f'Error checking if company exists: {str(e)}')
            return False

    @classmethod
    async def create_company(cls, company: Company):
        try:
            # Check if company already exists
            existing_company = await cls.get_company(company.id)
            if existing_company:
                return existing_company

            # Create new company
            company_dict = company.model_dump()
            result = await MongoDB.db[cls.collection_name].insert_one(company_dict)
            
            # Get created company
            created_company = await MongoDB.db[cls.collection_name].find_one(
                {'_id': result.inserted_id}
            )
            if not created_company:
                return None

            # Convert ObjectId to string
            if '_id' in created_company:
                created_company['_id'] = str(created_company['_id'])

            return Company.model_validate(created_company)
        except Exception as e:
            Logger.error(f'Error creating company: {str(e)}')
            return None

    @classmethod
    async def get_company(cls, company_id: str):
        try:
            company_data = await MongoDB.db[cls.collection_name].find_one(
                {'id': company_id}
            )
            if not company_data:
                return None

            # Convert ObjectId to string
            if '_id' in company_data:
                company_data['_id'] = str(company_data['_id'])

            return Company.model_validate(company_data)
        except Exception as e:
            Logger.error(f'Error getting company: {str(e)}')
            return None

    @classmethod
    async def delete_company(cls, company_id: str):
        try:
            result = await MongoDB.db[cls.collection_name].delete_one(
                {'id': company_id}
            )
            return result.deleted_count > 0
        except Exception as e:
            Logger.error(f'Error deleting company: {str(e)}')
            return False

    async def update_company(self, company: Company):
        try:
            company_dict = company.model_dump(by_alias=True, exclude={'_id'})
            result = await MongoDB.db[self.collection_name].update_one(
                {'_id': ObjectId(company.id)},
                {'$set': company_dict}
            )
            return result.modified_count > 0
        except Exception as e:
            Logger.error(f'Error updating company: {str(e)}')
            return False


