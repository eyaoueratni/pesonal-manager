from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Finance(Base):
    __tablename__ = "finances"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String(10), nullable=False)  # income / expense
    title = Column(String(200), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="TND")
    date = Column(DateTime(timezone=True), server_default=func.now())
    is_recurring = Column(Boolean, default=False)
    recurrence = Column(String(20), nullable=True)  # monthly / weekly / yearly
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="finances")