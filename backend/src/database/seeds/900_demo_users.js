const bcrypt = require("bcryptjs");

exports.seed = async function (knex) {
  const hasPassword = await knex.schema.hasColumn("users", "password");
  const hasPasswordHash = await knex.schema.hasColumn("users", "password_hash");
  const hash = await bcrypt.hash("123456", 10);

  const mk = (name, email, role) => ({
    name, email, role,
    ...(hasPasswordHash ? { password_hash: hash } : {}),
    ...(hasPassword ? { password: hash } : {}),
  });

  const users = [
    mk("Terapeuta Demo",  "terapeuta@demo.com",  "therapist"),
    mk("Professor Demo",  "prof@demo.com",       "teacher"),
    mk("Responsável Demo","responsavel@demo.com","guardian"),
  ];

  await knex("users").insert(users).onConflict("email").ignore();
};
