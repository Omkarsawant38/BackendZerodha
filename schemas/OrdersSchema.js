const { Schema } = require("mongoose");

const OrdersSchema = new Schema({
  name: String,
  qty: Number,
  price: Number,
  mode: String,
});

OrdersSchema.index({ name: 1, mode: 1 }, { unique: true });

module.exports = { OrdersSchema };
