from fastapi import APIRouter, Depends 
from backend.app.services.user_service import UserService
from backend.app.models.user import UserCreate, UserResponse
from typing import List 

router = APIRouter(
    prefix="/users",
    tags=["users"]

)

@router.post("/",response_model=UserResponse)
async def create_user(
    user: UserCreate,
    user_service: UserService = Depends()
):
    return await user_service.create_user(user)

@router.get("/",response_model=List[UserResponse])
async def get_users(
    user_service: UserService = Depends()
):
    return await user_service.get_users()

@router.get("/{user_id}",response_model=UserResponse)
async def get_user(
    user_id: int,
    user_service: UserService = Depends()
):
    return await user_service.get_user(user_id)

@router.put("/{user_id}/trust_score")
async def update_trust_score(
    user_id: int,
    new_score: float,
    user_service: UserService = Depends()
):
    return await user_service.update_trust_score(user_id,new_score)
