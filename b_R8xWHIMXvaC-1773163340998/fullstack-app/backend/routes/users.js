const express = require('express');
const {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserByEmail
} = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

router.get('/', authMiddleware, requireRole('admin'), getAllUsers);
router.get('/email/:email', authMiddleware, requireRole('admin'), getUserByEmail);
router.get('/:id', authMiddleware, getUser);
router.put('/:id', authMiddleware, updateUser);
router.delete('/:id', authMiddleware, deleteUser);

module.exports = router;
