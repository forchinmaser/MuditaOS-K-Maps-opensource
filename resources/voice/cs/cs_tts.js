// IMPLEMENTED (X) or MISSING ( ) FEATURES, (N/A) if not needed in this language:
//
// (X) Basic navigation prompts: route (re)calculated (with distance and time support), turns, roundabouts, u-turns, straight/follow, arrival
// (X) Announce nearby point names (destination / intermediate / GPX waypoint / favorites / POI)
// (X) Attention prompts: SPEED_CAMERA; SPEED_LIMIT; BORDER_CONTROL; RAILWAY; TRAFFIC_CALMING; TOLL_BOOTH; STOP; PEDESTRIAN; MAXIMUM; TUNNEL
// (X) Other prompts: gps lost, off route, back to route
// (X) Street name and prepositions (onto / on / to) and street destination (toward) support
// (X) Distance unit support (meters / feet / yard)
// (X) Special grammar: nth(nominative/instrumental), distance(accusative/locative/workaround), special plural 1 2 3_4
// (X) Support announcing highway exits


var metricConst;
var dictionary = {};
var tts;

//// STRINGS
////////////////////////////////////////////////////////////////
function populateDictionary(tts) {
	// ROUTE CALCULATED
	dictionary["route_is"] = tts ? "cesta je dlouhá" : "route_is.mp3";
	dictionary["route_calculate"] = tts ? "cesta přepočtena" : "route_calculate.mp3";
	dictionary["distance"] = tts ? "cesta je dlouhá" : "distance.mp3";
	
	// LEFT/RIGHT
	//dictionary["prepare"] = tts ? "budete odbočovat" : "prepare.mp3";
	dictionary["after"] = tts ? "po" : "after.mp3";
	dictionary["in"] = tts ? "po" : "in.mp3";
	
	dictionary["left"] = tts ? "odbočte doleva" : "left.mp3";
	dictionary["left_sh"] = tts ? "odbočte ostře doleva" : "left_sh.mp3";
	dictionary["left_sl"] = tts ? "odbočte mírně doleva" : "left_sl.mp3";
	dictionary["right"] = tts ? "odbočte doprava" : "right.mp3";
	dictionary["right_sh"] = tts ? "odbočte ostře doprava" : "right_sh.mp3";
	dictionary["right_sl"] = tts ? "odbočte mírně doprava" : "right_sl.mp3";
	// Note: "left_keep"/"right_keep" is a turn type aiding lane selection, while "left_bear"/"right_bear" is as brief "then..." preparation for the turn-after-next. In some languages l/r_keep may not differ from l/r_bear.
	dictionary["left_keep"] = tts ? "držte se vlevo" : "left_keep.mp3";
	dictionary["right_keep"] = tts ? "držte se vpravo" : "right_keep.mp3";
	dictionary["left_bear"] = tts ? "se držte vlevo" : "left_bear.mp3";    // in English the same as left_keep, may be different in other languages
	dictionary["right_bear"] = tts ? "se držte vpravo" : "right_bear.mp3";  // in English the same as right_keep, may be different in other languages
	
	// U-TURNS
	//dictionary["prepare_make_uturn"] = tts ? "se budete otáčet zpět" : "prepare_make_uturn.mp3";
	dictionary["make_uturn"] = tts ? "se otočte zpět" : "make_uturn.mp3";
	dictionary["make_uturn2"] = tts ? "otočte se zpět" : "make_uturn2.mp3";
	dictionary["make_uturn_wp"] = tts ? "otočte se, jakmile to bude možné" : "make_uturn_wp.mp3";
	
	// ROUNDABOUTS
	dictionary["prepare_roundabout"] = tts ? "přijedete na kruhový objezd" : "prepare_roundabout.mp3";
	dictionary["roundabout"] = tts ? "vjeďte na kruhový objezd" : "roundabout.mp3";
	dictionary["then"] = tts ? "pak" : "then.mp3";
	dictionary["and"] = tts ? "a" : "and.mp3";
	dictionary["take"] = tts ? "a zvolte" : "take.mp3";
	dictionary["take2"] = tts ? "vyjeďte" : "take2.mp3";
	dictionary["exit"] = tts ? "výjezd" : "exit.mp3";
	dictionary["exit2"] = tts ? "výjezdem" : "exit2.mp3";
	
	dictionary["1st"] = tts ? "první" : "1st.mp3";
	dictionary["2nd"] = tts ? "druhý" : "2nd.mp3";
	dictionary["3rd"] = tts ? "třetí" : "3rd.mp3";
	dictionary["4th"] = tts ? "čtvrtý" : "4th.mp3";
	dictionary["5th"] = tts ? "pátý" : "5th.mp3";
	dictionary["6th"] = tts ? "šestý" : "6th.mp3";
	dictionary["7th"] = tts ? "sedmý" : "7th.mp3";
	dictionary["8th"] = tts ? "osmý" : "8th.mp3";
	dictionary["9th"] = tts ? "devátý" : "9th.mp3";
	dictionary["10th"] = tts ? "desátý" : "10th.mp3";
	dictionary["11th"] = tts ? "jedenáctý" : "11th.mp3";
	dictionary["12th"] = tts ? "dvanáctý" : "12th.mp3";
	dictionary["13th"] = tts ? "třináctý" : "13th.mp3";
	dictionary["14th"] = tts ? "čtrnáctý" : "14th.mp3";
	dictionary["15th"] = tts ? "patnáctý" : "15th.mp3";
	dictionary["16th"] = tts ? "šestnáctý" : "16th.mp3";
	dictionary["17th"] = tts ? "sedmnáctý" : "17th.mp3";
	
	dictionary["1st_inst"] = tts ? "prvním" : "1st_inst.mp3";
	dictionary["2nd_inst"] = tts ? "druhým" : "2nd_inst.mp3";
	dictionary["3rd_inst"] = tts ? "třetím" : "3rd_inst.mp3";
	dictionary["4th_inst"] = tts ? "čtvrtým" : "4th_inst.mp3";
	dictionary["5th_inst"] = tts ? "pátým" : "5th_inst.mp3";
	dictionary["6th_inst"] = tts ? "šestým" : "6th_inst.mp3";
	dictionary["7th_inst"] = tts ? "sedmým" : "7th_inst.mp3";
	dictionary["8th_inst"] = tts ? "osmým" : "8th_inst.mp3";
	dictionary["9th_inst"] = tts ? "devátým" : "9th_inst.mp3";
	dictionary["10th_inst"] = tts ? "desátým" : "10th_inst.mp3";
	dictionary["11th_inst"] = tts ? "jedenáctým" : "11th_inst.mp3";
	dictionary["12th_inst"] = tts ? "dvanáctým" : "12th_inst.mp3";
	dictionary["13th_inst"] = tts ? "třináctým" : "13th_inst.mp3";
	dictionary["14th_inst"] = tts ? "čtrnáctým" : "14th_inst.mp3";
	dictionary["15th_inst"] = tts ? "patnáctým" : "15th_inst.mp3";
	dictionary["16th_inst"] = tts ? "šestnáctým" : "16th_inst.mp3";
	dictionary["17th_inst"] = tts ? "sedmnáctým" : "17th_inst.mp3";
	
	// STRAIGHT/FOLLOW
	dictionary["go_ahead"] = tts ? "pokračujte rovně" : "go_ahead.mp3";
	dictionary["follow"] = tts ? "pokračujte" : "follow.mp3";
	
	// ARRIVE
	dictionary["and_arrive_destination"] = tts ? "a dorazíte do cíle" : "and_arrive_destination.mp3";
	dictionary["reached_destination"] = tts ? "dorazili jste do cíle" : "reached_destination.mp3";
	dictionary["and_arrive_intermediate"] = tts ? "a dorazíte do mezicíle" : "and_arrive_intermediate.mp3";
	dictionary["reached_intermediate"] = tts ? "dorazili jste do mezicíle" : "reached_intermediate.mp3";
	
	// NEARBY POINTS
	dictionary["and_arrive_waypoint"] = tts ? "a projedete GPX mezicílem" : "and_arrive_waypoint.mp3";
	dictionary["reached_waypoint"] = tts ? "projeli jste GPX mezicílem" : "reached_waypoint.mp3";
	dictionary["and_arrive_favorite"] = tts ? "a projedete oblíbeným bodem" : "and_arrive_favorite.mp3";
	dictionary["reached_favorite"] = tts ? "projeli jste oblíbeným bodem" : "reached_favorite.mp3";
	dictionary["and_arrive_poi"] = tts ? "a projedete bodem zájmu" : "and_arrive_poi.mp3";
	dictionary["reached_poi"] = tts ? "projeli jste bodem zájmu" : "reached_poi.mp3";
	
	// ATTENTION
	//dictionary["exceed_limit"] = tts ? "překračujete povolenou rychlost" : "exceed_limit.mp3";
	dictionary["exceed_limit"] = tts ? "rychlostní limit" : "exceed_limit.mp3";
	dictionary["attention"] = tts ? "Pozor" : "attention.mp3";
	dictionary["speed_camera"] = tts ? "měření rychlosti" : "speed_camera.mp3";
	dictionary["border_control"] = tts ? "hraniční kontrola" : "border_control.mp3";
	dictionary["railroad_crossing"] = tts ? "železniční přejezd" : "railroad_crossing.mp3";
	//není jen zpomalovač, ale i šikana a ochranný ostrůvek; viz issue #5605
	dictionary["traffic_calming"] = tts ? "zklidnění dopravy" : "traffic_calming.mp3";
	dictionary["toll_booth"] = tts ? "mýtná brána" : "toll_booth.mp3";
	dictionary["stop"] = tts ? "stopka" : "stop.mp3";
	dictionary["pedestrian_crosswalk"] = tts ? "přechod pro chodce" : "pedestrian_crosswalk.mp3";
	dictionary["tunnel"] = tts ? "tunel" : "tunnel.mp3";
	
	// OTHER PROMPTS
	dictionary["location_lost"] = tts ? "signál G.P.S. ztracen" : "location_lost.mp3";
	dictionary["location_recovered"] = tts ? "signál G.P.S. obnoven" : "location_recovered.mp3";
	dictionary["off_route"] = tts ? "nacházíte se" : "off_route.mp3";
	dictionary["off_route2"] = tts ? " mimo trasu" : "off_route2.mp3";
	dictionary["back_on_route"] = tts ? "vrátili jste se zpět na trasu" : "back_on_route.mp3";
	
	// STREET NAME PREPOSITIONS
	dictionary["onto"] = tts ? "na:" : "onto.mp3";
	dictionary["on"] = tts ? "na:" : "on.mp3";
	dictionary["to"] = tts ? "na:" : "to.mp3";
	dictionary["toward"] = tts ? "ve směru:" : "toward.mp3";
	
	// DISTANCE UNIT SUPPORT
	dictionary["meters_accusative"] = tts ? "metrů" : "meters_accusative.mp3";
	dictionary["around_1_kilometer_accusative"] = tts ? "přibližně jeden kilometr" : "around_1_kilometer_accusative.mp3";
	dictionary["around_2_kilometers_accusative"] = tts ? "přibližně dva kilometry" : "around_2_kilometers_accusative.mp3";
	dictionary["around"] = tts ? "přibližně" : "around.mp3";
	dictionary["kilometers_accusative3_4"] = tts ? "kilometry" : "kilometers_accusative3_4.mp3";
	dictionary["kilometers_accusative5"] = tts ? "kilometrů" : "kilometers_accusative5.mp3";
	
	dictionary["meters_locative"] = tts ? "metrech" : "meters_locative.mp3";
	dictionary["around_1_kilometer_locative"] = tts ? "přibližně jednom kilometru" : "around_1_kilometer_locative.mp3";
	dictionary["around_2_kilometers_locative"] = tts ? "přibližně dvou kilometrech" : "around_2_kilometers_locative.mp3";
	dictionary["kilometers_locative"] = tts ? "kilometrech" : "kilometers_locative.mp3";
	
	dictionary["farther_workaround"] = tts ? "dál" : "farther_workaround.mp3";
	dictionary["around_workaround"] = tts ? "dál přibližně" : "around_workaround.mp3";
	
	dictionary["feet_accusative"] = tts ? "stop" : "feet_accusative.mp3";
	dictionary["1_tenth_of_a_mile_accusative"] = tts ? "desetinu míle" : "1_tenth_of_a_mile_accusative.mp3";
	dictionary["tenths_of_a_mile_accusative"] = tts ? "desetiny míle" : "tenths_of_a_mile_accusative.mp3";
	dictionary["around_1_mile_accusative"] = tts ? "přibližně jednu míli" : "around_1_mile_accusative.mp3";
	dictionary["miles_accusative"] = tts ? "mil" : "miles_accusative.mp3";
	
	dictionary["feet_locative"] = tts ? "stopách" : "feet_locative.mp3";
	dictionary["1_tenth_of_a_mile_locative"] = tts ? "desetině míle" : "1_tenth_of_a_mile_locative.mp3";
	dictionary["tenths_of_a_mile_locative"] = tts ? "desetinách míle" : "tenths_of_a_mile_locative.mp3";
	dictionary["around_1_mile_locative"] = tts ? "přibližně jedné míli" : "around_1_mile_locative.mp3";
	dictionary["miles_locative"] = tts ? "mílích" : "miles_locative.mp3";
	
	dictionary["yards_accusative"] = tts ? "jardů" : "yards_accusative.mp3";
	dictionary["yards_locative"] = tts ? "jardech" : "yards_locative.mp3";
	
	// TIME SUPPORT
	dictionary["time"] = tts ? "potřebná doba:" : "time.mp3";
	dictionary["1_hour"] = tts ? "jedna hodina" : "1_hour.mp3";
	dictionary["2_hours"] = tts ? "dvě hodiny" : "2_hours.mp3";
	dictionary["3_4_hours"] = tts ? "hodiny" : "3_4_hours.mp3";
	dictionary["hours"] = tts ? "hodin" : "hours.mp3";
	dictionary["less_a_minute"] = tts ? "méně než jedna minuta" : "less_a_minute.mp3";
	dictionary["1_minute"] = tts ? "jedna minuta" : "1_minute.mp3";
	dictionary["2_minutes"] = tts ? "dvě minuty" : "2_minutes.mp3";
	dictionary["3_4_minutes"] = tts ? "minuty" : "3_4_minutes.mp3";
	dictionary["minutes"] = tts ? "minut" : "minutes.mp3";
}


//// COMMAND BUILDING / WORD ORDER
////////////////////////////////////////////////////////////////
function setMetricConst(metrics) {
	metricConst = metrics;
}

function setMode(mode) {
	tts = mode;
	populateDictionary(mode);
}

function route_new_calc(dist, timeVal) {
	return dictionary["route_is"] + " " + distance(dist, "accusative", false) + " " + dictionary["time"] + " " + time(timeVal) + (tts ? ". " : " ");
}

function distance(dist, declension, isWorkaround) {
	var accusative = declension === "accusative";
	switch (metricConst) {
		case "km-m":
			if (dist < 17 ) {
				return (tts ? Math.round(dist).toString() : ogg_dist(Math.round(dist))) + " " + dictionary["meters_" + declension];
			} else if (dist < 100) {
				return (isWorkaround ? dictionary["farther_workaround"] + " " : "") + (tts ? (Math.round(dist/10.0)*10).toString() : ogg_dist(Math.round(dist/10.0)*10)) + " " + dictionary["meters_" + declension];
			} else if (dist < 1000) {
				return (isWorkaround ? dictionary["farther_workaround"] + " " : "") + (tts ? (Math.round(2*dist/100.0)*50).toString() : ogg_dist(Math.round(2*dist/100.0)*50)) + " " + dictionary["meters_" + declension];
			} else if (dist < 1500) {
				return dictionary["around_1_kilometer_" + declension];
			} else if (dist < 2500) {
				return dictionary["around_2_kilometers_" + declension];
			} else if (dist < 4500) {
				return (isWorkaround ? dictionary["around_workaround"] + " " : dictionary["around"] + " ") + (tts ? Math.round(dist/1000.0).toString() : ogg_dist(Math.round(dist/1000.0))) + " " + dictionary["kilometers_" + declension + (accusative ? "3_4" : "")];
			} else if (dist < 10000) {
				return (isWorkaround ? dictionary["around_workaround"] + " " : dictionary["around"] + " ") + (tts ? Math.round(dist/1000.0).toString() : ogg_dist(Math.round(dist/1000.0))) + " " + dictionary["kilometers_" + declension + (accusative ? "5" : "")];
			} else {
				return (isWorkaround ? dictionary["farther_workaround"] + " " : "") + (tts ? Math.round(dist/1000.0).toString() : ogg_dist(Math.round(dist/1000.0))) + " " + dictionary["kilometers_" + declension + (accusative ? "5" : "")];
			}
			break;
		case "mi-f":
			if (dist < 160) {
				return (tts ? (Math.round(2*dist/100.0/0.3048)*50).toString() : ogg_dist(Math.round(2*dist/100.0/0.3048)*50)) + " " + dictionary["feet_" + declension];
			} else if (dist < 241) {
				return dictionary["1_tenth_of_a_mile_" + declension];
			} else if (dist < 1529) {
				return (tts ? Math.round(dist/161.0).toString() : ogg_dist(Math.round(dist/161.0))) + " " + dictionary["tenths_of_a_mile_" + declension];
			} else if (dist < 2414) {
				return dictionary["around_1_mile_" + declension];
			} else if (dist < 16093) {
				return dictionary["around"] + " " + (tts ? Math.round(dist/1609.3).toString() : ogg_dist(Math.round(dist/1609.3))) + " " + dictionary["miles_" + declension];
			} else {
				return (tts ? Math.round(dist/1609.3).toString() : ogg_dist(Math.round(dist/1609.3))) + " " + dictionary["miles_" + declension];
			}
			break;
		case "mi-m":
			if (dist < 17) {
				return (tts ? Math.round(dist).toString() : ogg_dist(Math.round(dist))) + " " + dictionary["meters_" + declension];
			} else if (dist < 100) {
				return (isWorkaround ? dictionary["farther_workaround"] + " " : "") + (tts ? (Math.round(dist/10.0)*10).toString() : ogg_dist(Math.round(dist/10.0)*10)) + " " + dictionary["meters_" + declension];
			} else if (dist < 1000) {
				return (isWorkaround ? dictionary["farther_workaround"] + " " : "") + (tts ? (Math.round(2*dist/100.0)*50).toString() : ogg_dist(Math.round(2*dist/100.0)*50)) + " " + dictionary["meters_" + declension];
			} else if (dist < 1300) {
				return (tts ? (Math.round(2*dist/100.0)*50).toString() : ogg_dist((2*dist/100.0)*50)) + " " + dictionary["meters_" + declension]; 
			} else if (dist < 2414) {
				return dictionary["around_1_mile_" + declension];
			} else if (dist < 16093) {
				return dictionary["around"] + " " + (tts ? Math.round(dist/1609.3).toString() : ogg_dist(Math.round(dist/1609.3))) + " " + dictionary["miles_" + declension];
			} else {
				return (tts ? Math.round(dist/1609.3).toString() : ogg_dist(Math.round(dist/1609.3))) + " " + dictionary["miles_" + declension];
			}
			break;
		case "mi-y":
			if (dist < 17) {
				return (tts ? Math.round(dist/0.9144).toString() : ogg_dist(Math.round(dist/0.9144))) + " " + dictionary["yards_" + declension];
			} else if (dist < 100) {
				return (tts ? (Math.round(dist/10.0/0.9144)*10).toString() : ogg_dist(Math.round(dist/10.0/0.9144)*10)) + " " + dictionary["yards_" + declension];
			} else if (dist < 1300) {
				return (tts ? (Math.round(2*dist/100.0/0.9144)*50).toString() : ogg_dist(Math.round(2*dist/100.0/0.9144)*50)) + " " + dictionary["yards_" + declension]; 
			} else if (dist < 2414) {
				return dictionary["around_1_mile_" + declension];
			} else if (dist < 16093) {
				return dictionary["around"] + " " + (tts ? Math.round(dist/1609.3).toString() : ogg_dist(Math.round(dist/1609.3))) + " " + dictionary["miles_" + declension];
			} else {
				return (tts ? Math.round(dist/1609.3).toString() : ogg_dist(Math.round(dist/1609.3))) + " " + dictionary["miles_" + declension];
			}
			break;
	}
}

function time(seconds) {
	var minutes = Math.round(seconds/60.0);
	var oggMinutes = Math.round(((seconds/300.0) * 5));
	if (seconds < 30) {
		return dictionary["less_a_minute"];
	} else if (seconds < 90) {
		return dictionary["1_minute"];
	} else if (seconds < 150) {
		return dictionary["2_minutes"];
	} else if (minutes % 60 == 0 && tts) {
		return hours(minutes);
	} else if (minutes % 60 == 1 && tts) {
		return hours(minutes) + " " + dictionary["1_minute"];
	} else if (minutes % 60 == 2 && tts) {
		return hours(minutes) + " " + dictionary["2_minutes"];
	} else if (minutes % 60 < 5 && tts) {
		return hours(minutes) + " " + (minutes % 60).toString() + " " + dictionary["3_4_minutes"];
	} else if (tts) {
		return hours(minutes) + " " + (minutes % 60).toString() + " " + dictionary["minutes"];
	} else if (!tts && seconds < 270) {
		return ogg_dist(minutes) + dictionary["3_4_minutes"];
	} else if (!tts && oggMinutes % 60 > 0) {
		return hours(oggMinutes) + " " + ogg_dist(oggMinutes % 60) + dictionary["minutes"];
	} else if (!tts) {
		return hours(oggMinutes);
	}
}

function hours(minutes) {
	if (minutes < 60) {
		return "";
	} else if (minutes < 120) {
		return dictionary["1_hour"];
	} else if (minutes < 180) {
		return dictionary["2_hours"];
	} else if (minutes < 300) {
		var hours = Math.floor(minutes/60)
		return  (tts ? hours.toString() : ogg_dist(hours)) + " " + dictionary["3_4_hours"];
	} else {
		var hours = Math.floor(minutes / 60);
		return  (tts ? hours.toString() : ogg_dist(hours)) + " " + dictionary["hours"];
	}
}


function route_recalc(dist, seconds) {
	return dictionary["route_calculate"] + (tts ? ". " : " ") + dictionary["distance"] + " " + distance(dist, "accusative", false) + " " + dictionary["time"] + " " + time(seconds) + (tts ? ". " : " ");
}

function go_ahead(dist, streetName) {
	if (dist == -1) {
		return dictionary["go_ahead"];
	} else {
		return dictionary["follow"] + " " + distance(dist, "accusative", true) + " " + follow_street(streetName);
	}
}

function follow_street(streetName) {
	if ((streetName["toDest"] === "" && streetName["toStreetName"] === "" && streetName["toRef"] === "") || Object.keys(streetName).length == 0 || !tts) {
		return "";
	} else if (streetName["toStreetName"] === "" && streetName["toRef"] === "") {
		return dictionary["to"] + " " + streetName["toDest"];
	} else if (streetName["toRef"] === streetName["fromRef"] && streetName["toStreetName"] === streetName["fromStreetName"] || 
			(streetName["toRef"] == streetName["fromRef"] && streetName["toStreetName"] == "")) {
		return dictionary["on"] + " " + assemble_street_name(streetName);
	} else if (!(streetName["toRef"] === streetName["fromRef"] && streetName["toStreetName"] === streetName["fromStreetName"])) {
		return dictionary["to"] + " " + assemble_street_name(streetName);
	}
}

function turn(turnType, dist, streetName) {
	if (dist == -1) {
		return getTurnType(turnType) + " " + turn_street(streetName);
	} else {
		return dictionary["after"] + " " + distance(dist, "locative", false) + " " + getTurnType(turnType) + " " + turn_street(streetName); 
	}
}

function take_exit(turnType, dist, exitString, exitInt, streetName) {
	if (dist == -1) {
		return getTurnType(turnType) + " " + dictionary["onto"] + " " + getExitNumber(exitString, exitInt) + " " + take_exit_name(streetName)
	} else {
		return dictionary["after"] + " " + distance(dist, "locative", false) + " "
			+ getTurnType(turnType) + " " + dictionary["onto"] + " " + getExitNumber(exitString, exitInt) + " " + take_exit_name(streetName)
	}
}

function take_exit_name(streetName) {
	if (Object.keys(streetName).length == 0 || (streetName["toDest"] === "" && streetName["toStreetName"] === "") || !tts) {
		return "";
	} else if (streetName["toDest"] != "") {
		return (tts ? ", " : " ") + streetName["toStreetName"] + " " + dictionary["toward"] + " " + streetName["toDest"];
	} else if (streetName["toStreetName"] != "") {
		return (tts ? ", " : " ") + streetName["toStreetName"]
	} else {
		return "";
	}
}

function getExitNumber(exitString, exitInt) {
	if (!tts && exitInt > 0 && exitInt < 18) {
		return nth(exitInt) + " " + dictionary["exit"];
	} else if (tts) {
		return  dictionary["exit"] + " " + exitString;
	} else {
		return dictionary["exit"];
	}
}

function  getTurnType(turnType) {
	switch (turnType) {
		case "left":
			return dictionary["left"];
			break;
		case "left_sh":
			return dictionary["left_sh"];
			break;
		case "left_sl":
			return dictionary["left_sl"];
			break;
		case "right":
			return dictionary["right"];
			break;
		case "right_sh":
			return dictionary["right_sh"];
			break;
		case "right_sl":
			return dictionary["right_sl"];
			break;
		case "left_keep":
			return dictionary["left_keep"];
			break;
		case "right_keep":
			return dictionary["right_keep"];
			break;
	}
}

function then() {
	return " " + dictionary["and"] + " " + dictionary["then"] + " ";
}

function roundabout(dist, angle, exit, streetName) {
	if (dist == -1) {
		return dictionary["take2"] + " " + nth(exit, "_inst") + " " + dictionary["exit2"] + " " + turn_street(streetName);
	} else {
		return dictionary["in"] + " " + distance(dist, "locative", false) + " " + dictionary["roundabout"] + " " + dictionary["take"] + " " + nth(exit, "") + " " + dictionary["exit"] + " " + turn_street(streetName);
	}

}

function turn_street(streetName) {
	if (Object.keys(streetName).length == 0 || (streetName["toDest"] === "" && streetName["toStreetName"] === "" && streetName["toRef"] === "") || !tts) {
		return "";
	} else if (streetName["toStreetName"] === "" && streetName["toRef"] === "") {
		return dictionary["toward"] + " " + streetName["toDest"];
	} else if (streetName["toRef"] === streetName["fromRef"] && streetName["toStreetName"] === streetName["fromStreetName"]) {
		return dictionary["on"] + " " + assemble_street_name(streetName);
	} else if ((streetName["toRef"] === streetName["fromRef"] && streetName["toStreetName"] === streetName["fromStreetName"]) 
		|| (streetName["toStreetName"] === "" && streetName["toRef"] === streetName["fromRef"])) {
		return dictionary["on"] + " " + assemble_street_name(streetName);
	} else if (!(streetName["toRef"] === streetName["fromRef"] && streetName["toStreetName"] === streetName["fromStreetName"])) {
		return dictionary["onto"] + " " + assemble_street_name(streetName);
	}
	return "";
}

function assemble_street_name(streetName) {
	if (streetName["toDest"] === "") {
		return streetName["toRef"] + " " + streetName["toStreetName"];
	} else if (streetName["toRef"] === "") {
		return streetName["toStreetName"] + " " + dictionary["toward"] + " " + streetName["toDest"];
	} else if (streetName["toRef"] != "") {
		return streetName["toRef"] + " " + dictionary["toward"] + " " + streetName["toDest"];
	}
}

function nth(exit, declension) {
	switch (exit) {
		case (1):
			return dictionary["1st" + declension];
		case (2):
			return dictionary["2nd" + declension];
		case (3):
			return dictionary["3rd" + declension];
		case (4):
			return dictionary["4th" + declension];
		case (5):
			return dictionary["5th" + declension];
		case (6):
			return dictionary["6th" + declension];
		case (7):
			return dictionary["7th" + declension];
		case (8):
			return dictionary["8th" + declension];
		case (9):
			return dictionary["9th" + declension];
		case (10):
			return dictionary["10th" + declension];
		case (11):
			return dictionary["11th" + declension];
		case (12):
			return dictionary["12th" + declension];
		case (13):
			return dictionary["13th" + declension];
		case (14):
			return dictionary["14th" + declension];
		case (15):
			return dictionary["15th" + declension];
		case (16):
			return dictionary["16th" + declension];
		case (17):
			return dictionary["17th" + declension];
	}
}

function make_ut(dist, streetName) {
	if (dist == -1) {
		return dictionary["make_uturn2"] + " " + turn_street(streetName);
	} else {
		return dictionary["in"] + " " + distance(dist, "locative", false) + " " + dictionary["make_uturn"] + " " + turn_street(streetName);
	}
}

function bear_left(streetName) {
	return dictionary["left_bear"];
}

function bear_right(streetName) {
	return dictionary["right_bear"];
}

function prepare_make_ut(dist, streetName) {
	return dictionary["after"] + " " + distance(dist, "locative", false) + " " + dictionary["make_uturn"] + " " + turn_street(streetName);
}

function prepare_turn(turnType, dist, streetName) {
	return dictionary["after"] + " " + distance(dist, "locative", false) + " " + getTurnType(turnType) + " " + turn_street(streetName);
}

function prepare_roundabout(dist, exit, streetName) {
	return dictionary["after"] + " " + distance(dist, "locative", false) + " " + dictionary["prepare_roundabout"]; 
}

function and_arrive_destination(dest) {
	return dictionary["and_arrive_destination"] + " " + dest;
}

function and_arrive_intermediate(dest) {
	return dictionary["and_arrive_intermediate"] + " " + dest;
}

function and_arrive_waypoint(dest) {
	return dictionary["and_arrive_waypoint"] + " " + dest;
}

function and_arrive_favorite(dest) {
	return dictionary["and_arrive_favorite"] + " " + dest;
}

function and_arrive_poi(dest) {
	return dictionary["and_arrive_poi"] + " " + dest;
}

function reached_destination(dest) {
	return dictionary["reached_destination"] + " " + dest;
}

function reached_waypoint(dest) {
	return dictionary["reached_waypoint"] + " " + dest;
}

function reached_intermediate(dest) {
	return dictionary["reached_intermediate"] + " " + dest;
}

function reached_favorite(dest) {
	return dictionary["reached_favorite"] + " " + dest;
}

function reached_poi(dest) {
	return dictionary["reached_poi"] + " " + dest;
}

function location_lost() {
	return dictionary["location_lost"];
}

function location_recovered() {
	return dictionary["location_recovered"];
}

function off_route(dist) {
	return dictionary["off_route"] + " " + distance(dist, "accusative", false) + " " + dictionary["off_route2"];
}

function back_on_route() {
	return dictionary["back_on_route"];
}

function make_ut_wp() {
	return dictionary["make_uturn_wp"];
}

// TRAFFIC WARNINGS
function speed_alarm(maxSpeed, speed) {
	return dictionary["exceed_limit"] + " " + maxSpeed.toString();
}

function attention(type) {
	return dictionary["attention"] + (tts ? ", " : " ") + getAttentionString(type);
}

function getAttentionString(type) {
	switch (type) {
		case "SPEED_CAMERA":
			return dictionary["speed_camera"];
			break;
		case "SPEED_LIMIT":
			return "";
			break
		case "BORDER_CONTROL":
			return dictionary["border_control"];
			break;
		case "RAILWAY":
			return dictionary["railroad_crossing"];
			break;
		case "TRAFFIC_CALMING":
			return dictionary["traffic_calming"];
			break;
		case "TOLL_BOOTH":
			return dictionary["toll_booth"];
			break;
		case "STOP":
			return dictionary["stop"];
			break;
		case "PEDESTRIAN":
			return dictionary["pedestrian_crosswalk"];
			break;
		case "MAXIMUM":
			return "";
			break;
		case "TUNNEL":
			return dictionary["tunnel"];
			break;
		default:
			return "";
			break;
	}
}

function ogg_dist(distance) {
	if (distance == 0) {
		return "";
	} else if (distance < 20) {
		return Math.floor(distance).toString() + ".mp3 ";
	} else if (distance < 1000 && (distance % 50) == 0) {
		return distance.toString() + ".mp3 ";
	} else if (distance < 30) {
		return "20.mp3 " + ogg_dist(distance - 20);
	} else if (distance < 40) {
		return "30.mp3 " + ogg_dist(distance - 30);
	} else if (distance < 50) {
		return "40.mp3 " + ogg_dist(distance - 40);
	} else if (distance < 60) {
		return "50.mp3 " + ogg_dist(distance - 50);
	} else if (distance < 70) {
		return "60.mp3 " + ogg_dist(distance - 60);
	} else if (distance < 80) {
		return "70.mp3 "+ ogg_dist(distance - 70);
	} else if (distance < 90) {
		return "80.mp3 " + ogg_dist(distance - 80);
	} else if (distance < 100) {
		return "90.mp3 " + ogg_dist(distance - 90);
	} else if (distance < 200) {
		return "100.mp3 " + ogg_dist(distance - 100);
	} else if (distance < 300) {
		return "200.mp3 " + ogg_dist(distance - 200);
	} else if (distance < 400) {
		return "300.mp3 "+ ogg_dist(distance - 300);
	} else if (distance < 500) {
		return "400.mp3 " + ogg_dist(distance - 400);
	} else if (distance < 600) {
		return "500.mp3 " + ogg_dist(distance - 500);
	} else if (distance < 700) {
		return "600.mp3 " + ogg_dist(distance - 600);
	} else if (distance < 800) {
		return "700.mp3 " + ogg_dist(distance - 700);
	} else if (distance < 900) {
		return "800.mp3 " + ogg_dist(distance - 800);
	} else if (distance < 1000) {
		return "900.mp3 " + ogg_dist(distance - 900);
	} else {
		return ogg_dist(distance/1000) + "1000.mp3 " + ogg_dist(distance % 1000);
	}
}
