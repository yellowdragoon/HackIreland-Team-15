from fastapi import APIRouter, HTTPException
from app.services.users.user_service import UserService
from app.models.user.user import User
from typing import List

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

@router.post("/")
async def create_user(user: User):
    try:
        created_user = await UserService.create_user(user)
        return created_user
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{passport_string}")
async def get_user(passport_string: str):
    user = await UserService.get_user(passport_string)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/")
async def list_users():
    return await UserService.list_users()

@router.put("/{passport_string}")
async def update_user(passport_string: str, user: User):
    updated_user = await UserService.update_user(passport_string, user)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    return updated_user

@router.delete("/{passport_string}")
async def delete_user(passport_string: str):
    if not await UserService.delete_user(passport_string):
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}
