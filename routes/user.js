const router = require("express").Router();

const { createUser, createMoment } = require("../controller/user");
const { uploadFile } = require("../utils/multer");

router.post("/addData", createUser);
router.post("/addImage", uploadFile.single("image"), createMoment);

module.exports = router;
