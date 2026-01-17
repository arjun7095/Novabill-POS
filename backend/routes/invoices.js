const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Inventory = require('../models/Inventory');

router.get('/', auth, async (req, res) => {
  const items = await Inventory.find();
  res.json(items);
});

router.post('/', auth, async (req, res) => {
  const { itemName, quantity, price, hsnCode, gstRate } = req.body;
  const item = new Inventory({ itemName, quantity, price, hsnCode, gstRate });
  await item.save();
  res.json(item);
});

router.put('/:id', auth, async (req, res) => {
  const { quantity } = req.body;
  const item = await Inventory.findByIdAndUpdate(req.params.id, { quantity }, { new: true });
  res.json(item);
});

module.exports = router;