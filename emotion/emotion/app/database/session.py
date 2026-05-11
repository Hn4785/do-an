from sqlalchemy import create_engine, event
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from sqlalchemy.pool import StaticPool

from app.config import settings


# ===== Engine =====
def create_db_engine():
    """Tạo SQLAlchemy engine phù hợp với DATABASE_URL."""
    db_url = settings.DATABASE_URL

    # SQLite cần config đặc biệt cho async/threading
    if db_url.startswith("sqlite"):
        engine = create_engine(
            db_url,
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
            echo=settings.DEBUG,
        )

        # Bật WAL mode cho SQLite (tốt hơn cho concurrent reads)
        @event.listens_for(engine, "connect")
        def set_sqlite_pragma(dbapi_connection, connection_record):
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA journal_mode=WAL")
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.close()

    else:
        # PostgreSQL / MySQL
        engine = create_engine(
            db_url,
            pool_pre_ping=True,
            pool_size=10,
            max_overflow=20,
            echo=settings.DEBUG,
        )

    return engine


# ===== Engine & Session Factory =====
engine = create_db_engine()

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)


# ===== Base Model =====
class Base(DeclarativeBase):
    """Base class cho tất cả SQLAlchemy models."""
    pass


# ===== Dependency: DB Session =====
def get_db():
    """
    FastAPI dependency để inject DB session vào route handlers.

    Usage:
        @router.get("/example")
        def example(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


# ===== Init DB =====
def init_db() -> None:
    """
    Tạo tất cả bảng trong database nếu chưa tồn tại.
    Gọi hàm này khi khởi động app (trong main.py).
    """
    # Import tất cả models để Base biết cần tạo bảng nào
    from app.models import (  # noqa: F401
        alert_model,
        frame_result_model,
        report_model,
        session_model,
    )

    Base.metadata.create_all(bind=engine)


def drop_db() -> None:
    """
    Xóa toàn bộ bảng (dùng cho testing hoặc reset).
    ⚠️ KHÔNG dùng trong production!
    """
    Base.metadata.drop_all(bind=engine)
