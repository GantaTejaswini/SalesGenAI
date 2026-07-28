from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, JSON
from core.database import Base
from sqlalchemy.sql import func
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    lead_id = Column(String, ForeignKey("leads.id"), nullable=True, index=True)
    assigned_user_id = Column(String, ForeignKey("users.id"), nullable=True, index=True)
    
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    task_type = Column(String, default="To-Do") # To-Do, Call, Email, Meeting
    priority = Column(String, default="Medium") # Low, Medium, High
    
    due_date = Column(DateTime(timezone=True), nullable=True)
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    is_recurring = Column(Boolean, default=False)
    recurrence_pattern = Column(String, nullable=True) # Daily, Weekly, Monthly
    
    category = Column(String, nullable=True)
    color = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    is_archived = Column(Boolean, default=False)
    
    labels = Column(JSON, nullable=True) # Array of strings or objects
    dependencies = Column(JSON, nullable=True) # Array of task_ids
    reminder_times = Column(JSON, nullable=True) # Array of times before due_date
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
