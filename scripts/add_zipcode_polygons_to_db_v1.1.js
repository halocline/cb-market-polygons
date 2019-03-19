// add_zipcode_polygons_to_db.js
// Only used in getting project setup. Script reads GeoJSON file and load into a
// mongodb collection.
// by mdglissmann@gmail.com
// August 2016

/*
 * Populates a mongodb with GeoJSON data.
 * Reads GeoJSON file from filesystem,
 * maps each document to database document model,
 * then saves document to database.
 */

const fs = require('fs')
const util = require('util')
const stream = require('stream')
const es = require('event-stream')
const mongoose = require('mongoose')
const assert = require('assert')

// Database config
var dbconfig = {
	host: "mongodb://localhost/",
	db: "zipcode_polygons"
}

// Connect to db
var db = dbconfig.host + dbconfig.db
mongoose.connect(db, function (error) {
	if (error) {
		console.log(error)
		console.log('Mongoose connection failed. Process exiting...')
		process.exit()
	}
	else {
		console.log('Successfully connected to ' + db + ' database.')
	}
})

// Mongoose schema and model
var Schema = mongoose.Schema
var ZipPolygonSchema = new Schema({
	type: String,
	properties: {
		ZCTA5CE10: String,
		GEOID10: String,
		CLASSFP10: String,
		MTFCC10: String,
		FUNCSTAT10: String,
		ALAND10: Number,
		AWATER10: Number,
		INTPTLAT10: String,
		INTPTLON10: String
	},
	geometry: Schema.Types.Mixed
})
var ZipPolygon = mongoose.model('zipcodes', ZipPolygonSchema)


// Read geoJSON and load into db
/*
*	File sourced from 2014 US Census tl_2014_us_zcta510.zip.
*	Used the following to convert shapefile into geojson:
*	1) $ brew install gdal
*	2) unzip to [your directory]
*	3) $ cd [your directory]
*	4) $ ogr2ogr -f GeoJSON -t_srs $ crs:84 [name].geojson [name].shp
*/

//var data = fs.readFileSync('./data/geojson_zips_sample.json')
//var data = fs.readFileSync('./data/geojson_zips.json')
var lineNr = 0
var data = 0
var datalength = 0
var chunks = []
var count = 0
//var dataFile = './data/geojson_zips.json'
//var dataFile = './data/zips.geojson'
var dataFile = './data/zips_sample.json'

console.log(lineNr)

var s = fs.createReadStream(dataFile)
	.pipe( es.split() )
	.pipe( es.mapSync( function(line){
		s.pause()

		count++
		line = line.replace(/,\s*$/, "")
		line = JSON.parse(line)
		var zip = new ZipPolygon()
		zip.type = line.type
		zip.properties = line.properties
		zip.geometry = line.geometry
		//console.log(zip)

		zip.save( function(err) {
			if (err) { throw err }
			console.log('Zipcode polygon created.')
		})
		s.resume()
	})
	.on('end', function() {
		console.log('Entire file read.')
		console.log(count)
		console.log('Loading into database...')
	})
)
