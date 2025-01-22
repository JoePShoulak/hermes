const router = require("express").Router();
const apiRoutes = require("./api");

router.use("/api", apiRoutes);

router.use((req, res) => {
  console.log("Error with route:", req.url);
  res.send("<h1>Wrong Route!</h1>");
});

module.exports = router;
