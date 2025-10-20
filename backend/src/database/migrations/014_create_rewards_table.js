exports.up = async function (knex) {
  await knex.schema.createTable("rewards", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable();       // estrela, adesivo...
    table.integer("points").notNullable().defaultTo(0);
    table.string("icon");                     // slug/caminho do ícone
    table.boolean("active").notNullable().defaultTo(true);
    table.timestamps(true, true);
  });
};
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("rewards");
};
