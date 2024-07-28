const router = require("express").Router();

const { createUser } = require("../controller/user");

router.post("/addData", createUser);

module.exports = router;
