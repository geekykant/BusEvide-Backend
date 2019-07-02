const Pool = require('pg').Pool
const pool = new Pool({
  user: 'sreekant',
  host: 'localhost',
  database: 'buses',
  password: '',
  port: 5432,
})


class Database {
  constructor() {
    this.connection = new Pool({
      user: 'sreekant',
      host: 'localhost',
      database: 'buses',
      password: '',
      port: 5432,
    });
  }
  query(sql, args) {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, args, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }
}

var database = new Database();

const getBuses = (req, res) => {
  pool.query('SELECT route_name,id from bus_list;', (err, results) => {
    if (err) throw err
    var resultt = {};

    // //To add into datbase table the arrivals list
    // for (var i = 0; i < results.rows.length; i++) {
    //   lenn = results.rows[i]["route_name"].split("-").length;
    //   from_location = results.rows[i]["route_name"].split("-")[0].trim();
    //   to_location = results.rows[i]["route_name"].split("-")[lenn - 1].trim();
    //
    //   console.log(`${from_location} : ${to_location} : ${i+1}`);
    //
    //   pool.query('UPDATE bus_list SET from_location=$1, to_location=$2 where id=$3;',
    //     [from_location, to_location, results.rows[i]["id"]], (error, results) => {
    //       if (error) throw error
    //     })
    // }

    // To count the destinations & arrivals
    // var count = {};
    // for(var i=0; i<results.rows.length; i++){
    //   // resultt[i+1] = results.rows[i]["route_name"].split("-")[0].trim();
    //   if(count[results.rows[i]["route_name"].split("-")[0].trim()] !== undefined){
    //     count[results.rows[i]["route_name"].split("-")[0].trim()] += 1
    //   }else {
    //     count[results.rows[i]["route_name"].split("-")[0].trim()]= 1
    //   }
    // }
    // res.status(200).json(count)

    res.status(200).json(results.rows)
  })
}

// const getUsers = (request, response) => {
//   pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {
//     if (error) throw error
//     response.status(200).json(results.rows)
//   })
// }
//
const getBusesById = (request, response) => {
  const id = parseInt(request.params.id)
  // pool.query('SELECT * FROM bus_list WHERE bus_code = $1', [id], (error, results) => {
  pool.query('SELECT * FROM bus_list WHERE bus_code = $1', [id], (error, results) => {
    if (error) throw error
    response.status(200).json(results.rows)
  })
}

const getBusSuggestion = (req, res) => {
  // console.log(`key: ${req.query.key}`)
  pool.query(`SELECT bus_stops from bus_locations WHERE upper(bus_stops) like '` + req.query.key.toUpperCase() + `%' order by upper(bus_stops) asc`, (err, results) => {
    if (err) throw err;
    var data = [];
    for (i = 0; i < results.rows.length; i++) {
      data.push(results.rows[i]["bus_stops"]);
    }
    res.end(JSON.stringify(data));
  })
}

var bus_timings = [];
var timings = {};

const getBusRoutes = (req, res) => {
  var to_location = req.query.to_location;
  var from_location = req.query.from_location;

  if (!to_location.length || !from_location.length) {
    res.status(404).send("Enter Both Locations!");
    return;
  }

  database.query(`select * from bus_list where upper(bus_route) like upper('%${from_location}%${to_location}%');`)
    .then(results => {
      var bus_rows = results.rows;

      var bus_timings = [];

      var promiseArryTo = [];
      var promiseArryFrom = [];
      for (var i = 0; i < bus_rows.length; i++) {
        promiseArryTo.push(database.query(`select stop_timing from route_${bus_rows[i]["bus_code"]} where upper(bus_stop) like upper('%${to_location}%');`));
        promiseArryFrom.push(database.query(`select stop_timing from route_${bus_rows[i]["bus_code"]} where upper(bus_stop) like upper('%${from_location}%');`));
      }

      var allPromises = [promiseArryFrom, promiseArryTo];
      Promise.all(allPromises)
        .then((result) => {
          Promise.all(result[0])
            .then((result1) => {
              for (var i = 0; i < bus_rows.length; i++) {
                timings = {};
                timings["from"] = result1[i].rows[0]["stop_timing"];
                bus_timings.push(timings);
              }
            })
            .then(() => {
              Promise.all(result[1])
                .then((result2) => {
                  for (var i = 0; i < bus_rows.length; i++) {
                    timings = {};
                    timings["to"] = result2[i].rows[0]["stop_timing"];

                    bus_timings[i]["to"] = timings["to"];
                  }
                })
                .then(() => {
                  res.send(bus_timings);
                })
                .catch((error) => {
                  console.log(error);
                });
            })
            .catch((error) => {
              console.log(error);
            });
        })
        .catch((error) => {
          console.log(error);
        });
    })
}

// API FOR App
const getAPIBusesFrom = (req, res) => {
  pool.query(`SELECT bus_stops from bus_locations order by upper(bus_stops) asc`, (err, results) => {
    if (err) throw err;
    var data = [];
    for (i = 0; i < results.rows.length; i++) {
      data.push(results.rows[i]["bus_stops"]);
    }
    res.end(JSON.stringify(data));
  })
}

const getAPIBusesTypes = (req, res) => {
  pool.query(`select distinct bus_type from bus_list order by bus_type asc;`, (err, results) => {
    if (err) throw err;
    var data = [];
    for (i = 0; i < results.rows.length; i++) {
      data.push(results.rows[i]["bus_type"].toUpperCase());
    }
    res.end(JSON.stringify(data));
  })
}

module.exports = {
  getBuses,
  getBusesById,
  getBusSuggestion,
  getBusRoutes,
  getAPIBusesFrom,
  getAPIBusesTypes,
}
