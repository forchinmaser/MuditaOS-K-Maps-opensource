package com.mudita.map.ui.commandView

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.mudita.kompakt.commonUi.KompaktTypography500
import com.mudita.kompakt.commonUi.KompaktTypography900
import com.mudita.kompakt.commonUi.colorBlack
import com.mudita.kompakt.commonUi.components.DashedHorizontalDivider
import com.mudita.map.common.R
import com.mudita.map.common.model.routing.TransitLeg
import com.mudita.map.common.ui.routeStateIconSize
import com.mudita.map.common.utils.DESCRIPTION_SEPARATOR
import com.mudita.map.ui.NavigationTime
import com.mudita.map.ui.buttons.EndRouteButton
import com.mudita.maps.frontitude.R.plurals
import com.mudita.maps.frontitude.R.string

/**
 * Transit's counterpart to CommandNavigationView: legs come from TransportRoutingHelper as
 * walk/board/transfer segments rather than turn-by-turn RouteDirectionInfo, so there is no shared
 * step model between the two - this renders TransitLeg directly instead of converting into
 * NavigationStep.
 */
@Composable
fun TransitItineraryView(
    legs: List<TransitLeg>,
    onEndRouteClick: () -> Unit = {},
) {
    Column(modifier = Modifier.fillMaxSize()) {
        if (legs.isEmpty()) return

        Row(
            modifier = Modifier.fillMaxWidth().padding(top = 8.dp, end = 8.dp),
            horizontalArrangement = Arrangement.End,
        ) {
            EndRouteButton(onClick = onEndRouteClick)
        }

        legs.forEachIndexed { index, leg ->
            TransitLegRow(leg = leg)
            if (index != legs.lastIndex) {
                DashedHorizontalDivider(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp))
            }
        }
    }
}

@Composable
private fun TransitLegRow(leg: TransitLeg) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Icon(
            modifier = Modifier.size(routeStateIconSize),
            painter = painterResource(
                id = when (leg) {
                    is TransitLeg.Walk -> R.drawable.ic_walking
                    is TransitLeg.Ride -> R.drawable.mm_public_transport
                }
            ),
            contentDescription = null,
            tint = colorBlack,
        )

        Column(modifier = Modifier.padding(start = 12.dp)) {
            Text(
                text = when (leg) {
                    is TransitLeg.Walk -> leg.toStopName?.let {
                        stringResource(string.maps_common_label_walktostop, it)
                    } ?: stringResource(string.maps_common_label_walktodestination)

                    is TransitLeg.Ride -> stringResource(
                        string.maps_common_label_boardroute,
                        leg.routeRef,
                        leg.toStopName,
                    )
                },
                style = KompaktTypography900.labelMedium,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
            )

            val timeSeconds = when (leg) {
                is TransitLeg.Walk -> leg.timeSeconds
                is TransitLeg.Ride -> leg.timeSeconds
            }
            val timeText = NavigationTime.create(timeSeconds).getDisplayText()
            val detail = when (leg) {
                is TransitLeg.Walk -> timeText
                is TransitLeg.Ride -> pluralStringResource(
                    plurals.maps_routeplanning_placeholder_numberofstops,
                    leg.stopCount,
                    leg.stopCount,
                ) + DESCRIPTION_SEPARATOR + timeText
            }
            Text(
                modifier = Modifier.padding(top = 2.dp),
                text = detail,
                style = KompaktTypography500.labelSmall,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
        }
    }
}

@Composable
@Preview(backgroundColor = 0xffffffff, showBackground = true)
private fun TransitItineraryViewPreview() {
    TransitItineraryView(
        legs = listOf(
            TransitLeg.Walk(distanceMeters = 350, timeSeconds = 300, toStopName = "86 St"),
            TransitLeg.Ride(
                routeRef = "4",
                routeType = "subway",
                fromStopName = "86 St",
                toStopName = "Union Sq - 14 St",
                stopCount = 5,
                timeSeconds = 780,
            ),
            TransitLeg.Walk(distanceMeters = 200, timeSeconds = 180, toStopName = null),
        ),
    )
}
