exports.up = async function (knex) {
  await knex.schema.createTable("game_sessions2", (table) => {
    table.increments("id").primary();
    table.integer("child_id").notNullable()
      .references("id").inTable("children").onDelete("CASCADE");
    table.string("slug").notNullable();               // ex.: memory
    table.integer("attempts").defaultTo(0);
    table.integer("matched_pairs").defaultTo(0);
    table.integer("duration_seconds").defaultTo(0);
    table.integer("score").defaultTo(0);
    table.timestamps(true, true);
    table.index(["child_id", "slug"]);
  });
};
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("game_sessions2");
};
