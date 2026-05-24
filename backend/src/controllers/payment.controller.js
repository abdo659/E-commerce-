const Stripe = require("stripe");
const Order = require("../models/Order");

function stripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is missing from backend/.env");
  }

  return Stripe(process.env.STRIPE_SECRET_KEY);
}

function frontendUrl(path) {
  const base = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "");
  return `${base}/${path.replace(/^\//, "")}`;
}

function currency() {
  return (process.env.CURRENCY || "EGP").toLowerCase();
}

function lineItemsForOrder(order) {
  const lines = order.items.map(item => ({
    quantity: item.quantity,
    price_data: {
      currency: currency(),
      unit_amount: Math.round(item.price * 100),
      product_data: {
        name: item.name,
        images: item.image ? [item.image] : []
      }
    }
  }));

  if (order.shippingFee > 0) {
    lines.push({
      quantity: 1,
      price_data: {
        currency: currency(),
        unit_amount: Math.round(order.shippingFee * 100),
        product_data: {
          name: "Shipping"
        }
      }
    });
  }

  return lines;
}

async function createCheckoutSession(req, res, next) {
  try {
    const { orderId } = req.body;
    const order = await Order.findOne({ _id: orderId, user: req.user._id });

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    if (order.status !== "pending") {
      return res.status(400).json({ message: "Payment can only start for pending orders." });
    }

    const stripe = stripeClient();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: req.user.email,
      client_reference_id: String(order._id),
      line_items: lineItemsForOrder(order),
      metadata: {
        orderId: String(order._id),
        userId: String(req.user._id)
      },
      payment_intent_data: {
        metadata: {
          orderId: String(order._id),
          userId: String(req.user._id)
        }
      },
      success_url: frontendUrl(`payment-result.html?provider=stripe&success=true&session_id={CHECKOUT_SESSION_ID}&orderId=${order._id}`),
      cancel_url: frontendUrl(`payment-result.html?provider=stripe&success=false&orderId=${order._id}`)
    });

    order.payment.provider = "stripe";
    order.payment.mode = "sandbox";
    order.payment.stripeSessionId = session.id;
    order.payment.paymentUrl = session.url;
    await order.save();

    res.json({
      provider: "stripe",
      paymentUrl: session.url,
      sessionId: session.id
    });
  } catch (error) {
    next(error);
  }
}

async function confirmCheckoutSession(req, res, next) {
  try {
    const { sessionId, orderId } = req.body;

    if (!sessionId || !orderId) {
      return res.status(400).json({ message: "sessionId and orderId are required." });
    }

    const order = await Order.findOne({ _id: orderId, user: req.user._id });

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    const stripe = stripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.client_reference_id !== String(order._id)) {
      return res.status(400).json({ message: "Stripe session does not match this order." });
    }

    order.payment.provider = "stripe";
    order.payment.stripeSessionId = session.id;
    order.payment.stripePaymentIntentId = typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;
    order.payment.rawCallback = {
      payment_status: session.payment_status,
      status: session.status
    };

    if (session.payment_status === "paid") {
      order.status = "paid";
    } else if (session.status === "expired") {
      order.status = "failed";
    }

    await order.save();

    res.json({
      order,
      stripeStatus: session.status,
      paymentStatus: session.payment_status
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { createCheckoutSession, confirmCheckoutSession };
