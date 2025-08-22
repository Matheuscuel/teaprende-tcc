require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");

(async () => {
  const p = new PrismaClient();
  const u = await p.user.upsert({
    where: { email: "admin@local" },
    update: {},
    create: { name: "Admin", email: "admin@local", password: "123456", role: "admin" }
  });
  console.log("user:", u);
  const secret = process.env.JWT_SECRET || "devsecret";
  const token = jwt.sign({ id: u.id, role: u.role }, secret, { expiresIn: "1h" });
  console.log("\nTOKEN:\n", token);
  await p.$disconnect();
})().catch(e => { console.error(e); process.exit(1); });
