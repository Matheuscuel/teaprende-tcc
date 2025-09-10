const { prisma } = require("../db");

(async () => {
  const user = await prisma.users.findUnique({ where: { id: 1 } });
  const child = await prisma.children.findUnique({ where: { id: 1 } });
  const game = await prisma.games.findUnique({ where: { id: 1 } });

  console.log("users#1:", user);
  console.log("children#1:", child);
  console.log("games#1:", game);
  process.exit(0);
})();
