from sqlalchemy import Column, String, DateTime
from core.database import Base
from sqlalchemy.sql import func
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class Organization(Base):
    __tablename__ = "organizations"
    
    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    name = Column(String, nullable=False)
    logo_url = Column(String, nullable=True)
    industry = Column(String, nullable=True)
    website = Column(String, nullable=True)
    company_size = Column(String, nullable=True)
    plan = Column(String, default="Pro")
    address = Column(String, nullable=True)
    domains = Column(String, nullable=True) # comma-separated or json
    workspace_settings = Column(String, nullable=True) # JSON string
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
