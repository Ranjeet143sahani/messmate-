const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
require("dotenv").config();

const app = express();  // ✅ MUST be before app.use

// Middlewares
app.use(cors());

const authRoutes = require("./routes/userRoutes");
const foodRoutes = require("./routes/foodRoutes");
const orderRoutes = require("./routes/orderRoutes");
const tiffinRoutes = require("./routes/tiffinRoutes");

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

// Static
app.use('/uploads', express.static('uploads'));

// Routes
app.use("/api/users", authRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/tiffin", tiffinRoutes);
app.use("/api/payment", require("./routes/paymentRoutes"));
app.use("/api/dummy-payment", require("./routes/dummyPaymentRoutes"));

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Backend is running" });
});

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});