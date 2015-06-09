/* jshint unused: false */
/* global L, $, turf, console */

function BikeCountsLayer(map) {
  'use strict';
  var self = this;

  $.getJSON('data/bikecounts.json').then(function (data) {
    console.log('Got the bike counts!');
    self.locationArr = data.locations;
    $.each(self.locationArr, function (key, value) {
      var marker = L.marker([value.latitude, value.longitude])
        .bindPopup('<canvas id="bikecounts" width="600" height="400"></canvas>', {
          minWidth: 600
        })
        .on('popupopen', function (e) {
          // "value" is bound to this closure correctly; iterate through it to get the best data
          var orderedDates = _.sortByOrder(value.dateCounts, function (x) {
            return moment(x.date, 'YYYYMMDD').unix();
          });
          var data = {
            labels: _.map(orderedDates, function (x) {
                var retVal = moment(x.date, 'YYYYMMDD').format('MMMM YYYY');
                if (x.note) {
                  retVal += ' (' + x.note + ')';
                }
                return retVal;
              }),
            datasets: [
              {
                data: _.map(orderedDates, function (x) {
                  return _.add(x.counts.maleAM, x.counts.malePM);
                }),
                fillColor: 'blue',
                strokeColor: 'blue',
                highlightFill: 'blue',
                highlightStroke: 'blue'
              },
              {
                data: _.map(orderedDates, function (x) {
                  return _.add(x.counts.femaleAM, x.counts.femalePM);
                }),
                fillColor: 'pink',
                strokeColor: 'pink',
                highlightFill: 'pink',
                highlightStroke: 'pink'
              }
            ]
          }

          var ctx = document.getElementById("bikecounts").getContext('2d');
          var chart = new Chart(ctx).Bar(data);
        })
        .addTo(map);
    });
  }, function (jqXHR, errText, err) {
    console.log('There was an error! ' + errText);
    console.log(JSON.stringify(err));
    throw err;
  });
}


/*
 * Initializes and populates the population overlay layer.
 */

function PopulationLayer(map) {
  'use strict';
  var self = this;
  this.layer = L.geoJson(null, {
    style: style,
    onEachFeature: onEachFeature
  });
  this.info = L.control({position: 'bottomleft'});
  this.legend = L.control({position: 'bottomright'});

  $.getJSON('data/race_clipped.geojson', function (data) {
    self.layer.addData(data);
    addLegend();
    addInfoControl();
  });

  function style(feature) {
    return {
      fillColor: getColor(getTotalDensity(feature)),
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7
    };
  }

  function getColor(d) {
    return d > 30000 ? '#800026' :
           d > 20000  ? '#BD0026' :
           d > 15000  ? '#E31A1C' :
           d > 10000  ? '#FC4E2A' :
           d > 5000   ? '#FD8D3C' :
           d > 2000   ? '#FEB24C' :
           d > 1000   ? '#FED976' :
                      '#FFEDA0';
  }

  function highlightFeature(e) {
      var layer = e.target;

      layer.setStyle({
          weight: 5,
          color: '#666',
          dashArray: '',
          fillOpacity: 0.7
      });

      if (!L.Browser.ie && !L.Browser.opera) {
          layer.bringToFront();
      }

      self.info.update(layer.feature);
  }

  function resetHighlight(e) {
    self.layer.resetStyle(e.target);
    self.info.update();
  }

  function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
  }

  function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
  }

  function addLegend() {
    self.legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend leaflet-control-layers leaflet-control-layers-expanded'),
            grades = [0, 1000, 2000, 5000, 10000, 15000, 20000, 30000],
            labels = [];
        div.innerHTML += '<p><strong>Population Density, per mi&#178;</strong></p>';

        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
        return div;
    };

    //self.legend.addTo(map);
  }

  function addInfoControl() {
    self.info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
        this.update();
        return this._div;
    };

    // method that we will use to update the control based on feature properties passed
    self.info.update = function (feature) {
      var html = '<h4>Chicago Population Density</h4>';
        if (feature) {
          html += '<strong>Census Block ID: ' + feature.properties.GEOID + '</strong><br /><br />Block density: ' + getTotalDensity(feature) + ' people / mi<sup>2</sup><br/>Total Population: ' + feature.properties.a_pop10;
        } else {
          html += 'Hover over a census block';
        }
        this._div.innerHTML = html;
    };

    //self.info.addTo(map);
  }

}

function getTotalDensity(feature) {
  var areaInM2 = turf.area(feature);
  var areaInMi2 = areaInM2 / 2589988.11;
  return Math.round(feature.properties.a_pop10 / areaInMi2);
}

function HypertensionLayer(map) {
  'use strict';
  var self = this;
  this.layer = L.geoJson(null, {
    style: style,
    onEachFeature: onEachFeature
  });
  this.info = L.control({position: 'bottomleft'});
  this.legend = L.control({position: 'bottomright'});

  $.getJSON('data/hypertension.geojson', function (data) {
    self.layer.addData(data);
    addLegend();
    addInfoControl();
  });

  function style(feature) {
    return {
      fillColor: getColor(feature.properties.condition_value[2006]),
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7
    };
  }

  function getColor(d) {
    return d > 25.8 ? '#4F82B5' :
           d > 20.23  ? '#6CA4CC' :
           d > 14.62  ? '#94C2DE' :
                        '#CDDFEB';
  }

  function highlightFeature(e) {
      var layer = e.target;

      layer.setStyle({
          weight: 5,
          color: '#666',
          dashArray: '',
          fillOpacity: 0.7
      });

      if (!L.Browser.ie && !L.Browser.opera) {
          layer.bringToFront();
      }

      self.info.update(layer.feature);
  }

  function resetHighlight(e) {
    self.layer.resetStyle(e.target);
    self.info.update();
  }

  function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
  }

  function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
  }

  function addLegend() {
    self.legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend leaflet-control-layers leaflet-control-layers-expanded'),
            grades = [0, 14.62, 20.23, 25.8],
            labels = [];
        div.innerHTML += '<p><strong>Hypertension</strong></p>';

        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
        return div;
    };

    //self.legend.addTo(map);
  }

  function addInfoControl() {
    self.info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
        this.update();
        return this._div;
    };

    // method that we will use to update the control based on feature properties passed
    self.info.update = function (feature) {
      var html = '<h4>Chicago Hypertension Levels</h4>';
        if (feature) {
          html += '<strong>Block ID: ' + feature.properties.name + '</strong><br /><br />Hypertension Level: ' + feature.properties.condition_value[2006];
        } else {
          html += 'Hover over a census block';
        }
        this._div.innerHTML = html;
    };
    //self.info.addTo(map);
  }
}

function BikeLanesLayer(map) {
  'use strict';
  var self = this;
  var bikeLaneColors = Object.freeze({
    bikelane: '#00D624',
    trail: '#00570E',
    opacity: 0.8 }
  );

  var bikeLaneTypes = Object.freeze({
  	PROTECTED: '8',
    BUFFERED: '9',
    STANDARD: '1',
    SHAREDLANE: ['2','13','3'],
    GREENWAY: '45',
    TRAIL: ['5','7']
  });

  this.layer = L.geoJson(null, {
    style: function (feature) {
    	return bikeLaneStyler(feature);
    },
    onEachFeature: function (feature, layer) {
      if (feature.properties) {
        var content = '<table class="table table-striped table-bordered table-condensed">' + '<tr><th>Bikeway Type</th><td>' + feature.properties.BIKEROUTE + '</td></tr>' + '<tr><th>Street Name</th><td>' + feature.properties.STREET + '</td></tr>' + '<table>';
        layer.on({
          click: function (e) {
            $('#feature-title').html(feature.properties.STREET);
            $('#feature-info').html(content);
            $('#featureModal').modal('show');

          }
        });
      }
      layer.on({
        mouseover: function (e) {
          var layer = e.target;
          layer.setStyle({
            //weight: 4,
            color: '#e5f5f9',
            opacity: 0.9
          });
          if (!L.Browser.ie && !L.Browser.opera) {
            layer.bringToFront();
          }
        },
        mouseout: function (e) {
          self.layer.resetStyle(e.target);
        }
      });
    }
  }).addTo(map);

  $.getJSON('data/bike_routes_12-19-14_excl_recommended.geojson', function (data) {
    self.layer.addData(data);
  });
}

function bikeLaneStyler(feature) {
	var style = {};
	switch(feature.properties.TYPE) {
		case "8": // protected
			style = {
				color: "#00570E",
				weight: 5,
				opacity: 0.8
			  }
		  break;
		case "9": // buffered
			style = {
				color: "#00D624",
				weight: 6,
				opacity: 0.8
			  }
		  break;
		case "5":
		case "7": // trails
			style = {
				color: "#00570E",
				weight: 6,
				opacity: 0.8
			  }
		  break;
		case "2":
		case "13":
		case "3": // sharrows
			style = {
				color: "#00570E",
				weight: 0,
				opacity: 0
			  }
		  break;
		case "1": // conventional lanes
			style = {
				color: "#00D624",
				weight: 4,
				opacity: 0.8
			  }
		  break;
		case "45": // neighborhood greenway
			style = {
				color: "#00570E",
				weight: 4,
				opacity: 0.8
			  }
		  break;
	} // end switch
	
	return style;
}