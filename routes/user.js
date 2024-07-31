const router = require("express").Router();

const { createUser, createMoment, getAllImages, deleteImages } = require("../controller/user");
const { uploadFile } = require("../utils/multer");

router.post("/addData", createUser);
router.post("/addImage", uploadFile.single("image"), createMoment);
router.get("/getImage", getAllImages);
router.post("/deleteImage", deleteImages);

module.exports = router;
