from fastapi import APIRouter
from .v1.health import router as health_router
from .v1.projects import router as projects_router
from .v1.jobs import router as jobs_router
from .v1.styles import router as styles_router
from .v1.timelines import router as timelines_router
from .v1.storage import router as storage_router
from .v1.analysis import router as analysis_router
from .v1.planning import router as planning_router
from .v1.rendering import router as rendering_router

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(health_router)
api_router.include_router(projects_router)
api_router.include_router(jobs_router)
api_router.include_router(styles_router)
api_router.include_router(timelines_router)
api_router.include_router(storage_router)
api_router.include_router(analysis_router)
api_router.include_router(planning_router)
api_router.include_router(rendering_router)
