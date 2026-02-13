@echo off
set "PATH=%~dp0tools\node-v22.13.0-win-x64;%PATH%"
echo Starting Stocksit 2.0 with local Node environment...
npm.cmd run dev
pause
