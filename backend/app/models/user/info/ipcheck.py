from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class IPCheckResult(BaseModel):
    user_id: Optional[str] = None
    ip_address: Optional[str] = None
    mac_address: Optional[str] = None
    device_id: Optional[str] = None
    device_name: Optional[str] = None
    is_vpn: bool = False
    is_proxy: bool = False
    is_datacenter: bool = False
    is_tor: bool = False
    risk_score: float = 0.0
    country_code: str = ''
    city: Optional[str] = None
    last_seen: Optional[datetime] = None
