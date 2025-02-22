from fastapi import APIRouter, HTTPException
from app.services.companies.company_service import CompanyService
from app.models.company.company import Company

router = APIRouter(
    prefix="/companies",
    tags=["companies"]
)

@router.post("/")
async def create_company(company: Company):
    try:
        created_company = await CompanyService.create_company(company)
        return created_company
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{company_id}")
async def get_company(company_id: str):
    try:
        company = await CompanyService.get_company(company_id)
        return company
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.put("/{company_id}")
async def update_company(company_id: str, company: Company):
    try:
        updated_company = await CompanyService.update_company(company_id, company)
        return updated_company
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.delete("/{company_id}")
async def delete_company(company_id: str):
    try:
        result = await CompanyService.delete_company(company_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/")
async def list_companies():
    try:
        companies = await CompanyService.list_companies()
        return companies
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
