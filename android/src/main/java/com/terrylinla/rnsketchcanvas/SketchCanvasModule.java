package com.terrylinla.rnsketchcanvas;

import android.util.Log;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.UiThreadUtil;
import com.facebook.react.uimanager.UIManagerHelper;
import com.facebook.react.uimanager.common.UIManagerType;

public class SketchCanvasModule extends ReactContextBaseJavaModule {
    
    public SketchCanvasModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "SketchCanvasModule";
    }

    @ReactMethod
    public void transferToBase64(final int tag, final String type, final boolean transparent, 
        final boolean includeImage, final boolean includeText, final boolean cropToImageSize, final Callback callback){
        try {
            UiThreadUtil.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    try {
                        ReactApplicationContext context = getReactApplicationContext();
                        com.facebook.react.uimanager.UIManager uiManager = UIManagerHelper.getUIManager(context, UIManagerType.DEFAULT);
                        if (uiManager != null) {
                            SketchCanvas view = (SketchCanvas) uiManager.resolveView(tag);
                            if (view != null) {
                                String base64 = view.getBase64(type, transparent, includeImage, includeText, cropToImageSize);
                                callback.invoke(null, base64);
                            } else {
                                callback.invoke("View not found", null);
                            }
                        } else {
                            callback.invoke("UIManager not available", null);
                        }
                    } catch (Exception e) {
                        callback.invoke(e.getMessage(), null);
                    }
                }
            });
        } catch (Exception e) {
            callback.invoke(e.getMessage(), null);
        }
    }
}