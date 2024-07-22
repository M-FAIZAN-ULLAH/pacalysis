const Packet = require("../models/packetModel");

// Fetch top N packets from a specific document ID
const fetchTopPacketsFromId = async (req, res) => {
  try {
    const { id, limit } = req.query;
    const numLimit = parseInt(limit, 10);

    if (!id || isNaN(numLimit) || numLimit <= 0) {
      return res.status(400).send({ message: "Invalid ID or limit provided" });
    }

    const packetDoc = await Packet.findById(id);

    if (!packetDoc) {
      return res.status(404).send({ message: "Packet not found" });
    }

    const packets = packetDoc.packets.slice(0, numLimit);

    res
      .status(200)
      .send({ message: "Packets fetched successfully", data: packets });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error fetching packets", error: error.message });
  }
};

// Fetch a specific object from packets within a document by index
const fetchSpecificObject = async (req, res) => {
  try {
    const { id, index } = req.query;

    if (!id || index === undefined || isNaN(index)) {
      return res.status(400).send({ message: "Invalid ID or index provided" });
    }

    const packetDoc = await Packet.findById(id);

    if (!packetDoc) {
      return res.status(404).send({ message: "Packet not found" });
    }

    const object = packetDoc.packets[index];

    if (!object) {
      return res
        .status(404)
        .send({ message: "Object not found at this index" });
    }

    res
      .status(200)
      .send({ message: "Object fetched successfully", data: object });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error fetching object", error: error.message });
  }
};

// Fetch packets within a specific range
const fetchPacketsInRange = async (req, res) => {
  try {
    const { id, start, end } = req.query;
    const startIndex = parseInt(start, 10);
    const endIndex = parseInt(end, 10);

    if (
      !id ||
      isNaN(startIndex) ||
      isNaN(endIndex) ||
      startIndex < 0 ||
      endIndex < startIndex
    ) {
      return res.status(400).send({ message: "Invalid parameters provided" });
    }

    const packetDoc = await Packet.findById(id);

    if (!packetDoc) {
      return res.status(404).send({ message: "Packet not found" });
    }

    const packets = packetDoc.packets.slice(startIndex, endIndex + 1);

    res
      .status(200)
      .send({ message: "Packets fetched successfully", data: packets });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error fetching packets", error: error.message });
  }
};

// Fetch and filter URLs from packets within a specific document
const fetchUrlsFromDocument = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).send({ message: "Invalid ID provided" });
    }

    const packetDoc = await Packet.findById(id);

    if (!packetDoc) {
      return res.status(404).send({ message: "Packet not found" });
    }

    // Improved URL extraction logic
    // This regex will match domain names and possible subdomains
    const urlRegex = /(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}/g;
    const urlsWithIndex = [];

    packetDoc.packets.forEach((packet, index) => {
      if (packet.info) {
        const urlsInInfo = packet.info.match(urlRegex);
        if (urlsInInfo) {
          urlsInInfo.forEach((url) => {
            urlsWithIndex.push({ url, objectNumber: index });
          });
        }
      }
    });

    // Remove duplicate URLs for each object index
    const uniqueUrlsWithIndex = urlsWithIndex.reduce((acc, current) => {
      const x = acc.find(
        (item) =>
          item.url === current.url && item.objectNumber === current.objectNumber
      );
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, []);

    res
      .status(200)
      .send({
        message: "URLs fetched successfully",
        data: uniqueUrlsWithIndex,
      });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error fetching URLs", error: error.message });
  }
};

module.exports = {
  fetchTopPacketsFromId,
  fetchSpecificObject,
  fetchPacketsInRange,
  fetchUrlsFromDocument,
};
