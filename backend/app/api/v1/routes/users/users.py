from fastapi import APIRouter, HTTPException, Request
from app.services.users.user_service import UserService
from app.models.user.user import User
from app.models.response import ApiResponse
from typing import List
from app.utils.logger.logger import Logger

router = APIRouter(
    prefix="/users",
    tags=["users"],
    responses={
        404: {"description": "Not found"},
        500: {"description": "Internal server error"}
    }
)

@router.post("/test-data", response_model=ApiResponse[List[User]])
async def create_test_data():
    test_users = [
        User(passport_string="PS001", name="John Doe"),
        User(passport_string="PS002", name="Jane Smith"),
        User(passport_string="PS003", name="Bob Wilson"),
        User(passport_string="PS004", name="Alice Brown"),
        User(passport_string="PS005", name="Charlie Davis")
    ]
    
    created_users = []
    for user in test_users:
        created_user = await UserService.create_user(user, "127.0.0.1")
        if created_user:
            created_users.append(created_user)
    
    return ApiResponse(data=created_users, message="Test users created successfully")

@router.get("/", response_model=ApiResponse[List[User]])
async def list_users():
    users = await UserService.list_users()
    return ApiResponse(data=users, message="Users retrieved successfully")

@router.post("/", response_model=ApiResponse[User])
async def create_user(user: User, request: Request):
    try:
        ip_address = request.client.host
        created_user = await UserService.create_user(user, ip_address)
        return ApiResponse(data=created_user, message="User created successfully")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/score/{passport_string}",
         response_model=ApiResponse[dict],
         summary="Get user's reference score",
         description="Get the reference score for a user based on their breach events and device history.")
async def get_user_ref_score(passport_string: str):
    try:
        Logger.info(f"Getting reference score for user {passport_string}")
        user = await UserService.get_user(passport_string)
        if not user:
            Logger.error(f"User {passport_string} not found")
            raise HTTPException(status_code=404, detail="User not found")
        
        ref_score = await UserService.set_user_risk_score(passport_string)
        if ref_score is None:
            Logger.error(f"Failed to calculate reference score for user {passport_string}")
            raise HTTPException(status_code=500, detail="Failed to calculate reference score")
            
        Logger.info(f"Successfully got reference score {ref_score} for user {passport_string}")
        return {"status": "success", "data": {"ref_score": ref_score}}
    except HTTPException as e:
        raise e
    except Exception as e:
        Logger.error(f"Error getting reference score for user {passport_string}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/risk/{passport_string}")
async def get_user_risk(passport_string: str, request: Request):
    try:
        ip_address = request.client.host
        result = await UserService.get_user_with_risk_score(passport_string, ip_address)
        if not result:
            raise HTTPException(status_code=404, detail="User not found")
        return {
            "user": result["user"],
            "risk_score": result["risk_score"],
            "devices": result["devices"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{passport_string}")
async def update_user(passport_string: str, user: User, request: Request):
    try:
        ip_address = request.client.host
        updated_user = await UserService.update_user(passport_string, user, ip_address)
        if not updated_user:
            raise HTTPException(status_code=404, detail="User not found")
        return updated_user
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{passport_string}")
async def delete_user(passport_string: str):
    try:
        user = await UserService.get_user(passport_string)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        success = await UserService.delete_user(passport_string)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to delete user")
            
        return {"status": "success", "message": "User deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{passport_string}")
async def get_user(passport_string: str, request: Request):
    ip_address = request.client.host
    user = await UserService.get_user(passport_string, ip_address)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
