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

router.get('/', getAllPosts);
router.get('/:id', getPost);
router.post('/', authMiddleware, createPost);
router.put('/:id', authMiddleware, updatePost);
router.delete('/:id', authMiddleware, deletePost);
router.get('/user/:userId', getUserPosts);
router.put('/:id/like', likePost);

module.exports = router;
