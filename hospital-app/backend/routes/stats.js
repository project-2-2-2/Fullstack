const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Inventory = require('../models/Inventory');

// Get dashboard statistics
router.get('/stats', async (req, res) => {
    try {
        const patientCount = await Patient.countDocuments();
        const doctorCount = await Doctor.countDocuments();
        const appointmentCount = await Appointment.countDocuments();
        const inventoryCount = await Inventory.countDocuments();

        res.json({
            patients: patientCount,
            doctors: doctorCount,
            appointments: appointmentCount,
            inventory: inventoryCount
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
