from api.dashboard import *
from core.database import SessionLocal
from models.models import User
db=SessionLocal()
org_id='3531c5a5-c320-4f19-9a93-1b93c95fe22c'
open_opportunities = db.query(func.count(LeadModel.id)).filter(LeadModel.organization_id == org_id, LeadModel.lead_status.notin_(['Closed Won', 'Closed Lost'])).scalar() or 0
print('OPP:', open_opportunities)
