# TEAprende – Setup Rápido (Docker Compose)

Sobe **Postgres + API (Node/Express/Knex) + Next.js** com um único comando.

## Pré-requisitos
- Docker e Docker Compose
- Portas livres: 3000 (Next.js), 3001 (API), 5432 (Postgres)

## 1) Arquivos de ambiente
Crie os arquivos a partir dos exemplos (sem segredos):
- backend/.env  ← copie de backend/.env.example
- frontend/.env ← copie de frontend/.env.example (se usar o CRA)

O `knexfile.js` usa: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME.

## 2) Subir tudo
docker compose up -d

- Postgres: localhost:5432 (db: tea_system, user/pass: tea/tea)
- API: http://localhost:3001/api/health
- Next.js: http://localhost:3000

## 3) Reset do banco (se necessário)
docker compose exec api npx knex migrate:rollback --all --knexfile knexfile.js
docker compose exec api npx knex migrate:latest --knexfile knexfile.js

## 4) Usando o CRA em vez do Next.js
- Comente o serviço web_next e descomente o web_cra no docker-compose.yml.
- CRA: http://localhost:5173

## 5) Rotas principais da API (prefixo /api)
- /auth – POST /register, POST /login
- /users – GET /me, PUT /me
- /children – CRUD + /:id/games + /:id/performance
- /games – CRUD + progresso e atividades
- /reports – progresso, skills, tempo por criança
- /game-progress – registro de progresso
- /health – status da API

## Dicas
- Eleja o Next.js como front oficial e trate /frontend como legado.
- No backend, use src/server.js como entrypoint.
- Não versione .env; use apenas .env.example.
