from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.dependencies import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse
from pydantic import BaseModel, EmailStr
from typing import Optional
from passlib.context import CryptContext

router = APIRouter(prefix="/users", tags=["Users"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class UserUpdateProfile(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None


class UserUpdatePassword(BaseModel):
    current_password: str
    new_password: str


# ─────────────────────────────────────────────
# GET current user profile
# ─────────────────────────────────────────────
@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


# ─────────────────────────────────────────────
# UPDATE profile (username / email)
# ─────────────────────────────────────────────
@router.put("/me", response_model=UserResponse)
def update_profile(
    data: UserUpdateProfile,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if username is taken by another user
    if data.username and data.username != current_user.username:
        existing = db.query(User).filter(
            User.username == data.username,
            User.id != current_user.id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Username already taken")
        current_user.username = data.username

    # Check if email is taken by another user
    if data.email and data.email != current_user.email:
        existing = db.query(User).filter(
            User.email == data.email,
            User.id != current_user.id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
        current_user.email = data.email

    db.commit()
    db.refresh(current_user)
    return current_user


# ─────────────────────────────────────────────
# CHANGE password
# ─────────────────────────────────────────────
@router.put("/me/password")
def change_password(
    data: UserUpdatePassword,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify current password
    if not pwd_context.verify(data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    # Validate new password
    if len(data.new_password) < 7:
        raise HTTPException(status_code=400, detail="New password must be at least 7 characters")

    current_user.hashed_password = pwd_context.hash(data.new_password)
    db.commit()

    return {"message": "Password updated successfully"}


# ─────────────────────────────────────────────
# DELETE account
# ─────────────────────────────────────────────
@router.delete("/me")
def delete_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.delete(current_user)
    db.commit()
    return {"message": "Account deleted successfully"}


from app.core.security import hash_password, verify_password
from pydantic import BaseModel

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

@router.post("/change-password")
def change_password(
    data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Verify current password
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    # Update password
    current_user.hashed_password = hash_password(data.new_password)
    db.commit()
    return {"message": "Password changed successfully"}