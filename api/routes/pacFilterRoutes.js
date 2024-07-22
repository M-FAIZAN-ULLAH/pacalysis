const express = require("express");
const router = express.Router();
const {
  fetchTopPacketsFromId,
  fetchSpecificObject,
  fetchPacketsInRange,
  fetchUrlsFromDocument,
} = require("../controllers/pacFilterController");

// Route to fetch the top N packets from a specific document ID
router.get("/top", fetchTopPacketsFromId);

// Route to fetch a specific object from packets within a document by index
router.get("/object", fetchSpecificObject);

// Route to fetch packets within a specific index range
router.get("/range", fetchPacketsInRange);

// Define the route for fetching URLs from a document
router.get("/urls", fetchUrlsFromDocument);

module.exports = router;
