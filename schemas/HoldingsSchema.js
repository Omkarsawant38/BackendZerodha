// In schemas/HoldingsSchema.js
const mongoose = require('mongoose');

const HoldingsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  qty: { type: Number, required: true },
  avg: { type: Number, required: true },
  price: { type: Number, required: true },
  net: { type: String },
  day: { type: String },
  isLoss: { type: Boolean, default: false }
});

module.exports = HoldingsSchema;