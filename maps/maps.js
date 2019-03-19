// maps.js
// by mdglissmann@gmail.com
// August 2016
// For a given market, returns a geo definition for the market composed of a
// center point, boundary, and array of zips + geoJSON polygon + map
// initilization parameters.

//const express = require('express')
const markets = require('../markets/markets.js')
const gmapsAPI = require('../google-maps-api/index.js')
const turf = require('turf')
const fs = require('fs')

// Returns array of latitude & longitude coordinates based on provided array of
// zipcodes.
// ******** Opportunity to clean this up using map / reduce *********
// ******** Need to explore edge cases. Is order important? Can results be
// returned out of order? What count checks are in place to ensure no results
// are dropped? Others? *********
function getCoordinates (zips, callback) {
	var coords = []
	var counter = zips.length

	// Loop through zips array, use Google Maps API to geocode the address(i.e.
	// zip in this case) to get the zip's latitude and longitude coordinates.
	zips.forEach( function (zip) {
		var geocodeParams = { address: zip }

		// NEED TO RATE LIMIT THIS
		gmapsAPI.geocode(geocodeParams, function (err, res) {
			if (err) {
				console.log('Error: ' + err)
				callback(err, null)
				return
			}
			//console.log(res)
			//console.log(res.results[0].geometry)
			var latlng = res.results[0].geometry.location
			coords.push( latlng )
			counter--
			if ( counter === 0 ) {
				callback(null, coords)
			}
		})
	})
}

// Returns a geo definition defined by a center point & a boundary rectangle,
// for an array of provided lat/long coordinates.
function getGeoDefinition (coordinates, callback) {
	var counter = coordinates.length

	// Initialize a geoDef model object
	var centerPoint = {
		lat: null,
		lng: null
	}
	var latMax = 0,
			latMin = 0,
			latCenter,
			lngMax = 0,
			lngMin = 0,
			lngCenter
	var geoDef = {
		center: centerPoint,
		boundary: [
			{ lat: latMax, lng: lngMin },
			{ lat: latMax, lng: lngMax },
			{ lat: latMin, lng: lngMax },
			{ lat: latMin, lng: lngMin }
		]
	}

	// Creating geo definition object, including min and max latitude and
	// longitudes by looping through array of coordinates, evaluating coordinates
	// against current max and mins.
	// ******** Is there a more efficient prototype method for finding array mins/
	// maxes? *********
	coordinates.forEach( function (coordinate) {
		if (coordinate.lat > latMax || latMax === 0) {
			latMax = coordinate.lat
		}
		if (coordinate.lat < latMin || latMin === 0) {
			latMin = coordinate.lat
		}
		if (coordinate.lng > lngMax || lngMax === 0) {
			lngMax = coordinate.lng
		}
		if (coordinate.lng < lngMin || lngMin === 0) {
			lngMin = coordinate.lng
		}

		counter--
		if (counter === 0) {
			latCenter = (latMax + latMin) / 2
			lngCenter = (lngMax + lngMin) / 2
			centerPoint = {
				lat: latCenter,
				lng: lngCenter
			}
			geoDef = {
				center: centerPoint,
				boundary: [
					{ lat: latMax, lng: lngMin },
					{ lat: latMax, lng: lngMax },
					{ lat: latMin, lng: lngMax },
					{ lat: latMin, lng: lngMin }
				]
			}
			callback(null, geoDef)
		}
	})
}

// Helper function to retrieve random n elements from a provided array.
// ****** Why reinvent the wheel? Seems like a function like this should
// already exist ******
function getRandom(arr, n) {
    var result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    if (n > len) {
        n = len;
    }
    while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len;
    }
    return result;
}


// *********** Clean up these exports to make more readable ***********
module.exports = {
	// For a given market, return a geo definition for the market composed of a
	// center point, boundary, and array of zips.
	get: function (market_id, callback) {
		var geoDefinition = {}
		var zipCodes = []
		var centerPoint = {}
		var boundary = []

		markets.get(market_id, function (err, res) {
			if (err) {
				console.log('Error: ' + err)
				callback(err, null)
				return
			}

			var zips = res[0].serviceablePostalCodes
			zipCodes = zips

			getCoordinates(zips, function (err, res) {
				if (err) {
					console.log('Error: ' + err)
					callback(err, null)
					return
				}

				getGeoDefinition(res, function (err, res) {
					if (err) {
						console.log('Error: ' + err)
						callback(err, null)
						return
					}

					centerPoint = res.center
					boundary = res.boundary
					geoDefinition = {
						center: centerPoint,
						boundary: boundary,
						zipCodes: zipCodes
					}

					//console.log(geoDefinition)
					//res.json(geoDefinition)
					callback(null, geoDefinition)
				})
			})

		})
		//callback(null, response)
	},
	// Returns a single (i.e. unioned) polygon based on provided geoJSON
	getPolygon: function (geoJSON, callback) {
		var union = geoJSON.features[0];

		for (var i = geoJSON.features.length - 1; i >= 0; i--) {
			union = turf.union(union, geoJSON.features[i])
		}

		callback(null, union)
	},
	// Finding the center point for a polygon in order to find the point to
	// initialize the map.
	getMapInit: function (geoJSON, callback) {
		var geoDefinition = {}
		var centerPoint = {}
		var lat, lng, latMin = 0, latMax = 0, lngMin = 0, lngMax = 0, latCenter, lngCenter
		var lats = [], lngs = []

		// ******* This is unreadable and needs refactoring. *********
		// Looping through nested objects to get at longitude & latitudes
		for (var i = geoJSON.features.length - 1; i >= 0; i--) {
			for (var j = geoJSON.features[i].geometry.coordinates.length - 1; j >= 0; j--) {
				//console.log( "Zipcode: " + geoJSON.features[i].properties.GEOID10 )
				for (var k = geoJSON.features[i].geometry.coordinates[j].length - 1; k >= 0; k--) {
					lng = geoJSON.features[i].geometry.coordinates[j][k][0]
					lat = geoJSON.features[i].geometry.coordinates[j][k][1]

					if ( typeof(lat) === "number" ) { lats.push(lat) } else {console.log( lat )}
					if ( typeof(lng) === "number" ) { lngs.push(lng) }
				}
			}
		}

		// Aiming to calculate the center point of the unioned polygon. However,
		// this data can get to be quite large. Therefore, sampling a random subset
		// of latitudes / longitudes to reduce the processing time to find the mins
		// and maxes.
		// ******* Investigate whether there is an array.prototype which will find
		// mins and maxes more elegantly and efficiently. **********
		lats = getRandom(lats, 100000)
		lngs = getRandom(lngs, 100000)

		latMin = Math.min.apply(null, lats)
		latMax = Math.max.apply(null, lats)
		lngMin = Math.min.apply(null, lngs)
		lngMax = Math.max.apply(null, lngs)

		latCenter = (latMax + latMin) / 2
		lngCenter = (lngMax + lngMin) / 2

		console.log('Lat: ' + latCenter)
		console.log('Lng: ' + lngCenter)

		//centerPoint = { lat: 40.4992144, lng: -105.05001105 }
		centerPoint = { lat: latCenter, lng: lngCenter }

		geoDefinition = {
			center: centerPoint
		}

		callback(null, geoDefinition)
	},
	getMapInit2: function (polygon, callback) {
		var geoDefinition = {}
		var centerPoint = {}
		var lat, lng, latMax, latMin, lngMax, lngMin, latCenter, lngCenter,
			lats = [], lngs = []

		for (var i = polygon.geometry.coordinates.length - 1; i >= 0; i--) {
			//console.log( polygon.geometry.coordinates[i] )
			for (var j = polygon.geometry.coordinates[i].length - 1; j >= 0; j--) {
				//console.log( polygon.geometry.coordinates[i][j] )
				if ( polygon.geometry.type === "Polygon") {
					lat = polygon.geometry.coordinates[i][j][1]
					lng = polygon.geometry.coordinates[i][j][0]
					if ( typeof(lat) === 'number') { lats.push(lat) } else { console.log( typeof(lat) + lat ) }
					if ( typeof(lng) === 'number') { lngs.push(lng) } else { console.log( typeof(lng) + lng ) }
				}
				if ( polygon.geometry.type === "MultiPolygon") {
					for (var k = polygon.geometry.coordinates[i][j].length - 1; k >= 0; k--) {
						lat = polygon.geometry.coordinates[i][j][k][1]
						lng = polygon.geometry.coordinates[i][j][k][0]
						if ( typeof(lat) === 'number') { lats.push(lat) }
						if ( typeof(lng) === 'number') { lngs.push(lng) }
					}
				}
			}
		}

		latMin = Math.min.apply(null, lats)
		latMax = Math.max.apply(null, lats)
		lngMin = Math.min.apply(null, lngs)
		lngMax = Math.max.apply(null, lngs)

		latCenter = (latMax + latMin) / 2
		lngCenter = (lngMax + lngMin) / 2

		console.log('Lat: ' + latCenter)
		console.log('Lng: ' + lngCenter)

		//centerPoint = { lat: 40.4992144, lng: -105.05001105 }
		centerPoint = { lat: latCenter, lng: lngCenter }

		geoDefinition = {
			center: centerPoint
		}

		callback(null, geoDefinition)
	}
}
