exports.up = async function (knex) {
  await knex.schema.createTable("child_assigned_games", (table) => {
    table.increments("id").primary();
    table.integer("child_id").notNullable()
      .references("id").inTable("children").onDelete("CASCADE");
    table.string("slug").notNullable(); // ex.: memory
    table.unique(["child_id", "slug"]);
    table.timestamps(true, true);
  });
};
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("child_assigned_games");
};
