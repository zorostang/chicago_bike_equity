import csv
import json

geojson = {
	'type': 'FeatureCollection',
}
features = []
missing = 0
with open('business_licenses_current_active.2015-04-28.csv', 'rb') as csvfile:
	reader = csv.DictReader(csvfile)
	for row in reader:
		lat = row['Latitude']
		lon = row['Longitude']
		if lat and lon:
			lat = float(row['Latitude'])
			lon = float(row['Longitude'])
			del row['Latitude']
			del row['Longitude']
			f = {
				'type': 'Feature',
				'properties': row,
				'geometry': {
					'type': 'Point',
					'coordinates': [ lon, lat ]
				}
			}
			features.append(f)
		else:
			missing+=1

print "{} records missing lat/long data".format(missing)
geojson['features'] = features
with open('active_business_licenses.2015-04-28.geojson', 'w') as geojsonfile:
	geojsonfile.write(json.dumps(geojson))
print "file created"

