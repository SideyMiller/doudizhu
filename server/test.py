# test.py  新建这个文件，放在同目录下
import asyncio
from tornado.httpclient import AsyncHTTPClient, HTTPRequest
import json

HF_TOKEN = "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"
API_URL = "https://newdonediner-doudizhu-api.hf.space/"

async def test():
    client = AsyncHTTPClient()
    
    payload = {
        "action": "init",
        "data": {
            "three_landlord_cards": "3 4 5",
            "pid": "2",
            "ai_amount": 2,
            "player_data": [
                {"model": "WP", "hand_cards": "66667777888", "position_code": "0"},
                {"model": "WP", "hand_cards": "33444555999", "position_code": "2"},
            ]
        }
    }
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {HF_TOKEN}"
    }
    
    req = HTTPRequest(API_URL, method="POST", body=json.dumps(payload), headers=headers, request_timeout=30.0)
    res = await client.fetch(req)
    print(json.loads(res.body))

asyncio.run(test())