from __future__ import annotations
from ..DouZeroHelper import DouZeroHelper
from typing import TYPE_CHECKING
from tornado.ioloop import IOLoop
import asyncio
from ..player import Player
from ..protocol import Protocol as Pt
from ..rule import rule

if TYPE_CHECKING:
    from ..room import Room


class RobotPlayer(Player):

    def __init__(self, uid: int, name: str, sex: int = 1, avatar: str = 0, room: Room = None, **kwargs):
        super().__init__(uid, name, sex, avatar, **kwargs)
        self.room = room

    @property
    def allow_robot(self) -> bool:
        return True

    def to_server(self, code, packet):
        IOLoop.current().add_callback(self.on_message, code, packet)

    def write_message(self, packet):
        IOLoop.current().add_callback(self._write_message, packet)

    async def _write_message(self, packet):
        code = packet[0]
        if code == Pt.RSP_JOIN_ROOM:
            self.auto_ready()
        elif code == Pt.RSP_DEAL_POKER:
            if self.uid == packet[1]['uid']:
                self.auto_rob()
        elif code == Pt.RSP_CALL_SCORE:
            if self.room.turn_player == self:
                landlord = packet[1]['landlord']
                if landlord == -1:
                    self.auto_rob()
                elif self.room.turn_player == self:
                    await asyncio.sleep(1)
                    await self.auto_shot()
        elif code == Pt.RSP_SHOT_POKER:
            if self.room.turn_player == self and self.hand_pokers:
                await asyncio.sleep(1)
                await self.auto_shot()
        elif code == Pt.RSP_GAME_OVER:
            IOLoop.current().call_later(3, self.auto_ready)

    def auto_ready(self):
        IOLoop.current().add_callback(self.to_server, Pt.REQ_READY, {'ready': 1})

    def auto_rob(self):
        pokers = [poker for poker in (54, 53, 2, 15, 28, 41) if poker in self.hand_pokers]
        rob = int(len(pokers) >= 4)
        IOLoop.current().call_later(1, self.to_server, Pt.REQ_CALL_SCORE, {'rob': rob})

    async def auto_shot(self):
        best_pokers = await DouZeroHelper.sync_poker(self.room, self.seat, [], self)     
        if best_pokers is None:
            await asyncio.sleep(1)
            best_pokers = await DouZeroHelper.sync_poker(self.room, self.seat, [], self)   
        
        # if best_pokers is None:
             
        #     if not self.room.last_shot_poker or self.room.last_shot_seat == self.seat:
        #         best_pokers = rule.find_best_shot(self.hand_pokers)
        #     else:
        #         ally = self.room.players[self.room.last_shot_seat].landlord == 0
        #         left_pokers = len(self.room.players[self.room.last_shot_seat].hand_pokers)
        #         if ally and left_pokers <= 4 and len(self.hand_pokers) - len(self.room.last_shot_poker) > 4:
        #             best_pokers = []
        #         else:
        #             best_pokers = rule.find_best_follow(self.hand_pokers, self.room.last_shot_poker, ally)
        #             if 53 in best_pokers and 54 in best_pokers and left_pokers > 10:
        #                 best_pokers = []

        IOLoop.current().call_later(1, self.to_server, Pt.REQ_SHOT_POKER, {'pokers': best_pokers})
