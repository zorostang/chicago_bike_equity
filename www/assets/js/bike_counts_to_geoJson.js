var bikecounts = [];

data.locations.forEach(function (location) {
    bikecounts.push(locationToGeoJson(location));
});

console.log(JSON.stringify(bikecounts));

var locationToGeoJson = function(obj) {
    
    return {
        "type": "Feature",
        "properties": {
            "location": obj.location,
            "dateCounts": obj.dateCounts
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                obj.longitude,
                obj.latitude
            ]
        }
    };
}