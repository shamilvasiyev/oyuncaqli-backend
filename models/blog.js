const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const blogSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  published_at: { type: String, required: true },
  image: {
    imageUrl: { type: String, required: true },
    alt: { type: String, required: true },
  },
  body: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Blog", blogSchema);
