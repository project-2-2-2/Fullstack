# TaskForge — Full Stack Task Manager

A complete full-stack web application with:
- **Frontend**: Vanilla HTML, CSS, JavaScript (no frameworks)
- **Backend**: Node.js + Express + MongoDB + JWT

---

## Features

- ✅ **JWT Authentication** — Register, login, logout with bcrypt password hashing
- ✅ **Role-based access** — user / manager / admin roles
- ✅ **Task CRUD** — Create, read, update, delete tasks
- ✅ **Advanced filtering** — Filter by status, priority, category; full-text search
- ✅ **Sortable table** — Click column headers to sort
- ✅ **Pagination** — Configurable rows per page
- ✅ **Bulk operations** — Select multiple tasks and bulk delete
- ✅ **Analytics dashboard** — Visual breakdowns via progress bars
- ✅ **iFrame embed** — Load any external URL inside the workspace
- ✅ **Profile management** — Update name, department, avatar
- ✅ **Password change** — Secure password update endpoint
- ✅ **Responsive** — Mobile sidebar with hamburger menu
- ✅ **Toast notifications** — Non-blocking success/error messages
- ✅ **Dark industrial design** — Space Mono + Syne fonts

---

## Project Structure

```
taskmanager/
├── backend/
│   ├── server.js              # Express app entry point
│   ├── package.json
│   ├── .env                   # Environment variables
│   ├── middleware/
│   │   └── auth.js            # JWT protect + authorize middleware
│   ├── models/
│   │   ├── User.js            # Mongoose User schema
│   │   └── Task.js            # Mongoose Task schema
│   └── routes/
│       ├── auth.js            # /api/auth — register, login, logout, me
│       ├── tasks.js           # /api/tasks — full CRUD + stats
│       └── users.js           # /api/users — profile management
└── frontend/
    ├── index.html             # Login page
    ├── register.html          # Registration page
    ├── dashboard.html         # Main dashboard (tasks, analytics, embed)
    ├── profile.html           # User profile & security settings
    ├── css/
    │   └── style.css          # All styles
    └── js/
        ├── api.js             # Shared API helper, Auth utils, Toast
        └── dashboard.js       # Dashboard logic (tasks, charts, modals)
```

---

## Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment

Edit `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

For **MongoDB Atlas**, replace `MONGO_URI` with your connection string:
```
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/taskmanager
```

### 3. Start the server

```bash
# Development (with nodemon auto-reload)
cd backend
npm run dev

# Production
npm start
```

### 4. Open in browser

```
http://localhost:5000
```

---

## API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | — | Register new user |
| POST | /api/auth/login | — | Login, returns JWT |
| GET | /api/auth/me | ✓ | Get current user |
| POST | /api/auth/logout | ✓ | Logout (client-side) |
| PUT | /api/auth/change-password | ✓ | Change password |

### Tasks
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/tasks | ✓ | List tasks (filter, search, paginate, sort) |
| GET | /api/tasks/stats | ✓ | Aggregated stats |
| GET | /api/tasks/:id | ✓ | Get single task |
| POST | /api/tasks | ✓ | Create task |
| PUT | /api/tasks/:id | ✓ | Update task |
| PATCH | /api/tasks/:id/status | ✓ | Update status only |
| DELETE | /api/tasks/:id | ✓ | Delete task |
| DELETE | /api/tasks | ✓ | Bulk delete (body: { ids: [] }) |

### Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/users/profile | ✓ | Get profile |
| PUT | /api/users/profile | ✓ | Update profile |
| GET | /api/users | ✓ Admin | List all users |
| DELETE | /api/users/:id | ✓ Admin | Delete user |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Server + DB status |

---

## Task Fields

| Field | Type | Values |
|-------|------|--------|
| title | String | required, 3–100 chars |
| description | String | optional, max 500 |
| status | Enum | todo, in-progress, review, done |
| priority | Enum | low, medium, high, critical |
| category | Enum | development, design, marketing, operations, research, other |
| dueDate | Date | optional |
| tags | [String] | optional array |
| progress | Number | 0–100 |

---

## Demo Credentials

The login page has a "Fill Demo" button. You can also register any account.

If you want to seed a demo user manually, run this in MongoDB shell:

```js
db.users.insertOne({
  name: "Demo User",
  email: "demo@taskforge.io",
  // bcrypt hash of "demo123"
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCkQxVVlDk.Dx.n6bYv5K4y",
  role: "user",
  department: "General",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```
