exports.up = async function (knex) {
  const { rows } = await knex.raw("SELECT to_regclass('public.children_games') AS exists;");
  const exists = rows[0] && rows[0].exists !== null;
  if (!exists) {
    await knex.schema.withSchema('public').createTable('children_games', (table) => {
      table.increments('id').primary();
      table.integer('child_id').notNullable()
        .references('id').inTable('children').onDelete('CASCADE');
      table.integer('game_id').notNullable()
        .references('id').inTable('games').onDelete('CASCADE');
      table.integer('assigned_by').notNullable()
        .references('id').inTable('users').onDelete('RESTRICT');
      table.timestamp('assigned_at').defaultTo(knex.fn.now());
      table.boolean('active').defaultTo(true);
    });
  }
  // índice único idempotente
  await knex.raw(
    "DO $$ BEGIN CREATE UNIQUE INDEX IF NOT EXISTS uq_child_game ON public.children_games(child_id, game_id); EXCEPTION WHEN undefined_table THEN NULL; END $$;"
  );
};

exports.down = async function (knex) {
  await knex.schema.withSchema('public').dropTableIfExists('children_games');
};
