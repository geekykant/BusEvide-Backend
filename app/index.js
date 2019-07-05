const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const db = require('./queries')

var path = require('path');
app.set('views', path.join(__dirname, '/templates'));
app.set('view engine', 'ejs');

app.use(express.static('app/static'));

PORT = process.env.PORT || 8080

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true,
}))

//about
app.get('/bus_routes', function(req, res) {
  res.render('home/index');
  // res.render('404');
});

app.get('/', (request, response) => {
  response.json({
    info: 'Node.js, Express, and Postgres API'
  })
})

// API for App
app.get('/from_buses', db.getAPIBusesFrom)
app.get('/bus_types', db.getAPIBusesTypes)
app.get('/bus_timings/:id', db.getAPIBusTimings)
app.get('/bus_btw_locations', db.getBusRoutes)
app.get('/helpline_nos', db.getHelplineNos)

app.get('/search', db.getBusSuggestion)
app.get('/bus_search_form', db.getBusRoutes)
app.get('/buses', db.getBuses)
app.get('/buses/:id', db.getBusDetails)


app.listen(PORT, () => {
  console.log(`App running on port ${PORT}.`)
})
