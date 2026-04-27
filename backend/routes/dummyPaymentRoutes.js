const express = require("express");
const Order = require("../models/Order");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Simulate payment processing delay
const simulateDelay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Create a dummy payment session
router.post("/create-payment-session", authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.body;

    // Find the order
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Verify that the order belongs to the user
    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to pay for this order" });
    }

    // Check if already paid
    if (order.paymentStatus === "paid") {
      return res.status(400).json({ message: "Order is already paid" });
    }

    // Create a dummy payment session
    const sessionId = "dummy_session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    
    res.json({
      sessionId,
      orderId: order._id,
      amount: order.totalAmount,
      currency: "INR",
      status: "pending",
      message: "Payment session created. Use dummy card details to complete payment."
    });
  } catch (err) {
    console.error("Payment session error:", err);
    res.status(500).json({ message: "Error creating payment session", error: err.message });
  }
});

// Process dummy payment
router.post("/process-payment", authMiddleware, async (req, res) => {
  try {
    const { orderId, cardDetails } = req.body;

    // Validate card details
    if (!cardDetails) {
      return res.status(400).json({ message: "Card details are required" });
    }

    const { cardNumber, expiryDate, cvv, cardHolderName } = cardDetails;

    if (!cardNumber || !expiryDate || !cvv || !cardHolderName) {
      return res.status(400).json({ message: "All card details are required" });
    }

    // Validate card number (basic check - should be 16 digits)
    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    if (cleanCardNumber.length !== 16 || !/^\d+$/.test(cleanCardNumber)) {
      return res.status(400).json({ message: "Invalid card number" });
    }

    // Validate expiry date (MM/YY format)
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expiryRegex.test(expiryDate)) {
      return res.status(400).json({ message: "Invalid expiry date format (use MM/YY)" });
    }

    // Validate CVV (should be 3 or 4 digits)
    if (!/^\d{3,4}$/.test(cvv)) {
      return res.status(400).json({ message: "Invalid CVV" });
    }

    // Find the order
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Verify that the order belongs to the user
    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to pay for this order" });
    }

    // Check if already paid
    if (order.paymentStatus === "paid") {
      return res.status(400).json({ message: "Order is already paid" });
    }

    // Simulate payment processing delay (1-2 seconds)
    await simulateDelay(1000 + Math.random() * 1000);

    // Check for specific test card numbers
    const isTestCard = cleanCardNumber.startsWith("4000000000000002") || 
                       cleanCardNumber.startsWith("4242424242424242") ||
                       cleanCardNumber.startsWith("5555555555554444");

    // Check for failure test card (card ending in 0000)
    const isFailureCard = cleanCardNumber.endsWith("0000");

    let paymentStatus;
    let message;

    if (isFailureCard) {
      // Simulate payment failure for test card ending in 0000
      paymentStatus = "failed";
      message = "Payment declined. Please try a different card.";
    } else {
      // Simulate successful payment
      paymentStatus = "succeeded";
      message = "Payment successful!";
    }

    if (paymentStatus === "succeeded") {
      // Update order with payment details
      order.paymentStatus = "paid";
      order.paymentMethod = "card";
      order.paidAt = new Date();
      order.status = "Confirmed";
      order.paymentIntentId = "dummy_pi_" + Date.now();
      await order.save();

      res.json({
        success: true,
        message,
        order: {
          _id: order._id,
          paymentStatus: order.paymentStatus,
          status: order.status,
          totalAmount: order.totalAmount,
          paidAt: order.paidAt
        }
      });
    } else {
      // Payment failed
      order.paymentStatus = "failed";
      await order.save();

      res.json({
        success: false,
        message,
        order: {
          _id: order._id,
          paymentStatus: order.paymentStatus
        }
      });
    }
  } catch (err) {
    console.error("Payment processing error:", err);
    res.status(500).json({ message: "Error processing payment", error: err.message });
  }
});

// Get payment status
router.get("/status/:orderId", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Verify that the order belongs to the user
    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json({
      orderId: order._id,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
      status: order.status,
      paidAt: order.paidAt,
      paymentMethod: order.paymentMethod
    });
  } catch (err) {
    res.status(500).json({ message: "Error getting payment status", error: err.message });
  }
});

// Request refund (dummy)
router.post("/request-refund", authMiddleware, async (req, res) => {
  try {
    const { orderId, reason } = req.body;

    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Verify that the order belongs to the user
    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Check if order is paid
    if (order.paymentStatus !== "paid") {
      return res.status(400).json({ message: "Order is not paid" });
    }

    // Simulate refund processing
    await simulateDelay(1500);

    order.paymentStatus = "refunded";
    order.status = "Refunded";
    await order.save();

    res.json({
      success: true,
      message: "Refund processed successfully",
      order: {
        _id: order._id,
        paymentStatus: order.paymentStatus,
        status: order.status,
        refundedAt: new Date()
      }
    });
  } catch (err) {
    console.error("Refund error:", err);
    res.status(500).json({ message: "Error processing refund", error: err.message });
  }
});

module.exports = router;
