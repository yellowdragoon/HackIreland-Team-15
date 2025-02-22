from fastapi import APIRouter, Depends, Path 

router = APIRouter(
    prefix="/breach_types",
    tags=['breach_types']
)

@router.get("/{company_id}")
async def get_company_breach_types(
    company_id: int = Path(...,title='The ID of the company')
):
    return {'message':f'List breach types for company {company_id}'}

@router.post("/{company_id}")
async def create_company_breach_type(
    company_id: int = Path(...,title='The ID of the company')
):
    return {"message": f'Create breach type for company {company_id}'}
