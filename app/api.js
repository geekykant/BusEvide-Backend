const db = require("./queries");

var express = require("express");
var router = express.Router();

// API for App
router.get("/", (req, res) => {
  res.json({ message: "The version is V1. Started 2019." });
});
router.get("/from_buses", db.getAPIBusesFrom);
router.get("/bus_types", db.getAPIBusesTypes);
router.get("/bus_timings/:id", db.getAPIBusTimings);
router.get("/bus_btw_locations", db.getBusRoutes);
router.get("/helpline_nos", db.getHelplineNos);

router.get("/search", db.getBusSuggestion);
router.get("/bus_search_form", db.getBusRoutes);
router.get("/buses", db.getBuses);
router.get("/buses/:id", db.getBusDetails);

module.exports = router;
