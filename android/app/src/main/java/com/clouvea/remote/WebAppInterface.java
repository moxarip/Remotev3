package com.clouvea.remote;

import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.location.Location;
import android.location.LocationManager;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.BatteryManager;
import android.os.Environment;
import android.os.StatFs;
import android.os.Vibrator;
import android.webkit.JavascriptInterface;
import org.json.JSONObject;

public class WebAppInterface {
    private final Context mContext;
    private Ringtone mRingtone;

    public WebAppInterface(Context context) {
        this.mContext = context;
    }

    @JavascriptInterface
    public void vibrate(long milliseconds) {
        try {
            Vibrator v = (Vibrator) mContext.getSystemService(Context.VIBRATOR_SERVICE);
            if (v != null) {
                v.vibrate(milliseconds);
            }
        } catch (Exception ignored) {}
    }

    @JavascriptInterface
    public int getBatteryLevel() {
        try {
            Intent batteryIntent = mContext.registerReceiver(null, new IntentFilter(Intent.ACTION_BATTERY_CHANGED));
            if (batteryIntent != null) {
                int level = batteryIntent.getIntExtra(BatteryManager.EXTRA_LEVEL, -1);
                int scale = batteryIntent.getIntExtra(BatteryManager.EXTRA_SCALE, -1);
                if (level != -1 && scale != -1) {
                    return (int) ((level / (float) scale) * 100);
                }
            }
        } catch (Exception ignored) {}
        return 85;
    }

    @JavascriptInterface
    public boolean isCharging() {
        try {
            Intent batteryIntent = mContext.registerReceiver(null, new IntentFilter(Intent.ACTION_BATTERY_CHANGED));
            if (batteryIntent != null) {
                int status = batteryIntent.getIntExtra(BatteryManager.EXTRA_STATUS, -1);
                return status == BatteryManager.BATTERY_STATUS_CHARGING || status == BatteryManager.BATTERY_STATUS_FULL;
            }
        } catch (Exception ignored) {}
        return false;
    }

    @JavascriptInterface
    public String getStorageInfo() {
        try {
            StatFs stat = new StatFs(Environment.getExternalStorageDirectory().getPath());
            long totalBytes = stat.getTotalBytes();
            long freeBytes = stat.getAvailableBytes();
            long usedBytes = totalBytes - freeBytes;

            JSONObject obj = new JSONObject();
            obj.put("total", totalBytes);
            obj.put("free", freeBytes);
            obj.put("used", usedBytes);
            return obj.toString();
        } catch (Exception e) {
            return "{\"total\":128000000000,\"free\":64000000000,\"used\":64000000000}";
        }
    }

    @JavascriptInterface
    public String getNativeLocation() {
        try {
            LocationManager lm = (LocationManager) mContext.getSystemService(Context.LOCATION_SERVICE);
            if (lm != null) {
                Location loc = null;
                if (lm.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
                    loc = lm.getLastKnownLocation(LocationManager.GPS_PROVIDER);
                }
                if (loc == null && lm.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) {
                    loc = lm.getLastKnownLocation(LocationManager.NETWORK_PROVIDER);
                }

                if (loc != null) {
                    JSONObject obj = new JSONObject();
                    obj.put("latitude", loc.getLatitude());
                    obj.put("longitude", loc.getLongitude());
                    obj.put("accuracy", loc.getAccuracy());
                    obj.put("altitude", loc.getAltitude());
                    obj.put("speed", loc.getSpeed());
                    obj.put("time", loc.getTime());
                    obj.put("provider", loc.getProvider());
                    return obj.toString();
                }
            }
        } catch (Exception ignored) {}
        return null;
    }

    @JavascriptInterface
    public void startEmergencyAlarm() {
        try {
            vibrate(5000);
            Uri alert = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
            if (alert == null) {
                alert = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE);
            }
            if (alert != null) {
                mRingtone = RingtoneManager.getRingtone(mContext, alert);
                if (mRingtone != null && !mRingtone.isPlaying()) {
                    mRingtone.play();
                }
            }
        } catch (Exception ignored) {}
    }

    @JavascriptInterface
    public void stopEmergencyAlarm() {
        try {
            if (mRingtone != null && mRingtone.isPlaying()) {
                mRingtone.stop();
            }
        } catch (Exception ignored) {}
    }
}
