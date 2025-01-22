const router = require("express").Router();
const powerRoutes = require("./power");

router.use("/power", powerRoutes);
module.exports = router;
