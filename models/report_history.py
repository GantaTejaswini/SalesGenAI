from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
from core.database import Base
from sqlalchemy.sql import func
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class ReportHistory(Base):
    __tablename__ = "report_history"
    
    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    organization_id = Column(String, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    report_type = Column(String, nullable=False) # e.g., "Pipeline", "Win/Loss"
    parameters = Column(JSON, nullable=True) # e.g., date range, filters
    file_url = Column(String, nullable=True)
    status = Column(String, default="Completed") # Pending, Completed, Failed
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
