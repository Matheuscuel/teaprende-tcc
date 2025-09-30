// backend/src/database/migrations/0002_create_games_table.js
exports.up = async function (knex) {
  const exists = await knex.schema.hasTable('games');
  if (!exists) {
    await knex.schema.withSchema('public').createTable('games', (table) => {
      table.increments('id').primary();              // INTEGER auto-increment
      table.string('title', 100).notNullable().unique();
      table.text('description');
      table.string('level', 50);
      table.string('category', 100);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.integer('min_age');
      table.integer('max_age');
    });
  }
};

exports.down = async function (knex) {
  await knex.schema.withSchema('public').dropTableIfExists('games');
};

