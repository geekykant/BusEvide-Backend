require("dotenv").config();

const Pool = require("pg").Pool;
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 5432,
});
pool.connect();

pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

class Database {
  constructor() {
    this.connection = pool;
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
  pool.query("SELECT route_name,id from bus_list;", (err, results) => {
    if (err) throw err;
    res.status(200).json(results.rows);
  });
};

const getBusSuggestion = (req, res) => {
  // console.log(`key: ${req.query.key}`)
  pool.query(
    `SELECT bus_stops from bus_locations WHERE upper(bus_stops) like $1 order by upper(bus_stops) asc`,
    [req.query.key.toUpperCase() + "%"],
    (err, results) => {
      if (err) throw err;
      var data = [];
      for (i = 0; i < results.rows.length; i++) {
        data.push(results.rows[i]["bus_stops"]);
      }
      res.end(JSON.stringify(data));
    }
  );
};

const getBusRoutes = (req, res) => {
  var to_location = req.query.to_location;
  var from_location = req.query.from_location;

  if (!to_location.length || !from_location.length) {
    res.status(404).send("Enter Both Locations!");
    return;
  }

  database
    .query(
      "select * from bus_list where upper(bus_route) like upper($1) order by bus_code;",
      ["%" + from_location + "%" + to_location + "%"]
    )
    .then((results) => {
      var bus_rows = results.rows;

      if (bus_rows.length) {
        var bus_timings = [];

        var promiseArryTo = [];
        var promiseArryFrom = [];
        for (var i = 0; i < bus_rows.length; i++) {
          promiseArryTo.push(
            database.query(
              `select stop_timing from ${
                "route_" + bus_rows[i]["bus_code"]
              } where upper(bus_stop) like upper($1);`,
              ["%" + to_location + "%"]
            )
          );
          promiseArryFrom.push(
            database.query(
              `select stop_timing from ${
                "route_" + bus_rows[i]["bus_code"]
              } where upper(bus_stop) like upper($1);`,
              ["%" + from_location + "%"]
            )
          );
        }

        var allPromises = [promiseArryFrom, promiseArryTo];
        Promise.all(allPromises)
          .then((result) => {
            Promise.all(result[0])
              .then((result1) => {
                for (var i = 0; i < bus_rows.length; i++) {
                  timings = {};
                  timings["route_name"] = bus_rows[i]["route_name"];
                  timings["bus_type"] = bus_rows[i]["bus_type"];
                  timings["bus_type_code"] = bus_rows[i]["bus_type_code"];
                  timings["via_route"] = bus_rows[i]["via_route"];

                  timings["bus_code"] = bus_rows[i]["bus_code"];
                  timings["from_timing"] = result1[i].rows[0][
                    "stop_timing"
                  ].substring(0, 5);
                  bus_timings.push(timings);
                }
              })
              .then(() => {
                Promise.all(result[1])
                  .then((result2) => {
                    for (var i = 0; i < bus_rows.length; i++) {
                      bus_timings[i]["to_timing"] = result2[i].rows[0][
                        "stop_timing"
                      ].substring(0, 5);
                    }
                  })
                  .then(() => {
                    bus_timings.sort((a, b) => {
                      return a.from_timing.localeCompare(b.from_timing);
                    });
                    res.end(JSON.stringify(bus_timings));
                  })
                  .catch(errorCallback);
              })
              .catch(errorCallback);
          })
          .catch(errorCallback);
      } else {
        res.end("No buses found!");
      }
    });
};

// API FOR App
const getAPIBusesFrom = (req, res) => {
  pool.query(
    `SELECT bus_stops from bus_locations order by upper(bus_stops) asc`,
    (err, results) => {
      if (err) throw err;
      var data = [];
      for (i = 0; i < results.rows.length; i++) {
        data.push(results.rows[i]["bus_stops"]);
      }
      res.end(JSON.stringify(data));
    }
  );
};

const getAPIBusesTypes = (req, res) => {
  pool.query(
    `select distinct bus_type from bus_list order by bus_type asc;`,
    (err, results) => {
      if (err) throw err;
      var data = [];
      for (i = 0; i < results.rows.length; i++) {
        data.push(results.rows[i]["bus_type"].toUpperCase());
      }
      res.end(JSON.stringify(data));
    }
  );
};

const getAPIBusTimings = (req, res) => {
  if (req.params.id.length > 5) {
    res.end("You could do better!");
    return;
  }

  const bus_code = parseInt(req.params.id);

  pool.query(`SELECT * FROM route_${bus_code};`, (error, results) => {
    if (error) throw error;
    res.status(200).json(results.rows);
  });
};

const getBusDetails = (req, res) => {
  const id = parseInt(req.params.id);

  // pool.query('SELECT * FROM bus_list WHERE bus_code = $1', [id], (error, results) => {
  pool.query(
    "SELECT * FROM bus_list WHERE bus_code = $1",
    [id],
    (error, results) => {
      if (error) throw error;
      res.status(200).json(results.rows);
    }
  );
};

const getHelplineNos = (req, res) => {
  pool.query("SELECT * FROM helpline_nos;", (error, results) => {
    if (error) throw error;
    res.status(200).json(results.rows);
  });
};

const errorCallback = (error) => {
  console.log(`Error encountered!`);
  console.log(error);
};

module.exports = {
  getBuses,
  getBusSuggestion,
  getBusRoutes,
  getAPIBusesFrom,
  getAPIBusesTypes,
  getAPIBusTimings,
  getBusDetails,
  getHelplineNos,
};
