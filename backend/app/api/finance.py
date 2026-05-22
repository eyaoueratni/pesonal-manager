from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.finance import Finance
from app.models.user import User
from app.schemas.finance import FinanceCreate, FinanceResponse, FinanceSummary
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/finance", tags=["Finance"])


@router.get("/", response_model=List[FinanceResponse])
def get_all(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(Finance).filter(
        Finance.user_id == current_user.id
    ).order_by(Finance.date.desc()).all()


@router.get("/summary", response_model=FinanceSummary)
def get_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entries = db.query(Finance).filter(Finance.user_id == current_user.id).all()
    total_income = sum(e.amount for e in entries if e.type == "income")
    total_expenses = sum(e.amount for e in entries if e.type == "expense")
    return FinanceSummary(
        total_income=total_income,
        total_expenses=total_expenses,
        balance=total_income - total_expenses,
    )


@router.post("/", response_model=FinanceResponse, status_code=status.HTTP_201_CREATED)
def create_entry(
    data: FinanceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entry = Finance(**data.dict(), user_id=current_user.id)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_entry(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entry = db.query(Finance).filter(
        Finance.id == entry_id,
        Finance.user_id == current_user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    db.delete(entry)
    db.commit()
    return None