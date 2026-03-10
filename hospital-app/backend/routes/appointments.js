const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Appointment = require('../models/Appointment');

// Get all appointments
router.get('/', auth, async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate('patient', 'name')
            .populate('doctor', 'name')
            .sort({ date: 1, time: 1 });
        res.json(appointments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Add appointment
router.post('/', auth, async (req, res) => {
    const { patient, doctor, date, time, reason } = req.body;
    try {
        const newAppointment = new Appointment({ patient, doctor, date, time, reason });
        const appointment = await newAppointment.save();
        res.json(appointment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update appointment
router.put('/:id', auth, async (req, res) => {
    const { status } = req.body;
    try {
        let appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({ msg: 'Appointment not found' });

        appointment = await Appointment.findByIdAndUpdate(req.params.id, 
            { $set: { status } }, 
            { new: true });
        res.json(appointment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Delete appointment
router.delete('/:id', auth, async (req, res) => {
    try {
        let appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({ msg: 'Appointment not found' });

        await Appointment.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Appointment removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
