import asyncio
import logging.config
from concurrent.futures import ThreadPoolExecutor

import tornado.locks
import tornado.web
import tornado.websocket
#import uvloop
import mimetypes

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


async def main():
    app = Application()
    app.listen(PORT)
    logging.info(f'服务器启动成功，开始斗地主佬吧！监听端口: {PORT}')
    await asyncio.Event().wait()


if __name__ == '__main__':
    #uvloop.install()
    asyncio.run(main())
