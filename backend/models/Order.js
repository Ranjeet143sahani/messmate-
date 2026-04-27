const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true
  },
  items: Array,
  totalAmount: Number,
  status: {
    type: String,
    default: "Pending"
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed", "refunded"],
    default: "pending"
  },
  paymentIntentId: String,
  paymentMethod: String,
  paidAt: Date,
  isSubscription: {
    type: Boolean,
    default: false
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TiffinPlan"
  },
  startDate: Date,
  endDate: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Order", orderSchema);
