/* jshint unused: false */
/* global console, map, divvyStations, L, turf, $ */

	var lines = [];
	var nearestLayer, nearest, point, initialMarker;

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
  var geocodeService = new L.esri.Geocoding.Services.Geocoding();

  	//Todo: figure out what happens when error is thrown by esri.
    geocodeService.reverse().latlng(e.latlng).run(function(error, result) {

      //enclose here, if result is undefined,
      //else 
      //If error shown,
      //Print error: try again
      console.log("error: " + error + "," + "result: " + result);

      $('#features').append('<div class="panel-heading coordinate"> Address: '  + result.address.Match_addr + '</div>');
      //place marker & popup with address on coordinates selected
      //L.marker([50.505, 30.57], {icon: myIcon}).addTo(map);
      //add a class here.
      //bindPopup(add a class here)

      var marker = L.marker(result.latlng);
      marker.addTo(map);
      marker.bindPopup(result.address.Match_addr);
      marker.openPopup();

      marker_array.push(marker);
      console.log(marker_array.length);
      console.log(marker_array);

      //add to marker arrays

      //chaining, can do one at a time
      //var marker = L.marker(result.latlng);
      // marker.  

      //
      //L.marker(result.latlng).addTo(map).bindPopup(result.address.Match_addr).openPopup();

      //can I group all of these pop-ups together and then erase them at the same time?
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



