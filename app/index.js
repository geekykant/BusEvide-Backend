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
app.get('/api/from_buses', db.getAPIBusesFrom)
app.get('/api/bus_types', db.getAPIBusesTypes)

app.get('/search', db.getBusSuggestion)
app.get('/bus_search_form', db.getBusRoutes)

app.get('/buses', db.getBuses)
app.get('/buses/:id', db.getBusesById)
// app.post('/users', db.createUser)
// app.put('/users/:id', db.updateUser)
// app.delete('/users/:id', db.deleteUser)

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}.`)
})
