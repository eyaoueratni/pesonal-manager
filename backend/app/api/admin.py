from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.task import Task
from app.models.document import Document
from app.schemas.user import UserResponse, UserCreate, UserUpdate
from app.core.dependencies import require_admin
from app.core.security import hash_password
from app.services.email_services import (
    send_account_activated_email,
    send_account_deactivated_email,
    send_welcome_email,
)

router = APIRouter(prefix="/admin", tags=["admin"])


# ── USERS ──────────────────────────────────────────────────────
@router.get("/users", response_model=List[UserResponse])
def get_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    users = db.query(User).offset(skip).limit(limit).all()
    return users


@router.post("/users", response_model=UserResponse)
async def create_user(
    user: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    new_user = User(
        email=user.email,
        username=user.username,
        hashed_password=hash_password(user.password),
        role=getattr(user, 'role', 'user'),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    try:
        await send_welcome_email(
            email=new_user.email,
            username=new_user.username,
            password=user.password,
        )
    except Exception as e:
        print(f"Failed to send welcome email: {e}")

    return new_user


@router.get("/users/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch("/users/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}


@router.patch("/users/{user_id}/activate")
async def activate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = True
    db.commit()

    try:
        await send_account_activated_email(user.email, user.username)
    except Exception as e:
        print(f"Failed to send activation email: {e}")

    return {"message": "User activated"}


@router.patch("/users/{user_id}/deactivate")
async def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate yourself")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = False
    db.commit()

    try:
        await send_account_deactivated_email(user.email, user.username)
    except Exception as e:
        print(f"Failed to send deactivation email: {e}")

    return {"message": "User deactivated"}


# ── TASKS ──────────────────────────────────────────────────────
@router.get("/tasks/stats")
def get_tasks_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    total = db.query(Task).count()
    completed = db.query(Task).filter(Task.completed == True).count()
    pending = db.query(Task).filter(Task.completed == False).count()
    return {
        "total": total,
        "completed": completed,
        "pending": pending,
    }


@router.get("/tasks")
def get_all_tasks(
    skip: int = 0,
    limit: int = 100,
    user_id: int = None,
    completed: bool = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    query = db.query(Task)
    if user_id:
        query = query.filter(Task.user_id == user_id)
    if completed is not None:
        query = query.filter(Task.completed == completed)
    tasks = query.offset(skip).limit(limit).all()
    return [
        {
            "id": t.id,
            "title": t.title,
            "category": t.category,
            "priority": t.priority,
            "completed": t.completed,
            "start_time": t.start_time,
            "end_time": t.end_time,
            "user_id": t.user_id,
            "created_at": t.created_at,
        }
        for t in tasks
    ]


# ── DOCUMENTS ──────────────────────────────────────────────────
@router.get("/documents/stats")
def get_documents_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    total = db.query(Document).count()
    processed = db.query(Document).filter(
        Document.summary_status == "completed"
    ).count()
    pending = db.query(Document).filter(
        Document.summary_status == "pending"
    ).count()
    return {
        "total": total,
        "processed": processed,
        "pending": pending,
    }


@router.get("/documents")
def get_all_documents(
    skip: int = 0,
    limit: int = 100,
    user_id: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    query = db.query(Document)
    if user_id:
        query = query.filter(Document.user_id == user_id)
    docs = query.offset(skip).limit(limit).all()
    return [
        {
            "id": d.id,
            "title": d.title,
            "original_filename": d.original_filename,
            "file_type": d.file_type,
            "file_size": d.file_size,
            "summary_status": d.summary_status,
            "user_id": d.user_id,
            "created_at": d.created_at,
        }
        for d in docs
    ]


@router.delete("/documents/{document_id}")
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    db.delete(doc)
    db.commit()
    return {"message": "Document deleted"}