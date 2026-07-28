from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from core.database import Base
from sqlalchemy.sql import func
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    
    action = Column(String, nullable=False) # e.g., 'UPDATE_LEAD'
    entity_type = Column(String, nullable=False) # e.g., 'Lead'
    entity_id = Column(String, nullable=False)
    
    changes = Column(Text, nullable=True) # JSON payload of changes
    ip_address = Column(String, nullable=True)
    device_info = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
