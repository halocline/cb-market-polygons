// google maps api index.js
// by mdglissmann@gmail.com
// July 2016
//

const request = require('request')
var config = require('./config.js')
var generateSignature = require('./generateSignature.js').generateSignature

var domain = 'https://maps.googleapis.com'

module.exports = {
	config: require('./config.js'),
	generateSignature: require('./generateSignature.js'),
	geocode: function (geocodeParams, callback) {
		var geocode_api = '/maps/api/geocode/json?'
		var path = geocode_api + 'address=' + geocodeParams.address
			+ '&client=' + config.enterpriseConfig.google_client_id
		var signature = generateSignature(
			config.enterpriseConfig.google_private_crypto_key,
			path
		)
		//var url = domain + path + '&signature=' + signature
		var url = domain +
							geocode_api +
							'address=' +
							geocodeParams.address +
							'&key=' + process.env.GOOGLE_API_KEY

		console.log(url);
		request(url, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				var json = JSON.parse(response.body)
				console.log(json)
				callback(null, json)
			} else {
				console.log(error, response)
				callback(error, response)
			}
		})
	}
}
