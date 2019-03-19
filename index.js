// market-polygons index.js
// Proof of concept for generating market polygons and displaying via Google
// Maps API
// by mdglissmann@gmail.com
// August 2016

const express = require('express')
const request = require('request')
const path = require('path')
const exphbs = require('express-handlebars')
const app = express()
const port = 3000
const routes = require('./routes/index.js')

/*
 * Configuring express
 */
app.use( express.static(__dirname + '/public') )

// Setting Handlebars as view engine
app.engine('.hbs', exphbs(
	{
		defaultLayout: 'main',
		extname: '.hbs',
		layoutsDir: path.join(__dirname, 'views/layouts')
	}
))
app.set('view engine', '.hbs')
app.set('views', path.join(__dirname, 'views') )

// Logging requests
app.use( function (req, res, next) {
	//console.log(req.headers)
	console.log('Method:', req.method)
	console.log('Url:', req.url)
	console.log('BaseUrl:', req.baseUrl)
  console.log('OriginalUrl:', req.originalUrl)
	console.log('Query:', req.query)
	console.log('Params:', req.params)
	console.log('Referer:', req.headers.referer)
	next()
})

app.use( function (err, req, res, next) {
	console.log('Error: ', err)
	res.status(500).send('Something is not working... Error: ' + err)
})

/*
 * Routes
 */
app.use('/', routes)

/*
 * Start app server
 */
app.listen(port, function (err) {
	if (err) {
		return console.log('App listening error. Error: ', err)
	}
	console.log('Express server is listening on ' + port)
})
