exports.up = async function (knex) {
  await knex.schema.createTable("tasks", (table) => {
    table.increments("id").primary();
    table.string("title").notNullable();
    table.string("type").notNullable();      // ex.: puzzle, painting, matching
    table.integer("difficulty").notNullable().defaultTo(1); // 1..5
    table.boolean("active").notNullable().defaultTo(true);
    table.jsonb("payload_json");             // config específica da tarefa
    table.timestamps(true, true);
  });
};
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("tasks");
};
