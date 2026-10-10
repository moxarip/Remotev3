package com.clouvea.remote;

import android.app.Application;

public class ClouveaApp extends Application {
    public static final String CHANNEL_ID_DAEMON = "clouvea_daemon_channel";
    public static final String CHANNEL_ID_ALERTS = "clouvea_alerts_channel";

    @Override
    public void onCreate() {
        super.onCreate();
    }
}
