package com.mudita.map.common.model.routing

/**
 * One leg of a calculated public-transport itinerary, built from TransportRoutingHelper's result
 * in the :app module and handed down as plain data so this module doesn't need net.osmand.router
 * types. Deliberately not Parcelable/persisted: it is rebuilt fresh from RouteState on every
 * successful transit calculation, the same way navigationSteps is for car/bike/foot.
 */
sealed class TransitLeg {

    data class Walk(
        val distanceMeters: Int,
        val timeSeconds: Int,
        /** Name of the stop walked to, or null for the final walk leg into the destination. */
        val toStopName: String?,
    ) : TransitLeg()

    data class Ride(
        /** Route short name as riders would recognize it, e.g. "4" or "M15-SBS". */
        val routeRef: String,
        /** Raw OSM route type, e.g. "subway", "bus", "tram", "light_rail". */
        val routeType: String,
        val fromStopName: String,
        val toStopName: String,
        val stopCount: Int,
        val timeSeconds: Int,
    ) : TransitLeg()
}
