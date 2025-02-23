from fastapi import APIRouter, HTTPException, Request
from app.services.users.user_service import UserService
from app.models.user.user import User
from typing import List

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

@router.post("/")
async def create_user(user: User, request: Request):
    try:
        ip_address = request.client.host
        created_user = await UserService.create_user(user, ip_address)
        return created_user
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{passport_string}")
async def get_user(passport_string: str, request: Request):
    ip_address = request.client.host
    user = await UserService.get_user(passport_string, ip_address)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/{passport_string}/risk")
async def get_user_risk(passport_string: str, request: Request):
    ip_address = request.client.host
    result = await UserService.get_user_with_risk_score(passport_string, ip_address)
    if not result:
        raise HTTPException(status_code=404, detail="User not found")
    return result

@router.get("/")
async def list_users():
    return await UserService.list_users()

@router.put("/{passport_string}")
async def update_user(passport_string: str, user: User, request: Request):
    ip_address = request.client.host
    updated_user = await UserService.update_user(passport_string, user, ip_address)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    return updated_user

@router.delete("/{passport_string}")
async def delete_user(passport_string: str):
    if not await UserService.delete_user(passport_string):
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}
