// markets.js
// Markets Module: Contains database connection, model & controllers for markets

const mongoose = require('mongoose')

/*
 * Database config. This database contains market definitions (i.e. service
 * areas) which are defined by the zipcodes which compose the market.
 */
const dbconfig = {
	//host: "mongodb://localhost/",
	host: "mongodb+srv://mg-app:global@mg-ventures-dev-ctccg.gcp.mongodb.net/",
	db: "cb-api",
	port: "27017"
}

/*
 * Establish database connection
 */
const db = dbconfig.host + dbconfig.db
mongoose.connect(db, { useNewUrlParser: true }, function (error) {
	if (error) {
		console.log('Mongoose connnect error:', error)
		console.log('Mongoose connection failed. Process exiting...')
		process.exit()
	}
	else {
		console.log('Successfully connected to ' + db + ' database.')
		console.log('Database at: ' + dbconfig.port)
	}
})

/*
 * Defining market schema
 */
const Schema = mongoose.Schema
const MarketSchema = new Schema({
	name: String,
	serviceablePostalCodes: [],
	shortName: String,
	warehouseLocations: []
})
const Market = mongoose.model('markets', MarketSchema)

/*
 *** Exports ***
 */
module.exports = {
	list: function (req, res, next) {
		Market.find({}, function (err, docs) {
			res.render('layouts/markets', { markets: docs } )
		})
	},
	get: function (market_id, callback) {
		Market.find( { _id: market_id }, function (err, docs) {
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
	},
	zips: function (market_id, callback) {
		Market.find( {_id: market_id}, function (err, data) {
			if (err) {
				console.log('Error: ' + err)
				return err
			}

			if (data === null) {
				console.error("Could not find Market with id = " + market_id)
				return data
			} else {
				//console.log(data)
			}

			callback(null, data)
		})
	}
}
