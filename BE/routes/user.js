const router = require("express").Router();
const {
  saveLogin,
  saveUser,
  saveImages,
  getAllImages,
  getImage,
} = require("../controller/user");

router.post("/login", saveLogin);
router.post("/getMe", saveUser);
router.post("/addImage", saveImages);
router.get("/get-all-images", getAllImages);
router.get("/get-image/:imageId", getImage);

module.exports = router;
