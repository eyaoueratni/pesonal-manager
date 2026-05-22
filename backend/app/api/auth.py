from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token
from app.core.security import hash_password, verify_password, create_access_token
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_email = db.query(User).filter(User.email == user.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")

    existing_username = db.query(User).filter(User.username == user.username).first()
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")

    new_user = User(
        email=user.email,
        username=user.username,
        hashed_password=hash_password(user.password),
        role="user"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.post("/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    if not db_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Contact admin."
        )

    token = create_access_token({
        "sub": str(db_user.id),
        "role": db_user.role
    })

    user_response = UserResponse(
        id=db_user.id,
        email=db_user.email,
        username=db_user.username,
        role=db_user.role,
        is_active=db_user.is_active,
        created_at=db_user.created_at
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user_response
    }


# ── Change Password ───────────────────────────────────────────
class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


@router.post("/change-password")
def change_password(
    data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect"
        )

    if len(data.new_password) < 6:
        raise HTTPException(
            status_code=400,
            detail="New password must be at least 6 characters"
        )

    current_user.hashed_password = hash_password(data.new_password)
    db.commit()
    return {"message": "Password changed successfully"}
import secrets
from datetime import datetime, timedelta
from app.services.email_services import send_reset_password_email

# Store reset tokens temporarily (in production use Redis, for now use DB or dict)
reset_tokens = {}

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

@router.post("/forgot-password")
async def forgot_password(
    data: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == data.email).first()
    
    # Always return success even if email not found (security best practice)
    if not user:
        return {"message": "If this email exists, a reset link has been sent."}
    
    # Generate reset token
    token = secrets.token_urlsafe(32)
    reset_tokens[token] = {
        "user_id": user.id,
        "expires": datetime.utcnow() + timedelta(hours=1)
    }

    # Send email
    try:
        await send_reset_password_email(
            email=user.email,
            username=user.username,
            token=token,
        )
    except Exception as e:
        print(f"Failed to send reset email: {e}")

    return {"message": "If this email exists, a reset link has been sent."}


@router.post("/reset-password")
def reset_password(
    data: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    token_data = reset_tokens.get(data.token)

    if not token_data:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    if datetime.utcnow() > token_data["expires"]:
        del reset_tokens[data.token]
        raise HTTPException(status_code=400, detail="Token has expired")

    user = db.query(User).filter(User.id == token_data["user_id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.hashed_password = hash_password(data.new_password)
    db.commit()

    del reset_tokens[data.token]
    return {"message": "Password reset successfully"}