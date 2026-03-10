const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Inventory = require('../models/Inventory');

// Get all inventory
router.get('/', auth, async (req, res) => {
    try {
        const inventory = await Inventory.find().sort({ item: 1 });
        res.json(inventory);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Add inventory
router.post('/', auth, async (req, res) => {
    const { item, quantity, unit, supplier, expiryDate } = req.body;
    try {
        const newInventory = new Inventory({ item, quantity, unit, supplier, expiryDate });
        const inventory = await newInventory.save();
        res.json(inventory);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update inventory
router.put('/:id', auth, async (req, res) => {
    const { item, quantity, unit, supplier, expiryDate } = req.body;
    try {
        let inventory = await Inventory.findById(req.params.id);
        if (!inventory) return res.status(404).json({ msg: 'Inventory item not found' });

        inventory = await Inventory.findByIdAndUpdate(req.params.id, 
            { $set: { item, quantity, unit, supplier, expiryDate } }, 
            { new: true });
        res.json(inventory);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Delete inventory
router.delete('/:id', auth, async (req, res) => {
    try {
        let inventory = await Inventory.findById(req.params.id);
        if (!inventory) return res.status(404).json({ msg: 'Inventory item not found' });

        await Inventory.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Inventory item removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
