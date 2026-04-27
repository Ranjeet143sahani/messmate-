const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  restaurantName: String,
  phone: String,
  address: String,
  city: String,
  serviceAreas: [String],
  deliveryRadius: Number,
  profilePicture: String,
  coverPhoto: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Vendor", vendorSchema);

