from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Boolean, Float
from core.database import Base
from sqlalchemy.sql import func
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class PipelineStage(Base):
    __tablename__ = "pipeline_stages"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False, index=True)
    
    name = Column(String, nullable=False)
    order_index = Column(Integer, default=0, index=True)
    color = Column(String, default="#4F8CFF")
    probability = Column(Integer, default=50) # 0-100%
    is_default = Column(Boolean, default=False)
    is_won = Column(Boolean, default=False)
    is_lost = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
