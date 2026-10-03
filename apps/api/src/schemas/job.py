from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class JobResponse(BaseModel):
    id: str
    project_id: str
    type: str
    status: str
    progress: int
    stage_message: Optional[str] = None
    error_message: Optional[str] = None
    payload: Optional[Dict[str, Any]] = None
    result: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class JobListResponse(BaseModel):
    jobs: List[JobResponse]
    total: int
