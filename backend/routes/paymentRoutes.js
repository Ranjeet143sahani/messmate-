const express = require("express");
const Razorpay = require("razorpay");
const Order = require("../models/Order");
const authMiddleware = require("../middleware/authMiddleware");
const crypto = require("crypto");

const router = express.Router();

// Initialize Razorpay
const rzp = new Razorpay({
  key_id: "rzp_test_4g9ABCD123EFGH", // Test key - replace with yours
  key_secret: "o7KzBxyEFGHIJKL567MNOP8QR", // Test secret - replace with yours
});

// Create Razorpay order
router.post("/create-order", authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({ message: "Order already paid" });
    }

    // Create Razorpay order
    const razorpayOrder = await rzp.orders.create({
      amount: Math.round(order.totalAmount * 100), // paisa
      currency: "INR",
      receipt: `order_${order._id}`,
      notes: {
        orderId: order._id.toString(),
        userId: req.user.id
      }
    });

    res.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: "rzp_test_4g9ABCD123EFGH" // Test key
    });
  } catch (err) {
    console.error("Razorpay order error:", err);
    res.status(500).json({ message: "Error creating order", error: err.message });
  }
});

// Verify payment
router.post("/verify-payment", authMiddleware, async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

    // Verify signature
    const sign = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (expectedSign === razorpaySignature) {
      // Update order
      const order = await Order.findById(orderId);
      order.paymentStatus = "paid";
      order.paymentMethod = "razorpay";
      order.paymentIntentId = razorpayPaymentId;
      order.paidAt = new Date();
      order.status = "Confirmed";
      await order.save();

      res.json({ success: true, message: "Payment verified successfully", order });
    } else {
      res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (err) {
    console.error("Payment verification error:", err);
    res.status(500).json({ message: "Verification failed", error: err.message });
  }
});

// NEW: Cash on Delivery
router.post("/cod", authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({ message: "Order already paid" });
    }

    // Process COD - immediate confirmation
    order.paymentStatus = "paid";
    order.paymentMethod = "cod";
    order.paidAt = new Date();
    order.status = "Confirmed";
    await order.save();

    res.json({ 
      success: true, 
      message: "COD order confirmed! Payment will be collected on delivery.", 
      order 
    });
  } catch (err) {
    console.error("COD error:", err);
    res.status(500).json({ message: "COD processing failed", error: err.message });
  }
});

// Get payment status
router.get("/status/:orderId", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order || order.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    res.json({
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
      status: order.status,
      paidAt: order.paidAt
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

