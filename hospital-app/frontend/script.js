document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const protectedPages = ['dashboard.html', 'doctors.html', 'appointments.html', 'inventory.html'];
    const isProtectedPage = protectedPages.some(page => window.location.pathname.includes(page));

    if (!token && isProtectedPage) {
        window.location.href = 'index.html';
    }

    if (window.location.pathname.includes('dashboard.html')) {
        loadPatients();
        setupInteractivity();
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            window.location.href = 'index.html';
        });
    }

    const patientForm = document.getElementById('patient-form');
    if (patientForm) {
        patientForm.addEventListener('submit', handlePatientForm);
    }

    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', () => {
            patientForm.reset();
            document.getElementById('patient-id').value = '';
            document.getElementById('form-title').innerText = 'Register Patient';
            document.getElementById('submit-btn').innerText = 'Add Patient';
            cancelEditBtn.classList.add('hidden');
        });
    }
});

async function loadPatients() {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch('http://localhost:5000/api/patients', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const patients = await res.json();
        const tbody = document.getElementById('patients-body');
        tbody.innerHTML = '';
        patients.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${p.name}</td>
                <td>${p.age}</td>
                <td>${p.gender}</td>
                <td>${p.condition}</td>
                <td>${p.doctor}</td>
                <td class="action-btns">
                    <button class="edit-btn" onclick="editPatient('${p._id}', '${p.name}', ${p.age}, '${p.gender}', '${p.condition}', '${p.doctor}')">Edit</button>
                    <button class="delete-btn" onclick="deletePatient('${p._id}')">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error('Error loading patients:', err);
    }
}

async function handlePatientForm(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const id = document.getElementById('patient-id').value;
    const name = document.getElementById('p-name').value;
    const age = document.getElementById('p-age').value;
    const gender = document.getElementById('p-gender').value;
    const condition = document.getElementById('p-condition').value;
    const doctor = document.getElementById('p-doctor').value;

    const method = id ? 'PUT' : 'POST';
    const url = id ? `http://localhost:5000/api/patients/${id}` : 'http://localhost:5000/api/patients';

    try {
        const res = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, age, gender, condition, doctor })
        });
        const data = await res.json();
        if (data._id || data.msg) {
            document.getElementById('patient-form').reset();
            document.getElementById('patient-id').value = '';
            document.getElementById('form-title').innerText = 'Register Patient';
            document.getElementById('submit-btn').innerText = 'Add Patient';
            document.getElementById('cancel-edit-btn').classList.add('hidden');
            loadPatients();
        }
    } catch (err) {
        console.error('Error handling form:', err);
    }
}

function editPatient(id, name, age, gender, condition, doctor) {
    document.getElementById('patient-id').value = id;
    document.getElementById('p-name').value = name;
    document.getElementById('p-age').value = age;
    document.getElementById('p-gender').value = gender;
    document.getElementById('p-condition').value = condition;
    document.getElementById('p-doctor').value = doctor;

    document.getElementById('form-title').innerText = 'Edit Patient';
    document.getElementById('submit-btn').innerText = 'Update Patient';
    document.getElementById('cancel-edit-btn').classList.remove('hidden');
}

async function deletePatient(id) {
    if (!confirm('Are you sure you want to delete this patient?')) return;
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`http://localhost:5000/api/patients/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.msg) {
            loadPatients();
        }
    } catch (err) {
        console.error('Error deleting patient:', err);
    }
}

function setupInteractivity() {
    // Moving object feature
    const movingText = document.getElementById('moving-text');
    let pos = 0;
    let direction = 1;
    setInterval(() => {
        pos += direction * 2;
        if (pos > 100 || pos < 0) direction *= -1;
        movingText.style.left = pos + 'px';
    }, 50);

    // Color changing feature
    const bgBtn = document.getElementById('change-bg-btn');
    const colors = ['#f4f4f4', '#e0f7fa', '#fff9c4', '#f1f8e9', '#fff3e0'];
    let colorIdx = 0;
    bgBtn.addEventListener('click', () => {
        colorIdx = (colorIdx + 1) % colors.length;
        document.body.style.backgroundColor = colors[colorIdx];
    });
}
