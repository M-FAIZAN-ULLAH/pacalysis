const express = require("express");
const router = express.Router();
const pcapController = require("../controllers/pacpController");

// Define the route for file upload and processing
router.post("/upload", pcapController.uploadAndProcessFile);

module.exports = router;
