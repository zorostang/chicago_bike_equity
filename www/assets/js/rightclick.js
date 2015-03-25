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

function showCoordinates (e) {
	'use strict';
	//remove the previous coordinate information, if it exists
	$('.coordinate').remove(); //comment this out in the future to do comparison
	$('#features').append('<div class="panel-heading coordinate"> Cooordinates: '  + e.latlng + '</div>');
}

//show address reverse geocoding
function showAddress (e) {
  var geocodeService = new L.esri.Geocoding.Services.Geocoding();

    geocodeService.reverse().latlng(e.latlng).run(function(error, result) {
      L.marker(result.latlng).addTo(map).bindPopup(result.address.Match_addr).openPopup();
    });

}


