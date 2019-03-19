//	polygons.js
//	by mattg@closetbox.me
//	August 2016
//

const mongoose = require('mongoose')

var dbconfig = {
	//host: "mongodb://localhost/",
	host: "mongodb+srv://mg-app:global@mg-ventures-dev-ctccg.gcp.mongodb.net/",
	db: "zipcode_polygons",
	port: "27017"
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
		console.log('Database at: ' + dbconfig.port)
	}
})

// Mongoose schema and model definition
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


module.exports = {
	generateZipPolygons: function(zips, callback) {
		// Query definition to find all polygons objects where zipcode is found by
		// the GEOID10
		var query = { "properties.GEOID10" : { $in: zips } }

		// Find and return all objects satisfying query
		ZipPolygon.find(query, function(err, docs) {
			if (err) {
				var error = {
					msg: "Something went wrong...",
					error: err
				}
				callback(error, null)
				return
			}
			callback(null, docs)
		})

	}
}
