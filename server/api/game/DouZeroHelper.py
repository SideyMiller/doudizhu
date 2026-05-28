import json

from tornado.httpclient import AsyncHTTPClient, HTTPRequest

class DouZeroHelper:
    API_URL = "https://newdonediner-doudizhu-api.hf.space/"
    HF_TOKEN = ""
    _room_queues = {}
    @classmethod
    def _pokers_to_str(cls, pokers):
        if not pokers: return ""
        mapping = {1:'A', 2:'2', 3:'3', 4:'4', 5:'5', 6:'6', 7:'7', 8:'8', 9:'9', 10:'T', 11:'J', 12:'Q', 13:'K', 53:'X', 54:'D'}
        res = []
        for p in pokers:
            val = (p - 1) % 13 + 1 if p <= 52 else p
            res.append(mapping.get(val, ""))
        return "".join(res)

    @classmethod
    def _str_to_pokers(cls, card_str, hand_pokers):
        """将字符串转回数字数组，自动处理/删除逗号"""
        if not card_str or (isinstance(card_str, str) and card_str.lower() == "pass"): 
            return []
        
        # --- 需求 1 & 2：处理逗号 ---
        # 如果传入的是列表 ['3', '4']，转为字符串 "34"；如果是字符串 "3,4"，删掉逗号
        if isinstance(card_str, list):
            card_str = "".join(card_str)
        
        clean_str = card_str.replace(",", "").upper()
        
        mapping = {'A':1, '2':2, '3':3, '4':4, '5':5, '6':6, '7':7, '8':8, '9':9, 'T':10, 'J':11, 'Q':12, 'K':13, 'X':53, 'D':54}
        target_vals = [mapping[c] for c in clean_str if c in mapping]
        
        result = []
        temp_hand = list(hand_pokers)
        for val in target_vals:
            for p in temp_hand:
                p_val = (p - 1) % 13 + 1 if p <= 52 else p
                if p_val == val:
                    result.append(p)
                    temp_hand.remove(p)
                    break
       
        return result

    @classmethod
    def get_position_code(cls, seat, landlord_seat):
        
        # 0: 地主上家, 1: 地主, 2: 地主下家
        return (seat - landlord_seat + 1 + 3) % 3

    @classmethod
    async def init_game(cls, room):
        
        player_data = []
        ai_count = 0
        for p in room.players:
            if p.name.startswith('IDIOT-'): 
                
                ai_count += 1
                player_data.append({
                    "model": "WP",  # 默认使用 WP 模型
                    "hand_cards": cls._pokers_to_str(p.hand_pokers),
                    "position_code": cls.get_position_code(p.seat, room.landlord.seat)
                })
            print(f"DEBUG:{player_data}")

        # 2. 构建符合示例格式的 Payload
        payload = {
            "action": "init",
            "data": {
                "three_landlord_cards": cls._pokers_to_str(room.pokers),
                "pid": room.room_id,
                "ai_amount": ai_count, # 动态获取机器人数量
                "player_data": player_data
            }
        }
        headers = {
            
            "Content-Type": "application/json",
            "Authorization": f"Bearer {cls.HF_TOKEN}"
        }
        try:
            client = AsyncHTTPClient()
            req = HTTPRequest(cls.API_URL, method="POST", body=json.dumps(payload), headers=headers,request_timeout=5.0)
            response = await client.fetch(req)
            res_data = json.loads(response.body)
            if res_data.get("status") == "ok":
                play_data = res_data.get("data", {}).get("play", [])
                cls._room_queues[room.room_id] = [item.get("cards", []) for item in play_data]
                
            else:
                cls._room_queues[room.room_id] = []
                
        except Exception as e:
            print(f"Room [{room.room_id}] API Init Error: {e}")

    @classmethod
    async def sync_poker(cls, room, seat, pokers, p_obj):
        is_human = "IDIOT-" not in p_obj.name
        if is_human:
            landlord = room.landlord
            if landlord is None:
                return None  # 房间已经结算，直接跳过
            landlord_seat = landlord.seat
            
            payload = {
                "action": "play",
                "data": {
                    "pid": room.room_id,
                    "player": cls.get_position_code(seat, landlord_seat),
                    "cards": cls._pokers_to_str(pokers)
                }
            }
            headers = {
                
                "Content-Type": "application/json",
                "Authorization": f"Bearer {cls.HF_TOKEN}"
            }
            try:
                client = AsyncHTTPClient()
                req = HTTPRequest(cls.API_URL, method="POST", body=json.dumps(payload),headers=headers, request_timeout=5.0)
                res = await client.fetch(req)
                res_json = json.loads(res.body)
            
                if res_json.get("status") == "ok":
                    play_data = res_json.get("data", {}).get("play", [])
                    cls._room_queues[room.room_id] = [item.get("cards", []) for item in play_data]
                   
                
            except Exception as e:
                print(f"API Sync Error: {e}")
            
            return None # 玩家自己出牌不需要返回值

        else:  
            queue = cls._room_queues.get(room.room_id, [])
            if queue:
                ai_action = queue.pop(0) 
                
                return cls._str_to_pokers(ai_action, p_obj.hand_pokers)
            else:
                
                return  None
    