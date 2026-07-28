from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from core.database import Base
from sqlalchemy.sql import func
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class UserSession(Base):
    __tablename__ = "user_sessions"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    token_jti = Column(String, unique=True, index=True, nullable=False)
    device_name = Column(String, default="Unknown Device")
    browser = Column(String, default="Unknown Browser")
    os = Column(String, default="Unknown OS")
    ip_address = Column(String, default="127.0.0.1")
    is_current = Column(Boolean, default=True)
    is_revoked = Column(Boolean, default=False)
    
    last_active_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=True)
