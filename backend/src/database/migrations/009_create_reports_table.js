// backend/src/database/migrations/009_create_reports_table.js
exports.up = async function (knex) {
  // Garante que as tabelas referenciadas existem (ordem de migrations)
  const usersExists = await knex.schema.hasTable('users');
  const gamesExists = await knex.schema.hasTable('games');
  const childrenExists = await knex.schema.hasTable('children');

  if (!usersExists || !gamesExists || !childrenExists) {
    throw new Error(
      "[009_create_reports_table] 'users', 'games' e 'children' precisam existir antes. " +
      "Verifique a ordem das migrations."
    );
  }

  const { rows } = await knex.raw("SELECT to_regclass('public.reports') AS exists;");
  const exists = rows[0] && rows[0].exists !== null;

  if (!exists) {
    await knex.schema.withSchema('public').createTable('reports', (table) => {
      table.increments('id').primary();                // INTEGER PK auto-increment
      table.integer('child_id').notNullable()
        .references('id').inTable('children').onDelete('CASCADE');
      table.integer('game_id').notNullable()
        .references('id').inTable('games').onDelete('CASCADE');

      table.decimal('score', 10, 2);                   // compatível com sua rota
      table.integer('duration_seconds');               // compatível com sua rota
      table.timestamp('completed_at').defaultTo(knex.fn.now());

      table.jsonb('data');                             // opcional para detalhes adicionais
    });

    // Índices úteis para as consultas de desempenho
    await knex.raw("CREATE INDEX IF NOT EXISTS idx_reports_child ON public.reports(child_id)");
    await knex.raw("CREATE INDEX IF NOT EXISTS idx_reports_child_completed ON public.reports(child_id, completed_at DESC)");
  }
};

exports.down = async function (knex) {
  await knex.schema.withSchema('public').dropTableIfExists('reports');
};
