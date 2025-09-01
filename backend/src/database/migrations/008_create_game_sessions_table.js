// backend/src/database/migrations/008_create_game_sessions_table.js
exports.up = async function (knex) {
  // checa se já existe
  const { rows } = await knex.raw("SELECT to_regclass('public.game_sessions') AS exists;");
  const exists = rows[0] && rows[0].exists !== null;

  if (!exists) {
    await knex.schema.withSchema('public').createTable('game_sessions', (table) => {
      // pode ser serial/integer ou manter uuid só para a sessão; vou usar INTEGER para padronizar com o restante
      table.increments('id').primary(); // INTEGER PK autoincrement

      // ⚠️ IMPORTANTE: tipos inteiros nas FKs para casar com suas tabelas
      table.integer('child_id').notNullable()
        .references('id').inTable('children').onDelete('CASCADE');
      table.integer('game_id').notNullable()
        .references('id').inTable('games').onDelete('CASCADE');

      table.timestamp('started_at').defaultTo(knex.fn.now());
      table.timestamp('finished_at');
      table.decimal('score', 10, 2);
      table.decimal('accuracy', 5, 2);
      table.integer('level');
      table.jsonb('data');
      
      // quem registrou (users.id é INTEGER no seu banco)
      table.integer('created_by')
        .references('id').inTable('users')
        .onDelete('SET NULL');
    });
  }
};

exports.down = async function (knex) {
  await knex.schema.withSchema('public').dropTableIfExists('game_sessions');
};

