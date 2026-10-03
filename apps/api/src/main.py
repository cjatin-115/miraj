import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .core.config import settings
from .core.database import init_db
from .core.redis import close_redis, check_redis_health
from .core.media import media_env
from .api.router import api_router

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("miraaj")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup sequence
    logger.info("Initializing Miraaj V1 API Server...")
    
    # 1. Validate FFmpeg environment
    if media_env.is_valid:
        logger.info(f"FFmpeg OK: {media_env.ffmpeg_path} ({media_env.ffmpeg_version})")
    else:
        logger.warning("FFmpeg NOT detected or invalid. Video probing and rendering will be limited.")

    # 2. Initialize Database tables
    await init_db()

    # 3. Verify Redis connection
    redis_status = await check_redis_health()
    logger.info(f"Redis Status: {redis_status['status']}")

    yield

    # Shutdown sequence
    logger.info("Shutting down Miraaj API Server...")
    await close_redis()

app = FastAPI(
    title="Miraaj V1 API",
    description="Personal AI-Powered Short-Form Video Generation Pipeline API",
    version="1.0.0",
    lifespan=lifespan
)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.API_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(api_router)

@app.get("/", tags=["Root"])
async def root():
    return {
        "name": "Miraaj V1",
        "tagline": "AI Determines WHAT. Code Renders HOW.",
        "status": "online",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "apps.api.src.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=True
    )
