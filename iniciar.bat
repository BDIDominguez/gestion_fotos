@echo off
cd /d "%~dp0\docker"
echo Iniciando la aplicación...
docker-compose up --build -d
echo Aplicación iniciada en:
echo - Backend: http://localhost:8080
echo - Frontend: http://localhost:3000
cd ..
