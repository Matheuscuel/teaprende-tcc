// backend/prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const games = [
    { title: 'Associações Básicas', description: 'Jogo de pareamento de figuras', difficulty: 'fácil' },
    { title: 'Sequências', description: 'Ordenar passos simples', difficulty: 'médio' },
    { title: 'Atenção e Foco', description: 'Estímulos visuais/sonoros', difficulty: 'médio' },
    { title: 'Memória Rápida', description: 'Recordar padrões', difficulty: 'difícil' },
  ];

  for (const g of games) {
    const exists = await prisma.game.findFirst({ where: { title: g.title } });
    if (!exists) {
      await prisma.game.create({ data: g });
    }
  }

  console.log('Seed concluído.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});

