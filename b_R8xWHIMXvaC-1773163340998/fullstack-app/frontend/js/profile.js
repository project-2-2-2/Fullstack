let userProfile = null;
let userPosts = [];

// Load user profile
const loadProfile = async () => {
  showLoader();
  try {
    const user = getCurrentUser();
    const response = await apiUsers.getById(user.id);

    if (response.success) {
      userProfile = response.user;
      displayProfile();
      loadUserPosts();
    } else {
      showAlert(response.message || 'Failed to load profile', 'danger');
    }
  } catch (error) {
    showAlert('Error loading profile: ' + error.message, 'danger');
  } finally {
    hideLoader();
  }
};

// Display user profile
const displayProfile = () => {
  if (!userProfile) return;

  const profileHeader = document.getElementById('profile-header');
  if (profileHeader) {
    const initials = userProfile.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();

    profileHeader.innerHTML = `
      <div class="profile-avatar">${initials}</div>
      <h1 class="profile-name">${escapeHtml(userProfile.name)}</h1>
      <p class="profile-email">${escapeHtml(userProfile.email)}</p>
      <button class="btn btn-primary" onclick="openEditProfileModal()">Edit Profile</button>
    `;
  }

  const profileInfo = document.getElementById('profile-info');
  if (profileInfo) {
    profileInfo.innerHTML = `
      <div class="info-item">
        <div class="info-label">Email</div>
        <div class="info-value">${escapeHtml(userProfile.email)}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Name</div>
        <div class="info-value">${escapeHtml(userProfile.name)}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Phone</div>
        <div class="info-value">${userProfile.phone || 'Not provided'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Bio</div>
        <div class="info-value">${userProfile.bio || 'No bio added'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Member Since</div>
        <div class="info-value">${formatDate(userProfile.createdAt)}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Role</div>
        <div class="info-value">${userProfile.role}</div>
      </div>
    `;
  }
};

// Load user posts
const loadUserPosts = async () => {
  try {
    const user = getCurrentUser();
    const response = await apiPosts.getUserPosts(user.id);

    if (response.success) {
      userPosts = response.posts;
      displayUserPosts();
    }
  } catch (error) {
    console.error('Error loading user posts:', error);
  }
};

// Display user posts
const displayUserPosts = () => {
  const postsContainer = document.getElementById('user-posts');
  if (!postsContainer) return;

  postsContainer.innerHTML = '';

  if (userPosts.length === 0) {
    postsContainer.innerHTML = '<p style="text-align: center; color: #7f8c8d;">No posts yet. Create your first post!</p>';
    return;
  }

  userPosts.forEach(post => {
    const card = createPostCard(post);
    postsContainer.appendChild(card);
  });
};

// Open edit profile modal
const openEditProfileModal = () => {
  if (!userProfile) return;

  document.getElementById('edit-name-profile').value = userProfile.name;
  document.getElementById('edit-email-profile').value = userProfile.email;
  document.getElementById('edit-phone-profile').value = userProfile.phone || '';
  document.getElementById('edit-bio-profile').value = userProfile.bio || '';

  document.getElementById('edit-profile-modal').style.display = 'block';
};

// Close edit profile modal
const closeEditProfileModal = () => {
  document.getElementById('edit-profile-modal').style.display = 'none';
};

// Update profile
const updateProfile = async (e) => {
  e.preventDefault();

  const profileData = {
    name: document.getElementById('edit-name-profile').value,
    email: document.getElementById('edit-email-profile').value,
    phone: document.getElementById('edit-phone-profile').value,
    bio: document.getElementById('edit-bio-profile').value
  };

  const errors = validateForm(profileData);
  if (errors.length > 0) {
    showAlert(errors.join(', '), 'danger');
    return;
  }

  showLoader();
  try {
    const user = getCurrentUser();
    const response = await apiUsers.update(user.id, profileData);

    if (response.success) {
      userProfile = response.user;
      localStorage.setItem('user', JSON.stringify({
        id: response.user._id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role
      }));
      showAlert('Profile updated successfully', 'success');
      closeEditProfileModal();
      displayProfile();
    } else {
      showAlert(response.message || 'Failed to update profile', 'danger');
    }
  } catch (error) {
    showAlert('Error updating profile: ' + error.message, 'danger');
  } finally {
    hideLoader();
  }
};

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  protectRoute();
  loadProfile();

  // Close modal when clicking outside
  const modal = document.getElementById('edit-profile-modal');
  if (modal) {
    window.onclick = function(event) {
      if (event.target === modal) {
        closeEditProfileModal();
      }
    };
  }
});
