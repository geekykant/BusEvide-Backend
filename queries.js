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

const getBusRoutes = (req, res) => {
  var to_location = req.query.to_location;
  var from_location = req.query.from_location;

  if (!to_location.length || !from_location.length) {
    res.status(404).send("Enter Both Locations!");
    return;
  }

  pool.query(`select * from bus_list where upper(bus_route) like upper('%${to_location}%') AND upper(bus_route) like upper('%${from_location}%');`, (err, results) => {
    if (err) throw err;
    if (results.rows.length) {
      pool.query(`select * from route_${results.rows[0]["bus_code"]};`, (err, results1) => {
        if (err) throw err;
        res.status(200).json(results1.rows)
      })
    }else{
      res.status(404).send("No buses found!");
    }
    // res.status(200).send(`${results.rows.length} buses found!`)
    // res.status(200).json(results.rows[0])
  })
}

// const updateUser = (request, response) => {
//   const id = parseInt(request.params.id)
//   const { name, email } = request.body
//   pool.query(
//     'UPDATE users SET name = $1, email = $2 WHERE id = $3',
//     [name, email, id],
//     (error, results) => {
//       if (error) throw error
//       response.status(200).send(`User modified with ID: ${id}`)
//     }
//   )
// }

// const deleteUser = (request, response) => {
//   const id = parseInt(request.params.id)
//   pool.query('DELETE FROM users WHERE id = $1', [id], (error, results) => {
//     if (error) throw error
//     response.status(200).send(`User deleted with ID: ${id}`)
//   })
// }

module.exports = {
  getBuses,
  getBusesById,
  getBusSuggestion,
  getBusRoutes,
  getAPIBusesFrom,
  // createUser,
  // updateUser,
  // deleteUser,
}
