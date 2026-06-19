@echo off
echo === Configurando Cervejeira ===
echo.

echo [1/2] Instalando dependencias do backend...
cd backend
pip install -r requirements.txt
cd ..

echo.
echo [2/2] Instalando dependencias do frontend...
cd frontend
npm install
cd ..

echo.
echo === Pronto! ===
echo Execute start-backend.bat e start-frontend.bat em terminais separados.
pause
