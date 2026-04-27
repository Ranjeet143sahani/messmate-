const mongoose = require("mongoose");

const tiffinPlanSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true
  },
  planName: {
    type: String,
    required: true
  },
  description: String,
  meals: {
    breakfast: { type: Boolean, default: false },
    lunch: { type: Boolean, default: false },
    dinner: { type: Boolean, default: false }
  },
  price: {
    type: Number,
    required: true
  },
  duration: {
    type: String,
    enum: ["daily", "weekly", "monthly"],
    default: "monthly"
  },
  serviceAreas: [String],
  deliveryRadius: Number,
  menu: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("TiffinPlan", tiffinPlanSchema);
