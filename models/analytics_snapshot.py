from sqlalchemy import Column, String, DateTime, ForeignKey, Float, JSON
from core.database import Base
from sqlalchemy.sql import func
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class AnalyticsSnapshot(Base):
    __tablename__ = "analytics_snapshots"
    
    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    organization_id = Column(String, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    
    snapshot_date = Column(DateTime(timezone=True), nullable=False)
    metric_type = Column(String, nullable=False) # e.g. "Daily", "Weekly", "Monthly"
    
    metrics = Column(JSON, nullable=False) # Stores all calculated KPI values for that date
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
