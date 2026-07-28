from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from core.database import Base
from sqlalchemy.sql import func
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=True)
    role = Column(String, default="sales_rep") # super_admin, admin, manager, sales_rep, viewer
    is_active = Column(Boolean(), default=True)
    is_superuser = Column(Boolean(), default=False)
    
    # Profile & Identity extensions
    phone_number = Column(String, nullable=True)
    job_title = Column(String, nullable=True)
    department = Column(String, nullable=True)
    timezone = Column(String, default="UTC")
    language = Column(String, default="en")
    theme = Column(String, default="dark")
    bio = Column(String, nullable=True)
    profile_picture = Column(String, nullable=True)
    
    # Security
    two_factor_enabled = Column(Boolean(), default=False)
    two_factor_secret = Column(String, nullable=True)
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
