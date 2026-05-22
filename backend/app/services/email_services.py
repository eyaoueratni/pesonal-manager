from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from dotenv import load_dotenv
import os

load_dotenv()


def get_mail_config():
    return ConnectionConfig(
        MAIL_USERNAME=os.getenv("EMAIL_HOST_USER"),
        MAIL_PASSWORD=os.getenv("EMAIL_HOST_PASSWORD"),
        MAIL_FROM=os.getenv("MAIL_FROM", "noreply@planora.app"),
        MAIL_PORT=int(os.getenv("EMAIL_PORT", 2525)),
        MAIL_SERVER=os.getenv("EMAIL_HOST"),
        MAIL_STARTTLS=True,
        MAIL_SSL_TLS=False,
        USE_CREDENTIALS=True,
    )


async def send_welcome_email(email: str, username: str, password: str):
    fastmail = FastMail(get_mail_config())
    html = f"""
    <html><body style="font-family: Arial, sans-serif; color: #333; padding: 30px;">
        <h2>Welcome to Planora</h2>
        <p>Hello <strong>{username}</strong>,</p>
        <p>Your account has been created. Here are your credentials:</p>
        <p><strong>Email:</strong> {email}<br>
        <strong>Password:</strong> {password}</p>
        <p style="color: #888;">Please change your password after your first login.</p>
        <p>— Planora Team</p>
    </body></html>
    """
    message = MessageSchema(
        subject="Your Planora account is ready",
        recipients=[email],
        body=html,
        subtype=MessageType.html,
    )
    await fastmail.send_message(message)


async def send_deadline_email(
    email: str,
    username: str,
    document_title: str,
    deadline: str,
    amount: str,
):
    fastmail = FastMail(get_mail_config())
    html = f"""
    <html><body style="font-family: Arial, sans-serif; color: #333; padding: 30px;">
        <h2>Payment Deadline Detected</h2>
        <p>Hello <strong>{username}</strong>,</p>
        <p>A deadline was found in your document <strong>{document_title}</strong>.</p>
        <p><strong>Deadline:</strong> {deadline}<br>
        <strong>Amount:</strong> {amount}</p>
        <p>Please make sure to process this before the due date.</p>
        <p>— Planora Team</p>
    </body></html>
    """
    message = MessageSchema(
        subject=f"Payment deadline detected — {document_title}",
        recipients=[email],
        body=html,
        subtype=MessageType.html,
    )
    await fastmail.send_message(message)


async def send_account_activated_email(email: str, username: str):
    fastmail = FastMail(get_mail_config())
    html = f"""
    <html><body style="font-family: Arial, sans-serif; color: #333; padding: 30px;">
        <h2>Account Activated</h2>
        <p>Hello <strong>{username}</strong>,</p>
        <p>Your Planora account has been activated. You can now log in.</p>
        <p>— Planora Team</p>
    </body></html>
    """
    message = MessageSchema(
        subject="Your Planora account has been activated",
        recipients=[email],
        body=html,
        subtype=MessageType.html,
    )
    await fastmail.send_message(message)


async def send_account_deactivated_email(email: str, username: str):
    fastmail = FastMail(get_mail_config())
    html = f"""
    <html><body style="font-family: Arial, sans-serif; color: #333; padding: 30px;">
        <h2>Account Deactivated</h2>
        <p>Hello <strong>{username}</strong>,</p>
        <p>Your Planora account has been deactivated by an administrator.</p>
        <p>Please contact support if you think this is a mistake.</p>
        <p>— Planora Team</p>
    </body></html>
    """
    message = MessageSchema(
        subject="Your Planora account has been deactivated",
        recipients=[email],
        body=html,
        subtype=MessageType.html,
    )
    await fastmail.send_message(message)

async def send_reset_password_email(email: str, username: str, token: str):
    fastmail = FastMail(get_mail_config())
    reset_url = f"http://localhost:5173/reset-password?token={token}"
    html = f"""
    <html><body style="font-family: Arial, sans-serif; color: #333; padding: 30px;">
        <h2>Reset your password</h2>
        <p>Hello <strong>{username}</strong>,</p>
        <p>Click the link below to reset your password. This link expires in 1 hour.</p>
        <a href="{reset_url}" style="color: #6366f1;">{reset_url}</a>
        <p style="color: #888; margin-top: 20px;">If you didn't request this, ignore this email.</p>
        <p>— Planora Team</p>
    </body></html>
    """
    message = MessageSchema(
        subject="Reset your Planora password",
        recipients=[email],
        body=html,
        subtype=MessageType.html,
    )
    await fastmail.send_message(message)