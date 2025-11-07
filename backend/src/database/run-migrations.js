/**
 * Script para executar todas as migrations e garantir que todas as tabelas existam
 * Execute: node backend/src/database/run-migrations.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const knex = require('../../knexfile');

async function runMigrations() {
  const knexInstance = require('knex')(knex.development);
  
  try {
    console.log('🚀 Iniciando migrations...');
    console.log('📊 Verificando conexão com banco de dados...');
    
    await knexInstance.raw('SELECT 1');
    console.log('✓ Conexão com banco estabelecida');
    
    console.log('📦 Executando migrations...');
    const [batch, log] = await knexInstance.migrate.latest();
    
    if (log.length === 0) {
      console.log('✓ Todas as migrations já estão aplicadas');
    } else {
      console.log(`✓ ${log.length} migration(s) aplicada(s) com sucesso:`);
      log.forEach((migration, index) => {
        console.log(`  ${index + 1}. ${migration}`);
      });
    }
    
    console.log('\n✅ Migrations concluídas com sucesso!');
    console.log(`📊 Batch atual: ${batch}`);
    
  } catch (error) {
    console.error('❌ Erro ao executar migrations:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await knexInstance.destroy();
  }
}

runMigrations();

