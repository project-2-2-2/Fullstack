let posts = [];
let currentEditPostId = null;
let currentPage = 1;
let totalPages = 1;
const postsPerPage = 10;

// Load posts with pagination
const loadPosts = async () => {
  showLoader();
  try {
    const response = await apiPosts.getAll(`page=${currentPage}&limit=${postsPerPage}`);
    if (response.success) {
      posts = response.posts;
      totalPages = response.totalPages;
      displayPosts();
      updatePaginationControls();
    } else {
      showAlert(response.message || 'Failed to load posts', 'danger');
    }
  } catch (error) {
    showAlert('Error loading posts: ' + error.message, 'danger');
  } finally {
    hideLoader();
  }
};

// Display posts in table
const displayPosts = () => {
  const tbody = document.getElementById('posts-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';
  const currentUser = getCurrentUser();

  posts.forEach(post => {
    const row = createPostRow(post, currentUser.id);
    tbody.appendChild(row);
  });
};

// Update pagination controls
const updatePaginationControls = () => {
  const pageInfo = document.getElementById('page-info');
  const prevButton = document.getElementById('prev-page');
  const nextButton = document.getElementById('next-page');

  if (pageInfo) pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  if (prevButton) prevButton.disabled = currentPage === 1;
  if (nextButton) nextButton.disabled = currentPage === totalPages;
};

// Go to next page
const nextPage = () => {
  if (currentPage < totalPages) {
    currentPage++;
    loadPosts();
  }
};

// Go to previous page
const previousPage = () => {
  if (currentPage > 1) {
    currentPage--;
    loadPosts();
  }
};

// Open create post modal
const openCreatePostModal = () => {
  document.getElementById('post-form').reset();
  currentEditPostId = null;
  document.getElementById('post-modal-title').textContent = 'Create New Post';
  document.getElementById('post-modal').style.display = 'block';
};

// Open edit post modal
const openEditPostModal = (postId) => {
  currentEditPostId = postId;
  const post = posts.find(p => p._id === postId);

  if (post) {
    document.getElementById('post-title').value = post.title;
    document.getElementById('post-description').value = post.description;
    document.getElementById('post-content').value = post.content;
    document.getElementById('post-status').value = post.status;
    document.getElementById('post-modal-title').textContent = 'Edit Post';
    document.getElementById('post-modal').style.display = 'block';
  }
};

// Close post modal
const closePostModal = () => {
  document.getElementById('post-modal').style.display = 'none';
  currentEditPostId = null;
};

// Save post
const savePost = async (e) => {
  e.preventDefault();

  const postData = {
    title: document.getElementById('post-title').value,
    description: document.getElementById('post-description').value,
    content: document.getElementById('post-content').value,
    status: document.getElementById('post-status').value
  };

  if (!postData.title || !postData.description || !postData.content) {
    showAlert('Please fill all required fields', 'danger');
    return;
  }

  showLoader();
  try {
    let response;
    if (currentEditPostId) {
      response = await apiPosts.update(currentEditPostId, postData);
    } else {
      response = await apiPosts.create(postData);
    }

    if (response.success) {
      showAlert(currentEditPostId ? 'Post updated successfully' : 'Post created successfully', 'success');
      closePostModal();
      loadPosts();
    } else {
      showAlert(response.message || 'Failed to save post', 'danger');
    }
  } catch (error) {
    showAlert('Error saving post: ' + error.message, 'danger');
  } finally {
    hideLoader();
  }
};

// Delete post
const deletePost = async (postId) => {
  if (!confirm('Are you sure you want to delete this post?')) return;

  showLoader();
  try {
    const response = await apiPosts.delete(postId);
    if (response.success) {
      showAlert('Post deleted successfully', 'success');
      loadPosts();
    } else {
      showAlert(response.message || 'Failed to delete post', 'danger');
    }
  } catch (error) {
    showAlert('Error deleting post: ' + error.message, 'danger');
  } finally {
    hideLoader();
  }
};

// Like post
const likePost = async (postId) => {
  showLoader();
  try {
    const response = await apiPosts.like(postId);
    if (response.success) {
      showAlert('Post liked successfully', 'success');
      loadPosts();
    } else {
      showAlert(response.message || 'Failed to like post', 'danger');
    }
  } catch (error) {
    showAlert('Error liking post: ' + error.message, 'danger');
  } finally {
    hideLoader();
  }
};

// Filter posts by status
const filterPostsByStatus = () => {
  const status = document.getElementById('status-filter').value;
  const filtered = status ? posts.filter(post => post.status === status) : posts;

  const tbody = document.getElementById('posts-tbody');
  tbody.innerHTML = '';
  const currentUser = getCurrentUser();

  filtered.forEach(post => {
    const row = createPostRow(post, currentUser.id);
    tbody.appendChild(row);
  });
};

// Search posts
const searchPosts = () => {
  const query = document.getElementById('post-search').value.toLowerCase();
  const filtered = posts.filter(post =>
    post.title.toLowerCase().includes(query) ||
    post.description.toLowerCase().includes(query) ||
    post.author.name.toLowerCase().includes(query)
  );

  const tbody = document.getElementById('posts-tbody');
  tbody.innerHTML = '';
  const currentUser = getCurrentUser();

  filtered.forEach(post => {
    const row = createPostRow(post, currentUser.id);
    tbody.appendChild(row);
  });
};

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  protectRoute();
  loadPosts();

  // Close modal when clicking outside
  const modal = document.getElementById('post-modal');
  if (modal) {
    window.onclick = function(event) {
      if (event.target === modal) {
        closePostModal();
      }
    };
  }
});
