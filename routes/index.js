const routes = require('express').Router()
const fs = require('fs')
/* ---- Modules ---- */
const markets = require('../markets/markets')
const maps = require('../maps/maps')
const polygons = require('../polygons/polygons')
const gmapsapi = require('../google-maps-api/index.js')

routes.get('/', function (req, res) {
	res.render('layouts/home')
})

routes.get('/markets', markets.list)

// Test route for Google Maps Geocode API
routes.get('/geocode', function (req, res) {
	var geocodeParams = {
		"address": "80204",
		"language": "en",
		"region": "us"
	}

	gmapsapi.geocode(geocodeParams, function (err, response) {
			if (err) {
				console.log(err)
			}
			else {
				console.log('Geocoded response:', response)
				console.log( response.results[0].geometry.location )
				res.json(response)
			}
	})
})

// Returns geocoded JSON from Google Maps Geocode API for provided zip
routes.get('/geocode/:zip', function (req, res) {
	var geocodeParams = {
		address: req.params.zip
	}
	console.log(geocodeParams)

	gmapsapi.geocode(geocodeParams, function(err, response) {
		if (err) {
			console.log('Error: ' + err)
		}
		else {
			//res.send(response)
			res.json(response)
			console.log( response.results[0].geometry.location )
		}
	})
})

/* ////// This route should be retired
routes.get('/geocodemarket/:market', function (req, res) {
	var market_id = req.params.market
	//console.log(market_id)
	markets.zips(market_id, function (err, data) {
		if (err) {
			console.log('Error: ' + err)
		}
		else console.log(data[0].serviceablePostalCodes)
		//res.json(data)

		var arr = data[0].serviceablePostalCodes
		var coords = []
		var geocodeParams = {
			address: ''
		}

		arr.forEach( function (zip) {
			console.log(zip)
			geocodeParams = {
				address: zip
			}

			gmapsapi.geocode(geocodeParams, function (err, data) {
				if (err) {
					console.log('Error: ' + err)
				}
				else {
					console.log(data.results[0].geometry)
					var latlng = data.results[0].geometry.location
					console.log( latlng )
					coords.push( latlng )
					//res.send(coords)
					//console.log(coords)
				}
			})
		})
	})
})
*/

routes.get('/map/:market_id', function (req, res) {
	var market_id = req.params.market_id

	maps.get(market_id, function(error, response) {
		if (error) {
			console.log('Error: ' + error)
		}
		console.log('Map definition: ' + response)
		console.log(response.center)

		res.render('layouts/map', {
				zoom: 9,
				center: response.center,
				boundary: response.boundary
			}
		)
	})
})

routes.get('/build-map/:market_id/:name', function (req, res) {
	var market_id = req.params.market_id
	var market_name = req.params.name

	console.log('Getting GeoJSON for', market_name, 'zipcodes ...')
	var geoJSON = fs.readFileSync('./data/geos/polygons_zips/' + market_name + '_zips.json')

	geoJSON = JSON.parse(geoJSON)

	console.log('Creating polygon for', market_name, '...')
	maps.getPolygon(geoJSON, function (err, polygon) {
		// GoogleCloud fs.writeFileSync('./data/geos/polygons_markets/' + market_name + '_polygon.json', JSON.stringify(polygon))

		console.log('Displaying', market_name, 'market map ...')

		res.render('layouts/map2', {
			geoJSON: JSON.stringify(polygon),
			market: {
				id: market_id,
				name: market_name
			}
		})

	})

})

routes.get('/market/:market_id', function (req, res) {
	var market_id = req.params.market_id

	markets.get(market_id, function(err, market) {
		if (err) {
			console.log(err)
		}
		console.log(market)
	})
})


// Generates a GeoJSON polygon and save file to file system
routes.get('/zip-polygons/:market_id', function (req, res) {
	var market_id = req.params.market_id

	markets.get(market_id, function(err, market) {
		if (err) {
			console.log(err)
		}

		var zips = market[0].serviceablePostalCodes
		var market_name = market[0].name

		polygons.generateZipPolygons(zips, function(error, polygons) {
			if (error) {
				console.log(error)
			}

			var polygon_file = JSON.stringify(polygons)
			polygon_file = 	'{' +
							'"type": "FeatureCollection", ' +
							'"crs": { "type": "name", "properties": { "name": "cb:' + market_name + '" } }, ' +
							'"features": ' + polygon_file + '}'
			console.log(polygon_file)
			// GoogleCloud fs.writeFileSync('./data/geos/polygons_zips/' + market_name + '_zips.json', polygon_file)
			console.log('Polygon file created for', market_name)
		})
	})
})

module.exports = routes
