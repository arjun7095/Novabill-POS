const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  hsnCode: { type: String }, // For GST
  gstRate: { type: Number, default: 18 } // e.g., 5,12,18,28
});

module.exports = mongoose.model('Inventory', inventorySchema);