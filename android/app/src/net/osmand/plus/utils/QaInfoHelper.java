package net.osmand.plus.utils;

import android.app.Activity;
import android.app.AlertDialog;
import android.view.MotionEvent;

import com.mudita.maps.BuildConfig;

public class QaInfoHelper {
    private static int tapCount = 0;
    private static long lastTapTime = 0;
    private static final long RESET_DELAY = 3_000L;
    private static final int REQUIRED_TAP_COUNT = 5;
    private static final int TAP_INTERVAL_MS = 300;

    public static boolean handleTouch(Activity activity, MotionEvent ev) {
        if (ev.getAction() == MotionEvent.ACTION_DOWN) {
            long now = System.currentTimeMillis();
            long timeSinceLast = now - lastTapTime;

            if (timeSinceLast < TAP_INTERVAL_MS) {
                tapCount++;
            } else {
                tapCount = 1;
            }

            if (timeSinceLast > RESET_DELAY) {
                tapCount = 1;
            }

            lastTapTime = now;

            if (tapCount == REQUIRED_TAP_COUNT) {
                new AlertDialog.Builder(activity)
                        .setTitle("QA Version")
                        .setMessage("Build: " + BuildConfig.VERSION_NAME + " (" + BuildConfig.VERSION_CODE + ")")
                        .setPositiveButton("OK", null)
                        .show();
                tapCount = 0;
                return true;
            }
        }

        return false;
    }
}
