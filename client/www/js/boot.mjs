import {Protocol, Socket} from './net.mjs'
import { WS_SERVER_URL } from './config.js';
import { transact } from './solana-bundle.js';
// import { registerPlugin } from 'https://unpkg.com/@capacitor/core@8.2.0/dist/index.js';
// const WalletPlugin = registerPlugin('WalletPlugin');
// 纯前端用户信息管理
function getPlayerInfo(name) {
    let info = localStorage.getItem(name);
    if (info) {
        try {
            return JSON.parse(info);
        } catch (e) {}
    }
    // 未登录，返回 null
    return null;
}

function setPlayerInfo(info, name) {
    localStorage.setItem(name, JSON.stringify(info));
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

        // 添加一个文字提示，避免等待时黑屏卡顿感
        
        // 先加载已有音频
        this.load.image('dizhu', 'i/dizhu.png');
        this.load.image('nongmin', 'i/nongming.png');
        this.load.image('bg', 'i/bg.jpg');
        this.load.image('nullhead', 'i/nullhead.png');
        this.load.image('clock', 'i/clock.png');
        this.load.image('doudizhuBG', 'i/doudizhuBG.png');
        this.load.image('settingmenu', 'i/settingmenu.png');
        this.load.atlas('btn', 'i/btnspritesheet.png', 'i/btnspritesheet.json');
        this.load.atlas('text', 'i/textspritesheet.png', 'i/textspritesheet.json');
        this.load.atlas('sprite', 'i/spritesheet.png', 'i/spritesheet.json');
        this.load.image('winBG', 'i/window.png');
        this.load.spritesheet('poker', 'i/poker.png', 90, 120);
        this.load.json('rule', 'i/rule.json');
        // 自动加载audio目录下所有未加载的音频
        const allAudioFiles = [
            'bg_room.mp3', 'bg_game.ogg', 'end_win.mp3', 'end_lose.mp3', 'f_score_0.mp3', 'f_score_1.mp3',
            '0.mp3','00.mp3','000.mp3','2.mp3','22.mp3','222.mp3','3.mp3','33.mp3','333.mp3','4.mp3','44.mp3','444.mp3','5.mp3','55.mp3','555.mp3','6.mp3','66.mp3','666.mp3','7.mp3','77.mp3','777.mp3','8.mp3','88.mp3','888.mp3','9.mp3','99.mp3','999.mp3','A.mp3','AA.mp3','AAA.mp3','baojing1.mp3','baojing2.mp3','bomb.mp3','bomb_pair.mp3','bomb_single.mp3','buyao.mp3','feiji.mp3','J.mp3','JJ.mp3','JJJ.mp3','K.mp3','KK.mp3','KKK.mp3','liandui.mp3','LW.mp3','m_score_0.mp3','m_score_1.mp3','Q.mp3','QQ.mp3','QQQ.mp3','rocket.mp3','shunzi.mp3','start.wav','SW.mp3','trio_pair.mp3','trio_single.mp3'
        ];
        this.allAudioKeys = [];

        allAudioFiles.forEach(file => {
            // 取文件名（不含扩展名）作为key
            let key = file.replace(/\.(mp3|wav|ogg)$/i, '');
            this.allAudioKeys.push(key); // 存下 key
            this.load.audio(key, 'audio/' + file);
        });
        
    }

    create() {
        this.game.gameAudio = {};
        this.allAudioKeys.forEach(key => {
            if (this.game.cache.checkSoundKey(key)) {
                this.game.gameAudio[key] = this.game.add.audio(key);
            }
        });

        if (window.musicOn === undefined) window.musicOn = true;
        if (window.soundOn === undefined) window.soundOn = true;
        // 只在 musicOn 为 true 时播放背景音乐
        if (window.musicOn) {
            const music = this.game.gameAudio['bg_room'];
            if (music) {
                music.loop = true;
                // loopFull() 内部其实已经包含了播放逻辑，直接调用就行
                music.loopFull(); 
                
                // 2. 完美赋值给你需要的全局变量
                window._bgMusic = music;
            }
        }
        
        // 检查本地是否有用户信息
        const playerInfo = getPlayerInfo('playerInfo');
        if (playerInfo && playerInfo.uid) {
            
            let loadingText = this.game.add.sprite(this.game.world.centerX, this.game.world.height - 150, 'text', '连接文本.png');
            
            loadingText.anchor.set(0.5);


           // 开始静默建立 WebSocket
            window.globalSocket = new Socket(WS_SERVER_URL);
            window.globalSocket.connect(
                () => { 
                    
                    window.globalSocket.send([Protocol.REQ_LOGIN, { openid: playerInfo.openid, name: playerInfo.name }]);
                   
                },
                (packet) => { 
                    const code = packet[0];
                    const response = packet[1];

                    if (code === Protocol.RSP_LOGIN) {
                        
                        response.openid = playerInfo.openid;
                        setPlayerInfo(response,'playerInfo'); // 刷新本地缓存
                        window.playerInfo = response;
                        
                        this.state.start('MainMenu'); // 网络已通，正式进入大厅
                    } else if (code === Protocol.ERROR) {
                        
                        localStorage.removeItem('playerInfo');
                        
                        this.state.start('Login');
                    }
                },
                (error) => {                     
                        console.error(error);
                        // 连接失败也可以给个延时，让用户去 Login 界面手动重试
                        setTimeout(() => { this.state.start('Login'); }, 2000);
                    }
                );
            
            }else {
                        // 新用户（无缓存）：直接跳过连网，进入 Login 场景走正常的生成钱包/游客注册流程
                        
                        
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
        let humanRoom = this.createMyTextBtn(this.game.world.width / 2, this.game.world.height / 2, 'btn', this.gotoRoom, '真人对抗.png.png');
        this.game.world.add(humanRoom);

        // AI对抗按钮，放在真人对抗上方
        let aiRoom = this.createMyTextBtn(this.game.world.width / 2, this.game.world.height / 2 - 200, 'btn', this.gotoAiRoom, 'AI对抗.png.png');
        this.game.world.add(aiRoom);

        // 设置按钮，放在真人对抗下方，间距同上
        let setting = this.createMyTextBtn(this.game.world.width / 2, this.game.world.height / 2 + 200, 'btn', this.gotoSetting, '设置.png.png');
        this.game.world.add(setting);

        // 欢迎文本字体加大
        let style = {font: "36px ", fill: "#fff", align: "right"};
        let text = this.game.add.text(this.game.world.width - 50, 50, "欢迎回来 " + window.playerInfo.name, style);
        text.addColor('#cc00cc', 4);
        text.cacheAsBitmap = true;
        text.anchor.set(1, 0);

        // --- 新增：左上角显示钱包地址 ---
        let openid = window.playerInfo.openid || "未知钱包";
        let shortAddress = openid.length > 10 ? (openid.slice(0, 4) + '...' + openid.slice(-4)) : openid;
        let addrStyle = {font: "36px ", fill: "#fff", align: "left"};
        let addrText = this.game.add.text(50, 50, "钱包地址: " + shortAddress, addrStyle);
        addrText.addColor('#00ffcc', 4);
        addrText.cacheAsBitmap = true;

        // --- 新增：左上角断开连接按钮 ---
        let disconnectBtn = this.createMyTextBtn(addrText.width + addrText.width / 2 + 60, 78, 'sprite', this.onDisconnect, '取消连接按钮.png');
        disconnectBtn.scale.setTo(0.7); // 稍微缩放一点以免太大
        this.game.world.add(disconnectBtn);

        // this.state.start('Game', true, false, 1);
    }

    // --- 新增：断开逻辑 ---
    onDisconnect() {
        // 1. 清除本地缓存
        localStorage.removeItem('playerInfo');
        window.playerInfo = null;
        
        // 2. 关闭 WebSocket 连接
        if (window.globalSocket) {
            try { window.globalSocket.close(); } catch(e) {} 
            window.globalSocket = null;
        }

        // 3. 退回登录界面
        this.state.start('Login');
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
            const music = this.game.gameAudio['bg_game'];
            if (music) {
                music.loop = true;
                music.loopFull();
                music.play();
                window._bgMusic = music;
            }
        }
    }

   createMyTextBtn = (x, y, text, fn, name) => {
                // 父辈：按钮底板图片 btnBG
                let btn = this.game.add.sprite(x, y, text, name);
                btn.anchor.set(0.5, 0.5);
                btn.inputEnabled = true;
                btn.events.onInputDown.add(() => { 
                    btn.scale.set(0.9); 
                }, this);
                btn.events.onInputUp.add(() => { 
                    btn.scale.set(1.0); 
                    if(fn) fn.call(this);
                }, this);
                return btn;
            };

    onchangemusic() {
        window.musicOn = !window.musicOn;
            // 控制背景音乐播放/暂停
            if (window._bgMusic) {
                if (window.musicOn) {
                    window._bgMusic.resume();
                } else {
                    window._bgMusic.pause();
                }
            }
        if (this.musicBtn) {
            this.musicBtn.frameName = window.musicOn ? '关闭音乐.png' : '开启音乐按钮.png';
        }
    }
    onchangesound() {
        window.soundOn = !window.soundOn; 
        if (this.soundBtn) {
            this.soundBtn.frameName = window.soundOn ? '关闭提示音.png' : '开启提示音按钮.png';
        }

    }
    onsettingbtn() {
        for (let i = this.panel.children.length - 1; i >= 0; i--) {
                this.panel.children[i].visible = false; // 先隐藏所有子元素
            }
            this.panel.visible = false; // 最后隐藏面板自己
            this.panel.exists = false;
            this.isSettingOpen = false;

        
    }

    gotoSetting() {
        // 简单设置面板
        if (this.isSettingOpen) return; 
        // 【新增锁】：标记设置面板现在是打开状态
        this.isSettingOpen = true;

        
        let panelX = this.game.world.width / 2;
        let panelY = this.game.world.height / 2;

        // 使用你准备好的 winBG 作为大背景
        this.panel = this.game.add.sprite(panelX, panelY, 'winBG');
        this.panel.anchor.set(0.5, 0.5);
        let titleText = this.game.add.sprite(0, -170, 'settingmenu', null);
        titleText.anchor.set(0.5, 0.5);
        this.panel.addChild(titleText); // 挂载到面板
         
        this.musicBtn = this.createMyTextBtn(0, -60,'btn', this.onchangemusic, window.musicOn ? '关闭音乐.png' : '开启音乐按钮.png');
        this.panel.addChild(this.musicBtn); // 挂载到面板

        this.soundBtn = this.createMyTextBtn(0, 40, 'btn', this.onchangesound, window.soundOn ? '关闭提示音.png' : '开启提示音按钮.png');
        this.panel.addChild(this.soundBtn); // 挂载到面板
        
        // 关闭设置面板按钮
        let closeBtn = this.createMyTextBtn(0, 140, 'btn', this.onsettingbtn, '关闭设置按钮.png');
        this.panel.addChild(closeBtn); // 挂载到面板
    }
    shutdown() {
        // 离开这个场景时，把全局的输入监听全杀掉
        this.game.input.onDown.removeAll();
        this.game.input.onUp.removeAll();
        this.game.input.onTap.removeAll();
        
        // 这样进入新场景时，就是一个绝对干净的白板
    }
    
}

export class Login {
    create() {
        
        this.stage.backgroundColor = '#182d3b';
        this.bg = this.game.add.sprite(this.game.width / 2, 0, 'bg');
        this.bg.anchor.set(0.5, 0);

        let scale = Math.max(this.game.width / this.bg.width, this.game.height / this.bg.height);
        this.bg.scale.setTo(scale);

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
        
        let walletBtn = this.createMyTextBtn(this.game.world.centerX - 130, this.game.world.centerY + 100 * scaleFactor,'sprite', () => this.showAgreement(false), '连接钱包.png', '连接钱包.png');
        this.game.world.add(walletBtn);

        let guestBtn = this.createMyTextBtn(this.game.world.centerX + 130, this.game.world.centerY + 100 * scaleFactor, 'sprite', () => this.showAgreement(true), '游客体验.png', '游客体验.png');
        this.game.world.add(guestBtn);

       
        
        // if (!window.myListenerHandle) {
        //     window.walletListenerAdded = true;
        //     WalletPlugin.addListener('wallet_cache_ready', (data) => {
                
        //         // 直接存到 JS 能秒读的地方，不经过桥，不费电
        //         window.NATIVE_CACHE_ADDRESS = data.address; 
        //         localStorage.setItem('wallet_address', data.address);
        //         this.checkWalletCache();
        //     }).then(handle => {
        //         window.myListenerHandle = handle; // 以后想关掉它得用这个 handle
        //     });
        // }
        
    }

    checkWalletCache() {
            // 1. 主动查档：去 Java 原生层问有没有存好的地址
            const address = localStorage.getItem('wallet_address');
            if (address) {
                localStorage.setItem('wallet_address','');
                this.initGame(address, getPlayerInfo('playerInfo')?.name); 
            }
            else
            {
                
                return;
            }
            
    }


    createMyTextBtn = (x, y, text, fn, name) => {
                // 父辈：按钮底板图片 btnBG
                let btn = this.game.add.sprite(x, y, text, name);
                btn.anchor.set(0.5, 0.5);
                btn.inputEnabled = true;
                btn.events.onInputDown.add(() => { 
                    btn.scale.set(0.9); 
                }, this);
                btn.events.onInputUp.add(() => { 
                    btn.scale.set(1.0); 
                    if(fn) fn(); // 缩放恢复后再执行你的回调
                }, this);
                return btn;
            };
    showAgreement(isGuest) {
        const userName = this.name.value;
        if (!userName) {
            this.showError('注册错误文本.png');
            return;
        }
        setPlayerInfo({ name: userName }, 'playerInfo');
        if (this.isAgreementOpen) return;
        this.isAgreementOpen = true;

        let panelX = this.game.world.centerX;
        let panelY = this.game.world.centerY;
        
        // 底板
        this.agreementPanel = this.game.add.sprite(panelX, panelY, 'winBG');
        this.agreementPanel.anchor.set(0.5);

        // 标题
        let titleText = this.game.add.sprite(0, -170, 'sprite', '隐私服务.png');
        titleText.anchor.set(0.5);
        this.agreementPanel.addChild(titleText);

        // 隐私与服务超链接按钮 (注意这里填入你的真实网页链接)
        let privacyBtn = this.createMyTextBtn(0, -90,'sprite', () => { window.open('https://www.newdonediner.com/mygame/%E6%96%97%E5%9C%B0%E4%B8%BB-privacy', '_blank'); }, '隐私条款.png', '隐私条款.png');
        let termsBtn = this.createMyTextBtn(0, -5, 'sprite', () => { window.open('https://www.newdonediner.com/mygame/%E6%96%97%E5%9C%B0%E4%B8%BB-service', '_blank'); }, '服务条款.png', '服务条款.png');
        let mitbtn = this.createMyTextBtn(0, 80, 'sprite', () => { window.open('https://www.newdonediner.com/mygame/%E6%96%97%E5%9C%B0%E4%B8%BB-license', '_blank'); }, '许可协议.png', '许可协议.png');
        privacyBtn.scale.setTo(0.8);
        termsBtn.scale.setTo(0.8);
        mitbtn.scale.setTo(0.8);
        this.agreementPanel.addChild(privacyBtn);
        this.agreementPanel.addChild(termsBtn);
        this.agreementPanel.addChild(mitbtn);

        // 同意 和 不同意 按钮
        let agreeBtn = this.createMyTextBtn(-110, 170, 'sprite', () => {
            this.closeAgreement();
            this.executeLogin(isGuest, userName); // 走真正登录逻辑
        }, '同意.png', '同意.png');
        
        let disagreeBtn = this.createMyTextBtn(110, 170, 'sprite', () => {
            this.closeAgreement(); // 拒绝就关掉面板，啥也不做
        }, '不同意.png', '不同意.png');

        this.agreementPanel.addChild(agreeBtn);
        this.agreementPanel.addChild(disagreeBtn);
    }

    closeAgreement() {
        if (this.agreementPanel) {
            setTimeout(() => {
                if (this.agreementPanel) {
                    this.agreementPanel.destroy();
                    this.agreementPanel = null;
                }
            }, 10);
        }
        this.isAgreementOpen = false;
    }

    showError(spriteName) {
        if (this.errorText) this.errorText.destroy();
        this.errorText = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY + 24 * 1.5, 'text', spriteName);     
        this.errorText.anchor.set(0.5, 0);
        
    }

    // --- 核心改动 3：分流处理钱包和游客的注册逻辑 ---
    executeLogin(isGuest, userName) {
        function generateFakeAddress() {
            const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
            let result = '';
            for (let i = 0; i < 5; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        }

        let address = generateFakeAddress();
        const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);

        // 如果不是游客且是手机端，尝试唤起 MWA
        if (!isGuest && isMobile) {
                
                const mwaConfig = {
                name: "斗地主",
                // 这是 MWA 要求的 Identity URL，填你游戏的官网或服务器域名（必须是 https）
                identityUri: "https://cdn.newdonediner.com/", 
                // 钱包授权页显示的图标，通常是相对于 identityUri 的路径
                iconUri: "/icon.png"
            };
            WalletPlugin.authorize( mwaConfig );
            
            
        }
        else {
            // 其他情况（游客，或者非手机端），直接走登录流程
            this.initGame(address,userName);
        }
        
    }
    initGame(address, userName) {
        let loadingText = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY - 60 * 1.5, 'text', '连接文本.png');
        loadingText.scale.setTo(1.5);
        loadingText.anchor.set(0.5, 0.5);
        loadingText.tint = 0xff0000;
        const playerInfo = { openid: address, name: String(userName) };
        
            window.globalSocket = new Socket(WS_SERVER_URL);
            
            window.globalSocket.connect(
                () => { 
                    window.globalSocket.send([Protocol.REQ_LOGIN, playerInfo]);
                },
                (packet) => { 
                    const code = packet[0];
                    const response = packet[1];
                    
                    if (code === Protocol.RSP_LOGIN) {
                        response.openid = playerInfo.openid;
                        setPlayerInfo(response,'playerInfo');
                        window.playerInfo = response;
                        this.state.start('MainMenu');
                    } 
                    else if (code === Protocol.ERROR) {
                        this.showError('登录失败.png');
                       
                    }
                },
                (error) => { 
                    this.showError('连接失败.png');
                    console.error("WebSocket Error:", error);
                    
                }
            );
        
    }
    
    shutdown() {
        // 离开这个场景时，把全局的输入监听全杀掉
        this.game.input.onDown.removeAll();
        this.game.input.onUp.removeAll();
        this.game.input.onTap.removeAll();

        if (window.myListenerHandle) {
            window.myListenerHandle.remove(); // 拔掉管子
            window.myListenerHandle = null;
        }
       
        // 这样进入新场景时，就是一个绝对干净的白板
    }
}