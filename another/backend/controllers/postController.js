const Post = require('../models/Post');
const User = require('../models/User');

// Get all posts (public, with pagination)
exports.getAllPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const totalPosts = await Post.countDocuments();
    const totalPages = Math.ceil(totalPosts / limit);

    const posts = await Post.find()
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      count: posts.length,
      posts,
      page,
      totalPages
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single post
exports.getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name email');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.views += 1;
    await post.save();

    res.json({
      success: true,
      post
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create post (auth)
exports.createPost = async (req, res, next) => {
  try {
    const { title, description, content, status } = req.body;

    if (!title || !description || !content) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const post = new Post({
      title,
      description,
      content,
      status: status || 'draft',
      author: req.user.id
    });

    await post.save();

    res.status(201).json({
      success: true,
      post
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update post (owner or admin)
exports.updatePost = async (req, res, next) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    const { title, description, content, status } = req.body;

    post.title = title || post.title;
    post.description = description || post.description;
    post.content = content || post.content;
    post.status = status || post.status;
    post.updatedAt = Date.now();

    await post.save();

    res.json({
      success: true,
      post
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete post (owner or admin)
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get posts by user
exports.getUserPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({ author: req.params.userId })
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: posts.length,
      posts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Like post (public)
exports.likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.likes += 1;
    await post.save();

    res.json({
      success: true,
      post
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

