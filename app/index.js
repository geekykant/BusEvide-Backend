const express = require("express");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to BusEvide API; By Paavam Devs.",
  });
});

const apiRouter = require("./api");
app.use("/v1", apiRouter);

var PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`BusEvide app running on port ${PORT}.`);
});
