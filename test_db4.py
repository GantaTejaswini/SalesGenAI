from api.dashboard import *
from core.database import SessionLocal
from models.lead_model import LeadModel
from sqlalchemy import func
db=SessionLocal()
org_id=db.query(LeadModel).first().organization_id
open_opportunities = db.query(func.count(LeadModel.id)).filter(LeadModel.organization_id == org_id, LeadModel.lead_status.notin_(['Closed Won', 'Closed Lost'])).scalar() or 0
new_leads = db.query(func.count(LeadModel.id)).filter(LeadModel.organization_id == org_id, LeadModel.lead_status == 'New').scalar() or 0
print('OPP:', open_opportunities)
print('New leads:', new_leads)
