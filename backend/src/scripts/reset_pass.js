const { prisma } = require("../db");   // e não "../src/db"
const bcrypt = require("bcrypt");


(async () => {
  // define aqui as novas senhas
  const newTherapistPass = "joao";
  const newAdminPass = "admin123";

  // tenta achar usuários
  const therapist = await prisma.users.findFirst({ where: { email: "prof1@example.com" } });
  const admin = await prisma.users.findFirst({ where: { email: "admin@teste.com" } });

  if (therapist) {
    const hashed = await bcrypt.hash(newTherapistPass, 10);
    await prisma.users.update({
      where: { id: therapist.id },
      data: { password: hashed, role: therapist.role || "professional" }
    });
    console.log(`✅ Terapeuta (${therapist.email}) resetado para senha '${newTherapistPass}'`);
  } else {
    const hashed = await bcrypt.hash(newTherapistPass, 10);
    await prisma.users.create({
      data: {
        name: "Prof Padrão",
        email: "prof1@example.com",
        password: hashed,
        role: "professional"
      }
    });
    console.log("✅ Terapeuta criado: prof1@example.com / joao");
  }

  if (admin) {
    const hashed = await bcrypt.hash(newAdminPass, 10);
    await prisma.users.update({
      where: { id: admin.id },
      data: { password: hashed, role: admin.role || "admin" }
    });
    console.log(`✅ Admin (${admin.email}) resetado para senha '${newAdminPass}'`);
  } else {
    const hashed = await bcrypt.hash(newAdminPass, 10);
    await prisma.users.create({
      data: {
        name: "Admin",
        email: "admin@teste.com",
        password: hashed,
        role: "admin"
      }
    });
    console.log("✅ Admin criado: admin@teste.com / admin123");
  }

  console.log("🚀 Pronto!");
  process.exit(0);
})();
