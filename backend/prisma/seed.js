// backend/prisma/seed.js
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function upsertUser({ name, email, password, role, institution = null, specialization = null }) {
  const existing = await prisma.$queryRaw`
    SELECT id FROM users WHERE email = ${email}
  `;
  if (existing.length) {
    // garante role coerente (não troca senha existente)
    await prisma.$executeRaw`
      UPDATE users SET role = ${role}
      WHERE id = ${existing[0].id}
    `;
    return existing[0].id;
  }
  const hash = await bcrypt.hash(password, 10);
  const rows = await prisma.$queryRaw`
    INSERT INTO users (name, email, password, role, institution, specialization)
    VALUES (${name}, ${email}, ${hash}, ${role}, ${institution}, ${specialization})
    RETURNING id
  `;
  return rows[0].id;
}

async function ensureGames() {
  const c = await prisma.$queryRaw`SELECT COUNT(*)::int AS c FROM games`;
  if (c[0].c > 0) return; // já tem jogos

  // ATENÇÃO: level precisa ser exatamente um destes: Iniciante | Intermediário | Avançado
  await prisma.$executeRawUnsafe(`
    INSERT INTO games (title, description, level, category, image_url, instructions) VALUES
    ('Reconhecimento de Emoções','Aprenda a identificar diferentes expressões faciais e emoções.','Iniciante','Reconhecimento Emocional',NULL,'Observe a expressão facial e escolha a emoção correspondente.'),
    ('Cenários Sociais','Pratique respostas apropriadas em diferentes situações sociais.','Intermediário','Interação Social',NULL,'Leia o cenário social e escolha a resposta mais adequada.'),
    ('Conversação','Desenvolva habilidades de diálogo e comunicação verbal.','Avançado','Comunicação',NULL,'Complete o diálogo escolhendo as respostas mais apropriadas.'),
    ('Revezamento','Aprenda a esperar sua vez e compartilhar em atividades em grupo.','Iniciante','Interação Social',NULL,'Siga as instruções para praticar o revezamento em diferentes atividades.'),
    ('Expressões Faciais','Combine expressões faciais com as emoções correspondentes.','Intermediário','Reconhecimento Emocional',NULL,'Arraste as expressões faciais para as emoções correspondentes.'),
    ('Resolução de Problemas Sociais','Encontre soluções para desafios sociais do dia a dia.','Avançado','Interação Social',NULL,'Leia o problema social e escolha a melhor solução.');
  `);
}

async function main() {
  await ensureGames();

  const adminId = await upsertUser({
    name: 'Admin',
    email: 'admin@teste.com',
    password: 'Admin@123',
    role: 'admin',
  });

  const therId = await upsertUser({
    name: 'Leo',
    email: 'leo@teste.com',
    password: 'Leo@123456',
    role: 'terapeuta',
  });

  const respId = await upsertUser({
    name: 'Maria',
    email: 'maria@teste.com',
    password: 'Maria@123456',
    role: 'responsavel',

  });
  const profId = await upsertUser({
    name: 'Professor',
    email: 'prof@teste.com',
    password: 'Prof@123456',
    role: 'professor',
  });

  console.log({ adminId, therId, respId, profId });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
