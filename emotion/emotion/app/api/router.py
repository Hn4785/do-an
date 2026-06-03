from fastapi import APIRouter

from app.api import health, reports, sessions


api_router = APIRouter()

api_router.include_router(health.router, prefix="/health", tags=["Health"])
api_router.include_router(sessions.router, prefix="/sessions", tags=["Sessions"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports"])

router = api_router
