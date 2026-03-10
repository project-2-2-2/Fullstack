const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Patient = require('../models/Patient');

// Get all patients
router.get('/', auth, async (req, res) => {
    try {
        const patients = await Patient.find().sort({ createdAt: -1 });
        res.json(patients);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Add patient
router.post('/', auth, async (req, res) => {
    const { name, age, gender, condition, doctor } = req.body;
    try {
        const newPatient = new Patient({ name, age, gender, condition, doctor });
        const patient = await newPatient.save();
        res.json(patient);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update patient
router.put('/:id', auth, async (req, res) => {
    const { name, age, gender, condition, doctor } = req.body;
    try {
        let patient = await Patient.findById(req.params.id);
        if (!patient) return res.status(404).json({ msg: 'Patient not found' });

        patient = await Patient.findByIdAndUpdate(req.params.id, 
            { $set: { name, age, gender, condition, doctor } }, 
            { new: true });
        res.json(patient);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Delete patient
router.delete('/:id', auth, async (req, res) => {
    try {
        let patient = await Patient.findById(req.params.id);
        if (!patient) return res.status(404).json({ msg: 'Patient not found' });

        await Patient.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Patient removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
