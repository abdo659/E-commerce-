const express = require("express");
const {
  createCheckoutSession,
  confirmCheckoutSession
} = require("../controllers/payment.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/create-checkout-session", protect, createCheckoutSession);
router.post("/confirm-session", protect, confirmCheckoutSession);

module.exports = router;
