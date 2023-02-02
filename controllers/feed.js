const { validationResult } = require("express-validator");
const Post = require("../models/post");
const fs = require("fs");
const path = require("path");
const User = require("../models/auth");

exports.feed = (req, res, next) => {
  const currerntPage = req.query.page || 1;
  const postPerPage = 2;
  let totalPosts;
  Post.find()
    .countDocuments()
    .then((count) => {
      totalPosts = count;
      return Post.find()
        .populate("creator")
        .skip((currerntPage - 1) * postPerPage)
        .limit(postPerPage);
    })
    .then((posts) => {
      console.log(posts);
      res.status(200).json({
        message: "All posts fetched succesfully!",
        posts: posts,
        totalItems: totalPosts,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.addNewPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation error");
    error.statusCode = 422;
    throw error;
  }
  if (!req.file) {
    const err = new Error("Image hasn't chosen!");
    err.status = 422;
    throw err;
  }

  const imageUrl = req.file.path.replace("\\", "/");
  const title = req.body.title;
  const content = req.body.content;

  let creator;
  const post = new Post({
    title: title,
    imageUrl: imageUrl,
    content: content,
    creator: req.userId,
  });

  post
    .save()
    .then((result) => {
      return User.findById(req.userId);
    })
    .then((user) => {
      creator = user;
      user.posts.push(post);
      return user.save();
    })
    .then(() => {
      res.status(201).json({
        message: "New post has been created!",
        post: post,
        creator: { _id: creator._id, name: creator.name },
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getSinglePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Post didn't find");
        error.statusCode = 404;
        throw error;
      }

      res.status(200).json({
        message: "Post fetched!",
        post: post,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.editPost = (req, res, next) => {
  const postId = req.params.postId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation error");
    error.statusCode = 422;
    throw error;
  }
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;

  if (req.file) {
    imageUrl = req.file.path.replace("\\", "/");
  }
  if (!imageUrl) {
    const err = new Error("Image not found");
    err.status(422);
    throw err;
  }

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const err = new Error("Post not found!");
        err.status = 422;
        throw err;
      }
      if (post.creator.toString() !== req.userId) {
        const err = new Error("You can't edit this post");
        err.statusCode = 403;
        throw err;
      }
      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }
      post.title = title;
      post.content = content;
      post.imageUrl = imageUrl;
      return post.save();
    })
    .then((result) => {
      res.status(200).json({ message: "Post updated!", post: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Post didn't find");
        error.statusCode = 404;
        throw error;
      }
      if (post.creator.toString() !== req.userId) {
        const err = new Error("You can't delete this post");
        err.statusCode = 403;
        throw err;
      }
      clearImage(post.imageUrl);
      return Post.findByIdAndRemove(postId);
    })
    .then(() => {
      return User.findById(req.userId);
    })
    .then((user) => {
      user.posts.pull(postId);
      return user.save();
    })
    .then(() => {
      res.status(200).json({ message: "Post deleted!" });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => console.log(err));
};
