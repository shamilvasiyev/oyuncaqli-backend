const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  age: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  onSalePrice: {
    type: Number,
  },
  images: [
    {
      imageUrl: { type: String, required: true },
      alt: { type: String, required: true },
    },
  ],
  newArrival: {
    type: Boolean,
  },
  onStock: {
    type: Boolean,
  },
});

module.exports = mongoose.model("Product", productSchema);
