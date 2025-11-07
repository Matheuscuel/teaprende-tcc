# Contas de Demonstração - TEAprende

Este documento lista as contas de teste disponíveis para cada tipo de usuário.

## Como usar

Para testar cada tipo de usuário, faça login com qualquer uma das contas abaixo usando o email especificado e qualquer senha (modo DEMO).

## Contas Disponíveis

### 1. Admin (Administrador)
- **Email:** `admin@demo.com`
- **Acesso:** Total ao sistema
- **Permissões:**
  - ✅ Gerenciar usuários
  - ✅ Gerenciar crianças
  - ✅ Ver todos os relatórios
  - ✅ Gerenciar jogos
  - ✅ Gerenciar tarefas
  - ✅ Configurações do sistema

### 2. Terapeuta
- **Email:** `terapeuta@demo.com`
- **Acesso:** Pacientes e atividades terapêuticas
- **Permissões:**
  - ✅ Ver pacientes (crianças que atende)
  - ✅ Criar relatórios dos pacientes
  - ✅ Atribuir jogos terapêuticos
  - ✅ Criar e gerenciar tarefas
  - ✅ Acompanhar habilidades
  - ❌ Gerenciar usuários
  - ❌ Configurações do sistema

### 3. Professor
- **Email:** `professor@demo.com`
- **Acesso:** Turmas e alunos
- **Permissões:**
  - ✅ Gerenciar turmas
  - ✅ Ver alunos da turma
  - ✅ Criar relatórios da turma
  - ✅ Atribuir jogos aos alunos
  - ✅ Criar e gerenciar tarefas
  - ❌ Gerenciar usuários
  - ❌ Configurações do sistema

### 4. Responsável
- **Email:** `responsavel@demo.com` ou `responsável@demo.com`
- **Acesso:** Apenas informações do filho
- **Permissões:**
  - ✅ Acessar interface infantil (para o filho)
  - ✅ Ver relatórios do filho
  - ✅ Ver recompensas do filho
  - ❌ Gerenciar crianças
  - ❌ Gerenciar jogos
  - ❌ Gerenciar tarefas
  - ❌ Gerenciar usuários

## Redirecionamento Automático

Após o login, cada tipo de usuário é automaticamente redirecionado para seu dashboard específico:

- **Admin** → `/dashboard/admin`
- **Terapeuta** → `/dashboard/terapeuta`
- **Professor** → `/dashboard/professor`
- **Responsável** → `/dashboard/responsavel`

## Notas

- No modo DEMO, qualquer senha funciona
- O sistema detecta o tipo de usuário pelo email
- Para testar diferentes roles, use os emails correspondentes
- As contas são temporárias e não persistem após limpar o localStorage

