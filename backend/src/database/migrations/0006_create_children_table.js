// backend/src/database/migrations/0006_create_children_table.js
exports.up = async function (knex) {
  // Garante que a tabela users existe antes de criar FKs
  const usersExists = await knex.schema.hasTable('users');
  if (!usersExists) {
    throw new Error(
      "[0006_create_children_table] A tabela 'users' não existe ainda. " +
      "Garanta que a migration de users rode antes desta (ordem numérica dos arquivos)."
    );
  }

  // Checagem robusta no schema 'public'
  const { rows } = await knex.raw("SELECT to_regclass('public.children') AS exists;");
  const exists = rows[0] && rows[0].exists !== null;

  if (!exists) {
    await knex.schema.withSchema('public').createTable('children', (table) => {
      // Inteiro autoincremento, como está no seu banco
      table.increments('id').primary(); // INTEGER

      table.string('name', 100).notNullable();  // seu \d mostrou varchar(100)
      table.date('birth_date');                 // usar birth_date (com underline) para casar com o banco

      // user_id: profissional vinculado (TERAPEUTA/PROFESSOR) — INTEGER, FK em users(id)
      table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');

      // owner_id: responsável (RESPONSAVEL) — INTEGER, FK em users(id)
      table.integer('owner_id').references('id').inTable('users').onDelete('SET NULL');

      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.text('notes');
    });
  }
};

exports.down = async function (knex) {
  await knex.schema.withSchema('public').dropTableIfExists('children');
};
