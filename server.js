const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const userRoute = require("./userRoute");


const app = express();

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(bodyParser.json());
app.use(express.json());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
} else if (process.env.NODE_ENV === "production") {
  app.use(morgan("combined"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

// Routes
app.use("/api/users", userRoute);

app.get("/", (req, res) => {
  res.json({ message: "API is working on Vercel" });
});

app.get("/api/debug-db", async (req, res) => {
  try {
    const mongoose = require("mongoose");
    res.json({
      readyState: mongoose.connection.readyState, // 1 = connected
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const connectDB = require("./config/db");
connectDB();

// Local run only
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
}


// Handle unhandled rejections
process.on("unhandledRejection", (err) => {
  console.log(`Unhandled Rejection: ${err.message}`);
  console.log(`MongoDB Connection Error: ${err.name} | ${err.message}`);
  process.exit(1);
});

// Export for Vercel
module.exports = (req, res) => {
  app(req, res);
};
