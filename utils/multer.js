const multer = require("multer");
const { v4 } = require("uuid");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images");
  },
  filename: function (req, file, cb) {
    cb(null, v4() + file.originalname);
  },
});

const store = multer({
  storage: storage,
});

// // set storage
// let storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads");
//   },
//   filename: function (req, file, cb) {
//     let ext = file.originalname.substr(file.originalname.lastIndexOf("."));

//     cb(null, file.fieldname + "-" + Date.now() + ext);
//   },
// });

// module.exports = store = multer({ storage: storage });
module.exports = store;
