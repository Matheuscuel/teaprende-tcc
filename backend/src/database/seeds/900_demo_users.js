const bcrypt = require("bcrypt");

exports.seed = async function(knex) {
  await knex("user_children").del();
  await knex("users").del();

  // garante 1 criança demo
  let child = await knex("children").first("id").where({ name: "Criança Demo" });
  let childId;
  if (!child) {
    [childId] = await knex("children").insert({ name: "Criança Demo" }).returning("id");
    childId = childId.id ?? childId; // pg<8 vs >=8
  } else {
    childId = child.id;
  }

  const hash = async (p) => await bcrypt.hash(p, 10);

  const [thera] = await knex("users")
    .insert({ name: "Terapeuta Demo", email: "terapeuta@demo.com", password_hash: await hash("123456"), role: "therapist" })
    .returning(["id"]);
  const therapistId = thera.id ?? thera;

  const [teach] = await knex("users")
    .insert({ name: "Professor Demo", email: "prof@demo.com", password_hash: await hash("123456"), role: "teacher" })
    .returning(["id"]);
  const teacherId = teach.id ?? teach;

  const [guard] = await knex("users")
    .insert({ name: "Responsável Demo", email: "responsavel@demo.com", password_hash: await hash("123456"), role: "guardian" })
    .returning(["id"]);
  const guardianId = guard.id ?? guard;

  await knex("user_children").insert([
    { user_id: therapistId, child_id: childId, relationship: "therapist" },
    { user_id: teacherId,   child_id: childId, relationship: "teacher"   },
    { user_id: guardianId,  child_id: childId, relationship: "guardian"  },
  ]);
};
