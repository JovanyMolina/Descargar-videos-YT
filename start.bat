@echo off
echo ========================================
echo   YouTube Downloader Web - Iniciando
echo ========================================
echo.

:: Verificar si existe el entorno virtual de la API
if not exist "api\venv" (
    echo [API] Creando entorno virtual...
    cd api
    python -m venv venv
    call venv\Scripts\activate
    echo [API] Instalando dependencias...
    pip install -r requirements.txt
    cd ..
) else (
    echo [API] Entorno virtual encontrado.
)

:: Verificar si existe node_modules
if not exist "web\node_modules" (
    echo [WEB] Instalando dependencias de Node.js...
    cd web
    npm install
    cd ..
) else (
    echo [WEB] Dependencias de Node.js encontradas.
)

echo.
echo ========================================
echo   Iniciando servidores...
echo ========================================
echo.
echo [API] Backend en http://localhost:8000
echo [WEB] Frontend en http://localhost:3000
echo.
echo Presiona Ctrl+C para detener los servidores.
echo.

:: Iniciar API en una nueva ventana
start "API Server" cmd /k "cd api && venv\Scripts\activate && python main.py"

:: Esperar un poco para que la API inicie
timeout /t 3 /nobreak > nul

:: Iniciar Frontend
cd web
npm run dev
