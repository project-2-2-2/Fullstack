# Full-Stack Boilerplate (Vanilla + Express + MongoDB)

## Directory structure

- `frontend/`: Static HTML/CSS/JS (no frameworks)
- `backend/`: Node.js + Express API + MongoDB (Mongoose)

## Features

- JWT authentication (register/login/me)
- Protected pages + navbar
- CRUD examples:
  - Posts (`/api/posts`)
  - Products (`/api/products`)
  - Tasks (`/api/tasks`)
  - Users (`/api/users`) admin-only list/search
- Tables + forms + modals in frontend
- Reports page demonstrates an iframe (`frontend/reports.html`)

## Run locally

1) In `backend/`, create `.env` (or edit the existing one):

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret
JWT_EXPIRE=7d
PORT=5002
NODE_ENV=development
```

2) Install + start:

```bash
cd backend
npm install
npm run dev
```

3) Open `http://localhost:5002`

## Notes

- The frontend calls the API via same-origin `/api` (no hardcoded ports).
- Admin-only:
  - `GET /api/users`
  - `GET /api/users/email/:email`

