const express = require("express");
const blogController = require("../controllers/blog");
// const store = require("../utils/multer");

const router = express.Router();

// Admin Side

router.get("/", blogController.getAllBlogs);

router.get("/:bId", blogController.getSimpleBlog);

router.post("/", blogController.createBlog);

router.put("/:bId", blogController.editSimpleBlog);

router.delete("/:bId", blogController.deleteBlog);

module.exports = router;
