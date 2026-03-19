# 1. 复制网页到安卓目录
npx cap copy android
# 2. 进安卓目录打包 (使用 --daemon 模式会快一点)
cd android
./gradlew assembleDebug
# ./gradlew assembleRelease
cd C:\Users\niu32\Documents\GitHub\doudizhu\server\client
# # 3. 把打包出的 APK 轰进手机
# cd  C:\software\platform-tools-latest-windows
# .\platform-tools\adb install "C:\Users\niu32\Documents\GitHub\doudizhu\server\client\android\app\build\outputs\apk\debug\app-debug.apk"
# # 4. 直接启动手机上的 App (换成你的包名)
# .\platform-tools\adb shell am start -n com.newdonediner.doudizhu/.MainActivity