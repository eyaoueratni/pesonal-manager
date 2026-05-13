from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token
from app.core.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user (always creates as 'user' role)"""
    
    # Check if email exists
    existing_email = db.query(User).filter(User.email == user.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if username exists
    existing_username = db.query(User).filter(User.username == user.username).first()
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Create new user
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
    """Login user and return JWT token with user info"""
    
    # Find user
    db_user = db.query(User).filter(User.email == user.email).first()
    
    # Verify credentials
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Check if user is active
    if not db_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Contact admin."
        )
    
    # Create access token
    token = create_access_token({
        "sub": str(db_user.id),
        "role": db_user.role
    })
    
    # ✅ FIXED: Return user data WITHOUT hashed_password
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
        "user": user_response  # ✅ Safe, no password
    }