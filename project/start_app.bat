@echo off
echo Starting Engineering App...

echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm start"

echo Starting Frontend Server...
start "Frontend Client" cmd /k "cd frontend && npm run dev"

echo App started! backend: http://localhost:5000, frontend: http://localhost:3000
pause
