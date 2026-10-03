import logging
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import text

from .config import settings

logger = logging.getLogger(__name__)

class Base(DeclarativeBase):
    pass

primary_db_url = settings.effective_database_url
fallback_db_url = "sqlite+aiosqlite:///./miraaj_local.db"

active_db_type = "postgresql" if "postgresql" in primary_db_url else "sqlite"
current_engine = create_async_engine(primary_db_url, echo=False, future=True, pool_pre_ping=True)
AsyncSessionLocal = async_sessionmaker(
    bind=current_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)

async def init_db() -> None:
    """Initialize database tables, falling back to SQLite if PostgreSQL is unreachable."""
    global current_engine, AsyncSessionLocal, active_db_type
    try:
        async with current_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info(f"Database initialized with {active_db_type}.")
    except Exception as e:
        logger.warning(f"Primary database ({active_db_type}) connection failed: {e}. Switching to SQLite fallback for local development.")
        current_engine = create_async_engine(fallback_db_url, echo=False, future=True)
        active_db_type = "sqlite"
        AsyncSessionLocal.configure(bind=current_engine)
        async with current_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database initialized with SQLite fallback.")

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session

async def check_db_health() -> dict:
    """Check database connectivity and return status details."""
    try:
        async with AsyncSessionLocal() as session:
            result = await session.execute(text("SELECT 1"))
            val = result.scalar()
            if val == 1:
                return {
                    "status": "connected",
                    "type": active_db_type,
                    "message": f"Connected to {active_db_type}"
                }
    except Exception as e:
        return {
            "status": "error",
            "type": active_db_type,
            "message": str(e)
        }
    return {
        "status": "disconnected",
        "type": active_db_type,
        "message": "No response"
    }
