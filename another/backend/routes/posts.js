const express = require('express');
const {
  getAllPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  getUserPosts,
  likePost
} = require('../controllers/postController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Public read
router.get('/', getAllPosts);
router.get('/user/:userId', getUserPosts);
router.put('/:id/like', likePost);
router.get('/:id', getPost);

// Authenticated write
router.post('/', authMiddleware, createPost);
router.put('/:id', authMiddleware, updatePost);
router.delete('/:id', authMiddleware, deletePost);

module.exports = router;

