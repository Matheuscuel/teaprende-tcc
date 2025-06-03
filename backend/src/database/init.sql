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

