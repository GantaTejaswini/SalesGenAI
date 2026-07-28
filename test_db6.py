from api.dashboard import *
from core.database import SessionLocal
from models.user import User
db=SessionLocal()
user=db.query(User).order_by(User.created_at.desc()).first()
res = get_dashboard_data('this_month', db, user)
print('OPP:', res['kpis']['open_opportunities'])
