const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Doctor = require('../models/Doctor');

// Get all doctors
router.get('/', auth, async (req, res) => {
    try {
        const doctors = await Doctor.find().sort({ createdAt: -1 });
        res.json(doctors);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Add doctor
router.post('/', auth, async (req, res) => {
    const { name, specialization, experience, contact } = req.body;
    try {
        const newDoctor = new Doctor({ name, specialization, experience, contact });
        const doctor = await newDoctor.save();
        res.json(doctor);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update doctor
router.put('/:id', auth, async (req, res) => {
    const { name, specialization, experience, contact } = req.body;
    try {
        let doctor = await Doctor.findById(req.params.id);
        if (!doctor) return res.status(404).json({ msg: 'Doctor not found' });

        doctor = await Doctor.findByIdAndUpdate(req.params.id, 
            { $set: { name, specialization, experience, contact } }, 
            { new: true });
        res.json(doctor);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Delete doctor
router.delete('/:id', auth, async (req, res) => {
    try {
        let doctor = await Doctor.findById(req.params.id);
        if (!doctor) return res.status(404).json({ msg: 'Doctor not found' });

        await Doctor.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Doctor removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
