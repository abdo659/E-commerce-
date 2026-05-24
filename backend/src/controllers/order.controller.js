const Order = require("../models/Order");
const Product = require("../models/Product");

async function createOrder(req, res, next) {
  try {
    const { items, shipping } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Cart cannot be empty." });
    }

    const productIds = items.map(item => item.product);
    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length !== items.length) {
      return res.status(400).json({ message: "Some products are not available." });
    }

    const orderItems = items.map(item => {
      const product = products.find(p => String(p._id) === String(item.product));
      return {
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: Number(item.quantity || 1)
      };
    });

    const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingFee = subtotal >= 30000 ? 0 : 120;
    const total = subtotal + shippingFee;

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shipping,
      subtotal,
      shippingFee,
      total
    });

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
}

async function getOrder(req, res, next) {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
}

module.exports = { createOrder, getOrder };
