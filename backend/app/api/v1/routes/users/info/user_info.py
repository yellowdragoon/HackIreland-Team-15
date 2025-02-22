from fastapi import APIRouter, HTTPException
from app.services.users.info.user_info import UserInfoService
from app.models.user.info.ipcheck import IPCheckResult
from typing import List, Optional

router = APIRouter(
    prefix="/user-info",
    tags=["user-info"]
)

@router.post("/devices")
async def add_device(device: IPCheckResult):
    try:
        device_id = await UserInfoService.add_device_fingerprint(device)
        if not device_id:
            raise HTTPException(status_code=400, detail="Failed to add device")
        return {"device_id": device_id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/devices/{user_id}")
async def get_user_devices(user_id: str) -> List[IPCheckResult]:
    try:
        devices = await UserInfoService.get_user_devices(user_id)
        if not devices:
            return []
        return devices
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/devices/suspicious")
async def get_suspicious_devices() -> List[IPCheckResult]:
    try:
        return await UserInfoService.get_suspicious_devices()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/devices/shared")
async def get_shared_devices():
    try:
        return await UserInfoService.get_shared_devices()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/devices/{user_id}")
async def delete_user_devices(user_id: str):
    try:
        result = await UserInfoService.delete_user_devices(user_id)
        if not result:
            raise HTTPException(status_code=404, detail="No devices found for user")
        return {"message": "Devices deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/devices/id/{device_id}")
async def get_device_by_id(device_id: str) -> Optional[IPCheckResult]:
    try:
        device = await UserInfoService.get_device_by_id(device_id)
        if not device:
            raise HTTPException(status_code=404, detail="Device not found")
        return device
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/risk-score/{user_id}")
async def get_user_risk_score(user_id: str):
    try:
        score = await UserInfoService.get_user_risk_score(user_id)
        return {"user_id": user_id, "risk_score": score}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
