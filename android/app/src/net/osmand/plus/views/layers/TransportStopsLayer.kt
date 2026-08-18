package net.osmand.plus.views.layers

import android.content.Context
import android.graphics.Canvas
import android.graphics.PointF
import kotlin.math.abs
import net.osmand.PlatformUtil
import net.osmand.ResultMatcher
import net.osmand.data.LatLon
import net.osmand.data.PointDescription
import net.osmand.data.QuadRect
import net.osmand.data.RotatedTileBox
import net.osmand.data.TransportStop
import net.osmand.plus.OsmandApplication
import net.osmand.plus.views.layers.ContextMenuLayer.IContextMenuProvider
import net.osmand.plus.views.layers.base.OsmandMapLayer
import net.osmand.plus.views.layers.core.TransportStopsTileProvider
import org.apache.commons.logging.Log

/**
 * Renders subway/bus/tram stops (from the map's transport index, if present) as icons on the
 * map, and provides hit-testing so a tap can be resolved to the nearest stop.
 *
 * Data source: [OsmandApplication.getResourceManager]'s `searchTransportSync`, which only finds
 * results for map files that were indexed with [net.osmand.binary.BinaryMapIndexReader.hasTransportData];
 * on a map file with no transport section this layer naturally renders nothing.
 */
class TransportStopsLayer(context: Context) : OsmandMapLayer(context), IContextMenuProvider {

    private val app: OsmandApplication = context.applicationContext as OsmandApplication
    private val prefs = context.applicationContext.getSharedPreferences(MUDITA_MAP_PREFS, Context.MODE_PRIVATE)

    private var stopsTileProvider: TransportStopsTileProvider? = null
    private var wasVisible = false

    private val data: MapLayerData<List<TransportStop>> = object : MapLayerData<List<TransportStop>>() {
        init {
            ZOOM_THRESHOLD = 0
        }

        override fun calculateResult(latLonBounds: QuadRect, zoom: Int): List<TransportStop> {
            val resourceManager = app.resourceManager ?: return emptyList()
            val result = ArrayList<TransportStop>()
            try {
                resourceManager.searchTransportSync(
                    latLonBounds.top, latLonBounds.left, latLonBounds.bottom, latLonBounds.right,
                    object : ResultMatcher<TransportStop> {
                        override fun publish(obj: TransportStop): Boolean {
                            result.add(obj)
                            return true
                        }

                        override fun isCancelled(): Boolean = isInterrupted
                    }
                )
            } catch (e: Exception) {
                log.error("searchTransportSync failed", e)
            }
            return result
        }

        override fun layerOnPostExecute() {
            app.osmandMap?.refreshMap()
        }
    }

    fun isShowTransportStopsEnabled(): Boolean = prefs.getBoolean(KEY_SHOW_TRANSPORT_STOPS, true)

    override fun onPrepareBufferImage(canvas: Canvas, tileBox: RotatedTileBox, settings: DrawSettings?) {
        super.onPrepareBufferImage(canvas, tileBox, settings)
        val visible = isShowTransportStopsEnabled() && tileBox.zoom >= START_ZOOM
        if (!visible) {
            if (wasVisible) {
                clearProvider()
            }
            wasVisible = false
            return
        }
        wasVisible = true
        val mapRenderer = mapRenderer ?: return
        data.queryNewData(tileBox)
        var provider = stopsTileProvider
        if (provider == null) {
            provider = TransportStopsTileProvider(context, data, getPointsOrder(), textScale)
            stopsTileProvider = provider
        }
        provider.drawSymbols(mapRenderer)
    }

    private fun clearProvider() {
        val mapRenderer = mapRenderer
        val provider = stopsTileProvider
        if (mapRenderer != null && provider != null) {
            provider.clearSymbols(mapRenderer)
        }
        stopsTileProvider = null
    }

    override fun destroyLayer() {
        super.destroyLayer()
        clearProvider()
    }

    override fun onDraw(canvas: Canvas, tileBox: RotatedTileBox, settings: DrawSettings) {
        // Stop icons are drawn through the GL symbols provider in onPrepareBufferImage; nothing to
        // draw on the software canvas.
    }

    override fun drawInScreenPixels(): Boolean = true

    /**
     * Nearest stop to [point], within touch radius, among the stops currently cached for the
     * visible tile box. Used by [ContextMenuLayer] to resolve a single tap to a stop, since
     * single-tap dispatch in this fork does not loop over [IContextMenuProvider]s generically.
     */
    fun findStopFromPoint(point: PointF, tileBox: RotatedTileBox): TransportStop? {
        if (!isShowTransportStopsEnabled() || tileBox.zoom < START_ZOOM) return null
        val objects = data.results ?: return null
        val ex = point.x.toInt()
        val ey = point.y.toInt()
        val radius = getScaledTouchRadius(app, STOP_TOUCH_RADIUS_PX)
        var closest: TransportStop? = null
        var closestDistSq = Int.MAX_VALUE
        for (stop in objects) {
            val latLon = stop.location ?: continue
            val x = tileBox.getPixXFromLatLon(latLon.latitude, latLon.longitude).toInt()
            val y = tileBox.getPixYFromLatLon(latLon.latitude, latLon.longitude).toInt()
            val dx = abs(x - ex)
            val dy = abs(y - ey)
            if (dx <= radius && dy <= radius) {
                val distSq = dx * dx + dy * dy
                if (distSq < closestDistSq) {
                    closestDistSq = distSq
                    closest = stop
                }
            }
        }
        return closest
    }

    override fun getObjectName(o: Any?): PointDescription? =
        (o as? TransportStop)?.let { PointDescription(PointDescription.POINT_TYPE_TRANSPORT_STOP, it.name) }

    override fun disableSingleTap(): Boolean = false

    override fun disableLongPressOnMap(point: PointF, tileBox: RotatedTileBox): Boolean = false

    override fun collectObjectsFromPoint(
        point: PointF,
        tileBox: RotatedTileBox,
        o: MutableList<Any>,
        unknownLocation: Boolean
    ) {
        findStopFromPoint(point, tileBox)?.let { o.add(it) }
    }

    override fun getObjectLocation(o: Any?): LatLon? = (o as? TransportStop)?.location

    override fun isObjectClickable(o: Any): Boolean = o is TransportStop

    override fun runExclusiveAction(o: Any?, unknownLocation: Boolean): Boolean = false

    companion object {
        // Stops render from the same zoom OsmAnd's own transport routing considers "local" detail;
        // below this the tile provider would just be querying/discarding empty results every frame.
        private const val START_ZOOM = 14
        private const val STOP_TOUCH_RADIUS_PX = 10

        const val MUDITA_MAP_PREFS = "mudita_map_prefs"
        const val KEY_SHOW_TRANSPORT_STOPS = "show_transport_stops"

        val log: Log = PlatformUtil.getLog(TransportStopsLayer::class.java)
    }
}
