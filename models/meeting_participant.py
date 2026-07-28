from sqlalchemy import Column, String, DateTime, ForeignKey, Enum
from core.database import Base
from sqlalchemy.sql import func
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class MeetingParticipant(Base):
    __tablename__ = "meeting_participants"
    
    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    meeting_id = Column(String, ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, index=True)
    
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    contact_id = Column(String, ForeignKey("contacts.id", ondelete="CASCADE"), nullable=True)
    
    participant_email = Column(String, nullable=True)
    status = Column(String, default="Pending") # Pending, Accepted, Tentative, Declined
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
