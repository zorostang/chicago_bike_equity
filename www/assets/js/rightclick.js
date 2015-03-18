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
		
	nearest = turf.nearest( point, divvyStations.toGeoJSON() );
	console.log(nearest);
	nearestLayer = L.geoJson(nearest).addTo(map);
	
	/*
var geojsonMarkerOptions = {
	    radius: 8,
	    fillColor: "#ff7800",
	    color: "#000",
	    weight: 1,
	    opacity: 1,
	    fillOpacity: 0.8
	};
	
	L.geoJson(nearest, {
	    pointToLayer: function (feature, latlng) {
	        return L.circleMarker(latlng, geojsonMarkerOptions);
	    }
	}).addTo(map);
*/
}

function showCoordinates (e) {
	//remove the previous coordinate information, if it exists
	$(".coordinate").remove();
	$("#features").append("<div class='panel-heading coordinate'> Cooordinates: "  + e.latlng + "</div>");
}
