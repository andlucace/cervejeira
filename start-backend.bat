@echo off
echo === Iniciando Backend (FastAPI) ===
echo Acesse a API em: http://localhost:8000
echo Documentacao:    http://localhost:8000/docs
echo.
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
