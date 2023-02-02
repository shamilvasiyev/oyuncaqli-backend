const express = require("express");
const { body } = require("express-validator");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

const feedController = require("../controllers/feed");

router.get("/posts", isAuth, feedController.feed);

router.post(
  "/post",
  isAuth,
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  feedController.addNewPost
);

router.get("/post/:postId", isAuth, feedController.getSinglePost);

router.put(
  "/post/:postId",
  isAuth,
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  feedController.editPost
);

router.delete("/post/:postId", isAuth, feedController.deletePost);

module.exports = router;
