from datetime import datetime
from typing import List, Optional
from bson import ObjectId
from app.services.users.info.ipcheck import IPCheckService
from app.models.user.info.ipcheck import IPCheckResult
from app.utils.logger.logger import Logger
from app.core.db.db import MongoDB

class UserInfoService:
    collection_name = "user_info"

    @classmethod
    async def add_device(cls, user_id: str, ip_address: str) -> str:
        try:
            ip_check = await IPCheckService.check_ip(ip_address)

            device = IPCheckResult(
                user_id=user_id,
                ip_address=ip_address,
                **ip_check.model_dump(exclude={'user_id', 'ip_address', 'last_seen'}),
                last_seen=datetime.now()
            )

            result = await MongoDB.db[cls.collection_name].update_one(
                {
                    'user_id': user_id,
                    'ip_address': ip_address
                },
                {
                    '$set': device.model_dump()
                },
                upsert=True
            )

            if result.upserted_id:
                return str(result.upserted_id)
            return "updated"

        except Exception as e:
            Logger.error(f"Error adding device: {str(e)}")
            return None

    @classmethod
    async def get_user_devices(cls, user_id: str) -> List[dict]:
        try:
            devices = await MongoDB.db[cls.collection_name].find({'user_id': user_id}).to_list(None)
            return [IPCheckResult.model_validate(d).model_dump() for d in devices]
        except Exception as e:
            Logger.error(f"Error getting devices: {str(e)}")
            return []

    @classmethod
    async def get_risk_score(cls, user_id: str) -> int:
        try:
            devices = await cls.get_user_devices(user_id)
            if not devices:
                return 0

            base_score = max(d.risk_score for d in devices)
            vpn_bonus = 10 if any(d.is_vpn for d in devices) else 0
            proxy_bonus = 15 if any(d.is_proxy for d in devices) else 0
            tor_bonus = 20 if any(d.is_tor for d in devices) else 0

            return min(100, base_score + vpn_bonus + proxy_bonus + tor_bonus)

        except Exception as e:
            Logger.error(f"Error calculating risk: {str(e)}")
            return 0
