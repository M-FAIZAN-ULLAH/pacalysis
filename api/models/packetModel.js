// models/packetModel.js
const mongoose = require("mongoose");

const packetSchema = new mongoose.Schema({
  packets: [
    {
      time: Number,
      arrival_time: String,
      UTC_arrival_time: String,
      frame_number: Number,
      protocol_in_frame: Number,
      coloring_rule_name: String,
      coloring_rule_strength: String,
      source: String,
      destination: String,
      source_port: Number,
      destination_port: Number,
      length: Number,
      info: String,
      frames: Number,
      bytes: Number,
      header_checksum_status: String,
      ethernet: Object,
      queries: Number,
      answers: Number,
      flags: Object,
      ports: Number,
      details: Object,
    },
  ],
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Packet = mongoose.model("Packet", packetSchema);

module.exports = Packet;
