# Team Task Manager (TTM)

A professional, full-stack productivity platform for teams, featuring a modern glassmorphism UI, real-time task tracking, and role-based access control.

## 📂 Project Structure

The project is organized as a monorepo with separate directories for the frontend and backend:

```text
TTM/
├── frontend/          # React + Vite (Frontend Application)
│   ├── src/           # Component logic and UI
│   └── package.json
└── backend/           # Node.js + Express (Backend API)
    ├── server.js      # Main API entry point
    ├── database/      # Sequelize Models and DB config
    └── package.json
```

## 🚀 Tech Stack

- **Frontend**: React, Vite, Tailwind CSS (optional), Lucide Icons, Recharts.
- **Backend**: Node.js, Express, JWT (Authentication), bcryptjs.
- **Database**: Sequelize ORM, SQLite (Local), PostgreSQL (Production).

---

## 💻 Local Development

To run the project locally, you need to start both the backend and the frontend.

### 1. Setup Backend
```bash
cd backend
npm install
npm start
```
- Runs on: `http://localhost:5000`
- Uses: `database.sqlite` for storage.

### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
- Runs on: `http://localhost:5173` (typically).
- Automatically connects to the backend on port 5000.

---

## 🌐 Deployment

### Backend (Railway.app)
1. Set the **Root Directory** to `backend`.
2. Add a **PostgreSQL** database service.
3. Link the `DATABASE_URL` variable to your backend service.
4. Set `PORT` to default (Railway handles this automatically).

### Frontend (Netlify)
1. Set the **Base Directory** to `frontend`.
2. Set **Build Command** to `npm run build`.
3. Set **Publish Directory** to `dist`.
4. Add Environment Variable:
   - `VITE_API_URL`: `https://your-railway-app.up.railway.app/api`

---

## 🔑 Admin Credentials (Demo)

Use these credentials to access the admin dashboard:
- **Email**: `admin@example.com`
- **Password**: `admin123`

---

## ✨ Features
- **Dashboard**: Overview of team productivity and project health.
- **Task Management**: Create, assign, and track tasks across different projects.
- **Team Pulse**: Monitor team member status and activity.
- **Gamification**: Earn XP and badges for completing tasks.
- **Time Tracking**: Log work hours for specific tasks.
