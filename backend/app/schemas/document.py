from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Any


class DocumentResponse(BaseModel):
    id: int
    title: str
    original_filename: str
    file_type: str
    file_size: int
    summary: Optional[str]
    summary_status: str
    extracted_data: Optional[Any] = None  # ← add this
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class DocumentUpdate(BaseModel):
    title: Optional[str] = None