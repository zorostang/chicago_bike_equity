/* jshint unused: false */
/* global console, map, divvyStations, L, turf, $ */

var lines = [];
var nearestLayer, nearest, point, initialMarker, iteration = 0, bikeLanesData, nearbyBikeLanesLayer, hypertensionData;
var clickedAddresses = [];
var marker_array = [];

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

		if (lines[x]) { //if we already put down a line update it
			lines[x].setLatLngs([[nextNearest.geometry.coordinates[1], nextNearest.geometry.coordinates[0]], [e.latlng.lat, e.latlng.lng]]);
			setDistanceLabel(lines[x]);
		} else { //otherwise create it 
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
		//add initialMarker to marker array
		marker_array.push(initialMarker);
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
			setDistanceLabel(lines[x]).addTo(map); //distance label gets updated
		} else {
			lines[x] = L.polyline([[nextNearest.geometry.coordinates[1], nextNearest.geometry.coordinates[0]], [e.latlng.lat, e.latlng.lng]]);
			setDistanceLabel(lines[x]).addTo(map); //distance label gets added
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



//showAddress: uses reverse geocoding to shows address of coordinates clicked
//				utilizes "Esri Leaflet" plug-in
//				TODO: get rid of pop-up?



function showAddress (e) {
	iteration++; // keep track of the number of times the user has requested an Access Index this session
	clickedAddresses[iteration] = e;
	var address,
  	cords = e.latlng;
	latitude = e.latlng.lat,
	longitude = e.latlng.lng,
	requestUrl = "https://pelias.mapzen.com/reverse?lat="+latitude+"&lon="+longitude+"&size=10&layers=osmway,openaddresses";

	$.ajax({
		type: "GET",
		url: requestUrl,
		success: function(data) {
			//return the formatted location 
			var displayPoint, displayAddress, extendedDisplayPoint;
			for (var i = 0; i < data.features.length; i++) {
				var featureprops = data.features[i].properties;
				//get the first osmway layer 
				if (featureprops.layer === "osmway") {
					//osmway refers to the point of interest such as a park or school name
					//sometimes it also has the exact location (number, street name) as well 
					var featureAddress = featureprops.address;
					if (jQuery.isEmptyObject(featureAddress)) {
						//when the exact location isn't provided, set the name of the point of interest, if available
						displayPoint = featureprops.name;
						//extendedDisplayPoint = displayPoint + ", " + featureprops.local_admin + ", " + featureprops.admin1_abbr + " ("+featureprops.neighborhood+")";
						extendedDisplayPoint = displayPoint + ", " + featureprops.local_admin + ", " + featureprops.admin1_abbr;
					}
					else {
						//when the exact location is provided, all details are available, set the address as point of interest name, and location details
						//displayAddress = featureAddress.number + " " + featureAddress.street + ", " + featureprops.local_admin + ", " + featureprops.admin1_abbr + " ("+featureprops.neighborhood+")";
						displayAddress = featureAddress.number + " " + featureAddress.street + ", " + featureprops.local_admin + ", " + featureprops.admin1_abbr;
						displayPoint = featureprops.name;
						address = displayPoint + ", " + displayAddress;
					}
				break;
				}
			};
			for (var i = 0; i < data.features.length; i++) {
				var featureprops = data.features[i].properties;
				//get the first openaddress layer
				//this loop is only useful when the osmway could not provide the full address but just the point of interest name
				if (featureprops.layer === "openaddresses" && address === undefined) {
					displayAddress = featureprops.text;
					if (displayPoint === undefined) {
						//with no point of interest name, simply display the location addrress
						//address = displayAddress + " ("+featureprops.neighborhood+")";;
						address = displayAddress;
					}
					else {
						//address = displayPoint + ", " + displayAddress + " ("+featureprops.neighborhood+")";;
						address = displayPoint + ", " + displayAddress;
					}
				break;
				}
			};

			if(address ===undefined) {
				//this would happen if the responses from the geocoder only provided osmway layers and no openaddress layers
				//in this case, use the extended point of interest display
				address = extendedDisplayPoint;
			};
			
			$("#clear-access-index").removeClass("hidden"); // show the Start Over button
			$(".right_click_instructions").hide();
			$('.error').remove();

			
            var numberMarker = L.AwesomeMarkers.icon({
				icon: '',
				markerColor: 'darkblue',
				prefix: 'fa',
				html: (iteration)
				});
            var marker = L.marker(cords, {icon: numberMarker});
			marker.addTo(map);
			marker.bindPopup(address);
			marker.openPopup();
			
			marker_array.push(marker);
			console.log(marker_array.length);
			console.log(marker_array);

			$('.iteration_' + iteration + '_address').html(iteration + ". " + address);
			$('#address' + iteration).css('cursor','pointer');
			$('#address' + iteration).css('color','blue');
			$('#address' + iteration).css('text-decoration','underline;');
			$('#address' + iteration).click(refocusCallbackGenerator(iteration, address, marker));
		},
		error: function() {
		console.log("Error in match address");
	    $('#features').append('<div class="panel-heading error" style="background-color: red;"> No Address Found :( Try Again! </div>');
		}
	});
	// Create an empty shell for the Access Index results to go into
	$('#features .sidebar-table').prepend('<div class="panel-heading coordinate iteration_' + iteration + '"><h4 class="iteration_' + iteration + '_address" id="address'+iteration+'"> </h4><div class="iteration_' + iteration + '_bike_lanes"></div><div class="iteration_' + iteration + '_hypertension"></div><div class="iteration_' + iteration + '_bike_racks"></div></div>');
	
	
	// Other Access Index functions
	findNearbyDivvyWithoutRed(e);
	findNearestBikeLanes(e, true);
	findHypertension(e);
	countRacksWithinOneMileSquareOfLocation(e);
}

function refocusCallbackGenerator(iteration, address, marker){
	return function(){
		refocus(iteration, marker);
	};
}

function refocus(iteration, marker){
	var e = clickedAddresses[iteration];
	findNearbyDivvyWithoutRed(e);
	findNearestBikeLanes(e, false);
	marker.openPopup();
}

function findNearestBikeLanes(e, shouldAppendDescriptionToSidebar) {
	console.log("Going to find nearest bike lanes");
	bikelane_query_url = "https://stevevance.cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT *, st_distance(st_transform(st_setsrid(st_makepoint(" + e.latlng.lng + ", " + e.latlng.lat + "), 4326), 3435), st_transform(the_geom, 3435)) as distance FROM bike_routes_12_19_14_excl_recommended b where st_dwithin(st_transform(st_setsrid(st_makepoint(" + e.latlng.lng + ", " + e.latlng.lat + "), 4326), 3435), st_transform(the_geom, 3435), 2640)";

	if(map.hasLayer(nearbyBikeLanesLayer)) {
		nearbyBikeLanesLayer.clearLayers();
	}

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
				var content = "<p>Bike lanes: " + bikeLanesCount.total + " within 1/2 mile</p><ul class='iteration_" + iteration + " bike_lanes_list'></ul>";

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

			if (shouldAppendDescriptionToSidebar){
				appendIteration("_bike_lanes", content);
			
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
			var content = "<p>Estimated <b><abbr title='high blood pressure'>hypertension</abbr></b> prevalence in ZIP code " + zip_code + " for 2006-2012 is <b>" + value + " percent</b></p>";
			appendIteration("_hypertension", content);
		})
		.fail(function() {
			console.log("Cartodb: There was an error retrieving hypertension_url");
		});
}

//Q: Should I move this to the app.js file?
//Clear Access Index comparison when clear-access-index button is clicked
$("#clear-access-index").click(function() {
	//remove everything appended to the sidebar div
  $('.coordinate').remove(); 


  for (var i = 0; i < marker_array.length; i++) {
  	map.removeLayer(marker_array[i]); 
  };

  //removes layer 5 of markers for nearest divvy stations
  if(map.hasLayer(nearestLayer) ) {
	map.removeLayer(nearestLayer);
   }

   //remove blue distance lines connected to markers
   var k = 0; 
   for(k=0; k < 5; k++){
   		map.removeLayer(lines[k]);
   		console.log("lines" + k);
   }

   	//remove pink/red bike lanes
	if(map.hasLayer(nearbyBikeLanesLayer)) {
		nearbyBikeLanesLayer.clearLayers();
	}
  marker_array = []; 

  //reset the iteration back to zero
  iteration = 0;
  //add in remove popups

  //Q: do I need a return
  //return false;
});

function countRacksWithinOneMileSquareOfLocation(location){

	var count = 0;

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
		var content = "<p>Bike parking: " + count + " racks within 1/2 mile";
		appendIteration("_bike_racks", content)
	});
}

function appendIteration(name, content){
	$(".iteration_" + iteration + name).append(content);
}
