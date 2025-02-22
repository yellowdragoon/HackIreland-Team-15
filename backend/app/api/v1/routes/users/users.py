from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from app.services.users.user_service import UserService
from app.utils.logger.logger import Logger

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

class UserBase(BaseModel):
    passport_string: str
    name: str
    ref_score: Optional[int] = 0

class UserCreate(UserBase):
    pass

class UserUpdate(BaseModel):
    name: Optional[str] = None
    ref_score: Optional[int] = None

class UserResponse(UserBase):
    class Config:
        from_attributes = True

@router.post("/", response_model=UserResponse)
async def create_user(user: UserCreate):
    try:
        Logger.info(f"Creating user with passport: {user.passport_string}")
        created_user, errors = UserService.create_user(
            passport_string=user.passport_string,
            name=user.name,
            ref_score=user.ref_score
        )
        
        if errors:
            Logger.error(f"Validation errors: {errors}")
            raise HTTPException(status_code=400, detail=errors)
            
        Logger.info(f"Successfully created user: {user.passport_string}")
        return created_user
        
    except Exception as e:
        Logger.error(f"Error creating user: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{passport_string}", response_model=UserResponse)
async def get_user(passport_string: str):
    try:
        Logger.info(f"Fetching user: {passport_string}")
        user = UserService.get_user(passport_string)
        
        if not user:
            Logger.warning(f"User not found: {passport_string}")
            raise HTTPException(status_code=404, detail="User not found")
            
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        Logger.error(f"Error fetching user: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{passport_string}", response_model=UserResponse)
async def update_user(passport_string: str, user: UserUpdate):
    try:
        Logger.info(f"Updating user: {passport_string}")
        update_data = {k: v for k, v in user.dict().items() if v is not None}
        updated_user, errors = UserService.update_user(passport_string, **update_data)
        
        if errors:
            Logger.error(f"Update failed: {errors}")
            raise HTTPException(status_code=400, detail=errors)
            
        Logger.info(f"Successfully updated user: {passport_string}")
        return updated_user
        
    except Exception as e:
        Logger.error(f"Error updating user: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{passport_string}")
async def delete_user(passport_string: str):
    try:
        Logger.info(f"Deleting user: {passport_string}")
        success, errors = UserService.delete_user(passport_string)
        
        if not success:
            Logger.error(f"Delete failed: {errors}")
            raise HTTPException(
                status_code=404 if errors.get('error') == 'User not found' else 400,
                detail=errors
            )
            
        Logger.info(f"Successfully deleted user: {passport_string}")
        return {"message": "User deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        Logger.error(f"Error deleting user: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[UserResponse])
async def list_users():
    try:
        Logger.info("Fetching all users")
        return UserService.list_users()
    except Exception as e:
        Logger.error(f"Error listing users: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
