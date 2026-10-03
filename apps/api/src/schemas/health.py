from pydantic import BaseModel
from typing import Optional, Dict, Any

class DatabaseHealth(BaseModel):
    status: str
    type: str
    message: Optional[str] = None

class RedisHealth(BaseModel):
    status: str
    message: Optional[str] = None

class FFmpegHealth(BaseModel):
    available: bool
    version: Optional[str] = None
    path: Optional[str] = None

class StorageHealth(BaseModel):
    provider: str
    root_writable: bool

class HealthResponse(BaseModel):
    status: str # healthy, degraded, unhealthy
    version: str
    environment: str
    services: Dict[str, Any]
