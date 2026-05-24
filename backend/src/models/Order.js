const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    name: String,
    image: String,
    price: Number,
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    items: {
      type: [orderItemSchema],
      validate: value => value.length > 0
    },
    shipping: {
      fullName: String,
      phone: String,
      city: String,
      address: String
    },
    subtotal: {
      type: Number,
      required: true
    },
    shippingFee: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "cancelled"],
      default: "pending"
    },
    payment: {
      provider: {
        type: String,
        default: "stripe"
      },
      mode: String,
      stripeSessionId: String,
      stripePaymentIntentId: String,
      transactionId: String,
      paymentUrl: String,
      rawCallback: Object
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
