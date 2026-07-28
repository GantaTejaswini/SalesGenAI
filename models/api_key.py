from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from core.database import Base
from sqlalchemy.sql import func
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class ApiKey(Base):
    __tablename__ = "api_keys"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=True)
    name = Column(String, nullable=False)
    key_prefix = Column(String, nullable=False, index=True)
    hashed_key = Column(String, nullable=False)
    scopes = Column(String, default="read,write")
    
    is_revoked = Column(Boolean, default=False)
    last_used_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=True)
