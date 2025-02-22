from fastapi import APIRouter, Depends 
from ....services.company_service import CompanyService 
from ....models.company import CompanyCreate,CompanyResponse
from typing import List 


router = APIRouter(
    prefix="/companies",
    tags=["companies"]
)

@router.post("/",response_model=CompanyResponse)
async def create_company(
    company: CompanyCreate,
    company_service: CompanyService = Depends()
):
    return await company_service.create_company(company)

@router.get("/",response_model=List[CompanyResponse])
async def get_companies(
    company_service: CompanyService = Depends()
):
    return await company_service.get_companies()

@router.get("/{company_id}",response_model=CompanyResponse)
async def get_company(
    company_id: int,
    company_service: CompanyService = Depends()
): 
    return await company_service.get_company(company_id)

@router.post("/{company_id}/events")
async def create_event(
    company_id: int,
    event: dict,
    company_service: CompanyService = Depends()
):
    return await company_service.create_event(company_id,event)