package com.mudita.map.common.enums

enum class MapType(val key: String) {
    DRIVING("driving"), WALKING("walking"), CYCLING("cycling"), TRANSIT("transit");

    companion object {
        fun fromKey(key: String): MapType {
            return MapType.values().first { it.key == key }
        }
    }
}