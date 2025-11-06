# Sistema de Permissões - TEAprende

## Visão Geral

O sistema de permissões foi implementado com 4 tipos de usuários, cada um com níveis de acesso específicos.

## Tipos de Usuários

### 1. Admin (Administrador)
**Email Demo:** `admin@demo.com`

**Acesso Total:**
- ✅ Gerenciar usuários (`/quem-usa`)
- ✅ Gerenciar crianças
- ✅ Ver todos os relatórios (`/reports`)
- ✅ Gerenciar jogos (`/games`)
- ✅ Gerenciar tarefas (`/tasks`)
- ✅ Configurações do sistema
- ✅ Dashboard: `/dashboard/admin`

### 2. Terapeuta
**Email Demo:** `terapeuta@demo.com`

**Acesso:**
- ✅ Ver pacientes (crianças que atende)
- ✅ Criar relatórios dos pacientes (`/reports`)
- ✅ Atribuir jogos terapêuticos (`/games`)
- ✅ Criar e gerenciar tarefas (`/tasks`)
- ✅ Acompanhar habilidades (`/skills`)
- ❌ Gerenciar usuários
- ❌ Configurações do sistema
- ✅ Dashboard: `/dashboard/terapeuta`

### 3. Professor
**Email Demo:** `professor@demo.com`

**Acesso:**
- ✅ Gerenciar turmas
- ✅ Ver alunos da turma
- ✅ Criar relatórios da turma (`/reports`)
- ✅ Atribuir jogos aos alunos (`/games`)
- ✅ Criar e gerenciar tarefas (`/tasks`)
- ❌ Gerenciar usuários
- ❌ Configurações do sistema
- ✅ Dashboard: `/dashboard/professor`

### 4. Responsável
**Email Demo:** `responsavel@demo.com` ou `responsável@demo.com`

**Acesso Limitado:**
- ✅ Acessar interface infantil para o filho (`/kid`)
- ✅ Ver relatórios do filho (`/reports`)
- ✅ Ver recompensas do filho (`/rewards`)
- ❌ Gerenciar crianças
- ❌ Gerenciar jogos
- ❌ Gerenciar tarefas
- ❌ Gerenciar usuários
- ✅ Dashboard: `/dashboard/responsavel`

## Arquitetura do Sistema

### Arquivos Criados

1. **`app/lib/auth.js`**
   - Define roles e permissões
   - Funções de verificação de acesso
   - Funções de redirecionamento

2. **`app/components/auth/RoleGuard.jsx`**
   - Componente de proteção de rotas
   - Verifica permissões antes de renderizar
   - Exibe mensagem de acesso negado

3. **Dashboards Específicos:**
   - `app/dashboard/admin/page.jsx`
   - `app/dashboard/terapeuta/page.jsx`
   - `app/dashboard/professor/page.jsx`
   - `app/dashboard/responsavel/page.jsx`

### Fluxo de Autenticação

1. **Login** (`/login`)
   - Detecta o role do usuário
   - Redireciona automaticamente para o dashboard correto

2. **Registro** (`/register`)
   - Permite escolher o tipo de usuário (exceto Admin)
   - Redireciona baseado no role escolhido

3. **Dashboard Principal** (`/dashboard`)
   - Redireciona automaticamente para o dashboard específico do role

## Proteção de Rotas

### Rotas Protegidas por Role

- **`/quem-usa`**: Apenas Admin
- **`/dashboard/admin`**: Apenas Admin
- **`/dashboard/terapeuta`**: Apenas Terapeuta
- **`/dashboard/professor`**: Apenas Professor
- **`/dashboard/responsavel`**: Apenas Responsável

### Rotas com Acesso Parcial

- **`/reports`**: Todos os roles (mas filtrados por criança para Responsável)
- **`/games`**: Admin, Terapeuta, Professor
- **`/tasks`**: Admin, Terapeuta, Professor
- **`/kid`**: Apenas Responsável (interface infantil)

## Como Usar

### Para Testar

1. **Admin:**
   - Email: `admin@demo.com`
   - Qualquer senha (modo DEMO)
   - Acesso: Total

2. **Terapeuta:**
   - Email: `terapeuta@demo.com`
   - Qualquer senha (modo DEMO)
   - Acesso: Pacientes e atividades

3. **Professor:**
   - Email: `professor@demo.com`
   - Qualquer senha (modo DEMO)
   - Acesso: Turmas e alunos

4. **Responsável:**
   - Email: `responsavel@demo.com`
   - Qualquer senha (modo DEMO)
   - Acesso: Apenas informações do filho

### Redirecionamento Automático

Após login, cada usuário é automaticamente redirecionado para:
- Admin → `/dashboard/admin`
- Terapeuta → `/dashboard/terapeuta`
- Professor → `/dashboard/professor`
- Responsável → `/dashboard/responsavel`

## Detecção de Role no Modo DEMO

O sistema detecta automaticamente o role baseado no email:
- `admin@demo.com` → Admin
- `terapeuta@demo.com` → Terapeuta
- `professor@demo.com` → Professor
- `responsavel@demo.com` ou `responsável@demo.com` → Responsável

## Funcionalidades Implementadas

✅ Sistema de roles completo
✅ Dashboards específicos por role
✅ Proteção de rotas com RoleGuard
✅ Redirecionamento automático após login
✅ Detecção de role no modo DEMO
✅ Mensagens de acesso negado
✅ Documentação completa

## Próximos Passos

- [ ] Integrar com backend para validação de roles
- [ ] Implementar filtros por criança para Responsável
- [ ] Adicionar filtros por turma para Professor
- [ ] Implementar filtros por paciente para Terapeuta
- [ ] Adicionar logs de auditoria de acesso

