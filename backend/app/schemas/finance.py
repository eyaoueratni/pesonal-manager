from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class FinanceCreate(BaseModel):
    type: str  # income / expense
    title: str
    amount: float
    currency: str = "TND"
    date: Optional[datetime] = None
    is_recurring: bool = False
    recurrence: Optional[str] = None
    document_id: Optional[int] = None


class FinanceResponse(BaseModel):
    id: int
    type: str
    title: str
    amount: float
    currency: str
    date: datetime
    is_recurring: bool
    recurrence: Optional[str]
    document_id: Optional[int]
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class FinanceSummary(BaseModel):
    total_income: float
    total_expenses: float
    balance: float
    currency: str = "TND"