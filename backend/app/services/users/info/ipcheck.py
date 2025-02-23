import aiohttp
import ipaddress
from app.models.user.info.ipcheck import IPCheckResult
from app.utils.logger.logger import Logger
import os
from dotenv import load_dotenv
from typing import Dict

# Define AI provider IP ranges
AI_PROVIDER_RANGES = {
    'Azure': ipaddress.IPv4Network('20.33.0.0/16'),
    'AWS': ipaddress.IPv4Network('3.5.140.0/22')
}

load_dotenv()

class IPCheckService:
    IPQUALITYSCORE_API_KEY = os.getenv("IPQUALITYSCORE_API_KEY")

    @classmethod
    def _check_ai_provider(cls, ip_address: str) -> Dict[str, str]:
        try:
            ip = ipaddress.IPv4Address(ip_address)
            for provider, ip_range in AI_PROVIDER_RANGES.items():
                if ip in ip_range:
                    Logger.info(f'IP {ip_address} identified as {provider} AI agent')
                    return {'is_ai_agent': True, 'ai_provider': provider}
            return {'is_ai_agent': False, 'ai_provider': None}
        except Exception as e:
            Logger.error(f'Error checking AI provider for IP {ip_address}: {str(e)}')
            return {'is_ai_agent': False, 'ai_provider': None}

    @classmethod
    async def check_ip(cls, ip_address: str) -> IPCheckResult:
        try:
            if ipaddress.ip_address(ip_address).is_private:
                return IPCheckResult(is_vpn=False, is_proxy=False, country_code="LOCAL", city="LOCAL")
            
            # Check if IP is from an AI provider
            ai_check = cls._check_ai_provider(ip_address)

            async with aiohttp.ClientSession() as session:
                url = f"https://ipqualityscore.com/api/json/ip/{cls.IPQUALITYSCORE_API_KEY}/{ip_address}"
                async with session.get(url) as response:
                    data = await response.json()
                    base_risk_score = data.get("fraud_score", 0)
                    
                    # Increase risk score if it's an AI agent
                    if ai_check['is_ai_agent']:
                        base_risk_score += 50
                    
                    return IPCheckResult(
                        is_vpn=data.get("vpn", False),
                        is_proxy=data.get("proxy", False),
                        is_datacenter=data.get("datacenter", False),
                        is_tor=data.get("tor", False),
                        is_ai_agent=ai_check['is_ai_agent'],
                        ai_provider=ai_check['ai_provider'],
                        risk_score=min(base_risk_score, 100),  # Cap at 100
                        country_code=data.get("country_code", ""),
                        city=data.get("city", None)
                    )
        except Exception as e:
            Logger.error(f"Error checking IP {ip_address}: {str(e)}")
            return IPCheckResult(is_vpn=False, is_proxy=False, country_code="UNKNOWN", city=None)
