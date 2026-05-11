from fastapi import APIRouter
from app.api import health, sessions, reports

# Lấy router từ các module đã import ở trên
health_router   = health.router
sessions_router = sessions.router
reports_router  = reports.router

# ─── Root API Router ─────────────────────────────────────────────────────────
api_router = APIRouter(prefix="/api")

api_router.include_router(health_router,   prefix="/health",   tags=["Health"])
api_router.include_router(sessions_router, prefix="/sessions", tags=["Sessions"])
api_router.include_router(reports_router,  prefix="/reports",  tags=["Reports"])
router = api_router