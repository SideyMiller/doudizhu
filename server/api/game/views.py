import json
import logging
from typing import Optional, Any, Dict, List, Union

from tornado.escape import json_decode
from tornado.web import authenticated
from tornado.websocket import WebSocketHandler, WebSocketClosedError

from api.base import RestfulHandler, JwtMixin
from models.base import AlchemyMixin
from .globalvar import GlobalVar
from .player import Player
from .protocol import Protocol
from .room import Room
from sqlalchemy import select
from models import User


class SocketHandler(WebSocketHandler, AlchemyMixin, JwtMixin):

    def __init__(self, application, request, **kwargs):
        super().__init__(application, request, **kwargs)
        self.player: Optional[Player] = None

    def get_current_user(self):
        token = self.get_argument('token', None)
        if token:
            return self.jwt_decode(token)
        cookie = self.get_secure_cookie("userinfo")
        if cookie:
            return json_decode(cookie)
        return None

    @property
    def uid(self) -> int:
        if self.player is None:
            return 0
        return self.player.uid

    @property
    def room(self) -> Optional[Room]:
        return self.player.room

    @property
    def allow_robot(self) -> bool:
        return self.application.allow_robot

    async def data_received(self, chunk):
        logging.info('Received stream data')

    # @authenticated
    async def open(self):
        # self.player = GlobalVar.find_player(**self.current_user)
        # self.player.socket = self
        logging.info('SOCKET[0] 匿名连接成功')

    async def on_message(self, message):
        if message == 'ping':
            self._write_message('pong')
            return

        code, packet = self.decode_message(message)
        if code is None:
            self.write_message([Protocol.ERROR, {'reason': 'Protocol cannot be resolved'}])
            return

        logging.info('REQ[%d]: %s', self.uid, message)

        if code == Protocol.REQ_ROOM_LIST:
            self.write_message([Protocol.RSP_ROOM_LIST, {'rooms': GlobalVar.room_list()}])
            return
        if code == Protocol.REQ_LOGIN:
            name = packet.get('name')
            address = packet.get('openid')
            
            # 1. 查数据库，没有就新建（原汁原味搬过来的）
            async with self.session as session:
                async with session.begin():
                    account = await self.get_one_or_none(select(User).where(User.openid == address))
                    if not account:
                        account = User(openid=address, name=name, sex=1, avatar='')
                        session.add(account)
                        await session.commit()
            
            account_dict = account.to_dict()
            
            # 2. 核心：现场绑定玩家身份！(把原先 open 里的活儿在这干了)
            self.player = GlobalVar.find_player(**account_dict)
            self.player.socket = self
            logging.info('SOCKET[%s] 玩家登录成功并绑定', self.player.uid)
            
            # 3. 返回 RSP_LOGIN (101) 给客户端绘制大厅
            response_data = {
                **account_dict,
                'room': GlobalVar.find_player_room_id(account_dict['uid']),
                'rooms': GlobalVar.room_list(),
                'token': self.jwt_encode(account_dict)
            }
            self.write_message([Protocol.RSP_LOGIN, response_data])
            return

        # ========== 保护机制：如果还没发 100 登录，就不准往下走 ==========
        if self.player is None:
            self.write_message([Protocol.ERROR, {'reason': '请先发送 REQ_LOGIN 进行登录'}])
            return
        await self.player.on_message(code, packet)

    def on_close(self):
        if self.player:
            self.player.on_disconnect()
            logging.info('SOCKET[%s] CLOSED[%s %s]', self.player.uid, self.close_code, self.close_reason)
        else:
            logging.info('SOCKET[0] 匿名连接已断开')

    def check_origin(self, origin: str) -> bool:
        return True

    def get_compression_options(self) -> Optional[Dict[str, Any]]:
        return {'compression_level': 6, 'mem_level': 9}

    def write_message(self, message: List[Union[Protocol, Dict[str, Any]]], binary=False) -> Optional[None]:
        packet = json.dumps(message)
        self._write_message(packet, binary)

    def _write_message(self, message, binary=False):
        if self.ws_connection is None:
            return
        try:
            future = self.ws_connection.write_message(message, binary=binary)
            logging.info('RSP[%d]: %s', self.uid, message)
        except WebSocketClosedError:
            logging.error('WebSockedClosed[%s][%s]', self.uid, message)

    @staticmethod
    def decode_message(message):
        try:
            code, packet = json.loads(message)
            if isinstance(code, int) and isinstance(packet, dict):
                return code, packet
        except (json.decoder.JSONDecodeError, ValueError):
            logging.error('ERROR MESSAGE: %s', message)
        return None, None


class AdminHandler(RestfulHandler):
    required_fields = ('allow_robot',)

    @authenticated
    def get(self):
        if self.current_user['uid'] != 1:
            self.send_error(403, reason='Forbidden')
            return
        self.write({'allow_robot': self.application.allow_robot})

    @authenticated
    def post(self):
        if self.current_user['uid'] != 1:
            self.send_error(403, reason='Forbidden')
            return
        self.application.allow_robot = bool(self.get_body_argument('allow_robot'))
        self.write({'allow_robot': self.application.allow_robot})
