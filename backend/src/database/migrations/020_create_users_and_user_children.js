/**
 * Idempotente:
 * - Garante o TYPE relationship_role
 * - Cria users e user_children apenas se não existirem
 */
exports.up = async function(knex) {
  // 1) TYPE seguro
  await knex.schema.raw(`DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'relationship_role') THEN
      CREATE TYPE relationship_role AS ENUM ('therapist','teacher','guardian');
    END IF;
  END $$;`);

  // 2) Tabela users, se não existir
  const hasUsers = await knex.schema.hasTable('users');
  if (!hasUsers) {
    await knex.schema.createTable('users', (t) => {
      t.increments('id').primary();
      t.string('name').notNullable();
      t.string('email').notNullable().unique();
      t.string('password_hash').notNullable();
      t.timestamp('created_at').defaultTo(knex.fn.now());
      t.timestamp('updated_at').defaultTo(knex.fn.now());
    });
  }

  // 3) Tabela user_children, se não existir
  const hasUserChildren = await knex.schema.hasTable('user_children');
  if (!hasUserChildren) {
    await knex.schema.createTable('user_children', (t) => {
      t.increments('id').primary();
      t.integer('user_id').notNullable()
        .references('id').inTable('users').onDelete('CASCADE');
      t.integer('child_id').notNullable()
        .references('id').inTable('children').onDelete('CASCADE');
      t.specificType('role', 'relationship_role').notNullable();
      t.timestamp('created_at').defaultTo(knex.fn.now());
      t.unique(['user_id','child_id']);
    });
  }
};

exports.down = async function(knex) {
  if (await knex.schema.hasTable('user_children')) {
    await knex.schema.dropTable('user_children');
  }
  if (await knex.schema.hasTable('users')) {
    await knex.schema.dropTable('users');
  }
  // Só derruba o TYPE se ainda existir
  await knex.schema.raw(`DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'relationship_role') THEN
      DROP TYPE relationship_role;
    END IF;
  END $$;`);
};
