package net.osmand.plus.activities;

import android.view.MotionEvent;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import com.mudita.maps.BuildConfig;

import net.osmand.PlatformUtil;
import net.osmand.plus.OsmandApplication;
import net.osmand.plus.utils.QaInfoHelper;

import org.apache.commons.logging.Log;

public class OsmandBaseActivity extends AppCompatActivity {

	private static final Log LOG = PlatformUtil.getLog(OsmandBaseActivity.class);

	@NonNull
	public OsmandApplication getMyApplication() {
		return (OsmandApplication) getApplication();
	}

	/**
	 * Dispatches touch events to the QaInfoHelper to handle QA version taps.
	 * This is useful for debugging purposes in the QA build type.
	 */
	@Override
	public boolean dispatchTouchEvent(MotionEvent ev) {
		if (BuildConfig.BUILD_TYPE.equals("qa")) {
			QaInfoHelper.handleTouch(this, ev);
		}
		return super.dispatchTouchEvent(ev);
	}
}
