# Engineering App (Full Stack)

This project has been migrated to a full-stack architecture.

## Structure
- **backend/**: Node.js + Express + MySQL API.
- **frontend/**: Next.js Client (previously `enginer-app`).

## Setup
1.  **Database**: Ensure MySQL is running. The app uses database `engineering_web` (user: root, password: [empty]).
    - The database was automatically created and seeded.
2.  **Dependencies**:
    - Backend: `cd backend && npm install` (Already done)
    - Frontend: `cd frontend && npm install` (Already done)

## Running the App
Double-click **`start_app.bat`** to start both servers.

Or run manually:
1.  **Backend**: `cd backend && npm start` (Runs on port 5000)
2.  **Frontend**: `cd frontend && npm run dev` (Runs on port 3000)

## API Endpoints
- `GET /items` - List all items
- `POST /auth/login` - Login
- ...and more.
