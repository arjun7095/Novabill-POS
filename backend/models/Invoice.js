const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  items: [{
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory' },
    quantity: Number,
    price: Number,
    gstAmount: Number
  }],
  subtotal: Number,
  totalGST: Number,
  totalAmount: Number,
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Invoice', invoiceSchema);