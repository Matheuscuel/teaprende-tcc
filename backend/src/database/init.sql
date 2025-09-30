-- Criação das tabelas

-- Tabela de usuários
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('terapeuta', 'professor', 'responsavel', 'crianca')),
  institution VARCHAR(255),
  specialization VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de crianças
CREATE TABLE children (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  age INTEGER NOT NULL,
  gender VARCHAR(50) NOT NULL CHECK (gender IN ('masculino', 'feminino', 'outro')),
  notes TEXT,
  parent_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de associação entre crianças e profissionais (terapeutas/professores)
CREATE TABLE child_professional (
  id SERIAL PRIMARY KEY,
  child_id INTEGER REFERENCES children(id) ON DELETE CASCADE,
  professional_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(child_id, professional_id)
);

-- Tabela de jogos
CREATE TABLE games (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  level VARCHAR(50) NOT NULL CHECK (level IN ('Iniciante', 'Intermediário', 'Avançado')),
  category VARCHAR(100) NOT NULL,
  image_url VARCHAR(255),
  instructions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de progresso nos jogos
CREATE TABLE game_progress (
  id SERIAL PRIMARY KEY,
  game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
  child_id INTEGER REFERENCES children(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  time_spent INTEGER, -- em segundos
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir dados iniciais

-- Inserir jogos de exemplo
INSERT INTO games (title, description, level, category, instructions) VALUES
('Reconhecimento de Emoções', 'Aprenda a identificar diferentes expressões faciais e emoções.', 'Iniciante', 'Reconhecimento Emocional', 'Observe a expressão facial e escolha a emoção correspondente.'),
('Cenários Sociais', 'Pratique respostas apropriadas em diferentes situações sociais.', 'Intermediário', 'Interação Social', 'Leia o cenário social e escolha a resposta mais adequada.'),
('Conversação', 'Desenvolva habilidades de diálogo e comunicação verbal.', 'Avançado', 'Comunicação', 'Complete o diálogo escolhendo as respostas mais apropriadas.'),
('Revezamento', 'Aprenda a esperar sua vez e compartilhar em atividades em grupo.', 'Iniciante', 'Interação Social', 'Siga as instruções para praticar o revezamento em diferentes atividades.'),
('Expressões Faciais', 'Combine expressões faciais com as emoções correspondentes.', 'Intermediário', 'Reconhecimento Emocional', 'Arraste as expressões faciais para as emoções correspondentes.'),
('Resolução de Problemas Sociais', 'Encontre soluções para desafios sociais do dia a dia.', 'Avançado', 'Interação Social', 'Leia o problema social e escolha a melhor solução.');

-- Criar funções e triggers para atualização automática do campo updated_at

-- Função para atualizar o timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now(); 
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para a tabela users
CREATE TRIGGER update_users_modtime
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();

-- Trigger para a tabela children
CREATE TRIGGER update_children_modtime
BEFORE UPDATE ON children
FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();

-- Trigger para a tabela games
CREATE TRIGGER update_games_modtime
BEFORE UPDATE ON games
FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();

-- 1) Vínculo explícito criança ↔ jogo (atribuição)
CREATE TABLE IF NOT EXISTS child_game (
  child_id INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  game_id  INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  assigned_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (child_id, game_id)
);

-- 2) Índices úteis
CREATE INDEX IF NOT EXISTS idx_game_progress_child_game_time
  ON game_progress(child_id, game_id, created_at);

-- 3) Visão: desempenho agregado por criança/jogo
CREATE OR REPLACE VIEW v_child_performance AS
SELECT
  gp.child_id,
  gp.game_id,
  COUNT(*)                          AS sessions,
  ROUND(AVG(gp.score)::numeric, 2)  AS avg_score,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY gp.score) AS median_score,
  SUM(gp.time_spent)                AS total_time_spent,
  MIN(gp.created_at)                AS first_play,
  MAX(gp.created_at)                AS last_play
FROM game_progress gp
GROUP BY gp.child_id, gp.game_id;
 -- 0) Extensões úteis
CREATE EXTENSION IF NOT EXISTS citext;    -- e-mail case-insensitive

-- 1) USERS — melhorar e-mail e roles
-- 1.1) Tornar email case-insensitive e manter unicidade
ALTER TABLE users
  ALTER COLUMN email TYPE CITEXT USING email::citext;

-- Reforçar unicidade no citext (alguns Postgres aceitam manter o UNIQUE existente;
-- se quiser garantir explicitamente, crie um índice único em lower(email) - redundante com CITEXT).
-- CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_uniq ON users ((LOWER(email)));

-- 1.2) Incluir 'admin' no CHECK de role
ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users
  ADD CONSTRAINT users_role_check
  CHECK (role IN ('terapeuta', 'professor', 'responsavel', 'crianca', 'admin'));

-- 1.3) Garantir defaults/NOT NULL coerentes (sem quebrar dados existentes)
ALTER TABLE users
  ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP,
  ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;

-- 2) CHILDREN — pequenas proteções
-- Idade não-negativa
ALTER TABLE children
  ALTER COLUMN age DROP NOT NULL;           -- torna opcional (opcional)
ALTER TABLE children
  ADD CONSTRAINT children_age_nonneg CHECK (age IS NULL OR age >= 0);

-- Parent/owner pode ser removido => já está ON DELETE DEFAULT (NULL). Opcionalmente:
-- ALTER TABLE children DROP CONSTRAINT IF EXISTS children_parent_id_fkey;
-- ALTER TABLE children ADD CONSTRAINT children_parent_id_fkey
--   FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE children
  ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP,
  ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;

-- 3) CHILD_PROFESSIONAL — já tem UNIQUE(child_id, professional_id); OK

-- 4) GAMES — manter consistência
ALTER TABLE games
  ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP,
  ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;

-- 5) GAME_PROGRESS — reforços e índices
-- score já tem CHECK 0..100. Vamos garantir time_spent não-negativa
ALTER TABLE game_progress
  ADD CONSTRAINT game_progress_time_nonneg CHECK (time_spent IS NULL OR time_spent >= 0);

-- 6) Atribuição criança↔jogo já criada como child_game; manter

-- 7) Índices recomendados (performance em consultas comuns)
-- Busca por e-mail em users
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- Consultas por criança/jogo em progresso e child_game
CREATE INDEX IF NOT EXISTS idx_game_progress_child ON game_progress (child_id);
CREATE INDEX IF NOT EXISTS idx_game_progress_game  ON game_progress (game_id);
CREATE INDEX IF NOT EXISTS idx_child_game_child ON child_game (child_id);
CREATE INDEX IF NOT EXISTS idx_child_game_game  ON child_game (game_id);

-- 8) Trigger de updated_at já criada por você; vamos reaproveitar para game_progress também (opcional)
CREATE TRIGGER update_game_progress_modtime
BEFORE UPDATE ON game_progress
FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();

-- 9) VIEW v_child_performance já criada; ok

-- 10) Seed opcional de ADMIN (troque hash antes de produção!)
-- Hash bcrypt(10) de "Admin@123" (exemplo)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@teste.com') THEN
    INSERT INTO users (name, email, password, role, institution, specialization)
    VALUES (
      'Admin',
      'admin@teste.com',
      '$2b$10$wU9Lq5rXr9a1mQ7m7qM9dOGd9wqB4Wm0H7p9S2P5m1C4w1B2yQmTO', -- bcrypt "Admin@123"
      'admin',
      'TEAprende',
      'Administrador'
    );
  END IF;
END$$;
