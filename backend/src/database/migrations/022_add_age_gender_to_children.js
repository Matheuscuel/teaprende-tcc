/**
 * Migration para adicionar campos age e gender à tabela children
 */
exports.up = async function (knex) {
  const hasTable = await knex.schema.hasTable('children');
  if (!hasTable) {
    console.warn('Tabela children não existe, pulando migration');
    return;
  }

  // Adicionar coluna age se não existir
  const hasAge = await knex.schema.hasColumn('children', 'age');
  if (!hasAge) {
    await knex.schema.table('children', (table) => {
      table.integer('age').nullable();
    });
  }

  // Adicionar coluna gender se não existir
  const hasGender = await knex.schema.hasColumn('children', 'gender');
  if (!hasGender) {
    await knex.schema.table('children', (table) => {
      table.string('gender', 50).nullable();
    });
  }
};

exports.down = async function (knex) {
  const hasTable = await knex.schema.hasTable('children');
  if (!hasTable) return;

  const hasAge = await knex.schema.hasColumn('children', 'age');
  if (hasAge) {
    await knex.schema.table('children', (table) => {
      table.dropColumn('age');
    });
  }

  const hasGender = await knex.schema.hasColumn('children', 'gender');
  if (hasGender) {
    await knex.schema.table('children', (table) => {
      table.dropColumn('gender');
    });
  }
};

