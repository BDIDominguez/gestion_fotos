@echo off
cd /d "%~dp0\docker"
echo Deteniendo la aplicación...
docker-compose down
echo Todos los contenedores detenidos.
cd ..
