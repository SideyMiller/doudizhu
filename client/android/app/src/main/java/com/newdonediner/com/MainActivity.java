package com.newdonediner.com;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;
import android.os.SystemClock;
import android.webkit.WebView;
import android.view.MotionEvent;
import android.os.Build;
import android.view.WindowInsets;
import android.view.Display;          // 必须导入
import android.view.Window;           // 必须导入
import android.view.WindowManager;
import android.view.WindowInsetsController;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // 注册你刚写的插件
        registerPlugin(WalletPlugin.class);
        
        super.onCreate(savedInstanceState);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            Window window = getWindow();
            WindowManager.LayoutParams layoutParams = window.getAttributes();
            Display.Mode[] modes = window.getWindowManager().getDefaultDisplay().getSupportedModes();
            
            int mode60HzId = 0;
            
            // 遍历寻找 60Hz 的屏幕刷新模式
            for (Display.Mode mode : modes) {
                // 允许微小的浮点数误差，比如 59.9Hz 也算 60Hz
                if (Math.abs(mode.getRefreshRate() - 60.0f) < 1.0f) {
                    mode60HzId = mode.getModeId();
                    break; // 找到了就跳出循环
                }
            }
        
                // 如果找到了 60Hz 模式，强行应用给当前窗口
                if (mode60HzId != 0) {
                    layoutParams.preferredDisplayModeId = mode60HzId;
                    window.setAttributes(layoutParams);
                }
        }
        
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        
        // 如果重新获得了焦点
        if (hasFocus) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                WindowInsetsController controller = getWindow().getInsetsController();
                if (controller != null) {
                    // 1. 同时隐藏状态栏 (顶) 和 导航栏 (底)
                    controller.hide(WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars());
                    // 2. 设置行为：边缘滑动时短暂显示，几秒后自动收回 (完美替代旧版的 IMMERSIVE_STICKY)
                    controller.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
                }
            }

            // 通过 Capacitor 的 bridge 获取当前的 WebView
            WebView webView = this.bridge.getWebView();
            if (webView != null) {
                // 给它发一个空的取消事件，强行清空它内部的 Input 队列
                webView.dispatchTouchEvent(android.view.MotionEvent.obtain(
                    android.os.SystemClock.uptimeMillis(),
                    android.os.SystemClock.uptimeMillis(),
                    android.view.MotionEvent.ACTION_CANCEL, 0, 0, 0));
                
                webView.requestFocus(); // 再次确保它拿到了焦点
            }
        }
    }
    
    

}
