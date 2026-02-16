@echo off
echo Memulai Backend...
start /min cmd /c "cd backend && node server.js"

echo Memulai Frontend...
start /min cmd /c "cd frontend && npm start"

echo Memulai Cloudflare Tunnel (engilog.site)...
cd project
cloudflared.exe tunnel --config config.yml run engilog-tunnel

pause
