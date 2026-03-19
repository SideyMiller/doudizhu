import { transact } from './solana-bundle.js';
import {Protocol, Socket} from './net.mjs'
import { WS_SERVER_URL } from './config.js';
// 纯前端用户信息管理
function getPlayerInfo() {
    let info = localStorage.getItem('playerInfo');
    if (info) {
        try {
            return JSON.parse(info);
        } catch (e) {}
    }
    // 未登录，返回 null
    return null;
}

function setPlayerInfo(info) {
    localStorage.setItem('playerInfo', JSON.stringify(info));
}
function get(url, payload, callback) {
    http('GET', url, payload, callback);
}

function post(url, payload, callback) {
    http('POST', url, payload, callback);
}

function http(method, url, payload, callback) {
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            const response = JSON.parse(xhr.responseText);
            callback(xhr.status, response);
        }
    };
    xhr.send(JSON.stringify(payload));
}

export class Boot {
    preload() {
        this.load.image('preloaderBar', 'i/preload.png');
    }

    create() {
        this.input.maxPointers = 1;
        this.stage.disableVisibilityChange = true;

        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;
        this.scale.forceOrientation(true);
        this.scale.enterIncorrectOrientation.add(this.enterIncorrectOrientation, this);
        this.scale.leaveIncorrectOrientation.add(this.leaveIncorrectOrientation, this);

        this.state.start('Preloader');
    }


    enterIncorrectOrientation() {
        // orientated = false;
        const orientDiv = document.getElementById('orientation');
        if (orientDiv) {
            orientDiv.style.display = 'block'; // 只有找到了才操作
        }
    }

    leaveIncorrectOrientation() {
        // orientated = true;
        const orientDiv = document.getElementById('orientation');
        if (orientDiv) {
            orientDiv.style.display = 'none'; // 只有找到了才操作
        }
    }
}

export class Preloader {

    preload() {
        // 进度条放到屏幕中间，放大1.5倍
        const centerX = this.game.world.width / 2;
        const centerY = this.game.world.height / 2;
        this.preloadBar = this.game.add.sprite(centerX, centerY, 'preloaderBar');
        this.preloadBar.anchor.set(0.5);
        this.preloadBar.scale.setTo(1.5, 1.5);
        this.load.setPreloadSprite(this.preloadBar);

        // 已有音频key列表
        const loadedKeys = [
            'music_room', 'music_game',  'music_win', 'music_lose',
            'f_score_0', 'f_score_1'
        ];
        // 先加载已有音频
        this.load.audio('music_room', 'audio/bg_room.mp3');
        this.load.audio('music_game', 'audio/bg_game.ogg');
        this.load.audio('music_win', 'audio/end_win.mp3');
        this.load.audio('music_lose', 'audio/end_lose.mp3');
        this.load.audio('f_score_0', 'audio/f_score_0.mp3');
        this.load.audio('f_score_1', 'audio/f_score_1.mp3');
        this.load.image('dizhu', 'i/dizhu.png');
        this.load.image('nongmin', 'i/nongming.png');
        this.load.image('bg', 'i/bg.jpg');
        this.load.image('nullhead', 'i/nullhead.png');
        this.load.image('clock', 'i/clock.png');
        this.load.image('doudizhuBG', 'i/doudizhuBG.png');
        this.load.image('btnBG', 'i/btn-xl-yellow.png');
        this.load.image('winBG', 'i/window.png');
        this.load.spritesheet('poker', 'i/poker.png', 90, 120);
        this.load.json('rule', 'i/rule.json');

        // 自动加载audio目录下所有未加载的音频
        const allAudioFiles = [
            '0.mp3','00.mp3','000.mp3','2.mp3','22.mp3','222.mp3','3.mp3','33.mp3','333.mp3','4.mp3','44.mp3','444.mp3','5.mp3','55.mp3','555.mp3','6.mp3','66.mp3','666.mp3','7.mp3','77.mp3','777.mp3','8.mp3','88.mp3','888.mp3','9.mp3','99.mp3','999.mp3','A.mp3','AA.mp3','AAA.mp3','baojing1.mp3','baojing2.mp3','bg_game.ogg','bg_room.mp3','bomb.mp3','bomb_pair.mp3','bomb_single.mp3','buyao.mp3','end_lose.mp3','end_win.mp3','feiji.mp3','f_score_0.mp3','f_score_1.mp3','givecard.wav','J.mp3','JJ.mp3','JJJ.mp3','K.mp3','KK.mp3','KKK.mp3','liandui.mp3','LW.mp3','m_score_0.mp3','m_score_1.mp3','Q.mp3','QQ.mp3','QQQ.mp3','rocket.mp3','shunzi.mp3','start.wav','SW.mp3','trio_pair.mp3','trio_single.mp3'
        ];
        allAudioFiles.forEach(file => {
            // 取文件名（不含扩展名）作为key
            let key = file.replace(/\.(mp3|wav|ogg)$/i, '');
            if (!loadedKeys.includes(key)) {
                this.load.audio(key, 'audio/' + file);
            }
        });
    }

    create() {
        // 全局音乐和音效开关，默认开启
        if (window.musicOn === undefined) window.musicOn = true;
        if (window.soundOn === undefined) window.soundOn = true;
        // 只在 musicOn 为 true 时播放背景音乐
        if (window.musicOn) {
            const music = this.game.add.audio('music_room');
            music.loop = true;
            music.loopFull();
            music.play();
            window._bgMusic = music;
        }
        
        // 检查本地是否有用户信息
        const playerInfo = getPlayerInfo();
        if (playerInfo && playerInfo.uid) {
            // 老用户：添加一个文字提示，避免等待时黑屏卡顿感
            let loadingText = this.game.add.text(this.game.world.centerX, this.game.world.height - 150, "正在连接服务器...", { font: "30px", fill: "#ffffff" });
            loadingText.anchor.set(0.5);

           // 开始静默建立 WebSocket
            window.globalSocket = new Socket(WS_SERVER_URL);
            window.globalSocket.connect(
                () => { 
                    console.log("Preloader: 底层连接成功，偷偷发送 100 协议登录...");
                    window.globalSocket.send([Protocol.REQ_LOGIN, { openid: playerInfo.openid, name: playerInfo.name }]);
                   
                },
                (packet) => { 
                    const code = packet[0];
                    const response = packet[1];

                    if (code === Protocol.RSP_LOGIN) {
                        console.log("Preloader: 静默重连成功，切换大厅");
                        response.openid = playerInfo.openid;
                        setPlayerInfo(response); // 刷新本地缓存
                        window.playerInfo = response;
                        this.state.start('MainMenu'); // 网络已通，正式进入大厅
                    } else if (code === Protocol.ERROR) {
                        console.log('Preloader: 登录验证失败，清理缓存去注册页');
                        localStorage.removeItem('playerInfo');
                        this.state.start('Login');
                    }
                },
                (error) => { 
                        loadingText.text = '服务器连接失败，请检查网络！';
                        console.error(error);
                        // 连接失败也可以给个延时，让用户去 Login 界面手动重试
                        setTimeout(() => { this.state.start('Login'); }, 2000);
                    }
                );
            
            }else {
                        // 新用户（无缓存）：直接跳过连网，进入 Login 场景走正常的生成钱包/游客注册流程
                        console.log("没有本地缓存，前往注册页");
                        this.state.start('Login');
                    }
                
    }
}

export class MainMenu {
    create() {
        this.stage.backgroundColor = '#182d3b';
        let bg = this.game.add.sprite(this.game.width / 2, 0, 'bg');
        bg.anchor.set(0.5, 0.1);

        let scale = Math.max(this.game.width / bg.width, this.game.height / bg.height);
        bg.scale.setTo(scale);


        // 真人对抗按钮
        let humanRoom = this.createMyTextBtn(this.game.world.width / 2, this.game.world.height / 2);
        let hText = this.game.add.text(0, 0, "真人对抗", { font: "36px ", fill: "#000000", align: "center" });
        hText.anchor.set(0.5);
        humanRoom.addChild(hText);
        
        humanRoom.inputEnabled = true;
        humanRoom.events.onInputUp.add(this.gotoRoom, this);
        this.game.world.add(humanRoom);

        // AI对抗按钮，放在真人对抗上方
        let aiRoom = this.createMyTextBtn(this.game.world.width / 2, this.game.world.height / 2 - 200);
        let aiText = this.game.add.text(0, 0, "AI对抗", { font: "36px ", fill: "#000000", align: "center" });
        aiText.anchor.set(0.5);
        aiRoom.addChild(aiText);
        aiRoom.inputEnabled = true;
        aiRoom.events.onInputUp.add(this.gotoAiRoom, this);
        this.game.world.add(aiRoom);

        // 设置按钮，放在真人对抗下方，间距同上
        let setting = this.createMyTextBtn(this.game.world.width / 2, this.game.world.height / 2 + 200);
        let settingText = this.game.add.text(0, 0, "设置", { font: "36px ", fill: "#000000", align: "center" });
        settingText.anchor.set(0.5);
        setting.addChild(settingText);
        setting.inputEnabled = true;
        setting.events.onInputUp.add(this.gotoSetting, this);
        this.game.world.add(setting);

        // 欢迎文本字体加大
        let style = {font: "36px ", fill: "#fff", align: "right"};
        let text = this.game.add.text(this.game.world.width - 50, 50, "欢迎回来 " + window.playerInfo.name, style);
        text.addColor('#cc00cc', 4);
        text.anchor.set(1, 0);

        // this.state.start('Game', true, false, 1);
    }

    gotoAiRoom() {
        this.MusicDeal(); // 先处理音乐逻辑
        this.state.start('Game', true, false, 1);
    }

    gotoRoom() {
        this.MusicDeal(); // 先处理音乐逻辑
        this.state.start('Game', true, false, 2);
    }

    MusicDeal() {
        // 先处理你原来的音乐逻辑
        if (window._bgMusic) {
            window._bgMusic.stop();
        }
        if (window.musicOn) {
            const music = this.game.add.audio('music_game');
            music.loop = true;
            music.loopFull();
            music.play();
            window._bgMusic = music;
        }
    }

    createMyTextBtn = (x, y) => {
                // 父辈：按钮底板图片 btnBG
                let btn = this.game.add.button(x, y, 'btnBG',null, this);
                btn.anchor.set(0.5, 0.5);
                return btn;
            };
    gotoSetting() {
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
    }
}

export class Login {
    create() {
        this.stage.backgroundColor = '#182d3b';
        let bg = this.game.add.sprite(this.game.width / 2, 0, 'bg');
        bg.anchor.set(0.5, 0);

        let scale = Math.max(this.game.width / bg.width, this.game.height / bg.height);
        bg.scale.setTo(scale);

        this.game.add.plugin(PhaserInput.Plugin);
        // 放大1.5倍的文本框和按钮，字体36px
        const scaleFactor = 1.5;
        const inputWidth = 450 * scaleFactor;
        const inputFont = '36px ';
        const style = {
            font: inputFont, fill: '#000', width: inputWidth, padding: 12 * scaleFactor,
            borderWidth: 1 * scaleFactor, borderColor: '#c8c8c8', borderRadius: 2 * scaleFactor,
            textAlign: 'center', placeHolder: '请输入用户名',type: PhaserInput.InputType.text
        };
        this.name = this.game.add.inputField((this.game.world.width - inputWidth) / 2 - 20, this.game.world.centerY - 40 * scaleFactor, style);
        this.name.domElement.focus();
        this.errorText = this.game.add.text(this.game.world.centerX, this.game.world.centerY + 24 * scaleFactor, '', {
            font: "36px ",
            fill: "#f00",
            align: "center"
        });
        this.errorText.anchor.set(0.5, 0);
        let login = this.createMyTextBtn(this.game.world.centerX, this.game.world.centerY + 200 * scaleFactor);
        let loginText = this.game.add.text(0, 0, "注册", { font: "36px ", fill: "#000000", align: "center" });
        loginText.anchor.set(0.5);
        
        login.addChild(loginText);
        login.inputEnabled = true;
        login.events.onInputUp.add(this.onLogin, this);
        this.game.world.add(login);
        
    }
    createMyTextBtn = (x, y) => {
                // 父辈：按钮底板图片 btnBG
                let btn = this.game.add.button(x, y, 'btnBG',null, this);
                btn.anchor.set(0.5, 0.5);
                return btn;
            };
    async onLogin() {
        this.errorText.text = '';
        const userName = this.name.value;
        if (!userName) {
            this.errorText.text = "请输入用户名";
            return;
        }
        // 生成本地用户信息
        function generateFakeAddress() {
        // 剔除容易混淆的字符，模拟真实哈希
        const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
        let result = '';
        for (let i = 0; i < 5; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
}
        let address = generateFakeAddress();
        const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
        if (isMobile) {
            try {
                const result = await transact(async (wallet) => {
                    const auth = await wallet.authorize({ identity: { name: '斗地主' } });
                    return auth.accounts[0].address;
                });
                if (result) address = result;
            } catch (e) {
                console.warn("钱包调用失败或用户取消，改用游客模式:", e);
            }
        }
        const playerInfo = { openid: address, name: String(userName) };
        // --- 核心改动：在这里真正发起 WebSocket 连接并设为全局 ---
        if (!window.globalSocket) {
            window.globalSocket = new Socket(WS_SERVER_URL);
            
            // 绑定三个关键生命周期
            window.globalSocket.connect(
                () => { 
                    // 1. onopen 回调：连接一成功，立刻发送 100 号登录协议
                    console.log("WebSocket 连接成功，发送登录请求(100)");
                    
                    window.globalSocket.send([Protocol.REQ_LOGIN, playerInfo]);
                },
                (packet) => { 
                    const code = packet[0];
                    const response = packet[1];
                    
                    if (code === Protocol.RSP_LOGIN) {
                        response.openid = playerInfo.openid;
                        setPlayerInfo(response);
                        window.playerInfo = response;
                        console.log("静默登录成功！");
                        this.state.start('MainMenu');
                    } 
                    else if (code === Protocol.ERROR) {
                        this.errorText.text = '登录失败: ' + response.reason;
                    }
                },
                (error) => { 
                    // 3. onerror 回调
                    this.errorText.text = '连接服务器失败，请检查网络';
                    console.error("WebSocket Error:", error);
                }
            );
        } else {
            console.log("WebSocket 已存在，直接发送登录请求(100)");
        }
    }
}