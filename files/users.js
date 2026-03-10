const express = require('express');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// ─── GET /api/users/profile ───────────────────────────────────────────────────
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, data: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch profile.' });
  }
});

// ─── PUT /api/users/profile ───────────────────────────────────────────────────
router.put('/profile', async (req, res) => {
  try {
    const { name, department, avatar } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (department) updates.department = department;
    if (avatar !== undefined) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      data: user.toSafeObject()
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    res.status(500).json({ success: false, message: 'Could not update profile.' });
  }
});

// ─── GET /api/users (admin only) ─────────────────────────────────────────────
router.get('/', authorize('admin'), async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: users, total: users.length });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch users.' });
  }
});

// ─── DELETE /api/users/:id (admin only) ──────────────────────────────────────
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account.' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    res.json({ success: true, message: 'User deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not delete user.' });
  }
});

module.exports = router;
