from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean
from core.database import Base
from sqlalchemy.sql import func
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    type = Column(String, default="info") # info, success, warning, error
    category = Column(String, default="System") # AI, CRM, Meetings, Tasks, System, Security
    
    is_read = Column(Boolean, default=False)
    is_archived = Column(Boolean, default=False)
    link = Column(String, nullable=True) # Optional deep link to a related entity
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
