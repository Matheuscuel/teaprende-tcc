exports.up = async function (knex) {
  await knex.schema.createTable("skills", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable();      // ex.: comunicação
    table.string("category");                // social, linguagem, motora...
    table.text("description");
    table.boolean("active").notNullable().defaultTo(true);
    table.timestamps(true, true);
  });
};
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("skills");
};
