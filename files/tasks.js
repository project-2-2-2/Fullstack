const express = require('express');
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All task routes require authentication
router.use(protect);

// ─── GET /api/tasks ───────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const {
      status, priority, category,
      search, page = 1, limit = 10,
      sortBy = 'createdAt', sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter = { createdBy: req.user._id };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortObj = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate('assignedTo', 'name email')
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit)),
      Task.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: tasks,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch tasks.' });
  }
});

// ─── GET /api/tasks/stats ─────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user._id;

    const [statusCounts, priorityCounts, overdueTasks, recentTasks] = await Promise.all([
      Task.aggregate([
        { $match: { createdBy: userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Task.aggregate([
        { $match: { createdBy: userId } },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]),
      Task.countDocuments({
        createdBy: userId,
        dueDate: { $lt: new Date() },
        status: { $ne: 'done' }
      }),
      Task.find({ createdBy: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title status priority createdAt')
    ]);

    const stats = {
      total: 0,
      byStatus: { todo: 0, 'in-progress': 0, review: 0, done: 0 },
      byPriority: { low: 0, medium: 0, high: 0, critical: 0 },
      overdue: overdueTasks,
      recent: recentTasks
    };

    statusCounts.forEach(s => {
      stats.byStatus[s._id] = s.count;
      stats.total += s.count;
    });
    priorityCounts.forEach(p => {
      stats.byPriority[p._id] = p.count;
    });

    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch stats.' });
  }
});

// ─── GET /api/tasks/:id ───────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    }).populate('assignedTo', 'name email');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    res.json({ success: true, data: task });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid task ID.' });
    }
    res.status(500).json({ success: false, message: 'Could not fetch task.' });
  }
});

// ─── POST /api/tasks ──────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { title, description, status, priority, category, dueDate, tags, progress } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Task title is required.' });
    }

    const task = await Task.create({
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      category: category || 'other',
      dueDate: dueDate || null,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
      progress: progress || 0,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      data: task
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    res.status(500).json({ success: false, message: 'Could not create task.' });
  }
});

// ─── PUT /api/tasks/:id ───────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, createdBy: req.user._id });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const { title, description, status, priority, category, dueDate, tags, progress } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (category !== undefined) task.category = category;
    if (dueDate !== undefined) task.dueDate = dueDate || null;
    if (tags !== undefined) task.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
    if (progress !== undefined) task.progress = progress;

    await task.save();

    res.json({
      success: true,
      message: 'Task updated successfully.',
      data: task
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid task ID.' });
    }
    res.status(500).json({ success: false, message: 'Could not update task.' });
  }
});

// ─── PATCH /api/tasks/:id/status ─────────────────────────────────────────────
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['todo', 'in-progress', 'review', 'done'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { status },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    res.json({ success: true, message: 'Status updated.', data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not update status.' });
  }
});

// ─── DELETE /api/tasks/:id ────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    res.json({ success: true, message: 'Task deleted successfully.' });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid task ID.' });
    }
    res.status(500).json({ success: false, message: 'Could not delete task.' });
  }
});

// ─── DELETE /api/tasks ────────────────────────────────────────────────────────
router.delete('/', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide task IDs.' });
    }

    const result = await Task.deleteMany({
      _id: { $in: ids },
      createdBy: req.user._id
    });

    res.json({ success: true, message: `${result.deletedCount} task(s) deleted.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not delete tasks.' });
  }
});

module.exports = router;
