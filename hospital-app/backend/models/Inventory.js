const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
    item: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    supplier: { type: String, required: true },
    expiryDate: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Inventory', InventorySchema);
