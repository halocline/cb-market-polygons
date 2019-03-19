// generateSignature.js
// by mattg@closetbox.me
// July 2016
//

const crypto = require('crypto')
const urlSafeBase64 = require('urlsafe-base64')

/*
 * Generate enterprise signature
 * 
 */

function generateSignature (privateKeyBase64, querystring, callback) {
	var privateKeyInBuffer = urlSafeBase64.decode(privateKeyBase64)  // Key is in url safe base 64, need buffer to use
	var hashInBuffer = crypto.createHmac('sha1', privateKeyInBuffer).update(querystring).digest()
	var hashEncodeWebSafe = urlSafeBase64.encode(hashInBuffer) // Making web friendly

	if (callback) {
		callback( { signature: hashEncodeWebSafe } )
	}
	else {
		return hashEncodeWebSafe
	}
}

exports.generateSignature = generateSignature