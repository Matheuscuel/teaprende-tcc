exports.up = async function (knex) {
  await knex.schema.createTable("child_tasks", (table) => {
    table.increments("id").primary();
    table.integer("child_id").notNullable()
      .references("id").inTable("children").onDelete("CASCADE");
    table.integer("task_id").notNullable()
      .references("id").inTable("tasks").onDelete("CASCADE");
    table.enu("status", ["assigned","started","completed","skipped"], { useNative: true, enumName: "task_status" })
      .notNullable().defaultTo("assigned");
    table.integer("score");                  // pontuação obtida
    table.timestamp("assigned_at").defaultTo(knex.fn.now());
    table.timestamp("completed_at");
    table.unique(["child_id","task_id"]);
    table.timestamps(true, true);
  });
};
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("child_tasks");
  await knex.raw('DROP TYPE IF EXISTS "task_status"'); // Postgres enum
};
