from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.core.dependencies import get_current_user
from app.models import user
from app.models import task
from app.api import auth, admin, tasks, users, documents

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="HomeBase API",
    description="Personal Life Planner with AI Assistant",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(tasks.router)
app.include_router(users.router)
app.include_router(documents.router)

@app.get("/")
def root():
    return {"message": "HomeBase API is running! 🚀"}

@app.get("/me")
def get_me(current_user=Depends(get_current_user)):
    """Get current user info"""
    return current_user

from dotenv import load_dotenv
load_dotenv()
