const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      quantity: Number,
      selectedSize: {
        type: String,
        enum: ["S", "M", "L"],
      },
    },
  ],
  totalPrice: {
    type: Number,
    required: true,
  },
  address: {
    name: String,
    street: String,
    city: String,
    state: String,
    zip: Number,
    phone: Number,
  },
  status: {
    type: String,
    enum: ["Pending", "Shipped", "Delivered"],
    default: "Pending",
  },
  orderedAt: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
