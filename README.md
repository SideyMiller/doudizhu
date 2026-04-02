## 斗地主 &nbsp;&nbsp;
[![MIT Licence](https://badges.frapsoft.com/os/mit/mit.svg?v=103)](https://opensource.org/licenses/mit-license.php)  


斗地主游戏，后端基于Python+Tornado+MySQL开发，前端 Phaser 引擎（可打包为安卓应用）
（此项目带有web3，环境依赖未列举全，请留意json）
这个增量项目可选连接solanawallet，使用capacitor和clientlib-ktx:2.0.0，暂时解决了capacitor外壳下的mwa调用


**Dependencies**

* Python3.8+
* Mysql5.7+

Quick build APK
```shell
    cd client android
    ./gradlew assembleDebug  
```
Quick Start Client
```shell
    cd client
    npm run dev
    Now visit http://127.0.0.1:3000
```
Quick Start Server
```shell
    mysql --user=root -p < schema.sql
    pip3 install -r requirements.txt
    cd server
    export DATABASE_URI=mysql+aiomysql://root:123456@127.0.0.1:3306/ddz
    python3 app.py
    Now Server启动
```

