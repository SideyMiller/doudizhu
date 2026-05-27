import asyncio
import logging.config
from concurrent.futures import ThreadPoolExecutor

import tornado.locks
import tornado.web
import tornado.websocket
#import uvloop
import mimetypes
from tornado.httpclient import AsyncHTTPClient, HTTPRequest
from tornado.process import cpu_count

from api.auth import IndexHandler, LoginHandler, UserInfoHandler
from api.game.views import SocketHandler
from config import DEBUG, LOGGING, PORT, SECRET_KEY, DATABASE_URI

logging.config.dictConfig(LOGGING)


class Application(tornado.web.Application):
    def __init__(self):
        settings = {
            'debug': DEBUG,
            'cookie_secret': SECRET_KEY,
            'xsrf_cookies': False,
            'gzip': False,
            'autoescape': 'xhtml_escape',
            'database_uri': DATABASE_URI,
            
            
            'login_url': '/login',
        }

        url_patterns = [
            ('/', IndexHandler),
            ('/ws', SocketHandler),           
        ]
        super().__init__(url_patterns, **settings)
        self.executor = ThreadPoolExecutor(cpu_count() * 2)
        self.allow_robot = True

DOUZERO_API_URL = "https://newdonediner-doudizhu-api.hf.space/"  # 随便一个GET端点
HF_TOKEN = "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"
HEARTBEAT_INTERVAL = 600  # 每10分钟戳一次，比HF休眠周期短

async def keep_alive():
    
    """定时戳 HuggingFace API，防止休眠"""
    client = AsyncHTTPClient()
    while True:
        await asyncio.sleep(600)
        headers = {
                
                "Content-Type": "application/json",
                "Authorization": f"Bearer {HF_TOKEN}"
            }
        try:
            req = HTTPRequest(DOUZERO_API_URL, method="GET", headers=headers,request_timeout=10.0)
            await client.fetch(req)
            print("DEBUG: HuggingFace 心跳 OK")
        except Exception as e:
            print(f"DEBUG: 心跳失败（可能正在唤醒）: {e}")
        await asyncio.sleep(HEARTBEAT_INTERVAL)

async def main():
    app = Application()
    app.listen(PORT)
    logging.info(f'服务器启动成功，开始斗地主佬吧！监听端口: {PORT}')
    # 启动心跳任务
    asyncio.create_task(keep_alive())
    await asyncio.Event().wait()
    

if __name__ == '__main__':
    #uvloop.install()
    asyncio.run(main())
