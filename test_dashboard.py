import requests
res = requests.get('http://127.0.0.1:8000/api/dashboard?timeframe=this_month', headers={'Authorization': 'Bearer ' + 'mock'})
print(res.status_code)
