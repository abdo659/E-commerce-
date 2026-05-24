const express = require("express");
const { createOrder, getOrder } = require("../controllers/order.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/:id", protect, getOrder);

module.exports = router;
