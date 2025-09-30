const { prisma } = require("../db");
const bcrypt = require("bcryptjs");

(async () => {
  try {
    const email = "resp1@example.com";
    const hash = await bcrypt.hash("joao", 10);

    const u = await prisma.users.upsert({
      where: { email },
      update: { name: "Responsável Teste", role: "responsavel", password: hash },
      create: { name: "Responsável Teste", email, role: "responsavel", password: hash },
    });

    console.log("✅ Responsável criado/atualizado:", u.email, "senha=joao");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
