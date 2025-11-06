exports.up = async (knex) => {
  const has = await knex.schema.hasColumn('users', 'password');
  if (has) {
    await knex.schema.alterTable('users', (t) => { t.dropColumn('password'); });
  }
};

exports.down = async (knex) => {
  const has = await knex.schema.hasColumn('users', 'password');
  if (!has) {
    await knex.schema.alterTable('users', (t) => {
      t.string('password', 255).notNullable().defaultTo('');
    });
  }
};
