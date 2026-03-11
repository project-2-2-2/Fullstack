let tasks = [];
let currentEditTaskId = null;

const formatShortDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString();
};

const createTaskRow = (task, currentUserId) => {
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${task._id}</td>
    <td>${escapeHtml(task.title || '')}</td>
    <td>${escapeHtml(task.status || '')}</td>
    <td>${formatShortDate(task.dueDate)}</td>
    <td>${escapeHtml(task.owner?.name || 'Unknown')}</td>
    <td>
      <div class="action-buttons">
        <button class="btn btn-primary btn-small" onclick="openEditTaskModal('${task._id}')">Edit</button>
        ${(task.owner?._id === currentUserId || getCurrentUser().role === 'admin')
          ? `<button class="btn btn-danger btn-small" onclick="deleteTask('${task._id}')">Delete</button>`
          : ''}
      </div>
    </td>
  `;

  row.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') return;
    row.style.backgroundColor = row.style.backgroundColor ? '' : '#fff8e1';
  });

  return row;
};

const loadTasks = async () => {
  showLoader();
  try {
    const response = await apiTasks.getAll();
    if (response.success) {
      tasks = response.tasks || [];
      displayTasks(tasks);
    } else {
      showAlert(response.message || 'Failed to load tasks', 'danger');
    }
  } catch (error) {
    showAlert('Error loading tasks: ' + error.message, 'danger');
  } finally {
    hideLoader();
  }
};

const displayTasks = (list) => {
  const tbody = document.getElementById('tasks-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';
  const currentUser = getCurrentUser();

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No tasks yet.</td></tr>`;
    return;
  }

  list.forEach((t) => tbody.appendChild(createTaskRow(t, currentUser.id)));
};

const openCreateTaskModal = () => {
  document.getElementById('task-form').reset();
  currentEditTaskId = null;
  document.getElementById('task-modal-title').textContent = 'Add Task';
  document.getElementById('task-modal').style.display = 'block';
};

const openEditTaskModal = (taskId) => {
  currentEditTaskId = taskId;
  const task = tasks.find((t) => t._id === taskId);
  if (!task) return;

  document.getElementById('task-title').value = task.title || '';
  document.getElementById('task-details').value = task.details || '';
  document.getElementById('task-status').value = task.status || 'todo';
  document.getElementById('task-due').value = task.dueDate ? String(task.dueDate).slice(0, 10) : '';

  document.getElementById('task-modal-title').textContent = 'Edit Task';
  document.getElementById('task-modal').style.display = 'block';
};

const closeTaskModal = () => {
  document.getElementById('task-modal').style.display = 'none';
  currentEditTaskId = null;
};

const saveTask = async (e) => {
  e.preventDefault();

  const taskData = {
    title: document.getElementById('task-title').value,
    details: document.getElementById('task-details').value,
    status: document.getElementById('task-status').value,
    dueDate: document.getElementById('task-due').value
  };

  if (!taskData.title || !taskData.title.trim()) {
    showAlert('Title is required', 'danger');
    return;
  }

  showLoader();
  try {
    const response = currentEditTaskId
      ? await apiTasks.update(currentEditTaskId, taskData)
      : await apiTasks.create(taskData);

    if (response.success) {
      showAlert(currentEditTaskId ? 'Task updated' : 'Task created', 'success');
      closeTaskModal();
      await loadTasks();
    } else {
      showAlert(response.message || 'Failed to save task', 'danger');
    }
  } catch (error) {
    showAlert('Error saving task: ' + error.message, 'danger');
  } finally {
    hideLoader();
  }
};

const deleteTask = async (taskId) => {
  if (!confirm('Delete this task?')) return;
  showLoader();
  try {
    const response = await apiTasks.delete(taskId);
    if (response.success) {
      showAlert('Task deleted', 'success');
      await loadTasks();
    } else {
      showAlert(response.message || 'Failed to delete task', 'danger');
    }
  } catch (error) {
    showAlert('Error deleting task: ' + error.message, 'danger');
  } finally {
    hideLoader();
  }
};

const filterTasksByStatus = () => {
  const v = document.getElementById('status-filter').value;
  if (!v) return displayTasks(tasks);
  displayTasks(tasks.filter((t) => t.status === v));
};

document.addEventListener('DOMContentLoaded', () => {
  protectRoute();
  loadTasks();

  const modal = document.getElementById('task-modal');
  if (modal) {
    window.onclick = function(event) {
      if (event.target === modal) closeTaskModal();
    };
  }
});

