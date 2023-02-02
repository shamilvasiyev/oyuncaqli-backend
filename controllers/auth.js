const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/auth");

exports.signup = (req, res, next) => {
  const { name, password } = req.body;

  bcrypt
    .hash(password, 12)
    .then((hashPass) => {
      const user = new User({
        name: name,
        password: hashPass,
      });
      return user.save();
    })
    .then((result) => {
      console.log(result);
      res.status(201).json({ message: "Admin  created!" });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.singin = (req, res, next) => {
  const { username, password } = req.body;

  let userInfo;
  User.findOne({ username: username })
    .then((user) => {
      if (!user) {
        const err = new Error("User couldn't find. Please try again.");
        err.status = 401;
        throw err;
      }
      userInfo = user;
      return bcrypt.compare(password, user.password);
    })
    .then((isValid) => {
      if (!isValid) {
        const err = new Error("Password is invalid!");
        err.status = 401;
        throw err;
      }
      const token = jwt.sign(
        {
          username: userInfo.username,
          userId: userInfo._id.toString(),
        },
        process.env.SECRET_KEY,
        { expiresIn: "1h" }
      );
      res.status(200).json({ token });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
