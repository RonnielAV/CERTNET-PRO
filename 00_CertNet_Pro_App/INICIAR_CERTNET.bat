@echo off
cd /d "%~dp0"
echo Iniciando CertNet Pro...
echo.
echo Modulo recomendado para el levantamiento:
echo http://127.0.0.1:4173/survey.html
echo.
start "" powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Sleep -Seconds 1; Start-Process 'http://127.0.0.1:4173/survey.html'"
py -3 -m http.server 4173
if errorlevel 1 python -m http.server 4173
pause
