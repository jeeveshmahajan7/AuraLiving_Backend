const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  discountPercent: {
    type: Number,
  },
  rating: {
    type: Number,
    required: true,
  },
  sizeAvailable: [
    {
      type: String,
      required: true,
      enum: ["S", "M", "L"]
    },
  ],
  imgUrl: {
    type: String,
    required: true,
  },
  description: [
    {
      type: String,
      required: true,
    },
  ],
  category: {
    type: String,
    enum: ["Furniture", "Lamp", "Vase", "Wall Art", "Plant"],
  },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
