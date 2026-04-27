const express = require("express");
const Food = require("../models/Food");
const jwt = require("jsonwebtoken");
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "your_default_secret_key_change_this";

// Get all foods
router.get("/", async (req, res) => {
  const foods = await Food.find().populate("vendor", "name restaurantName");
  res.json(foods);
});

// Get foods by vendor
router.get("/vendor", async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.userType !== "vendor") {
      return res.status(403).json({ message: "Access denied" });
    }

    const foods = await Food.find({ vendor: decoded.id });
    res.json(foods);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add food (vendor only)
router.post("/", async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.userType !== "vendor") {
      return res.status(403).json({ message: "Only vendors can add food items" });
    }

    const { name, price, image, category, description } = req.body;
    
    const food = new Food({
      name,
      price,
      image,
      category,
      description,
      vendor: decoded.id
    });

    await food.save();
    res.json(food);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete food (vendor only)
router.delete("/:id", async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.userType !== "vendor") {
      return res.status(403).json({ message: "Only vendors can delete food items" });
    }

    const food = await Food.findOne({ _id: req.params.id, vendor: decoded.id });
    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }

    await Food.findByIdAndDelete(req.params.id);
    res.json({ message: "Food deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
