from sqlalchemy import Column, String, DateTime, ForeignKey, Integer
from core.database import Base
from sqlalchemy.sql import func
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class LeadAttachment(Base):
    __tablename__ = "lead_attachments"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False, index=True)
    lead_id = Column(String, ForeignKey("leads.id"), nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    file_name = Column(String, nullable=False)
    file_url = Column(String, nullable=False)
    file_type = Column(String, nullable=True)
    file_size = Column(Integer, nullable=True) # in bytes
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
