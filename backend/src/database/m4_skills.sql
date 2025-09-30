-- Module 4: skills + vínculo opcional em games
CREATE TABLE IF NOT EXISTS skills (
  id SERIAL PRIMARY KEY,
  code        VARCHAR(50)  UNIQUE NOT NULL,
  title       VARCHAR(120) NOT NULL,
  description TEXT
);

ALTER TABLE games
  ADD COLUMN IF NOT EXISTS skill_id INTEGER REFERENCES skills(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_skills_code     ON skills(code);
CREATE INDEX IF NOT EXISTS idx_games_skill_id  ON games(skill_id);
