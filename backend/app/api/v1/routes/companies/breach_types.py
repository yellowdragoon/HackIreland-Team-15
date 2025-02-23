from fastapi import APIRouter, HTTPException
from app.services.companies.breach_type.breach_type_service import CompanyBreachService
from app.models.company.breach_type.breach_type import CompanyBreachType, BreachTypeEnum
from app.services.companies.company_service import CompanyService
from typing import List

router = APIRouter(
    prefix="/breaches",
    tags=["breaches"]
)

@router.post("/{company_id}")
async def create_breach(company_id: str, breach: CompanyBreachType):
    try:
        created_breach = await CompanyBreachService.create_breach_record(company_id, breach)
        if not created_breach:
            raise HTTPException(status_code=404, detail="Company not found or breach already exists")
        return created_breach
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{company_id}")
async def get_breach(company_id: str):
    try:
        breach = await CompanyBreachService.get_breach_by_company(company_id)
        if not breach:
            raise HTTPException(status_code=404, detail="Breach not found")
        return breach
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{company_id}")
async def update_breach(company_id: str, breach: CompanyBreachType):
    try:
        updated_breach = await CompanyBreachService.update_breach(company_id, breach)
        if not updated_breach:
            raise HTTPException(status_code=404, detail="Breach not found")
        return updated_breach
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{company_id}")
async def delete_breach(company_id: str):
    try:
        success = await CompanyBreachService.delete_breach(company_id)
        if not success:
            raise HTTPException(status_code=404, detail="Breach not found")
        return {"message": "Breach deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/type/{breach_type}")
async def get_companies_by_breach_type(breach_type: BreachTypeEnum):
    try:
        companies = await CompanyBreachService.get_companies_by_breach_type(breach_type)
        return {"companies": companies}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/high-impact")
async def get_high_impact_breaches(effect_threshold: int = 70):
    try:
        breaches = await CompanyBreachService.get_high_impact_breaches(effect_threshold)
        return {"breaches": breaches}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
