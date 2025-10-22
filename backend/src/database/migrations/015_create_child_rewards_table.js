exports.up = async function (knex) {
  await knex.schema.createTable("child_rewards", (table) => {
    table.increments("id").primary();
    table.integer("child_id").notNullable()
      .references("id").inTable("children").onDelete("CASCADE");
    table.integer("reward_id").notNullable()
      .references("id").inTable("rewards").onDelete("CASCADE");
    table.integer("points_awarded").notNullable().defaultTo(0);
    table.text("reason");                     // motivo da premiação
    table.timestamp("awarded_at").defaultTo(knex.fn.now());
    table.timestamps(true, true);
  });
};
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("child_rewards");
};
