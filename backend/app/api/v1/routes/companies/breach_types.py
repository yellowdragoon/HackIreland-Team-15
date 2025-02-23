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
        # First check if company exists
        company = await CompanyService.get_company(company_id)
        if not company:
            raise HTTPException(status_code=404, detail=f"Company {company_id} not found")

        # Create breach record
        created_breach = await CompanyBreachService.create_breach_record(company_id, breach)
        if not created_breach:
            raise HTTPException(status_code=400, detail="Failed to create breach record")
        return created_breach
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{company_id}")
async def get_breach(company_id: str):
    try:
        # First check if company exists
        company = await CompanyService.get_company(company_id)
        if not company:
            raise HTTPException(status_code=404, detail=f"Company {company_id} not found")

        # Get breach record
        breach = await CompanyBreachService.get_breach_by_company(company_id)
        if not breach:
            raise HTTPException(status_code=404, detail=f"No breach record found for company {company_id}")
        return breach
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{company_id}")
async def update_breach(company_id: str, breach: CompanyBreachType):
    try:
        # First check if company exists
        company = await CompanyService.get_company(company_id)
        if not company:
            raise HTTPException(status_code=404, detail=f"Company {company_id} not found")

        # Update breach record
        updated_breach = await CompanyBreachService.update_breach(company_id, breach)
        if not updated_breach:
            raise HTTPException(status_code=404, detail=f"No breach record found for company {company_id}")
        return updated_breach
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{company_id}")
async def delete_breach(company_id: str):
    try:
        # First check if company exists
        company = await CompanyService.get_company(company_id)
        if not company:
            raise HTTPException(status_code=404, detail=f"Company {company_id} not found")

        # Delete breach record
        success = await CompanyBreachService.delete_breach(company_id)
        if not success:
            raise HTTPException(status_code=404, detail=f"No breach record found for company {company_id}")
        return {"message": "Breach deleted successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/high-impact/{effect_threshold}")
async def get_high_impact_breaches(effect_threshold: int):
    try:
        breaches = await CompanyBreachService.get_high_impact_breaches(effect_threshold)
        if not breaches:
            return {"breaches": []}
        return {"breaches": breaches}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
