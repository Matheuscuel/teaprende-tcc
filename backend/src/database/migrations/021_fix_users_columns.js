/**
 * Garante colunas esperadas pelo seed:
 *  - users.password_hash (string, NOT NULL)
 *  - users.role (relationship_role, NOT NULL, default 'therapist')
 *  - created_at / updated_at se faltarem
 */
exports.up = async function(knex) {
  // password_hash
  const hasPwd = await knex.schema.hasColumn("users", "password_hash");
  if (!hasPwd) {
    await knex.schema.alterTable("users", (t) => {
      t.string("password_hash").notNullable().defaultTo("");
    });
  }

  // role (enum relationship_role)
  const hasRole = await knex.schema.hasColumn("users", "role");
  if (!hasRole) {
    await knex.schema.alterTable("users", (t) => {
      t.specificType("role", "relationship_role").notNullable().defaultTo("therapist");
    });
  }

  // created_at / updated_at
  const hasCreatedAt = await knex.schema.hasColumn("users", "created_at");
  if (!hasCreatedAt) {
    await knex.schema.alterTable("users", (t) => t.timestamp("created_at").defaultTo(knex.fn.now()));
  }
  const hasUpdatedAt = await knex.schema.hasColumn("users", "updated_at");
  if (!hasUpdatedAt) {
    await knex.schema.alterTable("users", (t) => t.timestamp("updated_at").defaultTo(knex.fn.now()));
  }
};

exports.down = async function(knex) {
  // Reverte apenas o que adicionamos aqui
  if (await knex.schema.hasColumn("users", "role")) {
    await knex.schema.alterTable("users", (t) => t.dropColumn("role"));
  }
  if (await knex.schema.hasColumn("users", "password_hash")) {
    await knex.schema.alterTable("users", (t) => t.dropColumn("password_hash"));
  }
  // Mantém created_at/updated_at se criados por outras migrations
};
