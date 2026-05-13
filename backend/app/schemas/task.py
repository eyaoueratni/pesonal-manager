from pydantic import BaseModel, validator
from datetime import datetime
from typing import Optional

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    all_day: bool = False
    category: str = "personal"
    priority: str = "normal"
    is_recurring: bool = False
    recurrence_days: Optional[str] = None
    recurrence_end_date: Optional[datetime] = None
    parent_task_id: Optional[int] = None

    @validator('end_time')
    def end_after_start(cls, v, values):
        if 'start_time' in values and v <= values['start_time']:
            raise ValueError('end_time must be after start_time')
        return v

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    all_day: Optional[bool] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    completed: Optional[bool] = None
    # ── add these ──
    is_recurring: Optional[bool] = None
    recurrence_days: Optional[str] = None
    recurrence_end_date: Optional[datetime] = None

class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    start_time: datetime
    end_time: datetime
    all_day: bool
    category: str
    priority: str
    completed: bool
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime]
    # ── add these ──
    is_recurring: bool
    recurrence_days: Optional[str]
    recurrence_end_date: Optional[datetime]
    parent_task_id: Optional[int]

    class Config:
        from_attributes = True