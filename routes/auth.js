const express = require("express");
const { body } = require("express-validator");
const User = require("../models/auth");
const authController = require("../controllers/auth");

const router = express.Router();

router.put(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter valid E-mail")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userData) => {
          if (userData) {
            return Promise.reject("E-mail has already been registred!");
          }
        });
      })
      .normalizeEmail(),
    body("password").trim().isLength({ min: 5 }),
    body("name").trim().not().isEmpty(),
  ],
  authController.signup
);

router.post("/signin", authController.singin);

module.exports = router;
