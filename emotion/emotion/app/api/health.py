import time
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/health", tags=["Health"])


class ServiceStatus(BaseModel):
    camera:    bool
    mediapipe: bool
    deepface:  bool
    database:  bool


class HealthResponse(BaseModel):
    status:     str  # "ok" | "degraded" | "error"
    version:    str
    services:   ServiceStatus
    checked_at: float  # Unix ms


@router.get("", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Kiểm tra trạng thái hệ thống"""
    # TODO: Thay bằng kiểm tra thực tế từng service
    services = ServiceStatus(
        camera=True,
        mediapipe=True,
        deepface=True,
        database=True,
    )

    all_ok = all([
        services.camera,
        services.mediapipe,
        services.deepface,
        services.database,
    ])

    return HealthResponse(
        status="ok" if all_ok else "degraded",
        version="1.0.0",
        services=services,
        checked_at=time.time() * 1000,
    )
