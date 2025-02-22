from app.models.company.company import Company
from app.utils.logger.logger import Logger
from app.db.db import MongoDB
from typing import Optional
from bson import ObjectId

class CompanyService:
    collection_name = "companies"

    @classmethod
    async def create_company(self, company: Company):
        try:
            company_dict = company.model_dump()
            result = await MongoDB.db[self.collection_name].insert_one(company_dict)
            created_company = await MongoDB.db[self.collection_name].find_one(
                {'_id': result.inserted_id}
            )
            created_company['_id'] = str(created_company['_id'])
            return created_company
        except Exception as e:
            Logger.error(f'Error creating company: {str(e)}')
            return None

    async def get_company(self, company_id: str):
        try:
            company = await MongoDB.db[self.collection_name].find_one(
                {'_id': ObjectId(company_id)}
            )
            return Company.model_validate(company)
        except Exception as e:
            Logger.error(f'Error getting company: {str(e)}')
            return None

    async def delete_company(self, company_id: str):
        try:
            result = await MongoDB.db[self.collection_name].delete_one(
                {'_id': ObjectId(company_id)}
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


