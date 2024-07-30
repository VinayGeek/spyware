const path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

exports.uploadFile = multer({
  storage,
  fileFilter: (req, file, cb) => {
    let allowInputArr = ["image/png", "image/jpg", "image/jpeg"];

    if (allowInputArr.includes(file.mimetype)) {
      cb(null, true);
    } else {
      let err = new Error(`Invalid FIle Type`);
      err.name = "INVALID_FILE_TYPE";
      return cb(err.message, false);
    }
  },
});
