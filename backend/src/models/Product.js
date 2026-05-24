const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    brand: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    oldPrice: {
      type: Number,
      default: null
    },
    image: {
      type: String,
      required: true
    },
    gallery: [String],
    category: {
      type: String,
      required: true
    },
    stock: {
      type: Number,
      default: 10
    },
    featured: {
      type: Boolean,
      default: false
    },
    specs: [String]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
