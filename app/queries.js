const Pool = require('pg').Pool
const pool = new Pool({
  user: 'sreekant',
  host: 'localhost',
  database: 'buses',
  password: '',
  port: 5432,
})

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

// function delay() {
//   return new Promise(resolve => setTimeout(resolve, 300));
// }

var bus_timings = [];
var timings = {};

const getBusRoutes = (req, res) => {
  var to_location = req.query.to_location;
  var from_location = req.query.from_location;

  if (!to_location.length || !from_location.length) {
    res.status(404).send("Enter Both Locations!");
    return;
  }

  async function delayedLog(item) {
    // notice that we can await a function
    // that returns a promise
    await get_timings(item, to_location, from_location);
    // console.log(item);
  }

  function get_timings(item, to_location, from_location) {
    pool.query(`select stop_timing from route_${item["bus_code"]} where upper(bus_stop) like upper('%${to_location}%');`, (err2, values) => {
      if (err2) throw err2;
      timings["from"] = values.rows[0]["stop_timing"];
      bus_timings.push(timings["from"]);
      // console.log(values.rows[0]["stop_timing"]);
    })
    pool.query(`select stop_timing from route_${item["bus_code"]} where upper(bus_stop) like upper('%${from_location}%');`, (err2, values) => {
      if (err2) throw err2;
      timings["to"] = values.rows[0]["stop_timing"];
      bus_timings.push(timings["to"]);
      // console.log(values.rows[0]["stop_timing"]);
    })

    console.log(bus_timings);
    return bus_timings;
  }

  pool.query(`select * from bus_list where upper(bus_route) like upper('%${to_location}%${from_location}%');`, (err1, results) => {
    if (err1) throw err1;
    var bus_rows = results.rows;

    if (bus_rows.length) {
      bus_timings = [];
      timings = {};

      bus_rows.forEach(async (item, to_location, from_location) => {
        await delayedLog(item, to_location, from_location);
      })

      console.log('Done!');
      res.send('Done!');

      processArray(bus_rows);

      // var timings = {};
      //
      // new Promise((resolve, reject) => {
      //   resolve(get_timings(bus_rows, to_location, from_location));
      // }).then((value) => {
      //   console.log(value);
      //   res.status(200).json(results.rows);
      //   // expected output: "foo"
      // });

      // async function processArray(array) {
      //   // map array to promises
      //   const promises = array.map(delayedLog);
      //   // wait until all promises are resolved
      //   await Promise.all(promises);
      //   console.log('Done!');
      // }

      // for (var i = 0; i < results.rows.length; i++) {
      //   pool.query(`select stop_timing from route_${results.rows[i]["bus_code"]} where upper(bus_stop) like upper('%${to_location}%');`, (err2, values) => {
      //     if (err2) throw err2;
      //     timings["from"] = values.rows[0]["stop_timing"];
      //     // console.log(values.rows[0]["stop_timing"]);
      //   })
      //   pool.query(`select stop_timing from route_${results.rows[i]["bus_code"]} where upper(bus_stop) like upper('%${from_location}%');`, (err2, values) => {
      //     if (err2) throw err2;
      //     timings["to"] = values.rows[0]["stop_timing"];
      //     // console.log(values.rows[0]["stop_timing"]);
      //   })
      //   break;
      // }

      // console.log(timings);
    } else {
      res.status(404).send("No buses found!");
    }
    // res.status(200).send(`${results.rows.length} buses found!`)
    // res.status(200).json(results.rows[0])
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
  // createUser,
  // updateUser,
  // deleteUser,
}
