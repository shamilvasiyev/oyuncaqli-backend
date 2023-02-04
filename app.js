const path = require("path");
const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const multer = require("multer");
const cors = require("cors");
const mongoose = require("mongoose");
const { v4 } = require("uuid");

require("dotenv").config();

const authRouter = require("./routes/auth");
const productRouter = require("./routes/product");
const blogRouter = require("./routes/blog");
const orderRouter = require("./routes/order");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images");
  },
  filename: function (req, file, cb) {
    cb(null, v4() + file.originalname);
  },
});

const filter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(bodyParser.json());
// app.use(express.urlencoded({ extended: true }));`
app.use(
  multer({ storage: storage, fileFilter: filter }).fields([
    { name: "images", maxCount: 10 },
    { name: "image", maxCount: 1 },
  ])
);

app.use("/images", express.static(path.join(__dirname, "images")));

const allowedOrigins = [
  process.env.ALLOWED_DOMAIN_ONE,
  process.env.ALLOWED_DOMAIN_TWO,
  process.env.ALLOWED_DOMAIN_THREE,
];

app.use(cors({ origin: allowedOrigins }));

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH,DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
  );
  res.setHeader("Access-Control-Expose-Headers", "Content-Range");
  next();
});

app.use("/products", productRouter);
app.use("/blogs", blogRouter);
app.use("/auth", authRouter);
app.use("/orders", orderRouter);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

app.use("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../var/www/oyuncaqli/index.html"));
});

mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("Connected!");
    app.listen(process.env.PORT);
  })
  .catch((err) => {
    console.log(err);
  });
