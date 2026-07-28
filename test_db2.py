from api.dashboard import *
from core.database import SessionLocal
from models.models import LeadModel
db=SessionLocal()
org_id=db.query(LeadModel).first().organization_id
open_opportunities = db.query(func.count(LeadModel.id)).filter(LeadModel.organization_id == org_id, LeadModel.lead_status.notin_(['Closed Won', 'Closed Lost'])).scalar() or 0
print('OPP:', open_opportunities)
