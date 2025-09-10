const { prisma } = require("../db");

(async () => {
  // Usuário profissional id=1
  await prisma.users.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "Prof Padrão",
      email: "prof1@example.com",
      password: "temp123", // ajuste depois
      role: "professional"
    }
  });

  // Criança id=1
  await prisma.children.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "Criança Teste",
      age: 8,
      gender: "N/A"
    }
  });

  // Jogo id=1
  await prisma.games.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      title: "Memória de Cores",
      description: "Jogo para treinar memória visual",
      level: "fácil",
      category: "memória",
      image_url: null,
      instructions: "Clique nas cores na ordem correta"
    }
  });

  console.log("✅ Seed pronto: user#1, child#1, game#1");
  process.exit(0);
})();
