from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from contextlib import asynccontextmanager
import time
import logging

from app.config import settings
from app.api.router import router as api_router        
from app.websocket import router as ws_router          
from app.database.base import init_db                       

# ===== Logger =====
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("face_emotion_monitor")


# ===== Lifespan (startup / shutdown) =====
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Khởi động Face Emotion Monitor Backend...")
    await init_db()
    logger.info("✅ Database đã sẵn sàng")
    yield
    logger.info("🛑 Đang tắt server...")


# ===== Khởi tạo FastAPI App =====
app = FastAPI(
    title="Face Emotion Monitor API",
    description="API cho hệ thống nhận diện cảm xúc và đặc trưng khuôn mặt",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)


# ===== CORS Middleware =====
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== Trusted Host Middleware =====
if hasattr(settings, "ALLOWED_HOSTS") and settings.ALLOWED_HOSTS:
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=settings.ALLOWED_HOSTS,
    )


# ===== Request Logging Middleware =====
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000
    logger.info(
        f"{request.method} {request.url.path} "
        f"→ {response.status_code} "
        f"({process_time:.1f}ms)"
    )
    return response


# ===== Global Exception Handlers =====
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "status_code": exc.status_code,
            "message": exc.detail,
            "path": str(request.url.path),
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "error": True,
            "status_code": 422,
            "message": "Dữ liệu đầu vào không hợp lệ",
            "details": exc.errors(),
            "path": str(request.url.path),
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(
        f"Unhandled exception at {request.url.path}: {exc}",
        exc_info=True,
    )
    return JSONResponse(
        status_code=500,
        content={
            "error": True,
            "status_code": 500,
            "message": "Lỗi server nội bộ",
            "path": str(request.url.path),
        },
    )


# ===== Include Routers =====
app.include_router(api_router, prefix="/api")
app.include_router(ws_router)                          # WebSocket không cần prefix /api


# ===== Health Check =====
@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "ok",
        "version": "1.0.0",
        "service": "Face Emotion Monitor",
    }


@app.get("/", tags=["System"])
async def root():
    return {
        "message": "Face Emotion Monitor API",
        "docs": "/docs",
        "health": "/health",
    }