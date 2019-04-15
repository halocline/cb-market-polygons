// google maps api config.js
//
//
//

var enterpriseConfig = {
	google_client_id: process.env.GOOGLE_CLIENT_ID,
	google_private_crypto_key: process.env.GOOGLE_PRIVATE_CRYPTO_KEY
}

var developmentConfig = {
	google_api_key: process.env.GOOGLE_API_KEY
}

//exports.enterpriseConfig = enterpriseConfig

module.exports = {
	enterpriseConfig: enterpriseConfig,
	developmentConfig: developmentConfig
}
