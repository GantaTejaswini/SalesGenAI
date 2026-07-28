from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from core.database import Base
from sqlalchemy.sql import func
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class NotificationPreference(Base):
    __tablename__ = "notification_preferences"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False, index=True)
    
    email_notifications = Column(Boolean, default=True)
    in_app_notifications = Column(Boolean, default=True)
    ai_alerts = Column(Boolean, default=True)
    meeting_reminders = Column(Boolean, default=True)
    task_reminders = Column(Boolean, default=True)
    marketing_emails = Column(Boolean, default=False)
    product_updates = Column(Boolean, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
