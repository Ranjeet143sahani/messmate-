const express = require("express");
const TiffinPlan = require("../models/TiffinPlan");
const jwt = require("jsonwebtoken");
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "your_default_secret_key_change_this";

// Get all tiffin plans (for students - filtered by campus)
router.get("/", async (req, res) => {
  try {
    const { campus } = req.query;
    let query = { isActive: true };
    
    // If campus is provided, filter by service areas
    if (campus) {
      query.$or = [
        { serviceAreas: { $in: [campus] } },
        { serviceAreas: { $size: 0 } }, // Include plans with no specific area restriction
        { serviceAreas: { $exists: false } } // Include plans with no serviceAreas field
      ];
    }
    
    const plans = await TiffinPlan.find(query)
      .populate("vendor", "name restaurantName phone city serviceAreas")
      .sort({ createdAt: -1 });
    
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get tiffin plans by vendor
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

    const plans = await TiffinPlan.find({ vendor: decoded.id })
      .populate("vendor", "name restaurantName");
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single tiffin plan
router.get("/:id", async (req, res) => {
  try {
    const plan = await TiffinPlan.findById(req.params.id)
      .populate("vendor", "name restaurantName phone address city");
    
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }
    
    res.json(plan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create tiffin plan (vendor only)
router.post("/", async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.userType !== "vendor") {
      return res.status(403).json({ message: "Only vendors can create tiffin plans" });
    }

    const { planName, description, meals, price, duration, serviceAreas, deliveryRadius, menu } = req.body;
    
    const tiffinPlan = new TiffinPlan({
      vendor: decoded.id,
      planName,
      description,
      meals,
      price,
      duration,
      serviceAreas: serviceAreas || [],
      deliveryRadius,
      menu: menu || []
    });

    await tiffinPlan.save();
    res.json(tiffinPlan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update tiffin plan (vendor only)
router.put("/:id", async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.userType !== "vendor") {
      return res.status(403).json({ message: "Access denied" });
    }

    const plan = await TiffinPlan.findOne({ _id: req.params.id, vendor: decoded.id });
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    const { planName, description, meals, price, duration, serviceAreas, deliveryRadius, menu, isActive } = req.body;
    
    if (planName) plan.planName = planName;
    if (description) plan.description = description;
    if (meals) plan.meals = meals;
    if (price) plan.price = price;
    if (duration) plan.duration = duration;
    if (serviceAreas) plan.serviceAreas = serviceAreas;
    if (deliveryRadius) plan.deliveryRadius = deliveryRadius;
    if (menu) plan.menu = menu;
    if (isActive !== undefined) plan.isActive = isActive;

    await plan.save();
    res.json(plan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete tiffin plan (vendor only)
router.delete("/:id", async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.userType !== "vendor") {
      return res.status(403).json({ message: "Access denied" });
    }

    const plan = await TiffinPlan.findOne({ _id: req.params.id, vendor: decoded.id });
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    await TiffinPlan.findByIdAndDelete(req.params.id);
    res.json({ message: "Plan deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get vendor's active tiffin subscribers
router.get("/my-subscribers", async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.userType !== "vendor") {
      return res.status(403).json({ message: "Vendor access only" });
    }

    const now = new Date();
    const subscribers = await Order.find({
      vendorId: decoded.id,
      isSubscription: true,
      paymentStatus: "paid",
      endDate: { $gt: now }
    })
      .populate({
        path: 'planId',
        select: 'planName duration price'
      })
      .populate('userId', 'name phone college')
      .sort({ startDate: -1 });

    res.json(subscribers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
