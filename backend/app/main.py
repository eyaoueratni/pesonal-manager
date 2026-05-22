from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.core.dependencies import get_current_user
from app.models import user, task
from app.api import auth, admin, tasks, users, documents, notification
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from app.database import SessionLocal
from app.models.document import Document
from app.models.user import User
from app.services.email_services import send_deadline_email
from app.services.notification_service import create_notification
from datetime import datetime, date
from dotenv import load_dotenv
import json
from apscheduler.triggers.cron import CronTrigger
from app.api import finance

load_dotenv()

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="personal manager",
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
app.include_router(notification.router)
app.include_router(finance.router)

@app.get("/")
def root():
    return {"message": "Planora API is running! 🚀"}


@app.get("/me")
def get_me(current_user=Depends(get_current_user)):
    return current_user


# ── Scheduler ─────────────────────────────────────────────────
scheduler = AsyncIOScheduler()


async def check_deadlines():
    print("🔍 Checking deadlines...")
    db = SessionLocal()
    try:
        documents = db.query(Document).filter(
            Document.extracted_data != None,
            Document.summary_status == "done"
        ).all()

        print(f"📄 Found {len(documents)} processed documents")
        today = date.today()
        print(f"📅 Today is: {today}")

        for doc in documents:
            try:
                if isinstance(doc.extracted_data, str):
                    data = json.loads(doc.extracted_data)
                else:
                    data = doc.extracted_data

                deadline_str = data.get("deadline")
                amount = data.get("amount", "N/A")

                print(f"📋 Doc: {doc.title} | Deadline: {deadline_str} | Amount: {amount}")

                if not deadline_str or deadline_str.lower() in ["null", "none", "n/a", ""]:
                    print(f"⏭️ Skipping {doc.title} — no deadline")
                    continue

                deadline_date = None
                for fmt in ["%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y", "%d %B %Y", "%d %b %Y"]:
                    try:
                        deadline_date = datetime.strptime(deadline_str.strip(), fmt).date()
                        break
                    except ValueError:
                        continue

                if not deadline_date:
                    print(f"❌ Could not parse deadline: {deadline_str}")
                    continue

                days_until = (deadline_date - today).days
                print(f"⏰ Days until deadline: {days_until}")

                # Send reminder 3 days before
                if days_until == 3:
                    print(f"🚨 Sending 3-day reminder for {doc.title}")
                    user = db.query(User).filter(User.id == doc.user_id).first()
                    if user:
                        print(f"📧 Sending to {user.email}")
                        try:
                            await send_deadline_email(
                                email=user.email,
                                username=user.username,
                                document_title=doc.title,
                                deadline=deadline_str,
                                amount=amount,
                            )
                            print(f"✅ Email sent successfully!")
                        except Exception as e:
                            print(f"❌ Email failed: {e}")

                        create_notification(
                            db=db,
                            user_id=user.id,
                            title="⚠️ Payment due in 3 days",
                            message=f"'{doc.title}' is due on {deadline_str}. Amount: {amount}",
                            notification_type="warning",
                        )

                # Send reminder 1 day before
                elif days_until == 1:
                    print(f"🚨 Sending 1-day reminder for {doc.title}")
                    user = db.query(User).filter(User.id == doc.user_id).first()
                    if user:
                        print(f"📧 Sending to {user.email}")
                        try:
                            await send_deadline_email(
                                email=user.email,
                                username=user.username,
                                document_title=doc.title,
                                deadline=deadline_str,
                                amount=amount,
                            )
                            print(f"✅ Urgent email sent successfully!")
                        except Exception as e:
                            print(f"❌ Email failed: {e}")

                        create_notification(
                            db=db,
                            user_id=user.id,
                            title="🚨 Payment due tomorrow!",
                            message=f"'{doc.title}' is due tomorrow! Amount: {amount}",
                            notification_type="warning",
                        )

            except Exception as e:
                print(f"Error processing doc {doc.id}: {e}")
                continue

    finally:
        db.close()


@app.on_event("startup")
async def start_scheduler():
    scheduler.add_job(
        check_deadlines,
        CronTrigger(hour=8, minute=0),
        id="deadline_checker",
        replace_existing=True,
    )
    scheduler.start()
    print("✅ Deadline scheduler started")


@app.on_event("shutdown")
async def stop_scheduler():
    scheduler.shutdown()
