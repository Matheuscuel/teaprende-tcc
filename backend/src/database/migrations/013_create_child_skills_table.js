exports.up = async function (knex) {
  await knex.schema.createTable("child_skills", (table) => {
    table.increments("id").primary();
    table.integer("child_id").notNullable()
      .references("id").inTable("children").onDelete("CASCADE");
    table.integer("skill_id").notNullable()
      .references("id").inTable("skills").onDelete("CASCADE");
    table.integer("level").notNullable().defaultTo(0); // 0..5
    table.jsonb("evidence_json");   // observações/descrições
    table.unique(["child_id","skill_id"]);
    table.timestamps(true, true);   // cria created_at e updated_at
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("child_skills");
};
