const Task = require('../models/Task');

// Get tasks for current user (admin can see all if ?all=true)
exports.getTasks = async (req, res) => {
  try {
    const wantsAll = String(req.query.all || '').toLowerCase() === 'true';
    const filter = wantsAll && req.user.role === 'admin' ? {} : { owner: req.user.id };

    const tasks = await Task.find(filter)
      .populate('owner', 'name email role')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single task (owner or admin)
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('owner', 'name email role');
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (task.owner._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this task' });
    }

    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create task (current user is owner)
exports.createTask = async (req, res) => {
  try {
    const { title, details, status, dueDate } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    const task = await Task.create({
      title,
      details: details || '',
      status: status || 'todo',
      dueDate: dueDate ? new Date(dueDate) : null,
      owner: req.user.id
    });

    const populated = await Task.findById(task._id).populate('owner', 'name email role');
    res.status(201).json({ success: true, task: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update task (owner or admin)
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (task.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    const { title, details, status, dueDate } = req.body;

    if (title !== undefined) task.title = title;
    if (details !== undefined) task.details = details;
    if (status !== undefined) task.status = status;
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;
    task.updatedAt = Date.now();

    await task.save();
    const populated = await Task.findById(task._id).populate('owner', 'name email role');
    res.json({ success: true, task: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete task (owner or admin)
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (task.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

