import aiohttp
import ipaddress
from app.models.user.info.ipcheck import IPCheckResult
from app.utils.logger.logger import Logger
import os
from dotenv import load_dotenv

load_dotenv()

class IPCheckService:
    IPQUALITYSCORE_API_KEY = os.getenv("IPQUALITYSCORE_API_KEY")

    @classmethod
    async def check_ip(cls, ip_address: str) -> IPCheckResult:
        try:
            if ipaddress.ip_address(ip_address).is_private:
                return IPCheckResult(is_vpn=False, is_proxy=False, country_code="LOCAL", city="LOCAL")

            async with aiohttp.ClientSession() as session:
                url = f"https://ipqualityscore.com/api/json/ip/{cls.IPQUALITYSCORE_API_KEY}/{ip_address}"
                async with session.get(url) as response:
                    data = await response.json()
                    return IPCheckResult(
                        is_vpn=data.get("vpn", False),
                        is_proxy=data.get("proxy", False),
                        is_datacenter=data.get("datacenter", False),
                        is_tor=data.get("tor", False),
                        risk_score=data.get("fraud_score", 0),
                        country_code=data.get("country_code", ""),
                        city=data.get("city", None)
                    )
        except Exception as e:
            Logger.error(f"Error checking IP {ip_address}: {str(e)}")
            return IPCheckResult(is_vpn=False, is_proxy=False, country_code="UNKNOWN", city=None)
