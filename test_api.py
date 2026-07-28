import asyncio; import httpx; async def run():
  async with httpx.AsyncClient() as client:
    res = await client.post('http://127.0.0.1:8000/api/auth/login', data={'username':'tejrtej9347@gmail.com', 'password':'password'})
    token = res.json().get('access_token')
    res2 = await client.get('http://127.0.0.1:8000/api/dashboard?timeframe=this_month', headers={'Authorization': f'Bearer {token}'})
    print(res2.json())
asyncio.run(run())
