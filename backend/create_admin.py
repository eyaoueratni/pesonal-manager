import sys
sys.path.append('.')

from app.database import SessionLocal, engine, Base
from app.models.user import User
from app.core.security import hash_password

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

def create_admin():
    db = SessionLocal()
    
    try:
        # Check if admin exists
        existing_admin = db.query(User).filter(User.email == "admin@gmail.com").first()
        if existing_admin:
            print("❌ Admin already exists!")
            print(f"Email: {existing_admin.email}")
            print(f"Role: {existing_admin.role}")
            return
        
        # Create admin
        admin = User(
            email="admin@gmail.com",
            username="admin",
            hashed_password=hash_password("admin123"),
            role="admin",
            is_active=True
        )
        
        db.add(admin)
        db.commit()
        db.refresh(admin)
        
        print("✅ Admin created successfully!")
        print("=" * 50)
        print(f"Email:    admin@gmail.com")
        print(f"Password: admin123")
        print(f"Role:     {admin.role}")
        print("=" * 50)
        print("⚠️  IMPORTANT: Change password after first login!")
        
    except Exception as e:
        print(f"❌ Error creating admin: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()