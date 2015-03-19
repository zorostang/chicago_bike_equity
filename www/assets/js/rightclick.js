var nearestLayer, nearest, point;

function findNearbyDivvy(e) {
	console.log(e.latlng);
	console.log(e);

	if(map.hasLayer(nearestLayer) ) {
		map.removeLayer(nearestLayer);
	}

	point = {
		  "type": "Feature",
		  "properties": {
		    "marker-color": "#0f0"
		  },
		  "geometry": {
		    "type": "Point",
		    "coordinates": [e.latlng.lng, e.latlng.lat]
		  }
		};
	console.log("Point: ");
	console.log(point);

	nearestLayer = L.geoJson(null);
	var divvyStationsFC = divvyStations.toGeoJSON();

	for (var x = 0; x < 5; x++) {
		var nextNearest = turf.nearest( point, divvyStationsFC );
		var id = nextNearest.properties.ID;
		divvyStationsFC = turf.remove(divvyStationsFC, 'ID', id);
		nearestLayer.addData(nextNearest);
	}

	nearestLayer.addTo(map);
}

function showCoordinates (e) {
	//remove the previous coordinate information, if it exists
	$(".coordinate").remove();
	$("#features").append("<div class='panel-heading coordinate'> Cooordinates: "  + e.latlng + "</div>");
}
