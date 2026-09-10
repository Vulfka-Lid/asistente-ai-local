@echo off
title Asistente Local - Servidor
echo Iniciando Asistente Local...

:: 1. Iniciar el servidor local de Python en el puerto 8000
start /b python -m http.server 8000

:: 2. Esperar 1 segundo y abrir el navegador web
timeout /t 1 >nul
start http://localhost:8000

echo.
echo Servidor iniciado en http://localhost:8000
echo Manten esta ventana abierta para conservar el servidor activo.
echo Presiona CTRL+C para cerrar.