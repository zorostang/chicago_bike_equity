
//global variables for mapping
var groceriesGeojson;
var groceries;
var groceriesLayer;

//global variables for groceries near divvy stations function
var groceriesNearDivvy;
var fcSuperBuffer;
var divvySuperBufferArray;

//from conflict
var divvyStations;
var divvyBuffers;
var map;

//Beginning of app

$( document ).ready(function(){ //document ready jquery wrapper

var featureList, divvyStationsSearch = [], wardsSearch = [], commAreaSearch = [], groceriesSearch = [];

$(document).on("click", ".feature-row", function(e) {
  $(document).off("mouseout", ".feature-row", clearHighlight);
  sidebarClick(parseInt($(this).attr("id"), 10));
});

$(document).on("mouseover", ".feature-row", function(e) {
  highlight.clearLayers().addLayer(L.circleMarker([$(this).attr("lat"), $(this).attr("lng")], highlightStyle));
});

$(document).on("mouseout", ".feature-row", clearHighlight);

$("#about-btn").click(function() {
  $("#aboutModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#full-extent-btn").click(function() {
  map.fitBounds(wards.getBounds());
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#legend-btn").click(function() {
  $("#legendModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#login-btn").click(function() {
  $("#loginModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#list-btn").click(function() {
  $('#sidebar').toggle();
  map.invalidateSize();
  return false;
});

$("#nav-btn").click(function() {
  $(".navbar-collapse").collapse("toggle");
  return false;
});

$("#sidebar-toggle-btn").click(function() {
  $("#sidebar").toggle();
  map.invalidateSize();
  return false;
});

$("#sidebar-hide-btn").click(function() {
  $('#sidebar').hide();
  map.invalidateSize();
});

function clearHighlight() {
  highlight.clearLayers();
}

function sidebarClick(id) {
  var layer = markerClusters.getLayer(id);
  map.setView([layer.getLatLng().lat, layer.getLatLng().lng], 17);
  layer.fire("click");
  /* Hide sidebar and go to the map on small screens */
  if (document.body.clientWidth <= 767) {
    $("#sidebar").hide();
    map.invalidateSize();
  }
}

function syncSidebar() {

 //  Empty sidebar features
/*
  $("#feature-list tbody").empty();

  // Loop through grocery stores layer and add only features which are in the map bounds

  groceries.eachLayer(function (layer) {
    if (map.hasLayer(groceriesLayer)) {
      if (map.getBounds().contains(layer.getLatLng())) {
        $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/grocery.png"></td><td class="feature-name">' + layer.feature.properties['STORE NAME'] + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
      }
    }
 });
  // Update list.js featureList
  featureList = new List("features", {
    valueNames: ["feature-name"]
  });
  featureList.sort("feature-name", {
    order: "asc"
  });

*/
}

/* Basemap Layers */
// examples.map-i86l3621
var bikelanesOSM = L.tileLayer("http://{s}.tiles.mapbox.com/v3/examples.map-i86l3621,stevevance.c2k1og3k/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: 'Map data, including bike lanes, (c) <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors, CC-BY-SA.'
});

var mapquestOSM = L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png", {
  maxZoom: 19,
  subdomains: ["otile1", "otile2", "otile3", "otile4"],
  attribution: 'Tiles courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">. Map data (c) <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors, CC-BY-SA.'
});
var mapquestOAM = L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg", {
  maxZoom: 18,
  subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"],
  attribution: 'Tiles courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a>. Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency'
});
var mapquestHYB = L.layerGroup([L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg", {
  maxZoom: 18,
  subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"]
}), L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/hyb/{z}/{x}/{y}.png", {
  maxZoom: 19,
  subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"],
  attribution: 'Labels courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">. Map data (c) <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors, CC-BY-SA. Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency'
})]);

/* Overlay Layers */
var highlight = L.geoJson(null);
var highlightStyle = {
  stroke: false,
  fillColor: "#00FFFF",
  fillOpacity: 0.7,
  radius: 10
};


//establish the grocery store layer for mapping, point of interest searching
//and divvy calculations

 groceriesLayer = L.geoJson(null); //take out var
 groceries = L.geoJson(null, { //take out var
  pointToLayer: function (feature, latlng) {
    return L.marker(latlng, {
      icon: L.icon({
        iconUrl: "assets/img/grocery.png",
        iconSize: [24, 28],
        iconAnchor: [12, 28],
        popupAnchor: [0, -25]
      }),
      title: feature.properties['STORE NAME'],
      riseOnHover: true
    });
  },
  onEachFeature: function (feature, layer) {
    if (feature.properties) {
      var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Name</th><td>" + feature.properties['STORE NAME'] + "</td></tr>" + "<tr><th>Address</th><td>" + feature.properties.ADDRESS + "</td></tr>" + "<table>";
      layer.on({
        click: function (e) {
          $("#feature-title").html(feature.properties['STORE NAME']);
          $("#feature-info").html(content);
          $("#featureModal").modal("show");
          highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], highlightStyle));
        }
      });
/*
      $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/grocery.png"></td><td class="feature-name">' + layer.feature.properties['STORE NAME'] + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
*/
     groceriesSearch.push({
        name: layer.feature.properties['STORE NAME'],
        address: layer.feature.properties.ADDRESS,
        source: "Groceries",
        id: L.stamp(layer),
        lat: layer.feature.geometry.coordinates[1],
        lng: layer.feature.geometry.coordinates[0]
      });
    }
  }
});

var groceryStoresCall = $.getJSON("data/grocery_stores_2013.geojson", function (data) {
  groceries.addData(data);
  groceriesGeojson = data;
  //map.addLayer(groceriesLayer);
});

///////////////////////Begin divvyBuffers/////////////////

//var divvyBuffers = [];
divvyBuffers = L.geoJson(null, {
  style: function() {
    return {
      color: "blue",
      opacity: 0.1,
      fillOpacity: 0,
      clickable: false
    }
  }
});
divvyStations = L.geoJson(null, {
  style: function(feature) {
    return {
      color: "blue",
      fill: "blue",
      opacity: 0.5,
      fillOpacity: 0.5,
      weight: 1.0,
      clickable: false
    };
  },
  onEachFeature: function (feature, layer) {
    divvyStationsSearch.push({
      name: layer.feature.properties.Address,
      source: "DivvyStations",
      id: L.stamp(layer)
    });
  }
});
var divvyStationsCall = $.getJSON("data/divvy_stations.geojson", function (data) {
  divvyStations.addData(data);
  $.each(data, function(key, stations) {
    if (key === 'features') {
      stations.forEach(function(station) { //for every divvy station
        var buffered = turf.buffer(station, 0.25, 'miles'); //.25 mi buffer around each div st.

        var resultFeatures = buffered.features;//.concat(station); //add all features of

        divvyBuffers.addData({ //collection of divvyBuffers
          "type": "FeatureCollection",
          "features": resultFeatures //data from each buffer is added to collection
        });
      });

	 //Create a Divvy Super Buffer (merges all buffers together)
      divvySuperBuffer = turf.merge(divvyBuffers.toGeoJSON());
	 //Add SuperBuffer to the map
      divvyStations.addData(divvySuperBuffer);


    }

  });

	/* Function: Count the number of grocery stores within a
	*.25 mile of a Divvy Station.
	*/

	//create an array of one Divvy Super Buffer
	divvySuperBufferArray = [divvySuperBuffer];

	//make a feature collection of the one Super Buffer Array
	fcSuperBuffer = turf.featurecollection(divvySuperBufferArray);

	//count the number of grocery stores within the feature collection
  $.when( groceryStoresCall, divvyStationsCall ).done(function () {
    groceriesNearDivvy = turf.within(groceriesGeojson, fcSuperBuffer);
  	console.log("groceries near divvy object is below:");
  	console.log(groceriesNearDivvy);
  	console.log("groceries near divvy count: " + groceriesNearDivvy.features.length);
  	$("#features").append("<div class='panel-heading'> Groceries Within .5 Miles of a Divvy Station: " + groceriesNearDivvy.features.length  + "</div>");
  });
});

var wards = L.geoJson(null, {
  style: function (feature) {
    return {
      color: "gray",
      fill: "gray",
      opacity: 0.9,
      fillOpacity: 0,
      weight: 2.0,
      clickable: false
    };
  },
  onEachFeature: function (feature, layer) {
    wardsSearch.push({
      name: layer.feature.properties.District_1,
      source: "Wards",
      id: L.stamp(layer),
      bounds: layer.getBounds()
    });
  }
});
$.getJSON("data/chicago_wards_2015.geojson", function (data) {
  wards.addData(data);
});

/* Single marker cluster layer to hold all clusters */
var markerClusters = new L.MarkerClusterGroup({
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true,
  disableClusteringAtZoom: 16
});

map = L.map("map", {
	zoom: 12,
  maxZoom: 19,
	center: [41.87982, -87.63161],
	layers: [mapquestOSM, markerClusters, highlight],
	zoomControl: false,
	attributionControl: false,
	contextmenu: true,
	contextmenuWidth: 200,
	contextmenuItems: [{
		text: 'Show coordinates',
		callback: showCoordinates
	},{
		text: "Find nearby Divvy stations",
		callback: findNearbyDivvy
  },{
    text: "Show Address",
    callback: showAddress 
  },{
    text: "Clear Comparison",
    callback: clearComparison
	}]
});

var bikelanesLayer = new BikeLanesLayer(map);
var populationLayer = new PopulationLayer(map);

/* Layer control listeners that allow for a single markerClusters layer */
map.on("overlayadd", function(e) {
  if (e.layer === groceriesLayer) {
    markerClusters.addLayer(groceries);
    syncSidebar();
  } else if (e.layer === populationLayer.layer) {
    populationLayer.legend.addTo(this);
    populationLayer.info.addTo(this);
  }
});

map.on("overlayremove", function(e) {
  if (e.layer === groceriesLayer) {
    markerClusters.removeLayer(groceries);
    syncSidebar();
  } else if (e.layer === populationLayer.layer) {
    this.removeControl(populationLayer.legend);
    this.removeControl(populationLayer.info);
  }
});

/* Filter sidebar feature list to only show features in current map bounds */
map.on("moveend", function (e) {
  syncSidebar();
});

/* Clear feature highlight when map is clicked */
map.on("click", function(e) {
  highlight.clearLayers();
});

/* Attribution control */
function updateAttribution(e) {
  $.each(map._layers, function(index, layer) {
    if (layer.getAttribution) {
      $("#attribution").html((layer.getAttribution()));
    }
  });
}
map.on("layeradd", updateAttribution);
map.on("layerremove", updateAttribution);

var attributionControl = L.control({
  position: "bottomright"
});
attributionControl.onAdd = function (map) {
  var div = L.DomUtil.create("div", "leaflet-control-attribution");
  div.innerHTML = "<span class='hidden-xs'>Map template developed by <a href='http://bryanmcbride.com'>bryanmcbride.com</a> | </span><a href='#' onclick='$(\"#attributionModal\").modal(\"show\"); return false;'>Attribution</a>";
  return div;
};
map.addControl(attributionControl);

var zoomControl = L.control.zoom({
  position: "topleft"
}).addTo(map);

/* GPS enabled geolocation control set to follow the user's location */
var locateControl = L.control.locate({
  position: "topleft",
  drawCircle: true,
  follow: false,
  setView: true,
  keepCurrentZoomLevel: true,
  markerStyle: {
    weight: 1,
    opacity: 0.8,
    fillOpacity: 0.8
  },
  circleStyle: {
    weight: 1,
    clickable: false
  },
  icon: "icon-direction",
  metric: false,
  strings: {
    title: "My location",
    popup: "You are within {distance} {unit} from this point",
    outsideMapBoundsMsg: "You seem located outside the boundaries of the map"
  },
  locateOptions: {
    maxZoom: 18,
    watch: true,
    enableHighAccuracy: true,
    maximumAge: 10000,
    timeout: 10000
  }
}).addTo(map);

/* Larger screens get expanded layer control and visible sidebar */
if (document.body.clientWidth <= 767) {
  var isCollapsed = true;
} else {
  var isCollapsed = false;
}

var baseLayers = {
  "Street Map": mapquestOSM,
	"Regional Bikeways": bikelanesOSM,
	//"Satellite": mapquestOAM,
	"Satellite": mapquestHYB
};

var groupedOverlays = {
	"Points of Interest": {
	  "<img src='assets/img/grocery.png' width='24' height='28'>&nbsp;Grocery Stores": groceriesLayer
	},
	"Boundaries": {
	  "Wards": wards
	},
	"References": {
	  "Bike Lanes": bikelanesLayer.layer,
    "Divvy Stations": divvyStations,
    "Population Density": populationLayer.layer
	}
};

var layerControl = L.control.groupedLayers(baseLayers, groupedOverlays, {
  collapsed: isCollapsed
}).addTo(map);

/* Highlight search box text on click */

$("#featureModal").on("hidden.bs.modal", function (e) {
  $(document).on("mouseout", ".feature-row", clearHighlight);
});

/* Typeahead search functionality */
$(document).one("ajaxStop", function () {
  $("#loading").hide();
  /* Fit map to bike lanes bounds */
  map.fitBounds(bikelanesLayer.layer.getBounds());
  featureList = new List("features", {valueNames: ["feature-name"]});
  featureList.sort("feature-name", {order:"asc"});

  var wardsBH = new Bloodhound({
    name: "Wards",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: wardsSearch,
    limit: 10
  });

  var divvyStationsBH = new Bloodhound({
    name: "Divvy Stations",
    datumTokenizer: function(d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: divvyStationsSearch,
    limit: 10
  });

  var groceriesBH = new Bloodhound({
    name: "GroceryStores",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: groceriesSearch,
    limit: 10
  });

  var geonamesBH = new Bloodhound({
    name: "GeoNames",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    remote: {
      url: "http://api.geonames.org/searchJSON?username=bootleaf&featureClass=P&maxRows=5&countryCode=US&name_startsWith=%QUERY",
      filter: function (data) {
        return $.map(data.geonames, function (result) {
          return {
            name: result.name + ", " + result.adminCode1,
            lat: result.lat,
            lng: result.lng,
            source: "GeoNames"
          };
        });
      },
      ajax: {
        beforeSend: function (jqXhr, settings) {
          settings.url += "&east=" + map.getBounds().getEast() + "&west=" + map.getBounds().getWest() + "&north=" + map.getBounds().getNorth() + "&south=" + map.getBounds().getSouth();
          $("#searchicon").removeClass("fa-search").addClass("fa-refresh fa-spin");
        },
        complete: function (jqXHR, status) {
          $('#searchicon').removeClass("fa-refresh fa-spin").addClass("fa-search");
        }
      }
    },
    limit: 10
  });
  wardsBH.initialize();
  groceriesBH.initialize();
  divvyStationsBH.initialize();
  geonamesBH.initialize();

  /* instantiate the typeahead UI */
  $("#searchbox").typeahead({
    minLength: 3,
    highlight: true,
    hint: false
  }, {
    name: "Wards",
    displayKey: "name",
    source: wardsBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'>Wards</h4>"
    }
  }, {
    name: "GroceryStores",
    displayKey: "name",
    source: groceriesBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'><img src='assets/img/grocery.png' width='24' height='28'>&nbsp;Grocery Stores</h4>",
      suggestion: Handlebars.compile(["{{name}}<br>&nbsp;<small>{{address}}</small>"].join(""))
    }
  }, {
    name: "DivvyStations",
    displayKey: "name",
    source: divvyStationsBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'>Divvy Stations</h4>"
    }
  },
    {
    name: "GeoNames",
    displayKey: "name",
    source: geonamesBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'><img src='assets/img/globe.png' width='25' height='25'>&nbsp;GeoNames</h4>"
    }
  }).on("typeahead:selected", function (obj, datum) {
    if (datum.source === "Wards") {
      map.fitBounds(datum.wards);
    }
    if (datum.source === "GroceryStores") {
      if (!map.hasLayer(groceriesLayer)) {
        map.addLayer(groceriesLayer);
      }
      map.setView([datum.lat, datum.lng], 17);
      if (map._layers[datum.id]) {
        map._layers[datum.id].fire("click");
      }
    }
    if (datum.source === "GeoNames") {
      map.setView([datum.lat, datum.lng], 14);
    }
    if ($(".navbar-collapse").height() > 50) {
      $(".navbar-collapse").collapse("hide");
    }
  }).on("typeahead:opened", function () {
    $(".navbar-collapse.in").css("max-height", $(document).height() - $(".navbar-header").height());
    $(".navbar-collapse.in").css("height", $(document).height() - $(".navbar-header").height());
  }).on("typeahead:closed", function () {
    $(".navbar-collapse.in").css("max-height", "");
    $(".navbar-collapse.in").css("height", "");
  });
  $(".twitter-typeahead").css("position", "static");
  $(".twitter-typeahead").css("display", "block");

});
}); //document ready close-bracket