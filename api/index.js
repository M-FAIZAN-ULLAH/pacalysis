// Import necessary packages
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./database/connectDB");

// Create an Express application
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Middleware to enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Connect to MongoDB
connectDB();

// Import routes
const pcapRoutes = require("./routes/pcapRoutes");
const pacFilterRoutes = require("./routes/pacFilterRoutes");

// Use routes
app.use("/api/pcap", pcapRoutes);
app.use("/api/packets", pacFilterRoutes);

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
