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
        .bindPopup('<div id="bikecounts"></div>', {
          minWidth: 600
        })
        .on('popupopen', function (e) {
          // "value" is bound to this closure correctly; iterate through it to get the best data

          $('#bikecounts').html('<pre>' + JSON.stringify(value) + '</pre>');
        })
        .addTo(map);
      // build the popup (highcharts or some other library)
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
  }).addTo(map);
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

    self.legend.addTo(map);
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

    self.info.addTo(map);
  }

  function getTotalDensity(feature) {
    var areaInM2 = turf.area(feature);
    var areaInMi2 = areaInM2 / 2589988.11;
    return Math.round(feature.properties.a_pop10 / areaInMi2);
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
    STANDARD: '1',
    SHAREDLANE: ['2','13','3'],
    GREENWAY: '45',
    TRAIL: ['5','7'],
    PROTECTED: '8',
    BUFFERED: '9'
  });

  this.layer = L.geoJson(null, {
    style: function (feature) {
      if (feature.properties.TYPE === bikeLaneTypes.STANDARD) {
        return {
          color: bikeLaneColors.bikelane,
          weight: 3,
          opacity: bikeLaneColors.opacity
        };
      }
      if ($.inArray(feature.properties.TYPE, bikeLaneTypes.SHAREDLANE)) {
        return {
          color: bikeLaneColors.bikelane,
          weight: 2,
          opacity: 0
        };
      }
      if (feature.properties.TYPE === bikeLaneTypes.GREENWAY) {
        return {
          color: bikeLaneColors.bikelane,
          weight: 4,
          opacity: bikeLaneColors.opacity
        };
      }
      if ($.inArray(feature.properties.TYPE, bikeLaneTypes.TRAIL)) {
        return {
          color: bikeLaneColors.trail,
          weight: 6,
          opacity: bikeLaneColors.opacity
        };
      }
      if (feature.properties.TYPE === bikeLaneTypes.PROTECTED) {
        return {
          color: bikeLaneColors.trail,
          weight: 6,
          opacity: bikeLaneColors.opacity
        };
      }
      if (feature.properties.TYPE === bikeLaneTypes.BUFFERED) {
        return {
          color: bikeLaneColors.bikelane,
          weight: 5,
          opacity: bikeLaneColors.opacity
        };
      }
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