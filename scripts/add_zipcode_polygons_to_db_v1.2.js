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
const JSONStream = require( "JSONStream" )
const mongoose = require('mongoose')

// Database config
const dbconfig = {
	host: "mongodb://localhost/",
	db: "zipcode_polygons",
	port: "27017"
}

// Connect to db
const db = dbconfig.host + dbconfig.db
mongoose.connect(db, { useNewUrlParser: true }, error => {
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
const Schema = mongoose.Schema
const ZipPolygonSchema = new Schema({
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
const ZipPolygon = mongoose.model('zipcodes', ZipPolygonSchema)

/*
 * Creating file read stream, parsing each JSON object, map to mongoose
 * model, save document to database.
 */
const zips = './data/zips.geojson'
const inputStream = fs.createReadStream( zips )
const transformStream = JSONStream.parse( '*' )

inputStream
	.pipe( transformStream )
	.on( 'data', data => {
		inputStream.pause()

		const zip = new ZipPolygon()
		zip.type = data.type
		zip.properties = data.properties
		zip.geometry = data.geometry

		zip.save( function(err) {
			if (err) { throw err }
		})

		inputStream.resume()
	})
	.on( 'end', () => {
		console.log('Entire file read.')
		console.log('Loaded into database.')
		process.exitCode = 0
	})
