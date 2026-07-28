from sqlalchemy import Column, String, DateTime, ForeignKey
from core.database import Base
from sqlalchemy.sql import func
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class TeamInvitation(Base):
    __tablename__ = "team_invitations"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False, index=True)
    email = Column(String, nullable=False, index=True)
    role = Column(String, default="sales_rep") # admin, manager, sales_rep, viewer
    invited_by_id = Column(String, ForeignKey("users.id"), nullable=False)
    token = Column(String, unique=True, index=True, nullable=False)
    status = Column(String, default="pending") # pending, accepted, expired, revoked
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=True)
