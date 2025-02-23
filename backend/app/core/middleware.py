from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
from app.utils.json_encoder import CustomJSONEncoder
import time

class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: ASGIApp):
        super().__init__(app)

    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        try:
            response = await call_next(request)
            if response.status_code == 404:
                error_content = {
                    "error": "Not Found",
                    "message": f"Resource {request.url.path} not found",
                    "path": request.url.path,
                    "method": request.method,
                    "timestamp": time.time(),
                    "process_time": f"{(time.time() - start_time):.4f} seconds"
                }
                return JSONResponse(
                    status_code=404,
                    content=CustomJSONEncoder.encode(error_content)
                )

            if response.status_code >= 400:
                return response

            return response

        except Exception as exc:
            error_content = {
                "error": "Internal Server Error",
                "message": str(exc),
                "path": request.url.path,
                "method": request.method,
                "timestamp": time.time(),
                "process_time": f"{(time.time() - start_time):.4f} seconds"
            }
            return JSONResponse(
                status_code=500,
                content=CustomJSONEncoder.encode(error_content)
            )
