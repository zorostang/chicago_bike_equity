/* jshint unused: false */
/* global console, map, divvyStations, L, turf, $ */

	var lines = [];
	var nearestLayer, nearest, point, initialMarker, iteration = 0, bikeLanesData, nearbyBikeLanesLayer, hypertensionData;

function findNearbyDivvy(e) {
	'use strict';

	console.log(e.latlng);
	console.log(e);

	if(map.hasLayer(nearestLayer) ) {
		map.removeLayer(nearestLayer);
	}

	point = {
		  'type': 'Feature',
		  'properties': {
		    'marker-color': '#0f0'
		  },
		  'geometry': {
		    'type': 'Point',
		    'coordinates': [e.latlng.lng, e.latlng.lat]
		  }
		};
	console.log('Point: ');
	console.log(point);

	var divvyStationsFC = divvyStations.toGeoJSON();

	var redMarker = L.AwesomeMarkers.icon({
		icon: 'star',
		markerColor: 'red'
	});

	if (initialMarker) {
		initialMarker.setLatLng([e.latlng.lat, e.latlng.lng]);
		initialMarker.update();
	} else {
		initialMarker = L.marker([e.latlng.lat, e.latlng.lng], {icon: redMarker});
		initialMarker.addTo(map);
	}

	nearestLayer = L.geoJson(null);

	for (var x = 0; x < 5; x++) {
		var nextNearest = turf.nearest( point, divvyStationsFC );
		var id = nextNearest.properties.ID;
		divvyStationsFC = turf.remove(divvyStationsFC, 'ID', id);
		nearestLayer.addData(nextNearest);

		if (lines[x]) {
			lines[x].setLatLngs([[nextNearest.geometry.coordinates[1], nextNearest.geometry.coordinates[0]], [e.latlng.lat, e.latlng.lng]]);
			setDistanceLabel(lines[x]);
		} else {
			lines[x] = L.polyline([[nextNearest.geometry.coordinates[1], nextNearest.geometry.coordinates[0]], [e.latlng.lat, e.latlng.lng]]);
			setDistanceLabel(lines[x]).addTo(map);
		}
	}
	nearestLayer.addTo(map);
	map.fitBounds(nearestLayer);
}

function findNearbyDivvyWithoutRed(e) {
	'use strict';

	console.log(e.latlng);
	console.log(e);

	if(map.hasLayer(nearestLayer) ) {
		map.removeLayer(nearestLayer);
	}

	point = {
		  'type': 'Feature',
		  'properties': {
		    'marker-color': '#0f0'
		  },
		  'geometry': {
		    'type': 'Point',
		    'coordinates': [e.latlng.lng, e.latlng.lat]
		  }
		};
	console.log('Point: ');
	console.log(point);

	var divvyStationsFC = divvyStations.toGeoJSON();


	if (initialMarker) {
		initialMarker.setLatLng([e.latlng.lat, e.latlng.lng]);
		initialMarker.update();
	} else {
		initialMarker = L.marker([e.latlng.lat, e.latlng.lng]);
		initialMarker.addTo(map);
	}

	nearestLayer = L.geoJson(null, {
		onEachFeature: onEachDivvyStation
	});
	
	

	for (var x = 0; x < 5; x++) {
		var nextNearest = turf.nearest( point, divvyStationsFC );
		var id = nextNearest.properties.ID;
		divvyStationsFC = turf.remove(divvyStationsFC, 'ID', id);
		nearestLayer.addData(nextNearest);

		if (lines[x]) {
			lines[x].setLatLngs([[nextNearest.geometry.coordinates[1], nextNearest.geometry.coordinates[0]], [e.latlng.lat, e.latlng.lng]]);
			setDistanceLabel(lines[x]);
		} else {
			lines[x] = L.polyline([[nextNearest.geometry.coordinates[1], nextNearest.geometry.coordinates[0]], [e.latlng.lat, e.latlng.lng]]);
			setDistanceLabel(lines[x]).addTo(map);
		}
	}
	nearestLayer.addTo(map);
	//map.fitBounds(nearestLayer);
}

function onEachDivvyStation(feature, layer) {
	console.log(feature);
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties["Station Name"]) {
        layer.bindPopup(feature.properties["Station Name"]);
    }
}

function setDistanceLabel(line) {
	'use strict';
	var dist = turf.lineDistance(line.toGeoJSON(), 'miles');
	return line.bindLabel(Math.round(dist * 100) / 100 + ' mi');
}

/*
function showCoordinates (e) {
	'use strict';
	$('#features').append('<div class="panel-heading coordinate"> Cooordinates: '  + e.latlng + '</div>');
}
*/

var marker_array = [];

//showAddress: uses reverse geocoding to shows address of coordinates clicked
//				utilizes "Esri Leaflet" plug-in
//				TODO: get rid of pop-up?



function showAddress (e) {
	iteration++; // keep track of the number of times the user has requested an Access Index this session
	var geocodeService = new L.esri.Geocoding.Services.Geocoding();

  	//Todo: figure out what happens when error is thrown by esri.
    geocodeService.reverse().latlng(e.latlng).run(function(error, result) {

      //enclose here, if result is undefined,
      //else 
      //If error shown,
      //Print error: try again
      /*
      console.log("error: " + error + "," + "result: " + result);

      if (e === error) {
      	alert("No address for this location :( Try again!");
      	console.log("here");
		};
		*/
		//var address_error = result.address.Match_addr;

		if (result === undefined) {
			console.log("error in match address");
			$('#features').append('<div class="panel-heading error" style="background-color: red;"> No Address Found :( Try Again! </div>');
			//add div here
		} else {
			$(".right_click_instructions").hide();
			$('.error').remove(); 
			$('#features').append('<div class="panel-heading coordinate iteration_' + iteration + '"><h4>'  + result.address.Match_addr + '</h4><div class="iteration_' + iteration + '_bike_lanes"></div><div class="iteration_' + iteration + '_hypertension"></div><div class="iteration_' + iteration + '_bike_racks"></div></div>');
			var marker = L.marker(result.latlng);
			marker.addTo(map);
			marker.bindPopup(result.address.Match_addr);
			marker.openPopup();
			
			marker_array.push(marker);
			console.log(marker_array.length);
			console.log(marker_array);
			
		}
      //place marker & popup with address on coordinates selected
      //L.marker([50.505, 30.57], {icon: myIcon}).addTo(map);
      //add a class here.
      //bindPopup(add a class here)


      //add to marker arrays

      //chaining, can do one at a time
      //var marker = L.marker(result.latlng);
      // marker.  

      //
      //L.marker(result.latlng).addTo(map).bindPopup(result.address.Match_addr).openPopup();

      //can I group all of these pop-ups together and then erase them at the same time?
    });


	// Other Access Index functions
	findNearbyDivvyWithoutRed(e);
	findNearestBikeLanes(e);
	findHypertension(e);
	countRacksWithinOneMileSquareOfLocation(e);
}

function findNearestBikeLanes(e) {
	console.log("Going to find nearest bike lanes");
	bikelane_query_url = "https://stevevance.cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT *, st_distance(st_transform(st_setsrid(st_makepoint(" + e.latlng.lng + ", " + e.latlng.lat + "), 4326), 3435), st_transform(the_geom, 3435)) as distance FROM bike_routes_12_19_14_excl_recommended b where st_dwithin(st_transform(st_setsrid(st_makepoint(" + e.latlng.lng + ", " + e.latlng.lat + "), 4326), 3435), st_transform(the_geom, 3435), 2640)";

	$.getJSON(bikelane_query_url, function (data) {
	    	console.log("Cartodb: Working to retrieve bikelane_query_url");
		})
		.done(function(data) {
			console.log("Cartodb: Retrieved bikelane_query_url: " + bikelane_query_url);
			//console.log(data);
			bikeLanesData = data;
			
			// count the bike lanes
			var bikeLanesCount = {};
			bikeLanesCount.total = data.features.length;
			bikeLanesCount.protected = 0;
			bikeLanesCount.buffered = 0;
			
			// print the number of bike lanes nearby
			if(bikeLanesCount.total > 0) {
				var content = "<p>There are " + bikeLanesCount.total + " bike lanes within 1/2 mile</p><ul class='iteration_" + iteration + " bike_lanes_list'></ul>";
				if(map.hasLayer(nearbyBikeLanesLayer)) {
					nearbyBikeLanesLayer.clearLayers();
				}
				nearbyBikeLanesLayer = L.geoJson(bikeLanesData, {
					style: function (feature) {
				        return {color: "#ff0084", weight: 9};
				    },
				    onEachFeature: function (feature, layer) {
				        layer.bindLabel(feature.properties.street);
				    }
				}).addTo(map);
			} else {
				var content = "<p>There are no bike lanes within 1/2 mile</p>";
			}
			$(".iteration_" + iteration + "_bike_lanes").append(content);
			
			// see if any of them are protected or buffered bike lanes
			$.each(data.features, function(i, v) {
				if(v.properties.type == "8") {
					bikeLanesCount.protected++;
				}
				if(v.properties.type == "9") {
					bikeLanesCount.buffered++;
				}
			});
			
			// if there are protected/buffered, print the counts
			if(bikeLanesCount.protected > 0) {
				$("ul.iteration_" + iteration + ".bike_lanes_list").append("<li>" + bikeLanesCount.protected + " are protected bike lanes</li>");
			}
			if(bikeLanesCount.buffered > 0) {
				$("ul.iteration_" + iteration + ".bike_lanes_list").append("<li>" + bikeLanesCount.buffered + " are buffered bike lanes</li>");
			}
			
		})
		.fail(function() {
			console.log("Cartodb: There was an error retrieving bikelane_query_url");
		});
}

function findHypertension(e) {
	var hypertension_url = "https://stevevance.cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM chronic_disease_hypertension b where st_intersects(st_transform(st_setsrid(st_makepoint(" + e.latlng.lng + ", " + e.latlng.lat + "), 4326), 3435), st_transform(the_geom, 3435))";
	
	$.getJSON(hypertension_url, function (data) {
	    	console.log("Cartodb: Working to retrieve hypertension_url: " + hypertension_url);
		})
		.done(function(data) {
			hypertensionData = data;

			// Create a narrative for the data			
			var value = data.features[0].properties.condition_value;
			value = JSON.parse(value);
			value = value["2006"];
			var zip_code = data.features[0].properties.name;
			
			console.log(value);
			var extra = (value < 20 ? "(this is comparatively low)" : "(this is comparatively high)");
			var content = "<p>The estimated hypertension prevalence in ZIP code " + zip_code + " for 2006-2012 is <b>" + value + " percent</b> " + extra + "</p>";
			$('.iteration_' + iteration + '_bike_lanes').append(content);
			
			// Turn on the hypertension layer
			
		})
		.fail(function() {
			console.log("Cartodb: There was an error retrieving hypertension_url");
		});
}

//Q: Should I move this to the app.js file?
//Clear Access Index comparison when clear-access-index button is clicked
$("#clear-access-index").click(function() {
  $('.coordinate').remove(); 

  for (var i = marker_array.length - 1; i >= 0; i--) {
  	map.removeLayer(marker_array[i]); 
  };
  //add in remove popups

  //Q: do I need a return
  //return false;
});

function countRacksWithinOneMileSquareOfLocation(location){

	var count = 0;

	console.log("COUNT RACKS FUNCTION!!!")
	var user_coordinate = {
		  'type': 'Feature',
		  'properties': {
		    'marker-color': '#0f0'
		  },
		  'geometry': {
		    'type': 'Point',
		    'coordinates': [location.latlng.lng, location.latlng.lat]
		  }
		};

	var user_location_buffer = turf.buffer(user_coordinate, 0.5, 'miles').features[0]

	$.getJSON("data/racks.geojson", function (data) {
		$.each(data, function(key, val) {
			if (key === 'features') {
				$.each(val, function(idx, point){
					if (turf.inside(point, user_location_buffer)){
						count += 1;
					}
				});
			}
		});
		var content = "<p>There are " + count + " bike racks within 1/2 mile.";
		$(".iteration_" + iteration + "_bike_racks").append(content);
	});
}
