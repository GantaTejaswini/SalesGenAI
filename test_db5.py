from api.dashboard import *
from core.database import SessionLocal
from models.models import User
db=SessionLocal()
user=db.query(User).order_by(User.created_at.desc()).first()
res = dashboard('this_month', db, user)
print('OPP:', res['kpis']['open_opportunities'])
