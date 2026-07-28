from sqlalchemy import Column, String, DateTime, ForeignKey
from core.database import Base
from sqlalchemy.sql import func
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class Contact(Base):
    __tablename__ = "contacts"
    
    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False, index=True)
    company_id = Column(String, ForeignKey("companies.id"), nullable=True, index=True)
    
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, index=True, nullable=False)
    phone = Column(String, nullable=True)
    job_title = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
