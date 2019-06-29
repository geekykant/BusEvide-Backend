const Pool = require('pg').Pool
const pool = new Pool({
  user: 'sreekant',
  host: 'localhost',
  database: 'buses',
  password: '',
  port: 5432,
})

const getBuses = (req, res) => {
  pool.query('SELECT route_name from bus_list order by id ASC', (err, results) => {
    if (err) throw err
    var resultt = {};

    //To add into datbase table the arrivals list
    // for (var i = 0; i < results.rows.length; i++) {
    //   from_location = results.rows[i]["route_name"].split("-")[0].trim();
    //   to_location = results.rows[i]["route_name"].split("-")[1].trim();
    //   pool.query('UPDATE bus_list SET from_location=$1, to_location=$2 where id=$3;',
    //     [from_location, to_location, i + 1], (error, results) => {
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
  pool.query('SELECT * FROM bus_list WHERE id = $1', [id], (error, results) => {
    if (error) throw error
    response.status(200).json(results.rows)
  })
}

const getBusSuggestion = (req, res) => {
  console.log(`key: ${req.query.key}`)
  pool.query(`SELECT from_location from bus_list WHERE from_location like '` + req.query.key + `%'`, (err, results) => {
    if (err) throw err;
    var data = [];
    for (i = 0; i < results.rows.length; i++) {
      data.push(results.rows[i]["from_location"]);
    }
    res.end(JSON.stringify(data));
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
  getBusSuggestion
  // createUser,
  // updateUser,
  // deleteUser,
}
