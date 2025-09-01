// backend/src/database/migrations/0001_create_users_table.js
exports.up = async function (knex) {
  await knex.schema.withSchema("public").createTable("users", (table) => {
    table.increments("id").primary(); // SERIAL (auto incremento)
    table.string("name", 100).notNullable();
    table.string("email", 100).notNullable().unique();
    table.string("password", 255).notNullable();
    table.string("role", 50).defaultTo("responsavel");
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
};

exports.down = async function (knex) {
  await knex.schema.withSchema("public").dropTableIfExists("users");
};

