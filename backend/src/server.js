require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool } = require('./db');
const knex = require('./db/index');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors({ origin: '*'}));
app.use(express.json());

console.log('✓ CORS configurado');

// ---------------------- Auth (demo) ----------------------
function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET || 'secretkey', { expiresIn: '8h' });
}

// Demo accounts (ajuste conforme CONTAS_DEMO.md)
const DEMO_ACCOUNTS = {
  'admin@demo.com': { role: 'admin',   name: 'Admin Demo' },
  'terapeuta@demo.com': { role: 'terapeuta', name: 'Terapeuta Demo' },
  'professor@demo.com': { role: 'professor', name: 'Professor Demo' },
  'responsavel@demo.com': { role: 'responsavel', name: 'Responsável Demo' },
};

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const acc = DEMO_ACCOUNTS[email?.toLowerCase?.() || ''];
    if (!acc) return res.status(401).json({ message: 'Credenciais inválidas (use contas demo)' });

    // Tentar usar banco, mas se falhar, retornar dados demo direto
    let user = null;
    try {
      // Garante tabela users (ambiente demo sem migrations)
      try {
        const has = await knex.schema.hasTable('users');
        if (!has) {
          await knex.schema.withSchema('public').createTable('users', (table) => {
            table.increments('id').primary();
            table.string('name', 100).notNullable();
            table.string('email', 100).notNullable().unique();
            table.string('password', 255).notNullable();
            table.string('role', 50).defaultTo('responsavel');
            table.timestamp('created_at').defaultTo(knex.fn.now());
          });
        }
      } catch (_e) { /* ignora */ }

      // Garante usuário no banco
      user = await knex('users').where({ email }).first();
      if (!user) {
        const inserted = await knex('users')
          .insert({ name: acc.name, email, role: acc.role, password: 'demo', created_at: knex.fn.now() })
          .returning(['id', 'name', 'email', 'role']);
        user = inserted[0];
      }
    } catch (dbError) {
      console.warn('DB não disponível, usando modo demo:', dbError.message);
      // Modo demo: retornar dados sem banco
      user = { id: 999, name: acc.name, email, role: acc.role };
    }

    const token = signToken({ userId: user.id, role: user.role });
    return res.json({ token, user });
  } catch (e) {
    console.error('login error', e);
    return res.status(500).json({ message: 'Erro no login' });
  }
});
console.log('✓ route /api/auth/login pronta (demo)');

// Health-check
app.get('/api/health', async (req, res) => {
  try {
    const r = await pool.query('SELECT 1 AS ok');
    return res.json({ ok: true, db: r.rows[0].ok === 1 });
  } catch (e) {
    return res.status(200).json({ ok: true, db: false, error: e.message });
  }
});

// Rota game-progress (placeholder segura)
app.get('/api/game-progress', async (req, res) => {
  try {
    // Exemplo simples: responda vazio ou faça um SELECT se já existir tabela
    // const r = await pool.query('SELECT * FROM game_progress LIMIT 50');
    // return res.json({ ok: true, rows: r.rows });

    return res.json({
      ok: true,
      rows: [],
      note: 'placeholder - ajuste para sua tabela real se necessário'
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});
console.log('✓ route /api/game-progress pronta');

// Rota paginada genérica (ex.: /api/users-paged?page=1&pageSize=10&search=abc)
app.get('/api/:entity-paged', async (req, res) => {
  try {
    const { entity } = req.params;
    const page = Math.max(1, Number(req.query.page || 1));
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize || 10)));
    const search = String(req.query.search || '').trim();

    // Monte sua query real aqui; por segurança, retorno placeholder:
    return res.json({
      ok: true,
      entity,
      page,
      pageSize,
      rows: [],
      total: 0,
      note: 'placeholder - implemente a query real para ' + entity
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});
console.log('✓ route /api/*-paged pronta');

// Helper: autenticação simples por JWT (Bearer <token>)
function getUserIdFromAuth(req) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) return null;
    
    // Aceitar token demo (modo fallback quando backend não está disponível)
    if (token === 'demo-token') {
      const userHeader = req.headers['x-demo-user'];
      if (userHeader) {
        try {
          const user = JSON.parse(userHeader);
          return 999; // ID demo
        } catch(_) {}
      }
      return 999; // ID demo padrão
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    return decoded.userId ?? decoded.id ?? decoded.sub ?? null;
  } catch (_e) {
    return null;
  }
}

// Rota real de crianças (com auth e consulta ao banco)
function getAuthPayload(req){
  try{
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if(!token) {
      console.log('[DEBUG] getAuthPayload: Token não encontrado');
      return null;
    }
    
    // Aceitar token demo (modo fallback quando backend não está disponível)
    if (token === 'demo-token') {
      // Extrair role do localStorage via header customizado ou usar admin como padrão
      const userHeader = req.headers['x-demo-user'];
      if (userHeader) {
        try {
          const user = JSON.parse(userHeader);
          const role = user.role?.toLowerCase() || 'admin';
          console.log(`[DEBUG] getAuthPayload: Token demo com role=${role}`);
          return { userId: 999, role: role, demo: true };
        } catch(e) {
          console.warn('[DEBUG] getAuthPayload: Erro ao parsear X-Demo-User:', e.message);
        }
      }
      console.log('[DEBUG] getAuthPayload: Token demo sem header X-Demo-User, usando admin');
      return { userId: 999, role: 'admin', demo: true };
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
      console.log(`[DEBUG] getAuthPayload: Token JWT válido, userId=${decoded.userId ?? decoded.id ?? decoded.sub}`);
      return decoded;
    } catch(jwtError) {
      console.warn(`[DEBUG] getAuthPayload: Token JWT inválido ou expirado:`, jwtError.message);
      return null;
    }
  }catch(_e){ 
    console.error('[DEBUG] getAuthPayload: Erro inesperado:', _e.message);
    return null; 
  }
}
app.get('/api/children', async (req, res) => {
  console.log(`[DEBUG] GET /api/children chamado (sem id)`);
  const payload = getAuthPayload(req);
  if (!payload) return res.status(401).json({ message: 'Não autenticado' });
  
  const userId = Number(payload?.userId ?? payload?.id ?? payload?.sub);
  const isDemo = payload?.demo === true;

  try {
    // Verificar se tabela children existe
    const hasChildrenTable = await knex.schema.hasTable('children');
    if (!hasChildrenTable) {
      console.warn('Tabela children não existe, retornando lista vazia');
      return res.json({ children: [] });
    }

    // Descobrir papel do usuário
    let role = null;
    if (isDemo) {
      role = payload.role || 'admin';
    } else {
      try {
        const hasUsersTable = await knex.schema.hasTable('users');
        if (hasUsersTable) {
          const roleRow = await knex('users').where({ id: userId }).first('role');
          role = roleRow?.role || null;
        }
      } catch(_e) { 
        console.warn('Erro ao buscar role do usuário:', _e.message);
        role = null; 
      }
      if (!role) role = payload?.role || null;
    }
    if (!role) return res.status(403).json({ message: 'Acesso negado' });
    let rows = [];

    try {
      // Verificar quais colunas existem na tabela children
      const hasAge = await knex.schema.hasColumn('children', 'age');
      const hasGender = await knex.schema.hasColumn('children', 'gender');
      
      // Construir select dinâmico baseado nas colunas disponíveis
      let selectFields = ['id', 'name', 'created_at'];
      if (hasAge) selectFields.push('age');
      else selectFields.push(knex.raw('NULL::int as age'));
      if (hasGender) selectFields.push('gender');
      else selectFields.push(knex.raw('NULL::text as gender'));
      
      if (role === 'admin') {
        rows = await knex('children')
          .select(selectFields)
          .orderBy('name', 'asc');
      } else if (role === 'responsavel') {
        // responsável (owner_id)
        rows = await knex('children')
          .select(selectFields)
          .where({ owner_id: userId })
          .orderBy('name', 'asc');
      } else if (role === 'terapeuta' || role === 'professor') {
        // profissional vinculado em user_children
        const hasUserChildrenTable = await knex.schema.hasTable('user_children');
        if (hasUserChildrenTable) {
          // Ajustar selectFields para usar prefixo 'c.' quando necessário
          const joinSelectFields = ['c.id', 'c.name', 'c.created_at'];
          if (hasAge) joinSelectFields.push('c.age');
          else joinSelectFields.push(knex.raw('NULL::int as age'));
          if (hasGender) joinSelectFields.push('c.gender');
          else joinSelectFields.push(knex.raw('NULL::text as gender'));
          
          rows = await knex('children as c')
            .join('user_children as uc', 'c.id', 'uc.child_id')
            .where('uc.user_id', userId)
            .select(joinSelectFields)
            .orderBy('c.name', 'asc');
        } else {
          // Se user_children não existe, retornar lista vazia
          rows = [];
        }
      } else {
        return res.status(403).json({ message: 'Acesso negado' });
      }
    } catch (dbError) {
      console.warn('DB não disponível, retornando lista vazia:', dbError.message);
      // Se banco não disponível, retornar lista vazia ao invés de erro 500
      rows = [];
    }

    return res.json({ children: rows });
  } catch (e) {
    console.error('children list error', e);
    // Em caso de erro inesperado, retornar lista vazia ao invés de 500
    return res.json({ children: [] });
  }
});
console.log('✓ route /api/children (real) pronta');

// IMPORTANTE: Rotas mais específicas devem vir ANTES das genéricas
// Ordem correta: /api/children/:id/games > /api/children/:id > /api/children

// Listar jogos atribuídos a uma criança (GET) - ROTA ESPECÍFICA
app.get('/api/children/:id/games', async (req, res) => {
  console.log(`[DEBUG] GET /api/children/:id/games chamado com id=${req.params.id}`);
  const payload = getAuthPayload(req);
  if (!payload) return res.status(401).json({ message: 'Não autenticado' });
  
  const childId = Number(req.params.id);
  if (!childId || isNaN(childId)) {
    return res.status(400).json({ message: 'ID inválido' });
  }
  
  try {
    // Verificar acesso (mesma lógica de GET /api/children/:id)
    const userId = Number(payload?.userId ?? payload?.id ?? payload?.sub);
    const role = payload?.role || null;
    
    let hasAccess = false;
    if (role === 'admin') {
      hasAccess = true;
    } else if (role === 'responsavel') {
      const child = await knex('children').where({ id: childId, owner_id: userId }).first();
      hasAccess = !!child;
    } else if (role === 'terapeuta' || role === 'professor') {
      const hasUserChildrenTable = await knex.schema.hasTable('user_children');
      if (hasUserChildrenTable) {
        const link = await knex('user_children').where({ user_id: userId, child_id: childId }).first();
        hasAccess = !!link;
      }
    }
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Acesso negado' });
    }
    
    // Buscar jogos atribuídos
    const hasChildrenGamesTable = await knex.schema.hasTable('children_games');
    if (!hasChildrenGamesTable) {
      return res.json({ games: [] });
    }
    
    const games = await knex('children_games as cg')
      .join('games as g', 'cg.game_id', 'g.id')
      .where('cg.child_id', childId)
      .where('cg.active', true)
      .select('g.*', 'cg.assigned_at', 'cg.assigned_by')
      .orderBy('cg.assigned_at', 'desc');
    
    return res.json({ games });
  } catch (e) {
    console.error('Erro ao buscar jogos atribuídos:', e);
    return res.status(500).json({ message: 'Erro ao buscar jogos', error: e.message });
  }
});
console.log('✓ route GET /api/children/:id/games pronta');

// Obter uma criança específica por ID - ROTA ESPECÍFICA
app.get('/api/children/:id', async (req, res) => {
  console.log(`[DEBUG] GET /api/children/:id chamado com id=${req.params.id}`);
  const payload = getAuthPayload(req);
  if (!payload) return res.status(401).json({ message: 'Não autenticado' });
  
  const userId = Number(payload?.userId ?? payload?.id ?? payload?.sub);
  const isDemo = payload?.demo === true;
  const childId = Number(req.params.id);
  
  if (!childId || isNaN(childId)) {
    return res.status(400).json({ message: 'ID inválido' });
  }
  
  try {
    // Verificar se tabela children existe
    const hasChildrenTable = await knex.schema.hasTable('children');
    if (!hasChildrenTable) {
      return res.status(404).json({ message: 'Criança não encontrada' });
    }
    
    // Descobrir papel do usuário
    let role = null;
    if (isDemo) {
      role = payload.role || 'admin';
    } else {
      try {
        const hasUsersTable = await knex.schema.hasTable('users');
        if (hasUsersTable) {
          const roleRow = await knex('users').where({ id: userId }).first('role');
          role = roleRow?.role || null;
        }
      } catch(_e) { 
        console.warn('Erro ao buscar role do usuário:', _e.message);
        role = null; 
      }
      if (!role) role = payload?.role || null;
    }
    
    if (!role) return res.status(403).json({ message: 'Acesso negado' });
    
    // Verificar acesso baseado no role
    let child = null;
    let hasAccess = false;
    
    if (role === 'admin') {
      // Admin pode ver todas as crianças
      hasAccess = true;
    } else if (role === 'responsavel') {
      // Responsável só vê suas próprias crianças (owner_id)
      child = await knex('children').where({ id: childId, owner_id: userId }).first();
      hasAccess = !!child;
    } else if (role === 'terapeuta' || role === 'professor') {
      // Profissional vê crianças vinculadas em user_children
      const hasUserChildrenTable = await knex.schema.hasTable('user_children');
      if (hasUserChildrenTable) {
        const link = await knex('user_children')
          .where({ user_id: userId, child_id: childId })
          .first();
        hasAccess = !!link;
      }
    }
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Acesso negado' });
    }
    
    // Buscar a criança se ainda não foi buscada
    if (!child) {
      child = await knex('children').where({ id: childId }).first();
    }
    
    if (!child) {
      return res.status(404).json({ message: 'Criança não encontrada' });
    }
    
    // Buscar progresso médio (se a tabela existir)
    let averageProgress = 0;
    try {
      const hasGameProgress = await knex.schema.hasTable('game_progress');
      if (hasGameProgress) {
        const progressResult = await knex('game_progress')
          .where({ child_id: childId })
          .avg('score as avg_score')
          .first();
        averageProgress = Math.round(Number(progressResult?.avg_score || 0));
      }
    } catch (_e) {
      // Ignora erro se tabela não existir
    }
    
    return res.json({
      child: {
        id: child.id,
        name: child.name,
        age: child.age || null,
        gender: child.gender || null,
        notes: child.notes || null,
        preferences: child.preferences || null,
        support_level: child.support_level || null,
        birth_date: child.birth_date || null,
        created_at: child.created_at
      },
      averageProgress: averageProgress
    });
  } catch (e) {
    console.error('Erro ao buscar criança:', e);
    return res.status(500).json({ message: 'Erro ao buscar dados da criança', error: e.message });
  }
});
console.log('✓ route GET /api/children/:id pronta');

// Seed: garante contas demo, crianças e vínculos user_children
async function ensureDemoData() {
  try {
    // Verificar se consegue conectar ao banco antes de fazer seed
    try {
      await knex.raw('SELECT 1');
    } catch (dbError) {
      console.warn('! Seed demo pulado: banco não disponível -', dbError.message);
      return; // Não falha o servidor se banco não estiver disponível
    }

    // Garantir que as tabelas básicas existem
    try {
      const hasUsers = await knex.schema.hasTable('users');
      if (!hasUsers) {
        await knex.schema.withSchema('public').createTable('users', (table) => {
          table.increments('id').primary();
          table.string('name', 100).notNullable();
          table.string('email', 100).notNullable().unique();
          table.string('password', 255); // nullable para compatibilidade
          table.string('password_hash', 255); // nullable para compatibilidade
          table.string('role', 50).defaultTo('responsavel');
          table.timestamp('created_at').defaultTo(knex.fn.now());
          table.timestamp('updated_at').defaultTo(knex.fn.now());
        });
        console.log('✓ Tabela users criada');
      }

      const hasChildren = await knex.schema.hasTable('children');
      if (!hasChildren) {
        await knex.schema.withSchema('public').createTable('children', (table) => {
          table.increments('id').primary();
          table.string('name', 100).notNullable();
          table.date('birth_date').nullable();
          table.integer('age').nullable();
          table.string('gender', 50).nullable();
          table.text('notes').nullable();
          table.text('preferences').nullable();
          table.string('support_level', 50).nullable();
          table.integer('user_id').references('id').inTable('users').onDelete('CASCADE').nullable();
          table.integer('owner_id').references('id').inTable('users').onDelete('SET NULL').nullable();
          table.timestamp('created_at').defaultTo(knex.fn.now());
          table.timestamp('updated_at').defaultTo(knex.fn.now());
        });
        console.log('✓ Tabela children criada');
      } else {
        // Adicionar colunas que podem não existir
        const colsToAdd = [
          { name: 'age', type: 'integer', nullable: true },
          { name: 'gender', type: 'string', length: 50, nullable: true },
          { name: 'preferences', type: 'text', nullable: true },
          { name: 'support_level', type: 'string', length: 50, nullable: true },
          { name: 'updated_at', type: 'timestamp', nullable: false, default: true }
        ];
        
        for (const col of colsToAdd) {
          const exists = await knex.schema.hasColumn('children', col.name);
          if (!exists) {
            await knex.schema.table('children', (table) => {
              if (col.type === 'integer') {
                table.integer(col.name).nullable();
              } else if (col.type === 'string') {
                table.string(col.name, col.length || 255).nullable();
              } else if (col.type === 'text') {
                table.text(col.name).nullable();
              } else if (col.type === 'timestamp') {
                if (col.default) {
                  table.timestamp(col.name).defaultTo(knex.fn.now());
                } else {
                  table.timestamp(col.name).nullable();
                }
              }
            });
          }
        }
      }

      // Verificar e criar outras tabelas essenciais
      const hasGames = await knex.schema.hasTable('games');
      if (!hasGames) {
        await knex.schema.withSchema('public').createTable('games', (table) => {
          table.increments('id').primary();
          table.string('title', 100).notNullable().unique();
          table.text('description').nullable();
          table.string('level', 50).nullable();
          table.string('category', 100).nullable();
          table.string('slug', 100).nullable().unique();
          table.boolean('is_active').defaultTo(true).notNullable();
          table.timestamp('created_at').defaultTo(knex.fn.now());
          table.timestamp('updated_at').defaultTo(knex.fn.now());
        });
        console.log('✓ Tabela games criada');
      } else {
        // Adicionar colunas que podem não existir
        const hasSlug = await knex.schema.hasColumn('games', 'slug');
        if (!hasSlug) {
          await knex.schema.table('games', (table) => {
            table.string('slug', 100).nullable().unique();
          });
        }
        const hasIsActive = await knex.schema.hasColumn('games', 'is_active');
        if (!hasIsActive) {
          await knex.schema.table('games', (table) => {
            table.boolean('is_active').defaultTo(true).notNullable();
          });
        }
      }
      
      // Verificar se já existem os jogos principais, se não, criar
      const existingGames = await knex('games').select('slug', 'title');
      const gameSlugs = existingGames.map(g => (g.slug || '').toLowerCase());
      const gameTitles = existingGames.map(g => (g.title || '').toLowerCase());
      
      const defaultGames = [
        { title: 'Jogo da Memória', slug: 'memory', description: 'Encontre os pares de cartas correspondentes.', level: 'Iniciante', category: 'Cognição' },
        { title: 'Quebra-Cabeça', slug: 'puzzle', description: 'Monte as peças para formar imagens completas.', level: 'Iniciante', category: 'Cognição' },
        { title: 'Reconhecimento de Emoções', slug: 'emotions', description: 'Aprenda a identificar diferentes expressões faciais e emoções.', level: 'Iniciante', category: 'Socioemocional' },
        { title: 'Cores e Formas', slug: 'colors-shapes', description: 'Combine cores e formas para desenvolver habilidades visuais.', level: 'Iniciante', category: 'Cognição' },
        { title: 'Sequências', slug: 'sequences', description: 'Complete sequências numéricas e lógicas.', level: 'Intermediário', category: 'Cognição' },
        { title: 'Associação', slug: 'association', description: 'Ligue objetos relacionados para desenvolver raciocínio.', level: 'Iniciante', category: 'Cognição' }
      ];
      
      for (const game of defaultGames) {
        const slugExists = gameSlugs.includes(game.slug.toLowerCase());
        const titleExists = gameTitles.includes(game.title.toLowerCase());
        
        if (!slugExists && !titleExists) {
          try {
            await knex('games').insert({
              title: game.title,
              slug: game.slug,
              description: game.description,
              level: game.level,
              category: game.category,
              is_active: true,
              created_at: knex.fn.now(),
              updated_at: knex.fn.now()
            });
            console.log(`✓ Jogo "${game.title}" criado`);
          } catch (e) {
            console.log(`⚠ Erro ao criar jogo "${game.title}":`, e.message);
          }
        } else {
          console.log(`✓ Jogo "${game.title}" já existe`);
        }
      }

      const hasTasks = await knex.schema.hasTable('tasks');
      if (!hasTasks) {
        await knex.schema.withSchema('public').createTable('tasks', (table) => {
          table.increments('id').primary();
          table.string('title', 255).notNullable();
          table.string('type', 100).notNullable();
          table.integer('difficulty').notNullable().defaultTo(1);
          table.boolean('active').notNullable().defaultTo(true);
          table.boolean('is_active').notNullable().defaultTo(true);
          table.timestamp('created_at').defaultTo(knex.fn.now());
          table.timestamp('updated_at').defaultTo(knex.fn.now());
        });
        console.log('✓ Tabela tasks criada');
      }
      
      // Verificar se já existem as 4 tarefas principais, se não, criar
      const existingTasks = await knex('tasks').select('title');
      const taskTitles = existingTasks.map(t => t.title.toLowerCase());
      
      // Verificar quais colunas existem
      const hasIsActive = await knex.schema.hasColumn('tasks', 'is_active');
      const hasActive = await knex.schema.hasColumn('tasks', 'active');
      
      console.log(`[DEBUG] Colunas tasks: hasIsActive=${hasIsActive}, hasActive=${hasActive}`);
      
      const defaultTasks = [
        { title: 'Ligar os Pontos', type: 'connect-dots', difficulty: 1 },
        { title: 'Pintar o Desenho', type: 'painting', difficulty: 1 },
        { title: 'Identificar Emoções', type: 'emotions', difficulty: 2 },
        { title: 'Associar Itens', type: 'matching', difficulty: 2 }
      ];
      
      for (const task of defaultTasks) {
        if (!taskTitles.includes(task.title.toLowerCase())) {
          try {
            const insertData = {
              title: task.title,
              type: task.type,
              difficulty: task.difficulty,
              created_at: knex.fn.now(),
              updated_at: knex.fn.now()
            };
            
            // Apenas adicionar colunas que existem
            if (hasIsActive === true) {
              insertData.is_active = true;
            }
            if (hasActive === true) {
              insertData.active = true;
            }
            
            console.log(`[DEBUG] Inserindo tarefa "${task.title}" com dados:`, Object.keys(insertData));
            await knex('tasks').insert(insertData);
            console.log(`✓ Tarefa "${task.title}" criada`);
          } catch (e) {
            console.log(`⚠ Erro ao criar tarefa "${task.title}":`, e.message);
          }
        } else {
          console.log(`✓ Tarefa "${task.title}" já existe`);
        }
      }

      const hasSkills = await knex.schema.hasTable('skills');
      if (!hasSkills) {
        await knex.schema.withSchema('public').createTable('skills', (table) => {
          table.increments('id').primary();
          table.string('name', 255).notNullable();
          table.string('category', 100).nullable();
          table.boolean('active').notNullable().defaultTo(true);
          table.timestamp('created_at').defaultTo(knex.fn.now());
          table.timestamp('updated_at').defaultTo(knex.fn.now());
        });
        console.log('✓ Tabela skills criada');
      }

      const hasUserChildren = await knex.schema.hasTable('user_children');
      if (!hasUserChildren) {
        await knex.schema.withSchema('public').createTable('user_children', (table) => {
          table.increments('id').primary();
          table.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
          table.integer('child_id').notNullable().references('id').inTable('children').onDelete('CASCADE');
          table.timestamp('created_at').defaultTo(knex.fn.now());
          table.unique(['user_id', 'child_id']);
        });
        console.log('✓ Tabela user_children criada');
      }
    } catch (schemaError) {
      console.warn('! Erro ao criar tabelas:', schemaError.message);
      // Continua mesmo se der erro na criação de tabelas
    }

    // 1) Usuários demo
    const ensureUser = async (email, { name, role }) => {
      const existing = await knex('users').where({ email }).first('id');
      if (existing) return existing.id;
      
      // Verificar qual coluna de senha existe
      const hasPassword = await knex.schema.hasColumn('users', 'password');
      const hasPasswordHash = await knex.schema.hasColumn('users', 'password_hash');
      
      const insertData = { name, email, role, created_at: knex.fn.now() };
      if (hasPasswordHash) {
        insertData.password_hash = 'demo';
      } else if (hasPassword) {
        insertData.password = 'demo';
      }
      
      const inserted = await knex('users')
        .insert(insertData)
        .returning(['id']);
      return inserted[0].id;
    };

    const ids = {};
    for (const [email, meta] of Object.entries(DEMO_ACCOUNTS)) {
      ids[email] = await ensureUser(email, meta);
    }

    const terapeutaId = ids['terapeuta@demo.com'];
    const professorId = ids['professor@demo.com'];
    const responsavelId = ids['responsavel@demo.com'];

    // 2) Crianças demo
    const count = await knex('children').count({ c: '*' }).first();
    let childIds = [];
    if (Number(count?.c || 0) === 0) {
      const inserted = await knex('children')
        .insert([
          { name: 'Ana Clara', owner_id: responsavelId },
          { name: 'João Pedro', owner_id: responsavelId },
        ])
        .returning(['id']);
      childIds = inserted.map(r => r.id);
      console.log('✓ crianças demo inseridas');
    } else {
      const rows = await knex('children').select('id').limit(10);
      childIds = rows.map(r => r.id);
    }

    // 3) Vínculos para terapeuta e professor (user_children)
    if (terapeutaId || professorId) {
      const toInsert = [];
      for (const cid of childIds) {
        if (terapeutaId) toInsert.push({ user_id: terapeutaId, child_id: cid });
        if (professorId) toInsert.push({ user_id: professorId, child_id: cid });
      }
      if (toInsert.length) {
        try {
          await knex('user_children')
            .insert(toInsert)
            .onConflict(['user_id', 'child_id'])
            .ignore();
          console.log('✓ vínculos demo (terapeuta/professor -> crianças) prontos');
        } catch (e) {
          // fallback caso versão do knex/pg não suporte onConflict
          for (const row of toInsert) {
            try { await knex.raw(
              'INSERT INTO user_children (user_id, child_id) VALUES (?, ?) ON CONFLICT DO NOTHING',
              [row.user_id, row.child_id]
            ); } catch (_) {}
          }
        }
      }
    }
    console.log('✓ seed demo concluído');
  } catch (e) {
    console.warn('! seed demo falhou:', e.message);
    // Não falha o servidor se seed der erro
  }
}

// Criar criança (autenticado)
app.post('/api/children', async (req, res) => {
  const userId = Number(getUserIdFromAuth(req));
  if (!userId) return res.status(401).json({ message: 'Não autenticado' });
  
  const { name, birth_date, age, gender, notes, preferences, supportLevel } = req.body || {};
  
  // Validar nome (obrigatório e não vazio)
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ message: 'Nome é obrigatório e não pode estar vazio' });
  }
  
  // Validar age se fornecido
  let parsedAge = null;
  if (age !== undefined && age !== null && age !== '') {
    parsedAge = parseInt(age);
    if (isNaN(parsedAge) || parsedAge < 0 || parsedAge > 120) {
      return res.status(400).json({ message: 'Idade inválida' });
    }
  }
  
  try {
    // Calcular birth_date se age foi fornecido
    let calculatedBirthDate = birth_date;
    if (!calculatedBirthDate && parsedAge) {
      const today = new Date();
      const birthYear = today.getFullYear() - parsedAge;
      calculatedBirthDate = `${birthYear}-01-01`; // Aproximação
    }
    
    // Obter role do usuário para determinar owner_id
    let ownerId = null; // Iniciar como null por padrão
    let userRole = null;
    try {
      const userRow = await knex('users').where({ id: userId }).first('role');
      if (userRow) {
        userRole = userRow.role;
        
        // Se não for responsável ou admin, owner_id deve ser null
        if (userRole === 'responsavel' || userRole === 'admin') {
          ownerId = userId;
        }
        // Terapeuta/professor não é owner
      } else {
        // Se userId não existe no banco (ex: demo 999), ownerId deve ser null
        console.warn(`Usuário com ID ${userId} não encontrado no banco, usando owner_id=null`);
        ownerId = null;
      }
    } catch (_e) {
      // Se não conseguir verificar role, usa null como fallback para evitar FK violation
      console.warn('Não foi possível verificar role do usuário:', _e.message);
      ownerId = null;
    }
    
    // Construir objeto de inserção de forma segura
    const insertData = { 
      name: String(name).trim(), 
      birth_date: calculatedBirthDate || null, 
      owner_id: ownerId, 
      notes: notes ? String(notes).trim() : null 
    };
    
    // Adicionar campos opcionais se fornecidos
    // Tentar adicionar diretamente, se a coluna não existir o banco vai rejeitar
    if (parsedAge !== null) {
      insertData.age = parsedAge;
    }
    if (gender) {
      // Normalizar gender para minúsculas para consistência
      insertData.gender = String(gender).toLowerCase();
    }
    if (preferences) {
      insertData.preferences = String(preferences).trim();
    }
    if (supportLevel) {
      insertData.support_level = String(supportLevel).trim();
    }
    
    // Log para debug (remover em produção)
    console.log('Tentando inserir criança com dados:', JSON.stringify(insertData, null, 2));
    
    const inserted = await knex('children')
      .insert(insertData)
      .returning('*');
    
    if (!inserted || inserted.length === 0) {
      throw new Error('Falha ao inserir criança no banco de dados - nenhum registro retornado');
    }
    
    const newChild = inserted[0];
    console.log('Criança inserida com sucesso:', newChild.id);
    
    // Se for terapeuta ou professor, criar vínculo em user_children
    try {
      if (userRole === 'terapeuta' || userRole === 'professor') {
        const hasUserChildrenTable = await knex.schema.hasTable('user_children');
        if (hasUserChildrenTable) {
          await knex('user_children')
            .insert({ user_id: userId, child_id: newChild.id })
            .onConflict(['user_id', 'child_id'])
            .ignore();
          console.log(`Vínculo user_children criado: user_id=${userId}, child_id=${newChild.id}`);
        } else {
          console.warn('Tabela user_children não existe, pulando criação de vínculo');
        }
      }
    } catch (_e) {
      // Ignora erro de vínculo se der problema
      console.warn('Aviso: não foi possível criar vínculo user_children:', _e.message);
    }
    
    return res.status(201).json(newChild);
  } catch (e) {
    console.error('==================== ERRO AO CRIAR CRIANÇA ====================');
    console.error('Timestamp:', new Date().toISOString());
    console.error('Error message:', e.message);
    console.error('Error stack:', e.stack);
    console.error('Request body:', JSON.stringify(req.body, null, 2));
    console.error('userId:', userId);
    console.error('============================================================');
    return res.status(500).json({ 
      message: 'Erro ao criar criança', 
      error: e.message,
      details: process.env.NODE_ENV === 'development' ? e.stack : undefined
    });
  }
});
console.log('✓ route POST /api/children pronta');

// Listar todos os jogos (GET)
app.get('/api/games', async (req, res) => {
  console.log(`[DEBUG] GET /api/games chamado`);
  try {
    const payload = getAuthPayload(req);
    if (!payload) {
      console.log('[DEBUG] GET /api/games: Não autenticado');
      return res.status(401).json({ message: 'Não autenticado' });
    }
    
    console.log('[DEBUG] GET /api/games: Autenticado com userId:', payload?.userId ?? payload?.id ?? payload?.sub);
    
    const hasGamesTable = await knex.schema.hasTable('games');
    if (!hasGamesTable) {
      console.log('[DEBUG] GET /api/games: Tabela games não existe, retornando lista vazia');
      return res.json({ games: [] });
    }
    
    // Verificar quais colunas existem na tabela games
    const hasImageUrl = await knex.schema.hasColumn('games', 'image_url');
    const hasIsActive = await knex.schema.hasColumn('games', 'is_active');
    
    // Construir select dinâmico baseado nas colunas disponíveis
    let selectFields = ['id', 'title', 'description', 'level', 'category', 'created_at'];
    if (hasImageUrl) selectFields.push('image_url');
    if (hasIsActive) selectFields.push('is_active');
    
    const games = await knex('games')
      .select(selectFields)
      .orderBy('title', 'asc');
    
    console.log(`[DEBUG] GET /api/games: Retornando ${games.length} jogos`);
    return res.json({ games });
  } catch (e) {
    console.error('[DEBUG] GET /api/games: Erro ao listar jogos:', e);
    console.error('[DEBUG] GET /api/games: Stack:', e.stack);
    return res.status(500).json({ message: 'Erro ao listar jogos', error: e.message });
  }
});
console.log('✓ route GET /api/games pronta');

// Endpoint básico para tasks (GET)
app.get('/api/tasks', async (req, res) => {
  console.log(`[DEBUG] GET /api/tasks chamado`);
  try {
    const payload = getAuthPayload(req);
    if (!payload) {
      console.log('[DEBUG] GET /api/tasks: Não autenticado');
      return res.status(401).json({ message: 'Não autenticado' });
    }
    
    console.log('[DEBUG] GET /api/tasks: Autenticado com userId:', payload?.userId ?? payload?.id ?? payload?.sub);
    
    const hasTasksTable = await knex.schema.hasTable('tasks');
    if (!hasTasksTable) {
      console.log('[DEBUG] GET /api/tasks: Tabela tasks não existe, retornando lista vazia');
      return res.json({ tasks: [] });
    }
    
    // Verificar quais colunas existem na tabela tasks
    const hasIsActive = await knex.schema.hasColumn('tasks', 'is_active');
    
    // Construir select dinâmico baseado nas colunas disponíveis
    let selectFields = ['id', 'title', 'type', 'difficulty', 'created_at'];
    if (hasIsActive) {
      // Usar alias para compatibilidade com frontend
      selectFields.push(knex.raw('is_active as active'));
    } else {
      // Se não tem coluna is_active, adicionar campo padrão
      selectFields.push(knex.raw('true as active'));
    }
    
    // Retornar todas as tarefas (incluindo inativas) para gerenciamento
    const tasks = await knex('tasks')
      .select(selectFields)
      .orderBy('created_at', 'desc');
    
    console.log(`[DEBUG] GET /api/tasks: Retornando ${tasks.length} tarefas`);
    return res.json({ tasks });
  } catch (e) {
    console.error('[DEBUG] GET /api/tasks: Erro ao listar tarefas:', e);
    console.error('[DEBUG] GET /api/tasks: Stack:', e.stack);
    return res.status(500).json({ message: 'Erro ao listar tarefas', error: e.message });
  }
});
console.log('✓ route GET /api/tasks pronta');

// Endpoint básico para tasks (POST)
app.post('/api/tasks', async (req, res) => {
  console.log(`[DEBUG] POST /api/tasks chamado`);
  try {
    const payload = getAuthPayload(req);
    if (!payload) {
      return res.status(401).json({ message: 'Não autenticado' });
    }
    
    const { title, type, difficulty } = req.body || {};
    if (!title) {
      return res.status(400).json({ message: 'Título é obrigatório' });
    }
    
    const hasTasksTable = await knex.schema.hasTable('tasks');
    if (!hasTasksTable) {
      return res.status(500).json({ message: 'Tabela tasks não existe' });
    }
    
    // Verificar se a coluna is_active existe, senão usar active
    const hasIsActive = await knex.schema.hasColumn('tasks', 'is_active');
    const hasActive = await knex.schema.hasColumn('tasks', 'active');
    
    const insertData = {
      title,
      type: type || 'activity',
      difficulty: difficulty || 1,
      created_at: knex.fn.now()
    };
    
    if (hasIsActive) {
      insertData.is_active = true;
    }
    if (hasActive) {
      insertData.active = true;
    }
    
    const [task] = await knex('tasks')
      .insert(insertData)
      .returning('*');
    
    console.log(`[DEBUG] POST /api/tasks: Tarefa criada com id=${task.id}`);
    return res.status(201).json(task);
  } catch (e) {
    console.error('[DEBUG] POST /api/tasks: Erro ao criar tarefa:', e);
    return res.status(500).json({ message: 'Erro ao criar tarefa', error: e.message });
  }
});
console.log('✓ route POST /api/tasks pronta');

// Atualizar uma tarefa (PUT)
app.put('/api/tasks/:id', async (req, res) => {
  console.log(`[DEBUG] PUT /api/tasks/:id chamado com id=${req.params.id}`);
  try {
    const payload = getAuthPayload(req);
    if (!payload) {
      return res.status(401).json({ message: 'Não autenticado' });
    }
    
    const taskId = Number(req.params.id);
    if (!taskId || isNaN(taskId)) {
      return res.status(400).json({ message: 'ID inválido' });
    }
    
    const { title, type, difficulty, active } = req.body || {};
    
    const hasTasksTable = await knex.schema.hasTable('tasks');
    if (!hasTasksTable) {
      return res.status(404).json({ message: 'Tarefa não encontrada' });
    }
    
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (type !== undefined) updateData.type = type;
    if (difficulty !== undefined) updateData.difficulty = Number(difficulty);
    
    // Atualizar ambas as colunas se existirem
    const hasIsActive = await knex.schema.hasColumn('tasks', 'is_active');
    const hasActive = await knex.schema.hasColumn('tasks', 'active');
    
    if (active !== undefined) {
      if (hasIsActive) updateData.is_active = active;
      if (hasActive) updateData.active = active;
    }
    
    updateData.updated_at = knex.fn.now();
    
    const updated = await knex('tasks')
      .where({ id: taskId })
      .update(updateData)
      .returning('*');
    
    if (!updated || updated.length === 0) {
      return res.status(404).json({ message: 'Tarefa não encontrada' });
    }
    
    console.log(`[DEBUG] PUT /api/tasks/:id: Tarefa atualizada com id=${taskId}`);
    return res.json(updated[0]);
  } catch (e) {
    console.error('[DEBUG] PUT /api/tasks/:id: Erro ao atualizar tarefa:', e);
    return res.status(500).json({ message: 'Erro ao atualizar tarefa', error: e.message });
  }
});
console.log('✓ route PUT /api/tasks/:id pronta');

// Excluir uma tarefa (DELETE)
app.delete('/api/tasks/:id', async (req, res) => {
  console.log(`[DEBUG] DELETE /api/tasks/:id chamado com id=${req.params.id}`);
  try {
    const payload = getAuthPayload(req);
    if (!payload) {
      return res.status(401).json({ message: 'Não autenticado' });
    }
    
    const taskId = Number(req.params.id);
    if (!taskId || isNaN(taskId)) {
      return res.status(400).json({ message: 'ID inválido' });
    }
    
    const hasTasksTable = await knex.schema.hasTable('tasks');
    if (!hasTasksTable) {
      return res.status(404).json({ message: 'Tarefa não encontrada' });
    }
    
    // Soft delete - marcar como inativa ao invés de deletar
    const hasIsActive = await knex.schema.hasColumn('tasks', 'is_active');
    const hasActive = await knex.schema.hasColumn('tasks', 'active');
    
    const updateData = { updated_at: knex.fn.now() };
    if (hasIsActive) updateData.is_active = false;
    if (hasActive) updateData.active = false;
    
    const updated = await knex('tasks')
      .where({ id: taskId })
      .update(updateData)
      .returning('*');
    
    if (!updated || updated.length === 0) {
      return res.status(404).json({ message: 'Tarefa não encontrada' });
    }
    
    console.log(`[DEBUG] DELETE /api/tasks/:id: Tarefa desativada com id=${taskId}`);
    return res.json({ message: 'Tarefa desativada com sucesso', task: updated[0] });
  } catch (e) {
    console.error('[DEBUG] DELETE /api/tasks/:id: Erro ao excluir tarefa:', e);
    return res.status(500).json({ message: 'Erro ao excluir tarefa', error: e.message });
  }
});
console.log('✓ route DELETE /api/tasks/:id pronta');

// Salvar progresso de uma tarefa (POST /api/tasks/:id/progress)
app.post('/api/tasks/:id/progress', async (req, res) => {
  console.log(`[DEBUG] POST /api/tasks/:id/progress chamado com id=${req.params.id}`);
  try {
    const payload = getAuthPayload(req);
    if (!payload) {
      return res.status(401).json({ message: 'Não autenticado' });
    }
    
    const taskId = Number(req.params.id);
    const { child_id, score, status = 'completed', time_spent } = req.body || {};
    
    if (!child_id) {
      return res.status(400).json({ message: 'child_id é obrigatório' });
    }
    
    if (!taskId || isNaN(taskId)) {
      return res.status(400).json({ message: 'ID da tarefa inválido' });
    }
    
    const hasChildTasksTable = await knex.schema.hasTable('child_tasks');
    if (!hasChildTasksTable) {
      // Criar tabela se não existir
      await knex.schema.createTable('child_tasks', (table) => {
        table.increments('id').primary();
        table.integer('child_id').notNullable().references('id').inTable('children').onDelete('CASCADE');
        table.integer('task_id').notNullable().references('id').inTable('tasks').onDelete('CASCADE');
        table.string('status', 20).notNullable().defaultTo('assigned');
        table.integer('score').nullable();
        table.integer('time_spent').nullable(); // em segundos
        table.timestamp('assigned_at').defaultTo(knex.fn.now());
        table.timestamp('completed_at').nullable();
        table.timestamps(true, true);
        table.unique(['child_id', 'task_id']);
      });
      console.log('✓ Tabela child_tasks criada');
    }
    
    const updateData = {
      status: status || 'completed',
      score: score !== undefined ? Number(score) : null,
      updated_at: knex.fn.now()
    };
    
    if (time_spent !== undefined) {
      updateData.time_spent = Number(time_spent);
    }
    
    if (status === 'completed') {
      updateData.completed_at = knex.fn.now();
    }
    
    // Usar upsert (insert ou update)
    const existing = await knex('child_tasks')
      .where({ child_id: Number(child_id), task_id: taskId })
      .first();
    
    let result;
    if (existing) {
      // Atualizar registro existente
      result = await knex('child_tasks')
        .where({ child_id: Number(child_id), task_id: taskId })
        .update(updateData)
        .returning('*');
    } else {
      // Criar novo registro
      result = await knex('child_tasks')
        .insert({
          child_id: Number(child_id),
          task_id: taskId,
          assigned_at: knex.fn.now(),
          ...updateData
        })
        .returning('*');
    }
    
    console.log(`[DEBUG] POST /api/tasks/:id/progress: Progresso salvo para child_id=${child_id}, task_id=${taskId}`);
    return res.status(201).json(result[0]);
  } catch (e) {
    console.error('[DEBUG] POST /api/tasks/:id/progress: Erro ao salvar progresso:', e);
    return res.status(500).json({ message: 'Erro ao salvar progresso', error: e.message });
  }
});
console.log('✓ route POST /api/tasks/:id/progress pronta');

// Obter progresso de tarefas de uma criança (GET /api/children/:id/tasks/progress)
app.get('/api/children/:id/tasks/progress', async (req, res) => {
  console.log(`[DEBUG] GET /api/children/:id/tasks/progress chamado com id=${req.params.id}`);
  try {
    const payload = getAuthPayload(req);
    if (!payload) {
      return res.status(401).json({ message: 'Não autenticado' });
    }
    
    const childId = Number(req.params.id);
    if (!childId || isNaN(childId)) {
      return res.status(400).json({ message: 'ID inválido' });
    }
    
    const hasChildTasksTable = await knex.schema.hasTable('child_tasks');
    if (!hasChildTasksTable) {
      return res.json({ progress: [] });
    }
    
    const progress = await knex('child_tasks')
      .select('*')
      .where({ child_id: childId })
      .orderBy('completed_at', 'desc');
    
    console.log(`[DEBUG] GET /api/children/:id/tasks/progress: Retornando ${progress.length} registros`);
    return res.json({ progress });
  } catch (e) {
    console.error('[DEBUG] GET /api/children/:id/tasks/progress: Erro ao buscar progresso:', e);
    return res.status(500).json({ message: 'Erro ao buscar progresso', error: e.message });
  }
});
console.log('✓ route GET /api/children/:id/tasks/progress pronta');

// Atualizar uma criança (PUT)
app.put('/api/children/:id', async (req, res) => {
  const userId = Number(getUserIdFromAuth(req));
  if (!userId) return res.status(401).json({ message: 'Não autenticado' });
  
  const childId = Number(req.params.id);
  if (!childId || isNaN(childId)) {
    return res.status(400).json({ message: 'ID inválido' });
  }
  
  const { name, birth_date, age, gender, notes, preferences, supportLevel } = req.body || {};
  
  // Validar nome
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ message: 'Nome é obrigatório e não pode estar vazio' });
  }
  
  // Validar age se fornecido
  let parsedAge = null;
  if (age !== undefined && age !== null && age !== '') {
    parsedAge = parseInt(age);
    if (isNaN(parsedAge) || parsedAge < 0 || parsedAge > 120) {
      return res.status(400).json({ message: 'Idade inválida' });
    }
  }
  
  try {
    // Verificar acesso
    const payload = getAuthPayload(req);
    const role = payload?.role || null;
    
    // Verificar se usuário tem acesso a esta criança
    let hasAccess = false;
    if (role === 'admin') {
      hasAccess = true;
    } else if (role === 'responsavel') {
      const child = await knex('children').where({ id: childId, owner_id: userId }).first();
      hasAccess = !!child;
    } else if (role === 'terapeuta' || role === 'professor') {
      const hasUserChildrenTable = await knex.schema.hasTable('user_children');
      if (hasUserChildrenTable) {
        const link = await knex('user_children').where({ user_id: userId, child_id: childId }).first();
        hasAccess = !!link;
      }
    }
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Acesso negado' });
    }
    
    // Calcular birth_date se age foi fornecido
    let calculatedBirthDate = birth_date;
    if (!calculatedBirthDate && parsedAge) {
      const today = new Date();
      const birthYear = today.getFullYear() - parsedAge;
      calculatedBirthDate = `${birthYear}-01-01`;
    }
    
    // Construir objeto de atualização
    const updateData = {
      name: String(name).trim(),
      birth_date: calculatedBirthDate || null,
      notes: notes ? String(notes).trim() : null,
      updated_at: knex.fn.now()
    };
    
    if (parsedAge !== null) {
      updateData.age = parsedAge;
    }
    if (gender) {
      updateData.gender = String(gender).toLowerCase();
    }
    if (preferences) {
      updateData.preferences = String(preferences).trim();
    }
    if (supportLevel) {
      updateData.support_level = String(supportLevel).trim();
    }
    
    const updated = await knex('children')
      .where({ id: childId })
      .update(updateData)
      .returning('*');
    
    if (!updated || updated.length === 0) {
      return res.status(404).json({ message: 'Criança não encontrada' });
    }
    
    return res.json(updated[0]);
  } catch (e) {
    console.error('Erro ao atualizar criança:', e);
    return res.status(500).json({ message: 'Erro ao atualizar criança', error: e.message });
  }
});
console.log('✓ route PUT /api/children/:id pronta');

// Excluir uma criança (DELETE)
app.delete('/api/children/:id', async (req, res) => {
  console.log(`[DEBUG] DELETE /api/children/:id chamado com id=${req.params.id}`);
  const userId = Number(getUserIdFromAuth(req));
  if (!userId) return res.status(401).json({ message: 'Não autenticado' });
  
  const childId = Number(req.params.id);
  if (!childId || isNaN(childId)) {
    return res.status(400).json({ message: 'ID inválido' });
  }
  
  try {
    // Verificar acesso
    const payload = getAuthPayload(req);
    const role = payload?.role || null;
    
    // Verificar se usuário tem acesso a esta criança
    let hasAccess = false;
    if (role === 'admin') {
      hasAccess = true;
    } else if (role === 'responsavel') {
      const child = await knex('children').where({ id: childId, owner_id: userId }).first();
      hasAccess = !!child;
    } else if (role === 'terapeuta' || role === 'professor') {
      const hasUserChildrenTable = await knex.schema.hasTable('user_children');
      if (hasUserChildrenTable) {
        const link = await knex('user_children').where({ user_id: userId, child_id: childId }).first();
        hasAccess = !!link;
      }
    }
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Acesso negado' });
    }
    
    const deleted = await knex('children')
      .where({ id: childId })
      .delete();
    
    if (!deleted) {
      return res.status(404).json({ message: 'Criança não encontrada' });
    }
    
    return res.json({ message: 'Criança excluída com sucesso' });
  } catch (e) {
    console.error('Erro ao excluir criança:', e);
    return res.status(500).json({ message: 'Erro ao excluir criança', error: e.message });
  }
});
console.log('✓ route DELETE /api/children/:id pronta');

// (Rota GET /api/children/:id/games já está definida acima, antes de GET /api/children/:id)
// Atribuir jogos a uma criança (POST)
app.post('/api/children/:id/games', async (req, res) => {
  const userId = Number(getUserIdFromAuth(req));
  if (!userId) return res.status(401).json({ message: 'Não autenticado' });
  
  const childId = Number(req.params.id);
  if (!childId || isNaN(childId)) {
    return res.status(400).json({ message: 'ID inválido' });
  }
  
  const { gameIds } = req.body || {};
  if (!Array.isArray(gameIds)) {
    return res.status(400).json({ message: 'gameIds deve ser um array' });
  }
  
  try {
    // Verificar acesso
    const payload = getAuthPayload(req);
    const role = payload?.role || null;
    
    let hasAccess = false;
    if (role === 'admin' || role === 'terapeuta' || role === 'professor') {
      if (role === 'admin') {
        hasAccess = true;
      } else {
        const hasUserChildrenTable = await knex.schema.hasTable('user_children');
        if (hasUserChildrenTable) {
          const link = await knex('user_children').where({ user_id: userId, child_id: childId }).first();
          hasAccess = !!link;
        }
      }
    }
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Acesso negado' });
    }
    
    // Verificar se tabela existe
    const hasChildrenGamesTable = await knex.schema.hasTable('children_games');
    if (!hasChildrenGamesTable) {
      return res.status(500).json({ message: 'Tabela children_games não existe' });
    }
    
    // Desativar todos os jogos atuais
    await knex('children_games')
      .where({ child_id: childId })
      .update({ active: false });
    
    // Atribuir novos jogos
    if (gameIds.length > 0) {
      // Mapear slugs para IDs de jogos, criando jogos se necessário
      const gameIdMap = {
        'memory': { title: 'Jogo da Memória', description: 'Encontre os pares de cartas correspondentes.', level: 'Iniciante', category: 'Cognição' },
        'puzzle': { title: 'Quebra-Cabeça', description: 'Monte as peças para formar imagens completas.', level: 'Iniciante', category: 'Cognição' },
        'emotions': { title: 'Reconhecimento de Emoções', description: 'Aprenda a identificar diferentes expressões faciais e emoções.', level: 'Iniciante', category: 'Socioemocional' },
        'colors-shapes': { title: 'Cores e Formas', description: 'Combine cores e formas para desenvolver habilidades visuais.', level: 'Iniciante', category: 'Cognição' },
        'sequences': { title: 'Sequências', description: 'Complete sequências numéricas e lógicas.', level: 'Intermediário', category: 'Cognição' },
        'association': { title: 'Associação', description: 'Ligue objetos relacionados para desenvolver raciocínio.', level: 'Iniciante', category: 'Cognição' }
      };
      
      const resolvedGameIds = [];
      
      for (const gameIdOrSlug of gameIds) {
        let gameId = null;
        
        // Se for número, usar diretamente
        if (typeof gameIdOrSlug === 'number' || (typeof gameIdOrSlug === 'string' && !isNaN(gameIdOrSlug))) {
          const numId = Number(gameIdOrSlug);
          // Verificar se o jogo existe
          const game = await knex('games').where({ id: numId }).first();
          if (game) {
            gameId = numId;
          }
        } else if (typeof gameIdOrSlug === 'string') {
          // Se for string (slug), buscar ou criar o jogo
          const slug = gameIdOrSlug.toLowerCase();
          let game = await knex('games').where({ slug }).orWhere({ slug: slug.replace('-', '_') }).first();
          
          if (!game && gameIdMap[slug]) {
            // Criar o jogo automaticamente
            try {
              const inserted = await knex('games')
                .insert({
                  title: gameIdMap[slug].title,
                  slug: slug,
                  description: gameIdMap[slug].description,
                  level: gameIdMap[slug].level,
                  category: gameIdMap[slug].category,
                  is_active: true,
                  created_at: knex.fn.now(),
                  updated_at: knex.fn.now()
                })
                .returning(['id']);
              game = { id: inserted[0].id };
              console.log(`✓ Jogo "${gameIdMap[slug].title}" criado automaticamente`);
            } catch (e) {
              console.error(`Erro ao criar jogo "${slug}":`, e.message);
            }
          }
          
          if (game) {
            gameId = game.id;
          }
        }
        
        if (gameId) {
          resolvedGameIds.push(gameId);
        } else {
          console.warn(`Jogo não encontrado e não pôde ser criado: ${gameIdOrSlug}`);
        }
      }
      
      if (resolvedGameIds.length === 0) {
        return res.status(400).json({ message: 'Nenhum jogo válido encontrado para atribuir' });
      }
      
      const toInsert = resolvedGameIds.map(gameId => ({
        child_id: childId,
        game_id: gameId,
        assigned_by: userId,
        assigned_at: knex.fn.now(),
        active: true
      }));
      
      await knex('children_games')
        .insert(toInsert)
        .onConflict(['child_id', 'game_id'])
        .merge({ active: true, assigned_by: userId, assigned_at: knex.fn.now() });
    }
    
    return res.json({ message: 'Jogos atribuídos com sucesso' });
  } catch (e) {
    console.error('Erro ao atribuir jogos:', e);
    return res.status(500).json({ message: 'Erro ao atribuir jogos', error: e.message });
  }
});
console.log('✓ route POST /api/children/:id/games pronta');

// Registrar rotas de skills, reports, etc.
try {
  const skillsRoutes = require('./routes/skills');
  app.use('/api/skills', (req, res, next) => {
    // Adaptar middleware de autenticação
    const payload = getAuthPayload(req);
    if (!payload) return res.status(401).json({ message: 'Não autenticado' });
    req.userId = Number(payload?.userId ?? payload?.id ?? payload?.sub);
    req.userRole = payload?.role || null;
    next();
  }, skillsRoutes);
  console.log('✓ route /api/skills registrada');
} catch (e) {
  console.warn('⚠️ Não foi possível registrar rotas de skills:', e.message);
}

try {
  const reportsRoutes = require('./routes/reports');
  app.use('/api/reports', (req, res, next) => {
    const payload = getAuthPayload(req);
    if (!payload) return res.status(401).json({ message: 'Não autenticado' });
    req.userId = Number(payload?.userId ?? payload?.id ?? payload?.sub);
    req.userRole = payload?.role || null;
    next();
  }, reportsRoutes);
  console.log('✓ route /api/reports registrada');
} catch (e) {
  console.warn('⚠️ Não foi possível registrar rotas de reports:', e.message);
}

try {
  const rewardsRoutes = require('./routes/rewards');
  // Usar middleware customizado que aceita demo-token
  app.use('/api/rewards', (req, res, next) => {
    const payload = getAuthPayload(req);
    if (!payload) {
      console.log('[DEBUG] /api/rewards: Requisição sem autenticação, retornando 401');
      return res.status(401).json({ message: 'Não autenticado' });
    }
    req.userId = Number(payload?.userId ?? payload?.id ?? payload?.sub ?? 999);
    req.userRole = payload?.role || 'admin';
    req.user = { ...payload, id: req.userId, role: req.userRole };
    console.log(`[DEBUG] /api/rewards: Autenticado como userId=${req.userId}, role=${req.userRole}`);
    next();
  }, rewardsRoutes);
  console.log('✓ route /api/rewards registrada');
} catch (e) {
  console.warn('⚠️ Não foi possível registrar rotas de rewards:', e.message);
  console.error('Erro completo:', e);
}

// Middleware de tratamento de erros global
app.use((err, req, res, next) => {
  console.error('[ERROR HANDLER] Erro não tratado:', err);
  console.error('[ERROR HANDLER] Stack:', err.stack);
  console.error('[ERROR HANDLER] URL:', req.url);
  console.error('[ERROR HANDLER] Method:', req.method);
  
  if (res.headersSent) {
    return next(err);
  }
  
  res.status(err.status || 500).json({
    message: err.message || 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// ============================================
// ROTAS DE GERENCIAMENTO DE USUÁRIOS (ADMIN)
// ============================================

// Listar todos os usuários (GET /api/users) - Apenas Admin
app.get('/api/users', async (req, res) => {
  console.log(`[DEBUG] GET /api/users chamado`);
  try {
    const payload = getAuthPayload(req);
    if (!payload) {
      return res.status(401).json({ message: 'Não autenticado' });
    }
    
    const role = payload?.role || null;
    if (role !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem listar usuários.' });
    }
    
    const hasUsersTable = await knex.schema.hasTable('users');
    if (!hasUsersTable) {
      return res.json({ users: [] });
    }
    
    // Buscar todos os usuários com suas crianças vinculadas
    const users = await knex('users')
      .select('id', 'name', 'email', 'role', 'created_at')
      .orderBy('created_at', 'desc');
    
    // Para cada usuário, buscar crianças vinculadas
    const usersWithChildren = await Promise.all(users.map(async (user) => {
      let children = [];
      
      if (user.role === 'responsavel' || user.role === 'responsável') {
        // Responsável: buscar por owner_id
        children = await knex('children')
          .where('owner_id', user.id)
          .select('id', 'name', 'age', 'gender');
      } else if (user.role === 'terapeuta' || user.role === 'professor') {
        // Terapeuta/Professor: buscar via user_children
        const hasUserChildrenTable = await knex.schema.hasTable('user_children');
        if (hasUserChildrenTable) {
          const childIds = await knex('user_children')
            .where('user_id', user.id)
            .pluck('child_id');
          
          if (childIds.length > 0) {
            children = await knex('children')
              .whereIn('id', childIds)
              .select('id', 'name', 'age', 'gender');
          }
        }
      }
      
      // Buscar senha (se existir coluna password ou password_hash)
      const hasPassword = await knex.schema.hasColumn('users', 'password');
      const hasPasswordHash = await knex.schema.hasColumn('users', 'password_hash');
      
      let password = null;
      if (hasPassword || hasPasswordHash) {
        const userWithPassword = await knex('users')
          .where('id', user.id)
          .select(hasPassword ? ['password'] : ['password_hash'])
          .first();
        password = userWithPassword?.password || userWithPassword?.password_hash || null;
      }
      
      return {
        ...user,
        password: password || 'Não definida',
        children: children
      };
    }));
    
    console.log(`[DEBUG] GET /api/users: Retornando ${usersWithChildren.length} usuários`);
    return res.json({ users: usersWithChildren });
  } catch (e) {
    console.error('[DEBUG] GET /api/users: Erro ao listar usuários:', e);
    return res.status(500).json({ message: 'Erro ao listar usuários', error: e.message });
  }
});
console.log('✓ route GET /api/users pronta');

// Criar novo usuário (POST /api/users) - Apenas Admin
app.post('/api/users', async (req, res) => {
  console.log(`[DEBUG] POST /api/users chamado`);
  try {
    const payload = getAuthPayload(req);
    if (!payload) {
      return res.status(401).json({ message: 'Não autenticado' });
    }
    
    const role = payload?.role || null;
    if (role !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem criar usuários.' });
    }
    
    const { name, email, password, role: userRole } = req.body || {};
    
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Nome é obrigatório' });
    }
    
    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email é obrigatório' });
    }
    
    if (!password || !password.trim()) {
      return res.status(400).json({ message: 'Senha é obrigatória' });
    }
    
    // Normalizar role
    const roleMap = {
      'terapeuta': 'terapeuta',
      'Terapeuta': 'terapeuta',
      'professor': 'professor',
      'Professor': 'professor',
      'professora': 'professor',
      'Professora': 'professor',
      'responsavel': 'responsavel',
      'Responsável': 'responsavel',
      'responsável': 'responsavel',
      'Responsavel': 'responsavel'
    };
    
    const normalizedRole = roleMap[userRole] || userRole?.toLowerCase();
    const validRoles = ['terapeuta', 'professor', 'responsavel'];
    
    if (!normalizedRole || !validRoles.includes(normalizedRole)) {
      return res.status(400).json({ message: 'Papel deve ser: Terapeuta, Professor ou Responsável' });
    }
    
    const hasUsersTable = await knex.schema.hasTable('users');
    if (!hasUsersTable) {
      // Criar tabela se não existir
      await knex.schema.createTable('users', (table) => {
        table.increments('id').primary();
        table.string('name', 100).notNullable();
        table.string('email', 100).notNullable().unique();
        table.string('password', 255);
        table.string('password_hash', 255);
        table.string('role', 50).defaultTo('responsavel');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
      });
    }
    
    // Verificar se email já existe
    const existing = await knex('users').where('email', email.toLowerCase().trim()).first();
    if (existing) {
      return res.status(400).json({ message: 'Email já está em uso' });
    }
    
    // Verificar qual coluna de senha existe
    const hasPassword = await knex.schema.hasColumn('users', 'password');
    const hasPasswordHash = await knex.schema.hasColumn('users', 'password_hash');
    
    const insertData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: normalizedRole,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    };
    
    if (hasPasswordHash) {
      insertData.password_hash = password; // Em produção, usar hash
    } else if (hasPassword) {
      insertData.password = password; // Em produção, usar hash
    }
    
    const inserted = await knex('users')
      .insert(insertData)
      .returning(['id', 'name', 'email', 'role', 'created_at']);
    
    console.log(`[DEBUG] POST /api/users: Usuário criado com id=${inserted[0].id}`);
    return res.status(201).json({ user: inserted[0], password: password });
  } catch (e) {
    console.error('[DEBUG] POST /api/users: Erro ao criar usuário:', e);
    return res.status(500).json({ message: 'Erro ao criar usuário', error: e.message });
  }
});
console.log('✓ route POST /api/users pronta');

// Atualizar usuário (PUT /api/users/:id) - Apenas Admin
app.put('/api/users/:id', async (req, res) => {
  console.log(`[DEBUG] PUT /api/users/:id chamado com id=${req.params.id}`);
  try {
    const payload = getAuthPayload(req);
    if (!payload) {
      return res.status(401).json({ message: 'Não autenticado' });
    }
    
    const role = payload?.role || null;
    if (role !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem atualizar usuários.' });
    }
    
    const userId = Number(req.params.id);
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ message: 'ID inválido' });
    }
    
    const { name, email, password, role: userRole } = req.body || {};
    
    const hasUsersTable = await knex.schema.hasTable('users');
    if (!hasUsersTable) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    const existing = await knex('users').where('id', userId).first();
    if (!existing) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    const updateData = {
      updated_at: knex.fn.now()
    };
    
    if (name && name.trim()) {
      updateData.name = name.trim();
    }
    
    if (email && email.trim()) {
      // Verificar se email já está em uso por outro usuário
      const emailExists = await knex('users')
        .where('email', email.toLowerCase().trim())
        .whereNot('id', userId)
        .first();
      
      if (emailExists) {
        return res.status(400).json({ message: 'Email já está em uso' });
      }
      
      updateData.email = email.toLowerCase().trim();
    }
    
    if (password && password.trim()) {
      const hasPassword = await knex.schema.hasColumn('users', 'password');
      const hasPasswordHash = await knex.schema.hasColumn('users', 'password_hash');
      
      if (hasPasswordHash) {
        updateData.password_hash = password; // Em produção, usar hash
      } else if (hasPassword) {
        updateData.password = password; // Em produção, usar hash
      }
    }
    
    if (userRole) {
      // Normalizar role
      const roleMap = {
        'terapeuta': 'terapeuta',
        'Terapeuta': 'terapeuta',
        'professor': 'professor',
        'Professor': 'professor',
        'professora': 'professor',
        'Professora': 'professor',
        'responsavel': 'responsavel',
        'Responsável': 'responsavel',
        'responsável': 'responsavel',
        'Responsavel': 'responsavel'
      };
      
      const normalizedRole = roleMap[userRole] || userRole?.toLowerCase();
      const validRoles = ['terapeuta', 'professor', 'responsavel'];
      
      if (validRoles.includes(normalizedRole)) {
        updateData.role = normalizedRole;
      }
    }
    
    const updated = await knex('users')
      .where('id', userId)
      .update(updateData)
      .returning(['id', 'name', 'email', 'role', 'created_at']);
    
    console.log(`[DEBUG] PUT /api/users/:id: Usuário atualizado com id=${userId}`);
    return res.json({ user: updated[0] });
  } catch (e) {
    console.error('[DEBUG] PUT /api/users/:id: Erro ao atualizar usuário:', e);
    return res.status(500).json({ message: 'Erro ao atualizar usuário', error: e.message });
  }
});
console.log('✓ route PUT /api/users/:id pronta');

// Excluir usuário (DELETE /api/users/:id) - Apenas Admin
app.delete('/api/users/:id', async (req, res) => {
  console.log(`[DEBUG] DELETE /api/users/:id chamado com id=${req.params.id}`);
  try {
    const payload = getAuthPayload(req);
    if (!payload) {
      return res.status(401).json({ message: 'Não autenticado' });
    }
    
    const role = payload?.role || null;
    if (role !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem excluir usuários.' });
    }
    
    const userId = Number(req.params.id);
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ message: 'ID inválido' });
    }
    
    // Não permitir excluir a si mesmo
    const currentUserId = Number(payload?.userId ?? payload?.id ?? payload?.sub);
    if (userId === currentUserId) {
      return res.status(400).json({ message: 'Você não pode excluir a si mesmo' });
    }
    
    const hasUsersTable = await knex.schema.hasTable('users');
    if (!hasUsersTable) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    const existing = await knex('users').where('id', userId).first();
    if (!existing) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    await knex('users').where('id', userId).delete();
    
    console.log(`[DEBUG] DELETE /api/users/:id: Usuário excluído com id=${userId}`);
    return res.json({ message: 'Usuário excluído com sucesso' });
  } catch (e) {
    console.error('[DEBUG] DELETE /api/users/:id: Erro ao excluir usuário:', e);
    return res.status(500).json({ message: 'Erro ao excluir usuário', error: e.message });
  }
});
console.log('✓ route DELETE /api/users/:id pronta');

// Vincular criança a usuário (POST /api/users/:id/children) - Apenas Admin
app.post('/api/users/:id/children', async (req, res) => {
  console.log(`[DEBUG] POST /api/users/:id/children chamado com id=${req.params.id}`);
  try {
    const payload = getAuthPayload(req);
    if (!payload) {
      return res.status(401).json({ message: 'Não autenticado' });
    }
    
    const role = payload?.role || null;
    if (role !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem vincular crianças.' });
    }
    
    const userId = Number(req.params.id);
    const { child_id } = req.body || {};
    
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ message: 'ID do usuário inválido' });
    }
    
    if (!child_id) {
      return res.status(400).json({ message: 'child_id é obrigatório' });
    }
    
    const user = await knex('users').where('id', userId).first();
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    const child = await knex('children').where('id', Number(child_id)).first();
    if (!child) {
      return res.status(404).json({ message: 'Criança não encontrada' });
    }
    
    // Se for responsável, vincular via owner_id
    if (user.role === 'responsavel' || user.role === 'responsável') {
      await knex('children')
        .where('id', Number(child_id))
        .update({ owner_id: userId });
    } else if (user.role === 'terapeuta' || user.role === 'professor') {
      // Se for terapeuta/professor, vincular via user_children
      const hasUserChildrenTable = await knex.schema.hasTable('user_children');
      if (!hasUserChildrenTable) {
        await knex.schema.createTable('user_children', (table) => {
          table.increments('id').primary();
          table.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
          table.integer('child_id').notNullable().references('id').inTable('children').onDelete('CASCADE');
          table.timestamp('created_at').defaultTo(knex.fn.now());
          table.unique(['user_id', 'child_id']);
        });
      }
      
      await knex('user_children')
        .insert({ user_id: userId, child_id: Number(child_id) })
        .onConflict(['user_id', 'child_id'])
        .ignore();
    }
    
    console.log(`[DEBUG] POST /api/users/:id/children: Criança ${child_id} vinculada ao usuário ${userId}`);
    return res.json({ message: 'Criança vinculada com sucesso' });
  } catch (e) {
    console.error('[DEBUG] POST /api/users/:id/children: Erro ao vincular criança:', e);
    return res.status(500).json({ message: 'Erro ao vincular criança', error: e.message });
  }
});
console.log('✓ route POST /api/users/:id/children pronta');

// Middleware 404 - deve vir por último
app.use((req, res) => {
  console.log(`[404] Rota não encontrada: ${req.method} ${req.url}`);
  res.status(404).json({ message: 'Rota não encontrada' });
});

const PORT = Number(process.env.BACKEND_PORT || process.env.PORT || 3001);
app.listen(PORT, () => {
  console.log('Servidor rodando na porta', PORT);
  ensureDemoData();
});