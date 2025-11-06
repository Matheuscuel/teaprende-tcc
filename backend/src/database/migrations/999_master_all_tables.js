/**
 * Migration Master - Garante todas as tabelas necessárias para o TCC
 * Esta migration é idempotente e pode ser executada múltiplas vezes sem problemas
 */
exports.up = async function (knex) {
  console.log('🚀 Iniciando criação de todas as tabelas do TCC...');

  // 1. Tabela USERS (usuários do sistema)
  const hasUsers = await knex.schema.hasTable('users');
  if (!hasUsers) {
    await knex.schema.withSchema('public').createTable('users', (table) => {
      table.increments('id').primary();
      table.string('name', 100).notNullable();
      table.string('email', 100).notNullable().unique();
      table.string('password', 255); // nullable para compatibilidade
      table.string('password_hash', 255); // nullable para compatibilidade
      table.string('role', 50).defaultTo('responsavel'); // admin, terapeuta, professor, responsavel
      table.string('institution', 255).nullable();
      table.string('specialization', 255).nullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
    console.log('✓ Tabela users criada');
  }

  // 2. Tabela CHILDREN (crianças)
  const hasChildren = await knex.schema.hasTable('children');
  if (!hasChildren) {
    await knex.schema.withSchema('public').createTable('children', (table) => {
      table.increments('id').primary();
      table.string('name', 100).notNullable();
      table.date('birth_date').nullable();
      table.integer('age').nullable();
      table.string('gender', 50).nullable(); // masculino, feminino, outro
      table.text('notes').nullable();
      table.text('preferences').nullable(); // preferências da criança
      table.string('support_level', 50).nullable(); // Baixo, Médio, Alto, Muito Alto
      // Foreign Keys
      table.integer('user_id').references('id').inTable('users').onDelete('CASCADE').nullable(); // profissional vinculado
      table.integer('owner_id').references('id').inTable('users').onDelete('SET NULL').nullable(); // responsável
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
    console.log('✓ Tabela children criada');
  } else {
    // Adicionar colunas que podem não existir
    const hasAge = await knex.schema.hasColumn('children', 'age');
    if (!hasAge) {
      await knex.schema.table('children', (table) => {
        table.integer('age').nullable();
      });
    }
    const hasGender = await knex.schema.hasColumn('children', 'gender');
    if (!hasGender) {
      await knex.schema.table('children', (table) => {
        table.string('gender', 50).nullable();
      });
    }
    const hasPreferences = await knex.schema.hasColumn('children', 'preferences');
    if (!hasPreferences) {
      await knex.schema.table('children', (table) => {
        table.text('preferences').nullable();
      });
    }
    const hasSupportLevel = await knex.schema.hasColumn('children', 'support_level');
    if (!hasSupportLevel) {
      await knex.schema.table('children', (table) => {
        table.string('support_level', 50).nullable();
      });
    }
    const hasUpdatedAt = await knex.schema.hasColumn('children', 'updated_at');
    if (!hasUpdatedAt) {
      await knex.schema.table('children', (table) => {
        table.timestamp('updated_at').defaultTo(knex.fn.now());
      });
    }
  }

  // 3. Tabela USER_CHILDREN (relacionamento usuários-crianças)
  const hasUserChildren = await knex.schema.hasTable('user_children');
  if (!hasUserChildren) {
    // Criar TYPE se não existir
    await knex.raw(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'relationship_role') THEN
          CREATE TYPE relationship_role AS ENUM ('therapist', 'teacher', 'guardian');
        END IF;
      END $$;
    `);

    await knex.schema.withSchema('public').createTable('user_children', (table) => {
      table.increments('id').primary();
      table.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.integer('child_id').notNullable().references('id').inTable('children').onDelete('CASCADE');
      table.specificType('relationship', 'relationship_role').nullable(); // nullable para compatibilidade
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.unique(['user_id', 'child_id']);
    });
    console.log('✓ Tabela user_children criada');
  }

  // 4. Tabela GAMES (jogos educativos)
  const hasGames = await knex.schema.hasTable('games');
  if (!hasGames) {
    await knex.schema.withSchema('public').createTable('games', (table) => {
      table.increments('id').primary();
      table.string('title', 100).notNullable().unique();
      table.text('description').nullable();
      table.string('level', 50).nullable(); // Iniciante, Intermediário, Avançado
      table.string('category', 100).nullable(); // categoria do jogo
      table.string('image_url', 255).nullable();
      table.text('instructions').nullable();
      table.integer('min_age').nullable();
      table.integer('max_age').nullable();
      table.boolean('is_active').defaultTo(true).notNullable();
      table.string('slug', 100).nullable().unique(); // slug único para roteamento
      table.jsonb('config').nullable(); // configurações específicas do jogo
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
    console.log('✓ Tabela games criada');
  } else {
    // Adicionar colunas que podem não existir
    const hasIsActive = await knex.schema.hasColumn('games', 'is_active');
    if (!hasIsActive) {
      await knex.schema.table('games', (table) => {
        table.boolean('is_active').defaultTo(true).notNullable();
      });
    }
    const hasSlug = await knex.schema.hasColumn('games', 'slug');
    if (!hasSlug) {
      await knex.schema.table('games', (table) => {
        table.string('slug', 100).nullable().unique();
      });
    }
    const hasConfig = await knex.schema.hasColumn('games', 'config');
    if (!hasConfig) {
      await knex.schema.table('games', (table) => {
        table.jsonb('config').nullable();
      });
    }
    const hasUpdatedAt = await knex.schema.hasColumn('games', 'updated_at');
    if (!hasUpdatedAt) {
      await knex.schema.table('games', (table) => {
        table.timestamp('updated_at').defaultTo(knex.fn.now());
      });
    }
  }

  // 5. Tabela TASKS (tarefas/atividades pedagógicas)
  const hasTasks = await knex.schema.hasTable('tasks');
  if (!hasTasks) {
    await knex.schema.withSchema('public').createTable('tasks', (table) => {
      table.increments('id').primary();
      table.string('title', 255).notNullable();
      table.string('type', 100).notNullable(); // puzzle, painting, matching, etc
      table.integer('difficulty').notNullable().defaultTo(1); // 1-5
      table.boolean('active').notNullable().defaultTo(true);
      table.text('description').nullable();
      table.jsonb('payload_json').nullable(); // configurações específicas da tarefa
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
    console.log('✓ Tabela tasks criada');
  }

  // 6. Tabela SKILLS (habilidades)
  const hasSkills = await knex.schema.hasTable('skills');
  if (!hasSkills) {
    await knex.schema.withSchema('public').createTable('skills', (table) => {
      table.increments('id').primary();
      table.string('name', 255).notNullable();
      table.string('category', 100).nullable(); // social, linguagem, motora, etc
      table.text('description').nullable();
      table.boolean('active').notNullable().defaultTo(true);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
    console.log('✓ Tabela skills criada');
  }

  // 7. Tabela CHILDREN_GAMES (jogos atribuídos a crianças)
  const hasChildrenGames = await knex.schema.hasTable('children_games');
  if (!hasChildrenGames) {
    await knex.schema.withSchema('public').createTable('children_games', (table) => {
      table.increments('id').primary();
      table.integer('child_id').notNullable().references('id').inTable('children').onDelete('CASCADE');
      table.integer('game_id').notNullable().references('id').inTable('games').onDelete('CASCADE');
      table.integer('assigned_by').notNullable().references('id').inTable('users').onDelete('RESTRICT');
      table.timestamp('assigned_at').defaultTo(knex.fn.now());
      table.boolean('active').defaultTo(true).notNullable();
      table.unique(['child_id', 'game_id']);
    });
    console.log('✓ Tabela children_games criada');
  }

  // 8. Tabela CHILD_ASSIGNED_GAMES (alternativa para jogos atribuídos - slug)
  const hasChildAssignedGames = await knex.schema.hasTable('child_assigned_games');
  if (!hasChildAssignedGames) {
    await knex.schema.withSchema('public').createTable('child_assigned_games', (table) => {
      table.increments('id').primary();
      table.integer('child_id').notNullable().references('id').inTable('children').onDelete('CASCADE');
      table.string('slug', 100).notNullable(); // slug do jogo
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.unique(['child_id', 'slug']);
    });
    console.log('✓ Tabela child_assigned_games criada');
  }

  // 9. Tabela CHILD_TASKS (tarefas atribuídas a crianças)
  const hasChildTasks = await knex.schema.hasTable('child_tasks');
  if (!hasChildTasks) {
    // Criar TYPE se não existir
    await knex.raw(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
          CREATE TYPE task_status AS ENUM ('assigned', 'started', 'completed', 'skipped');
        END IF;
      END $$;
    `);

    await knex.schema.withSchema('public').createTable('child_tasks', (table) => {
      table.increments('id').primary();
      table.integer('child_id').notNullable().references('id').inTable('children').onDelete('CASCADE');
      table.integer('task_id').notNullable().references('id').inTable('tasks').onDelete('CASCADE');
      table.specificType('status', 'task_status').notNullable().defaultTo('assigned');
      table.integer('score').nullable(); // pontuação obtida
      table.timestamp('assigned_at').defaultTo(knex.fn.now());
      table.timestamp('completed_at').nullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.unique(['child_id', 'task_id']);
    });
    console.log('✓ Tabela child_tasks criada');
  }

  // 10. Tabela CHILD_SKILLS (habilidades das crianças)
  const hasChildSkills = await knex.schema.hasTable('child_skills');
  if (!hasChildSkills) {
    await knex.schema.withSchema('public').createTable('child_skills', (table) => {
      table.increments('id').primary();
      table.integer('child_id').notNullable().references('id').inTable('children').onDelete('CASCADE');
      table.integer('skill_id').notNullable().references('id').inTable('skills').onDelete('CASCADE');
      table.integer('level').notNullable().defaultTo(0); // nível de desenvolvimento (0-5)
      table.jsonb('evidence_json').nullable(); // evidências/provas do desenvolvimento
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.unique(['child_id', 'skill_id']);
    });
    console.log('✓ Tabela child_skills criada');
  }

  // 11. Tabela GAME_SESSIONS (sessões de jogos - histórico)
  const hasGameSessions = await knex.schema.hasTable('game_sessions');
  if (!hasGameSessions) {
    await knex.schema.withSchema('public').createTable('game_sessions', (table) => {
      table.increments('id').primary();
      table.integer('child_id').notNullable().references('id').inTable('children').onDelete('CASCADE');
      table.integer('game_id').notNullable().references('id').inTable('games').onDelete('CASCADE');
      table.timestamp('started_at').defaultTo(knex.fn.now());
      table.timestamp('finished_at').nullable();
      table.decimal('score', 10, 2).nullable();
      table.decimal('accuracy', 5, 2).nullable();
      table.integer('level').nullable();
      table.jsonb('data').nullable(); // dados adicionais da sessão
      table.integer('created_by').references('id').inTable('users').onDelete('SET NULL').nullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });
    console.log('✓ Tabela game_sessions criada');
  }

  // 12. Tabela REPORTS (relatórios de desempenho)
  const hasReports = await knex.schema.hasTable('reports');
  if (!hasReports) {
    await knex.schema.withSchema('public').createTable('reports', (table) => {
      table.increments('id').primary();
      table.integer('child_id').notNullable().references('id').inTable('children').onDelete('CASCADE');
      table.integer('game_id').notNullable().references('id').inTable('games').onDelete('CASCADE');
      table.decimal('score', 10, 2).nullable();
      table.integer('duration_seconds').nullable();
      table.timestamp('completed_at').defaultTo(knex.fn.now());
      table.jsonb('data').nullable(); // dados adicionais do relatório
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });
    
    // Índices para otimização de consultas
    await knex.raw('CREATE INDEX IF NOT EXISTS idx_reports_child ON public.reports(child_id)');
    await knex.raw('CREATE INDEX IF NOT EXISTS idx_reports_child_completed ON public.reports(child_id, completed_at DESC)');
    console.log('✓ Tabela reports criada');
  }

  // 13. Tabela REWARDS (recompensas)
  const hasRewards = await knex.schema.hasTable('rewards');
  if (!hasRewards) {
    await knex.schema.withSchema('public').createTable('rewards', (table) => {
      table.increments('id').primary();
      table.string('name', 255).notNullable();
      table.text('description').nullable();
      table.string('type', 50).nullable(); // badge, star, trophy, etc
      table.string('icon', 100).nullable();
      table.integer('points_required').defaultTo(0).notNullable();
      table.boolean('active').defaultTo(true).notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
    console.log('✓ Tabela rewards criada');
  }

  // 14. Tabela CHILD_REWARDS (recompensas conquistadas pelas crianças)
  const hasChildRewards = await knex.schema.hasTable('child_rewards');
  if (!hasChildRewards) {
    await knex.schema.withSchema('public').createTable('child_rewards', (table) => {
      table.increments('id').primary();
      table.integer('child_id').notNullable().references('id').inTable('children').onDelete('CASCADE');
      table.integer('reward_id').notNullable().references('id').inTable('rewards').onDelete('CASCADE');
      table.timestamp('earned_at').defaultTo(knex.fn.now());
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.unique(['child_id', 'reward_id']);
    });
    console.log('✓ Tabela child_rewards criada');
  }

  console.log('✅ Todas as tabelas do TCC foram criadas/verificadas com sucesso!');
};

exports.down = async function (knex) {
  // Remover tabelas na ordem inversa (respeitando foreign keys)
  await knex.schema.dropTableIfExists('child_rewards');
  await knex.schema.dropTableIfExists('rewards');
  await knex.schema.dropTableIfExists('reports');
  await knex.schema.dropTableIfExists('game_sessions');
  await knex.schema.dropTableIfExists('child_skills');
  await knex.schema.dropTableIfExists('child_tasks');
  await knex.schema.dropTableIfExists('child_assigned_games');
  await knex.schema.dropTableIfExists('children_games');
  await knex.schema.dropTableIfExists('skills');
  await knex.schema.dropTableIfExists('tasks');
  await knex.schema.dropTableIfExists('games');
  await knex.schema.dropTableIfExists('user_children');
  await knex.schema.dropTableIfExists('children');
  await knex.schema.dropTableIfExists('users');
  
  // Remover tipos ENUM
  await knex.raw('DROP TYPE IF EXISTS task_status');
  await knex.raw('DROP TYPE IF EXISTS relationship_role');
};

