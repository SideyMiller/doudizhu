
import {Poker, Rule} from './rule.mjs'
import {Player, createPlay} from './player.mjs'
import {Protocol, Socket} from './net.mjs'

// 纯前端模拟登录/本地存储用户信息
function getPlayerInfo() {
    let info = localStorage.getItem('playerInfo');
    if (info) {
        try {
            return JSON.parse(info);
        } catch (e) {
            console.error("解析本地存储失败", e);
        }
    }
    
    // --- 重点：删掉下面那堆随机生成的代码 ---
    // 不再自动模拟登录，直接返回空
    return null; 
}

const playerInfo = getPlayerInfo();

class Observer {

    constructor() {
        this.state = {};
        this.subscribers = {};
    }

    get(key) {
        return this.state[key];
    }

    set(key, val) {
        const keys = key.split('.');
        if (keys.length === 1) {
            this.state[key] = val;
        } else {
            this.state[keys[0]][keys[1]] = val;
            key = keys[0];
        }
        const newVal = this.state[key];
        const subscribers = this.subscribers;
        if (subscribers.hasOwnProperty(key)) {
            subscribers[key].forEach(function (cb) {
                if (cb) cb(newVal);
            });
        }
    }

    subscribe(key, cb) {
        const subscribers = this.subscribers;
        if (subscribers.hasOwnProperty(key)) {
            subscribers[key].push(cb);
        } else {
            subscribers[key] = [cb];
        }
    }

    unsubscribe(key, cb) {
        const subscribers = this.subscribers;
        if (subscribers.hasOwnProperty(key)) {
            const index = subscribers.indexOf(cb);
            if (index > -1) {
                subscribers.splice(index, 1);
            }
        }
    }
}

const observer = new Observer();

export class Game {
    constructor(game) {
        this.players = [];

        this.tablePoker = [];
        this.tablePokerPic = {};

        this.lastShotPlayer = null;

        this.whoseTurn = 0;
    }

    init(baseScore) {
        observer.set('baseScore', baseScore);
    }

    create() {

        this.players = [];
        this.tablePoker = [];
        this.tablePokerPic = {};
        this.lastShotPlayer = null;
        this.whoseTurn = 0;
        
        Rule.RuleList = this.cache.getJSON('rule');
        this.stage.backgroundColor = '#182d3b';
        let bg = this.game.add.sprite(this.game.width / 2, 0, 'doudizhuBG');
        bg.anchor.set(0.5, 0.1);

        let scale = Math.max(this.game.width / bg.width, this.game.height / bg.height);
        bg.scale.setTo(scale);

        this.players.push(createPlay(0, this));
        this.players.push(createPlay(1, this));
        this.players.push(createPlay(2, this));
        this.players[0].updateInfo(window.playerInfo.uid, window.playerInfo.name);
       
        

        const width = this.game.world.width;
        const height = this.game.world.height;


        // 房间信息条
        const titleBar = this.game.add.text(width / 2, 0, `房间号:${0} 底分: 0 倍数: 0`, {
            font: "40px",
            fill: "#feba00",
            align: "center"
        });
        titleBar.anchor.set(0.5, 0);
        observer.subscribe('room', function (room) {
            titleBar.text = `房间号:${room.id} 底分: ${room.origin} 倍数: ${room.multiple}`;
        });
        // 复用设置面板逻辑
        this.isSettingOpen = false;
        this.gotoSetting = function() {
            // 简单设置面板
            if (this.isSettingOpen) return; 
            // 【新增锁】：标记设置面板现在是打开状态
            this.isSettingOpen = true;

            
            let panelX = this.game.world.width / 2;
            let panelY = this.game.world.height / 2;

            // 使用你准备好的 winBG 作为大背景
            let panel = this.game.add.sprite(panelX, panelY, 'winBG');
            panel.anchor.set(0.5, 0.5);
            panel.inputEnabled = true;
            let titleText = this.game.add.text(0, -170, "设置菜单", { 
                    font: "50px ", 
                    fill: "#ffffff", 
                    align: "center" 
                });
            titleText.anchor.set(0.5, 0.5);
            panel.addChild(titleText); // 挂载到面板
            
            
            let musicBtnText = window.musicOn ? "关闭音乐" : "开启音乐";
            let soundBtnText = window.soundOn ? "关闭提示音" : "开启提示音";
            let musicBtn = this.createMyTextBtn(0, -60);
            let mText = this.game.add.text(0, 0, musicBtnText, { font: "36px ", fill: "#000000", align: "center" });
            mText.anchor.set(0.5);
            musicBtn.addChild(mText);
            musicBtn.inputEnabled = true;
            musicBtn.events.onInputUp.add(function () {
                window.musicOn = !window.musicOn;
                mText.text = window.musicOn ? "关闭音乐" : "开启音乐";
                // 控制背景音乐播放/暂停
                if (window._bgMusic) {
                    if (window.musicOn) {
                        window._bgMusic.resume();
                    } else {
                        window._bgMusic.pause();
                    }
                }
            }, this);
            panel.addChild(musicBtn); // 挂载到面板

            
            let soundBtn = this.createMyTextBtn(0, 40);
            let sText = this.game.add.text(0, 0, soundBtnText, { font: "36px ", fill: "#000000", align: "center" });
            sText.anchor.set(0.5);
            soundBtn.addChild(sText);
            soundBtn.inputEnabled = true;
            soundBtn.events.onInputUp.add(function () {
                window.soundOn = !window.soundOn;
                sText.text = window.soundOn ? "关闭提示音" : "开启提示音";
            }, this);
            panel.addChild(soundBtn); // 挂载到面板
            
            // 关闭设置面板按钮
            let closeBtn = this.createMyTextBtn(0, 140);
            let cText = this.game.add.text(0, 0, "关闭设置", { font: "36px ", fill: "#000000", align: "center" });
            cText.anchor.set(0.5);
            closeBtn.addChild(cText);
            closeBtn.inputEnabled = true;
            closeBtn.events.onInputUp.add(function () {
                panel.destroy();
                
                this.isSettingOpen = false;
            }, this);
            panel.addChild(closeBtn); // 挂载到面板
            
        };
        // 设置按钮，放在titleBar左侧
        const btnY = titleBar.y + titleBar.height / 2 + 30;
        const btnX = width / 2 - titleBar.width / 2 -550 / 3;
        let settingBtn = this.createMyTextBtn(btnX, btnY);
        let setText = this.game.add.text(0, 0, "设置", { font: "36px ", fill: "#000000", align: "center" });
        setText.anchor.set(0.5);
        settingBtn.addChild(setText);
        settingBtn.inputEnabled = true;
        settingBtn.events.onInputUp.add(this.gotoSetting, this);
        this.game.world.add(settingBtn);


        

        // 创建退出按钮
        this.exitBtn = this.createMyTextBtn(width * 0.4, height * 0.6);
        let exitText = this.game.add.text(0, 0, "退出", { font: "36px ", fill: "#000000", align: "center" });
        exitText.anchor.set(0.5);
        this.exitBtn.addChild(exitText);
        this.exitBtn.inputEnabled = true;
        this.exitBtn.events.onInputUp.add(this.quitGame, this);
        this.game.world.add(this.exitBtn);

        // 创建准备按钮
        const that = this;
        const countdown = this.game.add.text(width / 2, height / 2, '10', {
            font: "60px ",
            fill: "rgb(255, 255, 255)a00",
            align: "center"
        });
        
        countdown.anchor.set(0.5);
        countdown.visible = false;
        observer.subscribe('countdown', function (timer) {
            countdown.visible = timer >= 0;
            if (timer >= 0) {
                countdown.text = timer;
                that.game.time.events.add(1000, function () {
                    observer.set('countdown', observer.get('countdown') - 1);
                }, that);
            }
        });

        let ready = this.createMyTextBtn(width * 0.6, height * 0.6);
        let readyText = this.game.add.text(0, 0, "准备", { font: "36px ", fill: "#000000", align: "center" });
        readyText.anchor.set(0.5);
        ready.addChild(readyText);
        ready.inputEnabled = true;
        ready.events.onInputUp.add(this.ReadyGame, this);
        this.game.world.add(ready);

        
        observer.subscribe('ready', function (is_ready) {
            ready.visible = !is_ready;
        });

        //不抢地主按钮
        const group = this.game.add.group();
        let pass = this.createMyTextBtn(width * 0.4, height * 0.6);
        let passText = this.game.add.text(0, 0, "不抢", { font: "36px ", fill: "#000000", align: "center" });
        passText.anchor.set(0.5);
        pass.addChild(passText);
        pass.inputEnabled = true;
        pass.events.onInputUp.add(this.PassGame, this);
        group.add(pass);

        //抢地主按钮
        let rob = this.createMyTextBtn(width * 0.6, height * 0.6);
        let robText = this.game.add.text(0, 0, "抢地主", { font: "36px ", fill: "#000000", align: "center" });
        robText.anchor.set(0.5);
        rob.addChild(robText);
        rob.inputEnabled = true;
        rob.events.onInputUp.add(this.RobGame, this);
        group.add(rob);

        //一分按钮
        // let one = this.createMyTextBtn(width * 0.6, height * 0.6);
        // let oneText = this.game.add.text(0, 0, "一分", { font: "36px ", fill: "#000000", align: "center" });
        // oneText.anchor.set(0.5);
        // one.addChild(oneText);
        // one.inputEnabled = true;
        // one.events.onInputUp.add(this.OneGame, this);
        // group.add(one);

        //两分按钮
        // let two = this.createMyTextBtn(width * 0.6, height * 0.6);
        // let twoText = this.game.add.text(0, 0, "两分", { font: "36px ", fill: "#000000", align: "center" });
        // twoText.anchor.set(0.5);
        // two.addChild(twoText);
        // two.inputEnabled = true;
        // two.events.onInputUp.add(this.TwoGame, this);
        // group.add(two);
        group.visible = false;

        observer.subscribe('rob', function (is_rob) {
            group.visible = is_rob;
            
            observer.set('countdown', -1);
        });

        console.log("正在接管全局服务器连接...");
        this.socket = window.globalSocket; // 拿来主义，直接用 Login 场景建好的全局连接

        if (this.socket) {
        // 【核心改动】：不要赋值给 .websocket.onmessage
        // 而是把 Game 场景的处理函数，挂载到我们刚才建的“转接头”上
        this.socket.onMessageCallback = this.onmessage.bind(this);
        console.log('socket onopen');
        this.send_message([Protocol.REQ_ROOM_LIST, {}]);
        this.send_message([Protocol.REQ_JOIN_ROOM, {"room": -1, "level": observer.get('baseScore')}]);
           
        } else {
            console.error("致命错误：全局 Socket 未初始化！");
        }
    }
    RobGame() {
            if (this.players[0] && this.players[0].hideTimer) this.players[0].hideTimer();
            if (window.soundOn && this.game.add.audio) {
                this.game.add.audio('f_score_1').play();
            }
            this.send_message([Protocol.REQ_CALL_SCORE, {"rob": 1}]);
        };

    PassGame() {
            if (this.players[0] && this.players[0].hideTimer) this.players[0].hideTimer();
            if (window.soundOn && this.game.add.audio) {
            this.game.add.audio('f_score_0').play();
            }
            this.send_message([Protocol.REQ_CALL_SCORE, {"rob": 0}]);
            };

    ReadyGame() {
            this.send_message([Protocol.REQ_READY, {"ready": 1}]);
            observer.set('countdown', 10);
        };
    createMyTextBtn = (x, y) => {
                    // 父辈：按钮底板图片 btnBG
                    let btn = this.game.add.button(x, y, 'btnBG',null, this);
                    btn.anchor.set(0.5, 0.5);
                    return btn;
                };
    onopen() {
        console.log('socket onopen');
        this.socket.send([Protocol.REQ_ROOM_LIST, {}]);
        this.socket.send([Protocol.REQ_JOIN_ROOM, {"room": -1, "level": observer.get('baseScore')}]);
    }

    onerror() {
        console.log('socket onerror, try reconnect.');
        this.socket.connect(this.onopen.bind(this), this.onmessage.bind(this), this.onerror.bind(this));
    }

    send_message(request) {
        this.socket.send(request);
    }

    onmessage(message) {
        const code = message[0], packet = message[1];
        switch (code) {
            case Protocol.RSP_ROOM_LIST:
                console.log(code, packet);
                break;
            case Protocol.RSP_JOIN_ROOM:
                observer.set('room', packet['room']);
                const syncInfo = packet['players'];
                for (let i = 0; i < syncInfo.length; i++) {
                    if (syncInfo[i].uid === this.players[0].uid) {
                        let info_1 = syncInfo[(i + 1) % 3];
                        let info_2 = syncInfo[(i + 2) % 3];
                        this.players[1].updateInfo(info_1.uid, info_1.name);
                        this.players[2].updateInfo(info_2.uid, info_2.name);
                        break;
                    }
                }
                break;
            case Protocol.RSP_READY:
                // TODO: 显示玩家已准备状态
                if (packet['uid'] === this.players[0].uid) {
                    observer.set('ready', true);
                }
                break;
            case Protocol.RSP_DEAL_POKER: {
                this.exitBtn.visible = false;
                const playerId = packet['uid'];
                const pokers = packet['pokers'];
                this.dealPoker(pokers);
                this.whoseTurn = this.uidToSeat(playerId);
                this.startCallScore();
                break;
            }
            case Protocol.RSP_CALL_SCORE: {
                const playerId = packet['uid'];
                const rob = packet['rob'];
                const landlord = packet['landlord'];
                this.whoseTurn = this.uidToSeat(playerId);

                const hanzi = ['不抢', "抢地主"];
                this.players[this.whoseTurn].say(hanzi[rob]);

                observer.set('rob', false);
                if (landlord === -1) {
                    this.whoseTurn = (this.whoseTurn + 1) % 3;
                    this.startCallScore();
                } else {
                    this.whoseTurn = this.uidToSeat(landlord);
                    this.tablePoker[0] = packet['pokers'][0];
                    this.tablePoker[1] = packet['pokers'][1];
                    this.tablePoker[2] = packet['pokers'][2];
                    this.players[this.whoseTurn].setLandlord();
                    this.showLastThreePoker();
                }
                observer.set('room.multiple', packet['multiple']);
                break;
            }
            case Protocol.RSP_SHOT_POKER:
                this.handleShotPoker(packet);
                observer.set('room.multiple', packet['multiple']);
                break;
            case Protocol.RSP_GAME_OVER: {
                this.players.forEach(p => { if (p && p.hideTimer) p.hideTimer(); });
                const winner = packet['winner'];
                const that = this;
                packet['players'].forEach(function (player) {
                    const seat = that.uidToSeat(player['uid']);
                    if (seat > 0) {
                        that.players[seat].replacePoker(player['pokers'], 0);
                        that.players[seat].reDealPoker();
                    }
                });

                this.whoseTurn = this.uidToSeat(winner);

                function gameOver() {
                    // 先停掉music_room
                    if (window._bgMusic) {
                        window._bgMusic.stop();
                    }
                    // 判断自己是否胜利
                    let mySeat = 0; // 默认本地玩家在0号位
                    let isMeLandlord = this.players[mySeat].isLandlord;
                    let winnerIsLandlord = this.players[this.whoseTurn].isLandlord;
                    let isWin = (isMeLandlord && winnerIsLandlord) || (!isMeLandlord && !winnerIsLandlord);

                    // 播放胜利/失败音乐
                    if (window.musicOn && this.game.add.audio) {
                        if (isWin) {
                            this.game.add.audio('music_win').play();
                        } else {
                            this.game.add.audio('music_lose').play();
                        }
                    }

                    // 在屏幕中央显示“你赢了”或“你输了”，3秒后自动消失
                    let style = {font: "64px ", fill: isWin ? "#FFD700" : "#aaa", align: "center"};
                    let resultText = this.game.add.text(this.game.world.width / 2, this.game.world.height / 2, isWin ? "你赢了" : "你输了", style);
                    resultText.anchor.set(0.5);
                    // 3秒后让文本消失
                    this.game.time.events.add(3000, function() {
                        resultText.destroy();
                    }, this);
                    this.exitBtn.visible = true;
                    observer.set('ready', false);
                    this.cleanWorld();
                }

                this.game.time.events.add(2000, gameOver, this);
                break;
            }
            // case Protocol.RSP_CHEAT:
            //     let seat = this.uidToSeat(packet[1]);
            //     this.players[seat].replacePoker(packet[2], 0);
            //     this.players[seat].reDealPoker();
            //     break;
            default:
                console.log("UNKNOWN PACKET:", packet)
        }
    }

    cleanWorld() {
        this.players.forEach(function (player) {
            player.cleanPokers();
            // player.uiLeftPoker.kill();
            player.uiHead.loadTexture('nongmin');
        });
        for (let i = 0; i < this.tablePoker.length; i++) {
            let p = this.tablePokerPic[this.tablePoker[i]];
            p.destroy();
        }
    }

    restart() {
        this.players = [];

        this.tablePoker = [];
        this.tablePokerPic = {};

        this.lastShotPlayer = null;

        this.whoseTurn = 0;

        this.stage.backgroundColor = '#182d3b';
        this.players.push(createPlay(0, this));
        this.players.push(createPlay(1, this));
        this.players.push(createPlay(2, this));
        for (let i = 0; i < 3; i++) {
            //this.players[i].uiHead.kill();
        }
    }

    update() {
    }

    uidToSeat(uid) {
        for (let i = 0; i < 3; i++) {
            if (uid === this.players[i].uid)
                return i;
        }
        console.log('ERROR uidToSeat:' + uid);
        return -1;
    }

    dealPoker(pokers) {
       
        if (window.soundOn && this.game.add.audio) {
            let startAudio = this.game.add.audio('start');
            startAudio.play();
        }
        // 添加一张底牌
        let p = new Poker(this, 55, 55);
        this.tablePokerPic[55] = p;
        this.game.world.add(p);

        for (let i = 0; i < 17; i++) {
            this.players[2].pokerInHand.push(55);
            this.players[1].pokerInHand.push(55);
            this.players[0].pokerInHand.push(pokers.pop());
        }

        this.players[0].dealPoker();
        this.players[1].dealPoker();
        this.players[2].dealPoker();
    }

    showLastThreePoker() {
        // 删除底牌
        this.tablePokerPic[55].destroy();
        delete this.tablePokerPic[55];

        for (let i = 0; i < 3; i++) {
            let pokerId = this.tablePoker[i];
            let p = new Poker(this, pokerId, pokerId);
            this.tablePokerPic[pokerId] = p;
            this.game.world.add(p);
            this.game.add.tween(p).to({x: this.game.world.width / 2 + (i - 1) * 60}, 600, Phaser.Easing.Default, true);
        }
        this.game.time.events.add(1500, this.dealLastThreePoker, this);
    }

    dealLastThreePoker() {
        let turnPlayer = this.players[this.whoseTurn];

        for (let i = 0; i < 3; i++) {
            let pid = this.tablePoker[i];
            let poker = this.tablePokerPic[pid]
            turnPlayer.pokerInHand.push(pid);
            turnPlayer.pushAPoker(poker);
        }
        turnPlayer.sortPoker();
        if (this.whoseTurn === 0) {
            turnPlayer.arrangePoker();
            const that = this;
            for (let i = 0; i < 3; i++) {
                let pid = this.tablePoker[i];
                let p = this.tablePokerPic[pid];
                let tween = this.game.add.tween(p).to({y: this.game.world.height - Poker.PH * 0.8}, 400, Phaser.Easing.Default, true);

                function adjust(p) {
                    that.game.add.tween(p).to({y: that.game.world.height - Poker.PH / 2}, 400, Phaser.Easing.Default, true, 400);
                }

                tween.onComplete.add(adjust, this, p);
            }
        } else {
            let first = turnPlayer.findAPoker(55);
            for (let i = 0; i < 3; i++) {
                let pid = this.tablePoker[i];
                let p = this.tablePokerPic[pid];
                p.frame = 55 - 1;
                this.game.add.tween(p).to({x: first.x, y: first.y}, 200, Phaser.Easing.Default, true);
            }
        }

        this.tablePoker = [];
        this.lastShotPlayer = turnPlayer;
        this.switchTimer(20);
        if (this.whoseTurn === 0) {
            this.startPlay();
        }
    }

    // Joker牌名映射：w->SW, W->LW
    mapJoker(card) {
        if (card === 'w') return 'SW';
        if (card === 'W') return 'LW';
        return card;
    }

    handleShotPoker(packet) {
        this.whoseTurn = this.uidToSeat(packet['uid']);
        let turnPlayer = this.players[this.whoseTurn];
        let pokers = packet['pokers'];
        if (pokers.length === 0) {
            this.players[this.whoseTurn].say("不出");
            // 不出时可加“不要”语音
            if (window.soundOn && this.game.add.audio && this.game.cache.checkSoundKey('buyao')) {
                this.game.add.audio('buyao').play();
            }
        } else {
            // 精准报幕语音
            if (window.soundOn && this.game.add.audio) {
                // 1. 获取牌型和index
                let cards = Poker.toCards(pokers);
                let value = Rule.cardsValue(cards);
                let type = value[0];
                // 2. 拼接key
                let key = type;
                // 单张、对子、三张等特殊处理
                if (type === 'single' && cards.length === 1) {
                    key = this.mapJoker(cards[0]); // 3、4、5、...、A、2、SW、LW
                } else if (type === 'pair' && cards.length === 2 && cards[0] === cards[1]) {
                    key = cards[0] + cards[1]; // 33、44、...、AA、22、ww、WW
                } else if (type === 'trio' && cards.length === 3 && cards[0] === cards[1] && cards[1] === cards[2]) {
                    key = cards[0] + cards[1] + cards[2]; // 333、444、...、AAA、222、www、WWW
                } else if (type === 'rocket') {
                    key = 'rocket';
                } else if (type === 'bomb') {
                    key = 'bomb';
                } else if (type === 'trio_pair') {
                    key = 'trio_pair';
                } else if (type === 'trio_single') {
                    key = 'trio_single';
                } else if (type === 'bomb_pair') {
                    key = 'bomb_pair';
                } else if (type === 'bomb_single') {
                    key = 'bomb_single';
                } else if (type === 'seq_trio_single2' || type === 'seq_trio_single3' || type === 'seq_trio_single4' || type === 'seq_trio_single5' || type === 'seq_trio2' || type === 'seq_trio3' || type === 'seq_trio4' || type === 'seq_trio5' || type === 'seq_trio6') {
                    key = 'feiji';
                } else if (type === 'seq_single5' || type === 'seq_single6' || type === 'seq_single7' || type === 'seq_single8' || type === 'seq_single9' || type === 'seq_single10' || type === 'seq_single11' || type === 'seq_single12') {
                    
                    key = 'shunzi';
                } else if (type === 'seq_pair3' || type === 'seq_pair4' || type === 'seq_pair5' || type === 'seq_pair6' || type === 'seq_pair7' || type === 'seq_pair8' || type === 'seq_pair9' || type === 'seq_pair10') {
                    key = 'liandui';
                } 
                // 3. 播放音频（存在才播）
                if (this.game.cache.checkSoundKey(key)) {
                    this.game.add.audio(key).play();
                }
            }
            let pokersPic = {};
            pokers.sort(Poker.comparePoker);
            let count = pokers.length;
            let gap = Math.min((this.game.world.width - Poker.PW * 2) / count, Poker.PW * 0.36);
            for (let i = 0; i < count; i++) {
                let p = turnPlayer.findAPoker(pokers[i]);
                p.id = pokers[i];
                p.frame = pokers[i] - 1;
                p.bringToTop();
                this.game.add.tween(p).to({
                    x: this.game.world.width / 2 + (i - count / 2) * gap,
                    y: this.game.world.height * 0.4
                }, 500, Phaser.Easing.Default, true);

                turnPlayer.removeAPoker(pokers[i]);
                pokersPic[p.id] = p;
            }

            for (let i = 0; i < this.tablePoker.length; i++) {
                let p = this.tablePokerPic[this.tablePoker[i]];
                // p.kill();
                p.destroy();
            }
            this.tablePoker = pokers;
            this.tablePokerPic = pokersPic;
            this.lastShotPlayer = turnPlayer;
            turnPlayer.arrangePoker();
        }
        if (turnPlayer.pokerInHand.length > 0) {
            this.whoseTurn = (this.whoseTurn + 1) % 3;
            this.switchTimer(20);
            if (this.whoseTurn === 0) {
                this.game.time.events.add(1000, this.startPlay, this);
            }
        }
    }

    startCallScore() {
        this.switchTimer(10);
        if (this.whoseTurn === 0) {
            observer.set('rob', true);
        }

    }

    startPlay() {
        if (this.isLastShotPlayer()) {
            this.players[0].playPoker([]);
        } else {
            this.players[0].playPoker(this.tablePoker);
        }
    }

    finishPlay(pokers) {
        if (this.players[0] && this.players[0].hideTimer) this.players[0].hideTimer();
        this.send_message([Protocol.REQ_SHOT_POKER, {"pokers": pokers}]);
    }

    isLastShotPlayer() {
        return this.players[this.whoseTurn] === this.lastShotPlayer;
    }

    quitGame() {
        if (this.socket && this.socket.websocket) {
            // 注意：确保你的 Protocol 里有 REQ_LEAVE_ROOM 这个枚举，通常是 1002 或类似的数字
            this.send_message([Protocol.REQ_LEAVE_ROOM, {}]);
        }
        if (window.musicOn && this.game.add.audio) {
            // 先停掉当前正在播放的音乐
            if (window._bgMusic) {
                window._bgMusic.stop();
            }
            // 重新创建大厅音乐，【关键】必须把它赋值给 window._bgMusic
            window._bgMusic = this.game.add.audio('music_room');
            // 播放它 (如果大厅音乐需要循环播放，可以在 play 里加参数，比如 play('', 0, 1, true))
            window._bgMusic.play('', 0, 1, true);
            
        }
        this.state.start('MainMenu');
        
    }
    switchTimer(seconds) {
        // 1. 全体闭嘴
        this.players.forEach(p => {
            if (p && p.hideTimer) p.hideTimer();
        });
        // 2. 当前轮到的人亮表
        if (this.players[this.whoseTurn] && this.players[this.whoseTurn].showTimer) {
            this.players[this.whoseTurn].showTimer(seconds);
        }
    }
}






