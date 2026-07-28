import sqlite3
conn = sqlite3.connect('salesgenie.db')
cursor = conn.cursor()
cursor.execute('SELECT COUNT(*) FROM leads WHERE lead_status NOT IN (\"Closed Won\", \"Closed Lost\")')
print(cursor.fetchone()[0])
cursor.execute('SELECT lead_status, estimated_deal_value, created_at, organization_id FROM leads LIMIT 1')
print(cursor.fetchone())
