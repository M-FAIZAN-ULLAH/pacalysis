const express = require("express");
const router = express.Router();
const {
  fetchTopPacketsFromId,
  fetchSpecificObject,
  fetchPacketsInRange,
  fetchUrlsFromDocument,
  fetchPacketsBySourceIP,
  fetchUrlsBySourceIP,
  fetchAllDocumentIds,
} = require("../controllers/pacFilterController");

// Route to fetch the top N packets from a specific document ID
router.get("/top", fetchTopPacketsFromId);

// Route to fetch a specific object from packets within a document by index
router.get("/object", fetchSpecificObject);

// Route to fetch packets within a specific index range
router.get("/range", fetchPacketsInRange);

// Define the route for fetching URLs from a document
router.get("/urls", fetchUrlsFromDocument);

// Define the route for fetching packets by source IP
router.get("/by-source-ip", fetchPacketsBySourceIP);

// Route to fetch URLs by source IP
router.get("/urls-by-source-ip", fetchUrlsBySourceIP);

// Route to fetch all document IDs
router.get("/document-ids", fetchAllDocumentIds);

module.exports = router;
