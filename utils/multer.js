const multer = require("multer");

const storage = multer.memoryStorage();

exports.uploadFile = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowInputArr = [
      "image/png",
      "image/jpg",
      "image/jpeg",
      "image/gif",
      "image/webp",
    ];

    if (allowInputArr.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const err = new Error("Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.");
      err.name = "INVALID_FILE_TYPE";
      err.status = 400;
      return cb(err, false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
});
