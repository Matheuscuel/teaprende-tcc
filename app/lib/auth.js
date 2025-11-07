// Sistema de autenticação e permissões

export const ROLES = {
  ADMIN: 'Admin',
  TERAPEUTA: 'Terapeuta',
  PROFESSOR: 'Professor',
  RESPONSAVEL: 'Responsável'
};

// Permissões por role
export const PERMISSIONS = {
  [ROLES.ADMIN]: {
    // Admin tem acesso total
    dashboard: true,
    relatorios: true,
    criancas: true,
    jogos: true,
    tarefas: true,
    usuarios: true,
    config: true,
    kid: false, // Não precisa da interface infantil
  },
  [ROLES.TERAPEUTA]: {
    dashboard: true,
    relatorios: true,
    criancas: true, // Crianças que ele atende
    jogos: true,
    tarefas: true,
    usuarios: false,
    config: false,
    kid: false,
  },
  [ROLES.PROFESSOR]: {
    dashboard: true,
    relatorios: true,
    criancas: true, // Crianças da turma
    jogos: true,
    tarefas: true,
    usuarios: false,
    config: false,
    kid: false,
  },
  [ROLES.RESPONSAVEL]: {
    dashboard: true, // Só do filho
    relatorios: true, // Só do filho
    criancas: false, // Não gerencia crianças
    jogos: false,
    tarefas: false,
    usuarios: false,
    config: false,
    kid: true, // Interface infantil para o filho
  }
};

// Rotas permitidas por role
export const ALLOWED_ROUTES = {
  [ROLES.ADMIN]: [
    '/dashboard',
    '/reports',
    '/quem-usa',
    '/games',
    '/tasks',
    '/skills',
    '/rewards',
  ],
  [ROLES.TERAPEUTA]: [
    '/dashboard',
    '/reports',
    '/games',
    '/tasks',
    '/skills',
    '/rewards',
  ],
  [ROLES.PROFESSOR]: [
    '/dashboard',
    '/reports',
    '/games',
    '/tasks',
    '/skills',
    '/rewards',
  ],
  [ROLES.RESPONSAVEL]: [
    '/dashboard',
    '/reports',
    '/kid',
    '/rewards',
  ],
};

// Função para obter o usuário atual
export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

// Função para obter o role do usuário (normalizado)
export function getUserRole() {
  const user = getCurrentUser();
  if (!user?.role) return null;
  
  // Normalizar role do backend para o formato esperado pelo frontend
  const roleMap = {
    'admin': ROLES.ADMIN,
    'terapeuta': ROLES.TERAPEUTA,
    'professor': ROLES.PROFESSOR,
    'professora': ROLES.PROFESSOR,
    'responsavel': ROLES.RESPONSAVEL,
    'responsável': ROLES.RESPONSAVEL,
    // Aceitar também os valores já normalizados
    [ROLES.ADMIN]: ROLES.ADMIN,
    [ROLES.TERAPEUTA]: ROLES.TERAPEUTA,
    [ROLES.PROFESSOR]: ROLES.PROFESSOR,
    [ROLES.RESPONSAVEL]: ROLES.RESPONSAVEL,
  };
  
  const normalized = roleMap[user.role.toLowerCase()] || roleMap[user.role] || user.role;
  return normalized;
}

// Função para verificar se o usuário tem permissão
export function hasPermission(permission) {
  const role = getUserRole();
  if (!role) return false;
  
  const rolePermissions = PERMISSIONS[role];
  if (!rolePermissions) return false;
  
  return rolePermissions[permission] === true;
}

// Função para verificar se o usuário tem acesso à rota
export function hasRouteAccess(route) {
  const role = getUserRole();
  if (!role) return false;
  
  const allowedRoutes = ALLOWED_ROUTES[role];
  if (!allowedRoutes) return false;
  
  // Verifica se a rota começa com algum dos caminhos permitidos
  return allowedRoutes.some(allowed => route.startsWith(allowed));
}

// Função para verificar se é admin
export function isAdmin() {
  return getUserRole() === ROLES.ADMIN;
}

// Função para verificar se é responsável
export function isResponsavel() {
  return getUserRole() === ROLES.RESPONSAVEL;
}

// Função para obter a rota de redirecionamento baseada no role
export function getDefaultRoute(role) {
  if (!role) {
    console.warn('[getDefaultRoute] Role não fornecido, redirecionando para home');
    return '/';
  }
  
  // Normalizar role para comparação (case-insensitive)
  const normalizedRole = typeof role === 'string' ? role.toLowerCase().trim() : String(role).toLowerCase().trim();
  
  // Mapear roles para rotas (aceita tanto valores exatos quanto normalizados, inglês e português)
  const roleRouteMap = {
    // Valores exatos de ROLES (case-insensitive)
    [ROLES.ADMIN.toLowerCase()]: '/dashboard/admin',
    [ROLES.TERAPEUTA.toLowerCase()]: '/dashboard/terapeuta',
    [ROLES.PROFESSOR.toLowerCase()]: '/dashboard/professor',
    [ROLES.RESPONSAVEL.toLowerCase()]: '/dashboard/responsavel',
    // Valores diretos em português (lowercase)
    'admin': '/dashboard/admin',
    'terapeuta': '/dashboard/terapeuta',
    'professor': '/dashboard/professor',
    'professora': '/dashboard/professor',
    'responsavel': '/dashboard/responsavel',
    'responsável': '/dashboard/responsavel',
    // Valores em inglês (lowercase) - para compatibilidade com backend
    'therapist': '/dashboard/terapeuta',
    'teacher': '/dashboard/professor',
    'guardian': '/dashboard/responsavel',
    'parent': '/dashboard/responsavel',
    // Valores exatos (com primeira letra maiúscula)
    'Admin': '/dashboard/admin',
    'Terapeuta': '/dashboard/terapeuta',
    'Therapist': '/dashboard/terapeuta',
    'Professor': '/dashboard/professor',
    'Teacher': '/dashboard/professor',
    'Responsável': '/dashboard/responsavel',
    'Guardian': '/dashboard/responsavel',
    'Parent': '/dashboard/responsavel'
  };
  
  // Tentar encontrar rota pelo role normalizado primeiro
  let route = roleRouteMap[normalizedRole];
  
  // Se não encontrou, tentar pelo valor original
  if (!route) {
    route = roleRouteMap[role] || '/';
  }
  
  console.log('[getDefaultRoute] Role recebido:', role, '| Normalizado:', normalizedRole, '| Rota:', route);
  return route;
}

