const express = require("express");
const User = require("../models/User");
const Vendor = require("../models/Vendor");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "your_default_secret_key_change_this";

// Multer storage for uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ storage: storage });

// ============ CONSUMER AUTHENTICATION ============

// Register Consumer
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, address, college, branch, city } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      college,
      branch,
      city
    });

    const token = jwt.sign(
      { id: user._id, userType: "consumer" },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({ 
      message: "User registered successfully",
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        phone: user.phone,
        address: user.address,
        college: user.college,
        branch: user.branch,
        city: user.city,
        userType: "consumer"
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login Consumer
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, userType: "consumer" },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ 
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        phone: user.phone,
        address: user.address,
        college: user.college,
        branch: user.branch,
        city: user.city,
        userType: "consumer"
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ============ VENDOR AUTHENTICATION ============

// Register Vendor
router.post("/register/vendor", async (req, res) => {
  try {
    const { name, email, password, restaurantName, phone, address, city } = req.body;

    const vendorExists = await Vendor.findOne({ email });
    if (vendorExists) {
      return res.status(400).json({ message: "Vendor already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const vendor = await Vendor.create({
      name,
      email,
      password: hashedPassword,
      restaurantName,
      phone,
      address,
      city
    });

    const token = jwt.sign(
      { id: vendor._id, userType: "vendor" },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({ 
      message: "Vendor registered successfully",
      token,
      user: { 
        id: vendor._id, 
        name: vendor.name, 
        email: vendor.email,
        restaurantName: vendor.restaurantName,
        phone: vendor.phone,
        address: vendor.address,
        city: vendor.city,
        userType: "vendor"
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login Vendor
router.post("/login/vendor", async (req, res) => {
  try {
    const { email, password } = req.body;

    const vendor = await Vendor.findOne({ email });
    if (!vendor) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, vendor.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: vendor._id, userType: "vendor" },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ 
      token,
      user: { 
        id: vendor._id, 
        name: vendor.name, 
        email: vendor.email,
        restaurantName: vendor.restaurantName,
        phone: vendor.phone,
        address: vendor.address,
        city: vendor.city,
        userType: "vendor"
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ============ PROFILE ============

// Get Profile
router.get("/profile", async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    let user;

    if (decoded.userType === "vendor") {
      user = await Vendor.findById(decoded.id).select("-password");
    } else {
      user = await User.findById(decoded.id).select("-password");
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user: { ...user._doc, userType: decoded.userType } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update Profile
router.put("/profile", upload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'coverPhoto', maxCount: 1 }
]), async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    let user;

    const updateData = { ...req.body };

    // Handle uploaded files
    if (req.files && req.files.profilePicture) {
      updateData.profilePicture = `/uploads/${req.files.profilePicture[0].filename}`;
    }
    if (req.files && req.files.coverPhoto) {
      updateData.coverPhoto = `/uploads/${req.files.coverPhoto[0].filename}`;
    }

    if (decoded.userType === "vendor") {
      user = await Vendor.findByIdAndUpdate(
        decoded.id,
        { $set: updateData },
        { new: true }
      ).select("-password");
    } else {
      user = await User.findByIdAndUpdate(
        decoded.id,
        { $set: updateData },
        { new: true }
      ).select("-password");
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user: { ...user._doc, userType: decoded.userType } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get consumer's active tiffin subscriptions
router.get("/my-subscriptions", authMiddleware, async (req, res) => {
  try {
    if (req.user.userType !== "consumer") {
      return res.status(403).json({ message: "Consumer access only" });
    }

    const now = new Date();
    const subscriptions = await Order.find({
      userId: req.user.id,
      isSubscription: true,
      paymentStatus: "paid",
      endDate: { $gt: now }
    })
      .populate({
        path: 'planId',
        select: 'planName price duration meals vendor'
      })
      .populate('vendorId', 'restaurantName')
      .sort({ startDate: -1 });

    res.json(subscriptions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
