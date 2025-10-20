/**
 * users + user_children
 */
exports.up = async function(knex) {
  await knex.schema
    .raw("CREATE TYPE user_role AS ENUM ('therapist','teacher','guardian')")
    .raw("CREATE TYPE relationship_role AS ENUM ('therapist','teacher','guardian')");

  await knex.schema.createTable('users', (t) => {
    t.increments('id').primary();
    t.string('name').notNullable();
    t.string('email').notNullable().unique();
    t.string('password_hash').notNullable();
    t.specificType('role', 'user_role').notNullable();
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('user_children', (t) => {
    t.increments('id').primary();
    t.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.integer('child_id').notNullable().references('id').inTable('children').onDelete('CASCADE');
    t.specificType('relationship', 'relationship_role').notNullable();
    t.unique(['user_id','child_id','relationship']);
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('user_children');
  await knex.schema.dropTableIfExists('users');
  await knex.schema
    .raw("DROP TYPE IF EXISTS relationship_role")
    .raw("DROP TYPE IF EXISTS user_role");
};
