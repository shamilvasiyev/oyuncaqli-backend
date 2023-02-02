const HttpErrorHandler = require("../models/errorHandler");
const Blog = require("../models/blog");
const path = require("path");
const fs = require("fs");

exports.getAllBlogs = async (req, res, next) => {
  let allBlogs;

  try {
    allBlogs = await Blog.find();

    if (!allBlogs) {
      allBlogs = null;
    }
  } catch (err) {
    const error = new HttpErrorHandler("Blogs not found!", 500);
    return next(error);
  }

  res.status(200).set("Content-Range", allBlogs.length).json(allBlogs);
};

exports.getSimpleBlog = async (req, res, next) => {
  let blog;
  const bId = req.params.bId;

  try {
    blog = await Blog.findById(bId);
  } catch (err) {
    const error = new HttpErrorHandler("Blog not found!", 500);
    return next(error);
  }

  res.status(200).json(blog);
};

exports.createBlog = async (req, res, next) => {
  const { title, body, published_at } = req.body;
  const image = req.files.image[0].path.replace("\\", "/");

  const newBlog = new Blog({
    title,
    published_at,
    image: { imageUrl: image, alt: title },
    body,
  });

  try {
    newBlog.save();

    res.status(201).json({ data: newBlog });
  } catch (error) {
    const err = new HttpErrorHandler("Blog can not create!", 500);
    return next(err);
  }
};

exports.editSimpleBlog = async (req, res, next) => {
  let updatedBlog;
  const bId = req.params.bId;

  const { title, body } = req.body;

  try {
    updatedBlog = await Blog.findById(bId);
  } catch (err) {
    const error = new HttpErrorHandler("Blog not found!", 404);
    return next(error);
  }

  updatedBlog.title = title;
  updatedBlog.body = body;

  try {
    await updatedBlog.save();
  } catch (err) {
    const error = new HttpErrorHandler("Blog can not be updated!", 500);
    return next(error);
  } finally {
    const response = {
      id: updatedBlog._id,
      title: updatedBlog.title,
      body: updatedBlog.body,
    };

    res.status(200).json({ data: response });
  }
};

exports.deleteBlog = async (req, res, next) => {
  const bId = req.params.bId;
  let deletedBlog;

  Blog.findById(bId)
    .then((blog) => {
      if (!blog) {
        const error = new HttpErrorHandler("Blog not found!", 404);
        return next(error);
      }

      deletedBlog = blog;

      clearImage(blog?.image?.imageUrl);

      return Blog.findByIdAndDelete(bId);
    })
    .then(() => res.status(200).json({ data: deletedBlog }));
};

const clearImage = (filePath) => {
  const imagePath = path.join(__dirname, "..", filePath);
  fs.unlink(imagePath, (err) => console.log(err));
};
