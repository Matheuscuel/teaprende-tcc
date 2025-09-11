# TEAprende – Módulo 2: Gerenciamento de Crianças

Este módulo implementa:

* Cadastro de crianças (CRUD)
* Associação de jogos à criança
* Registro de pontuações
* Visualização de desempenho individual

> **Pré-requisito:** Módulo 1 (Auth + RBAC) já configurado e em execução.

---

## ⚙️ Preparação

1. Entre na pasta do backend:

   ```bash
   cd backend
   ```
2. Garanta que o **PostgreSQL** (Docker) está ativo. Pelo seu setup:

   * Container: `projeto-db-1`
   * Porta do host: **5433** (mapeada para 5432 do container)
3. Configure o arquivo `.env` (nesta pasta `backend/`):

   ```env
   DATABASE_URL="postgresql://user:1234@localhost:5433/teaprende?schema=public"
   SHADOW_DATABASE_URL="postgresql://user:1234@localhost:5433/teaprende_shadow?schema=public"
   ```
4. Confirme o `datasource` no `prisma/schema.prisma`:

   ```prisma
   datasource db {
     provider          = "postgresql"
     url               = env("DATABASE_URL")
     shadowDatabaseUrl = env("SHADOW_DATABASE_URL")
   }
   ```

---

## 🗄️ Migrações e Seed

1. Gerar o client Prisma:

   ```bash
   npm run prisma:generate
   ```
2. Criar/atualizar as tabelas:

   ```bash
   npm run prisma:migrate
   ```
3. Popular jogos básicos:

   ```bash
   npm run prisma:seed
   ```

   Jogos criados:

   * **Associações Básicas** (fácil)
   * **Sequências** (médio)
   * **Atenção e Foco** (médio)
   * **Memória Rápida** (difícil)

> Se aparecer erro `P1001` (porta errada), confira se está na **pasta backend** e se o `.env` aponta para **localhost:5433**.

---

## ▶️ Executar API

Ambiente de desenvolvimento:

```bash
npm run dev
```

Servidor: **[http://localhost:3001/api](http://localhost:3001/api)**

---

## 🔑 Autenticação

As rotas exigem JWT (gerado no login). Inclua no header:

```http
Authorization: Bearer SEU_TOKEN
```

Perfis com acesso às rotas de crianças: `terapeuta`, `professor`, `responsavel` (com restrições de owner) e `admin`.

---

## 🔗 Endpoints do Módulo 2

### Crianças (CRUD)

* **POST** `/api/children` – criar criança
* **GET** `/api/children` – listar (filtros: `q`, `owner_id`, `active`)
* **GET** `/api/children/:id` – detalhar
* **PUT** `/api/children/:id` – atualizar
* **DELETE** `/api/children/:id` – desativar (soft delete)

### Jogos ⇄ Criança

* **POST** `/api/children/:id/games` – atribuir um ou mais jogos (`{ gameIds: number[], status?: string }`)
* **GET** `/api/children/:id/games` – listar jogos atribuídos
* **DELETE** `/api/children/:id/games/:gameId` – desatribuir jogo

### Desempenho

* **GET** `/api/children/:id/performance` – agregados (média de score, tentativas, último score por jogo)

### Pontuações (para alimentar o desempenho)

* **POST** `/api/scores` – registrar score (`{ child_id, game_id, score, durationS? }`)

---

## 🧪 Roteiro de Demonstração (PowerShell)

> Substitua `$TOKEN` por um JWT válido (`terapeuta`/`professor`/`admin`).

```powershell
$BASE = "http://localhost:3001/api"
$headers = @{ "Authorization" = "Bearer $TOKEN"; "Content-Type"="application/json" }

# 1) Criar criança
$body = @{ name="Ana"; birthdate="2016-05-10"; notes="Acompanha fono" } | ConvertTo-Json
Invoke-WebRequest -Uri "$BASE/children" -Headers $headers -Method POST -Body $body

# 2) Listar crianças
(Invoke-WebRequest -Uri "$BASE/children" -Headers $headers -Method GET).Content

# 3) Atribuir jogos (IDs 1 e 2)
$assign = @{ gameIds = @(1,2); status="ativo" } | ConvertTo-Json
Invoke-WebRequest -Uri "$BASE/children/1/games" -Headers $headers -Method POST -Body $assign

# 4) Registrar score
$score = @{ child_id=1; game_id=1; score=85.5; durationS=120 } | ConvertTo-Json
Invoke-WebRequest -Uri "$BASE/scores" -Headers $headers -Method POST -Body $score

# 5) Consultar desempenho
Invoke-WebRequest -Uri "$BASE/children/1/performance" -Headers $headers -Method GET
```

**Resposta esperada (exemplo):**

```json
{
  "error": false,
  "summary": { "totalSessions": 1, "overallAvgScore": 85.5 },
  "perGame": [
    {
      "game_id": 1,
      "game_title": "Associações Básicas",
      "difficulty": "fácil",
      "avgScore": 85.5,
      "attempts": 1,
      "lastScore": 85.5,
      "lastPlayedAt": "2025-08-21T23:59:00.000Z"
    }
  ]
}
```

---

## 🛠️ Dicas e Troubleshooting

* **P1001 / porta incorreta**: Rode os comandos **dentro de `backend/`** e confirme o `.env` com `5433`.
* **Dois Postgres ativos**: Use sempre o mesmo (recomendado `projeto-db-1` em 5433) para `DATABASE_URL` e `SHADOW_DATABASE_URL`.
* **Shadow Database**: precisa existir e ser acessível. No seu setup: `teaprende_shadow`.
* **Permissões**: o usuário `user` (do container) costuma ter permissão para criar DB. Se não, crie os bancos via `psql` no container com esse usuário.

---

## ✅ O que apresentar ao professor

1. **Cadastro de criança** (POST /children → GET /children)
2. **Atribuição de jogos** (POST /children/\:id/games → GET /children/\:id/games)
3. **Registro de score** (POST /scores)
4. **Desempenho** (GET /children/\:id/performance) mostrando média e último score por jogo

> Dica: deixe um script PowerShell/cURL pronto para rodar ao vivo.

---

## 📂 Onde ficam os arquivos do módulo

* `prisma/schema.prisma` – modelos `User`, `Child`, `Game`, `ChildGame`, `GameScore`
* `prisma/seed.js` – seed de jogos
* `src/lib/prisma.js` – singleton do Prisma Client
* `src/routes/children.js` – CRUD + jogos + desempenho
* `src/routes/scores.js` – registro de pontuações

---

## 📄 Licença

MIT – consulte o arquivo `LICENSE` do repositório.
