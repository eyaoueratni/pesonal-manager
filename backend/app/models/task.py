from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    
    # Basic info
    title = Column(String(200), nullable=False)  # "Doctor Appointment"
    description = Column(Text, nullable=True)     # "Annual checkup at City Hospital"
    
    # Time-based (MOST IMPORTANT for calendar)
    start_time = Column(DateTime(timezone=True), nullable=False)  # When it starts
    end_time = Column(DateTime(timezone=True), nullable=False)    # When it ends
    all_day = Column(Boolean, default=False)  # True for events like "Birthday"
    
    # Categorization
    category = Column(String(50), default="personal")  # work, personal, health, fitness, etc.
    priority = Column(String(20), default="normal")    # important, normal, low
    
    # Status
    completed = Column(Boolean, default=False)
    
    # Reminders (optional for now)
    # reminder_before_minutes = Column(Integer, nullable=True)  # Remind 30 mins before
    
    # Relationships
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    # Add to app/models/task.py
    is_recurring = Column(Boolean, default=False)
    recurrence_days = Column(String(20), nullable=True)  # e.g. "0,2,4" (Mon,Wed,Fri)
    recurrence_end_date = Column(DateTime(timezone=True), nullable=True)
    parent_task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)  # links occurrences to original
    user = relationship("User", back_populates="tasks")