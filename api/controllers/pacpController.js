const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");
const Packet = require("../models/packetModel");

// Configure Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Initialize Multer with the storage configuration
const upload = multer({ storage: storage }).single("pcapfile");

// Controller function to handle file upload and processing
const uploadAndProcessFile = async (req, res) => {
  // Increase response time
  req.setTimeout(600000); // 10 minutes

  upload(req, res, function (err) {
    if (err) {
      return res
        .status(500)
        .send({ message: "Error uploading file", error: err.message });
    }

    const filePath = req.file.path;

    // Execute the Python script to parse the pcap file with increased buffer sizes
    exec(
      `python ${path.join(__dirname, "../scripts/parse_pcap.py")} ${filePath}`,
      {
        maxBuffer: 1024 * 1024 * 50, // 50MB buffer
        timeout: 600000, // 10 minutes
      },
      async (error, stdout, stderr) => {
        if (error) {
          return res
            .status(500)
            .send({ message: "Error processing file", error: error.message });
        }
        if (stderr) {
          const warningMessage =
            "WARNING: Wireshark is installed, but cannot read manuf";
          if (stderr.includes(warningMessage)) {
            // If the stderr contains the specific warning, ignore it and continue processing
            console.warn(warningMessage);
          } else {
            return res
              .status(500)
              .send({ message: "Error processing file", error: stderr });
          }
        }

        try {
          const packetDetails = JSON.parse(stdout);

          // Create a new Packet document with the parsed details
          const newPacket = new Packet({
            packets: packetDetails,
          });

          // Save the document to the database
          await newPacket.save();

          res.status(200).send({
            message: "File successfully processed and stored!",
            data: newPacket,
          });
        } catch (parseError) {
          return res.status(500).send({
            message: "Error parsing JSON data",
            error: parseError.message,
          });
        }
      }
    );
  });
};

module.exports = {
  uploadAndProcessFile,
};
