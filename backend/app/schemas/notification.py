from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    is_read: bool
    notification_type: str
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationCreate(BaseModel):
    title: str
    message: str
    notification_type: Optional[str] = "info"
    user_id: int