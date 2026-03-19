import {Poker, Rule} from './rule.mjs'

export const createPlay = function (seat, game) {
    let player = seat === 0 ? new Player(seat, game) : new NetPlayer(seat, game);
    let xy = [
        Poker.PW / 2, game.world.height - Poker.PH - 10,
        game.world.width - Poker.PW / 2, 94,
        Poker.PW / 2, 94
    ];
    player.initUI(xy[seat * 2], xy[seat * 2 + 1]);
    if (seat === 0) {
        player.initShotLayer();
    } else if (seat === 1) {
        player.uiHead.scale.set(-2, 2);
    }
    return player;
}

export class Player {
    constructor(seat, game) {
        this.uid = seat;
        this.seat = seat;
        this.game = game;

        this.pokerInHand = [];
        this._pokerPic = {};
        this.isLandlord = false;

        this.hintPoker = [];
        this.isDraging = false;
    }

    initUI(sx, sy) {
        this.uiHead = this.game.add.sprite(sx + 10, sy + 40, 'nullhead', null);
         
        //闹钟
        this.clock = this.game.add.sprite(sx + 250, sy - 200, 'clock');
        this.clock.anchor.set(0.5);
        this.clock.scale.set(1.5);
        this.clock.visible = false; // 默认藏起来
        this.uiTimerText = this.game.add.text(0, 0, "20", {
            font: "30px",
            fill: "#000000", // 黑色字体
            align: "center"
        });
        this.uiTimerText.anchor.set(0.5, 0.4);
        this.clock.addChild(this.uiTimerText);
       
        if (this.seat === 0) {
        
            this.uiHead.anchor.set(0, 0.5);
            this.uiHead.x = 10;
        
               
        } else if(this.seat === 1){
            
            this.uiHead.anchor.set(0.3, 0.5);
            this.uiHead.y = 200; 
            this.clock.x = sx - 150; 
            this.clock.y = sy + this.uiHead.y + 150; 
        }else if(this.seat === 2){
            this.uiHead.anchor.set(0.3, 0.5);
            this.uiHead.y = 200; 
            this.clock.x = sx + 150; 
            this.clock.y = this.uiHead.y + 150;
        }

        // 统一缩放：使用 scale.set 性能更好且不会因多次调用 width *= 2 导致倍数混乱
        this.uiHead.scale.set(2);
        const style = {font: "34px ", fill: "#fc00d2", align: "center"};
        
        this.uiName = this.game.add.text(sx + 120, sy - 60, '', style);
        this.uiName.anchor.set(0, 0);

        
        
    }
    showTimer(seconds) {
        this.clock.visible = true;
        this.uiTimerText.text = seconds;

        // 如果之前有定时器还在跑，先一刀掐死，防止重影
        if (this.timerLoop) {
            this.game.time.events.remove(this.timerLoop);
        }

        // 开启循环：每 1 秒（Phaser.Timer.SECOND）扣 1 滴血
        this.timerLoop = this.game.time.events.loop(Phaser.Timer.SECOND, () => {
            seconds--;
            if (seconds <= 0) {
                seconds = 0;
                this.game.time.events.remove(this.timerLoop); // 减到0自动停
            }
            this.uiTimerText.text = seconds;
        }, this);
    }

    hideTimer() {
        this.clock.visible = false;
        // 彻底掐断后台定时器
        if (this.timerLoop) {
            this.game.time.events.remove(this.timerLoop);
            this.timerLoop = null;
        }
    }
    updateInfo(uid, name) {
        this.uid = uid;
        if (uid) {
            this.uiHead.loadTexture('nongmin');
        } else {
            this.uiHead.loadTexture('nullhead');
        }
        let showName = name || "";
        if (name && name.length > 7) { showName = name.slice(0, 3) + '..' + name.slice(-3); }
        this.uiName.text = showName;
    }

    cleanPokers() {

        let length = this.pokerInHand.length;
        for (let i = 0; i < length; i++) {
            let pid = this.pokerInHand[i];
            let p = this.findAPoker(pid);
            p.kill();
        }
        this.pokerInHand = [];
    }
    createMyTextBtn = (x, y) => {
                    // 父辈：按钮底板图片 btnBG
                    let btn = this.game.add.button(x, y, 'btnBG',null, this);
                    btn.anchor.set(0.5, 0.5);
                    return btn;
                };
    initShotLayer() {
        this.shotLayer = this.game.add.group();
        let group = this.shotLayer;       
        let sy = this.game.world.height * 0.65;
       

        //不出按钮，放在最左边，间距同上
        let pass = this.createMyTextBtn(0, sy);
        let passText = this.game.add.text(0, 0, "不出", { font: "36px ", fill: "#000000", align: "center" });
        passText.anchor.set(0.5);
        pass.addChild(passText);
        
        pass.inputEnabled = true;
        pass.events.onInputUp.add(this.onPass, this);
        group.add(pass);
        // 提示按钮，放在不出按钮右边，间距同上
        let hint = this.createMyTextBtn(0, sy);
        let hintText = this.game.add.text(0, 0, "提示", { font: "36px ", fill: "#000000", align: "center" });
        hintText.anchor.set(0.5);
        hint.addChild(hintText);
        hint.inputEnabled = true;
        hint.events.onInputUp.add(this.onHint, this);
        group.add(hint);
        // 出牌按钮，放在提示按钮右边，间距同上
        let shot = this.createMyTextBtn(0, sy);
        let shotText = this.game.add.text(0, 0, "出牌", { font: "36px ", fill: "#000000", align: "center" });
        shotText.anchor.set(0.5);
        shot.addChild(shotText);
        shot.inputEnabled = true;
        shot.events.onInputUp.add(this.onShot, this);
        group.add(shot);
        this.game.world.bringToTop(group);
        group.forEach(function (child) {
            child.kill();
        });
    }

    setLandlord() {
        this.isLandlord = true;
        this.uiHead.loadTexture('dizhu');
    }

    say(str) {
        let style = {font: "40px ", fill: "#fffb00", align: "center"};
        let sx = this.uiName.x + this.uiName.width / 2 ;
        let sy = this.uiName.y - this.uiName.height ;
        let text = this.game.add.text(sx, sy, str, style);
        if (this.uiHead.scale.x === -2) {
            text.x = text.x - text.width - 100;
        }
        
        this.game.time.events.add(2000, text.destroy, text);
    }

    onInputDown(poker, pointer) {
        this.isDraging = true;
        this.onSelectPoker(poker, pointer);
    }

    onInputUp(poker, pointer) {
        this.isDraging = false;
        //this.onSelectPoker(poker, pointer);
    }

    onInputOver(poker, pointer) {
        if (this.isDraging) {
            this.onSelectPoker(poker, pointer);
        }
    }

    onSelectPoker(poker, pointer) {
        let index = this.hintPoker.indexOf(poker.id);
        if (index === -1) {
            poker.y = this.game.world.height - Poker.PH * 0.8;
            this.hintPoker.push(poker.id);
        } else {
            poker.y = this.game.world.height - Poker.PH * 0.5;
            this.hintPoker.splice(index, 1);
        }
    }


    onPass(btn) {
        this.game.finishPlay([]);
        this.pokerUnSelected(this.hintPoker);
        this.hintPoker = [];
        btn.parent.forEach(function (child) {
            child.kill();
        });
    }


    onHint(btn) {
        if (this.hintPoker.length === 0) {
            this.hintPoker = this.lastTurnPoker;
        } else {
            this.pokerUnSelected(this.hintPoker);
            if (this.lastTurnPoker.length > 0 && !Poker.canCompare(this.hintPoker, this.lastTurnPoker)) {
                this.hintPoker = [];
            }
        }
        let bigger = this.hint(this.hintPoker);
        if (bigger.length === 0) {
            if (this.hintPoker === this.lastTurnPoker) {
                this.say("没有能大过的牌");
                // this.onPass(btn);
            } else {
                this.pokerUnSelected(this.hintPoker);
            }
        } else {
            this.pokerSelected(bigger);
        }
        this.hintPoker = bigger;
    }

    onShot(btn) {
        if (this.hintPoker.length === 0) {
            return;
        }
        let code = this.canPlay(this.game.isLastShotPlayer() ? [] : this.game.tablePoker, this.hintPoker);
        if (code) {
            this.say(code);
            return;
        }
        this.game.finishPlay(this.hintPoker);
        this.hintPoker = [];
        btn.parent.forEach(function (child) {
            child.kill();
        });
    }

    hint(lastTurnPoker) {
        let cards;
        let handCards = Poker.toCards(this.pokerInHand);
        if (lastTurnPoker.length === 0) {
            cards = Rule.bestShot(handCards);
        } else {
            cards = Rule.cardsAbove(handCards, Poker.toCards(lastTurnPoker));
        }

        return Poker.toPokers(this.pokerInHand, cards);
    }

    canPlay(lastTurnPoker, shotPoker) {
        let cardsA = Poker.toCards(shotPoker);
        let valueA = Rule.cardsValue(cardsA);
        if (!valueA[0]) {
            return '出牌不合法';
        }
        let cardsB = Poker.toCards(lastTurnPoker);
        if (cardsB.length === 0) {
            return '';
        }
        let valueB = Rule.cardsValue(cardsB);
        if (valueA[0] !== valueB[0] && valueA[1] < 1000) {
            return '出牌类型跟上家不一致';
        }

        if (valueA[1] > valueB[1]) {
            return '';
        }
        return '出牌需要大于上家';
    }

    playPoker(lastTurnPoker) {
        this.lastTurnPoker = lastTurnPoker;

        let group = this.shotLayer;
        let step = this.game.world.width / 6;
        let sx = this.game.world.width / 2 - 0.5 * step;
        if (!this.game.isLastShotPlayer()) {
            sx -= 0.5 * step;
            let pass = group.getAt(0);
            pass.centerX = sx;
            sx += step;
            pass.revive();
        }
        let hint = group.getAt(1);
        hint.centerX = sx;
        hint.revive();
        let shot = group.getAt(2);
        shot.centerX = sx + step;
        shot.revive();

        this.enableInput();
    }

    sortPoker() {
        this.pokerInHand.sort(Poker.comparePoker);
    }

    dealPoker() {
        this.sortPoker();
        let length = this.pokerInHand.length;
        for (let i = 0; i < length; i++) {
            let pid = this.pokerInHand[i];
            let p = new Poker(this.game, pid, pid);
            this.game.world.add(p);
            this.pushAPoker(p);
            this.dealPokerAnim(p, i);
        }
    }

    dealPokerAnim(p, i) {
        //to(properties, duration, ease, autoStart, delay, repeat, yoyo)
        this.game.add.tween(p).to({
            x: this.game.world.width / 2 + Poker.PW * 0.44 * (i - 8.5),
            y: this.game.world.height - Poker.PH / 2
        }, 500, Phaser.Easing.Default, true, 50 * i);
    }

    arrangePoker() {
        let count = this.pokerInHand.length;
        let gap = Math.min(this.game.world.width / count, Poker.PW * 0.44);
        for (let i = 0; i < count; i++) {
            let pid = this.pokerInHand[i];
            let p = this.findAPoker(pid);
            p.bringToTop();
            this.game.add.tween(p).to({x: this.game.world.width / 2 + (i - count / 2) * gap}, 600, Phaser.Easing.Default, true);
        }
    }

    pushAPoker(poker) {
        this._pokerPic[poker.id] = poker;

        poker.events.onInputDown.add(this.onInputDown, this);
        poker.events.onInputUp.add(this.onInputUp, this);
        poker.events.onInputOver.add(this.onInputOver, this);
    }

    removeAPoker(pid) {
        let length = this.pokerInHand.length;
        for (let i = 0; i < length; i++) {
            if (this.pokerInHand[i] === pid) {
                this.pokerInHand.splice(i, 1);
                delete this._pokerPic[pid];
                return;
            }
        }
        console.log('Error: REMOVE POKER ', pid);
    }

    removeAllPoker() {
        let length = this.pokerInHand.length;
        for (let i = 0; i < length; i++) {
            this.pokerInHand.splice(i, 1);
            delete this._pokerPic[pid];
        }
        console.log('Error: REMOVE POKER ', pid);
    }

    findAPoker(pid) {
        let poker = this._pokerPic[pid];
        if (poker === undefined) {
            console.log('Error: FIND POKER ', pid);
        }
        return poker;
    }

    enableInput() {
        let length = this.pokerInHand.length;
        for (let i = 0; i < length; i++) {
            let p = this.findAPoker(this.pokerInHand[i]);
            p.inputEnabled = true;
        }
    }

    pokerSelected(pokers) {
        for (let i = 0; i < pokers.length; i++) {
            let p = this.findAPoker(pokers[i]);
            p.y = this.game.world.height - Poker.PH * 0.8;
        }
    }

    pokerUnSelected(pokers) {
        for (let i = 0; i < pokers.length; i++) {
            let p = this.findAPoker(pokers[i]);
            p.y = this.game.world.height - Poker.PH / 2;
        }
    }
}


export class NetPlayer extends Player {
    constructor(seat, game) {
        super(seat, game);
        this._pokerPic = [];
    }

    pushAPoker(poker) {
        this._pokerPic.push(poker);
        this.updateLeftPoker();
    }

    removeAPoker(pid) {
        let i = this.pokerInHand.length - 1;
        for (; i >= 0; i--) {
            if (this.pokerInHand[i] === pid) {
                this.pokerInHand.splice(i, 1);
                break
            }
        }
        if (i === -1) {
            this.pokerInHand.pop();
        }
        i = this._pokerPic.length - 1;
        for (; i >= 0; i--) {
            if (this._pokerPic[i].id === pid) {
                this._pokerPic.splice(i, 1);
                break
            }
        }
        if (i === -1) {
            this._pokerPic.pop();
        }
        this.updateLeftPoker();
    }

    arrangePoker() {
        if (this.pokerInHand.length > 0 && this.pokerInHand[0] < 54) {
            this.reDealPoker();
        }
    }

    replacePoker(pokers, start) {
        if (this.pokerInHand.length !== pokers.length - start) {
            console.log("ERROR ReplacePoker:", this.pokerInHand, pokers);
        }
        if (this._pokerPic.length !== pokers.length - start) {
            console.log("ERROR ReplacePoker:", this._pokerPic, pokers);
        }
        const length = this.pokerInHand.length;
        for (let i = 0; i < length; i++) {
            this.pokerInHand[i] = pokers[start + i];
            this._pokerPic[i].id = pokers[start + i];
            this._pokerPic[i].frame = pokers[start + i];
        }
    }

    findAPoker(pid) {
        for (let i = this._pokerPic.length - 1; i >= 0; i--) {
            if (this._pokerPic[i].id == pid) {
                return this._pokerPic[i];
            }
        }
        return this._pokerPic[this._pokerPic.length - 1];
    }

    reDealPoker() {
        this.sortPoker();
        const length = this.pokerInHand.length;
        for (let i = 0; i < length; i++) {
            const pid = this.pokerInHand[i];
            const p = this.findAPoker(pid);
            p.bringToTop();
            this.dealPokerAnim(p, this.seat === 1 ? length - 1 - i : i);
        }
    }

    cleanPokers() {
        const length = this.pokerInHand.length;
        for (let i = 0; i < length; i++) {
            const pid = this.pokerInHand[i];
            const p = this.findAPoker(pid);
            p.kill();
        }
        this.pokerInHand = [];
    }

    dealPokerAnim(p, i) {
        const width = this.game.world.width;
        if (p.id > 53) {
            this.game.add.tween(p).to({
                x: this.seat === 1 ? width - Poker.PW / 2 : Poker.PW / 2,
                y: this.seat === 1 ? this.uiHead.y + Poker.PH / 2 + 100 : this.uiHead.y + Poker.PH / 2 + 100
            }, 500, Phaser.Easing.Default, true, 25 + 50 * i);
        } else {
            this.game.add.tween(p).to({
                x: this.seat === 1 ? (width - Poker.PW / 2) - (i * Poker.PW * 0.44) : Poker.PW / 2 + i * Poker.PW * 0.44,
                y: this.seat === 1 ? this.uiHead.y + Poker.PH / 2 + 10 : this.uiHead.y + Poker.PH * 1.5 + 20
            }, 500, Phaser.Easing.Default, true, 50 * i);
        }
    }

    initUI(sx, sy) {
        super.initUI(sx, sy);
        this.uiLeftPoker = this.game.add.text(sx, sy + 60 + Poker.PH + 150, '17', {
            font: "40px ",
            fill: "#ffffff",
            align: "center"
        });
        this.uiLeftPoker.anchor.set(0.5, 0);
        this.uiLeftPoker.width *= 2;
        this.uiLeftPoker.height *= 2;
        this.uiLeftPoker.kill();

        const style = {font: "34px ", fill: "#fc00d2", align: "center"};
        if (this.seat === 1) {
            this.uiName = this.game.add.text(sx - 120, sy + 40, '等待玩家加入', style);
            this.uiName.anchor.set(1, 0);
        } else {
            this.uiName = this.game.add.text(sx + 140, sy + 40, '等待玩家加入', style);
            this.uiName.anchor.set(0, 0);
        }
    }

    updateInfo(uid, name) {
        super.updateInfo(uid, name);
        let showName = name || "";
        if (name && name.length > 7) { showName = name.slice(0, 3) + '..' + name.slice(-3); }
        if (uid) {
            this.uiName.text = showName;
        } else {
            this.uiName.text = '等待玩家加入';
        }
    }

    updateLeftPoker() {
        const len = this.pokerInHand.length;
        if (len > 0) {
            this.uiLeftPoker.text = "" + this.pokerInHand.length;
            this.uiLeftPoker.revive();
        } else {
            this.uiLeftPoker.kill();
        }
    }
}
