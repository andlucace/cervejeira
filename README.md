# Cervejeira

Aplicação full-stack para controle de estoque de cervejas.

## Estrutura
- Frontend: Vite + React + TypeScript
- Backend: FastAPI + SQLAlchemy + SQLite

## Deploy no Hostinger

### Frontend
1. Gere o build localmente:
   - `cd frontend`
   - `npm install`
   - `npm run build`
2. Publique o conteúdo da pasta `frontend/dist` no diretório público do Hostinger.
3. Defina a variável de ambiente `VITE_API_URL` para a URL pública da API.

### Backend
1. Faça upload da pasta `backend` para o ambiente Python do Hostinger.
2. Instale as dependências:
   - `pip install -r requirements.txt`
3. Inicie o servidor com:
   - `uvicorn main:app --host 0.0.0.0 --port 8000`
4. Se o painel suportar `Procfile`, use o comando já incluído.

### Observações
- O banco é SQLite e fica no diretório `backend/cervejeira.db`.
- Em ambientes compartilhados, pode ser necessário garantir permissão de escrita para esse arquivo.
