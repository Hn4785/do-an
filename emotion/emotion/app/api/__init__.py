from fastapi import APIRouter
from .health   import router as health_router
from .sessions import router as sessions_router
from .reports  import router as reports_router

api_router = APIRouter(prefix="/api")

api_router.include_router(health_router)
api_router.include_router(sessions_router)
api_router.include_router(reports_router)

