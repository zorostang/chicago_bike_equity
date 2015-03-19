/*
 * Initializes and populates the population overlay layer.
 */

function Population(map) {
  var self = this;
  this.layer = L.geoJson(null, {
    style: style,
    onEachFeature: onEachFeature
  }).addTo(map);
  this.info = L.control({position: 'bottomleft'});
  this.legend = L.control({position: 'bottomright'});

  $.getJSON("data/race_clipped.geojson", function (data) {
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
        div.innerHTML += "<p><strong>Population Density, per mi&#178;</strong></p>";

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