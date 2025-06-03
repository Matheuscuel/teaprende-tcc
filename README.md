# TEAprende - Sistema de Jogos Educativos para Crianças com TEA

TEAprende é um sistema completo para auxiliar no desenvolvimento de habilidades sociais para crianças com Transtorno do Espectro Autista (TEA). O sistema inclui jogos educativos interativos, gerenciamento de usuários (terapeutas, professores, responsáveis e crianças) e geração de relatórios detalhados sobre o progresso.

## Estrutura do Projeto

O projeto está dividido em duas partes principais:

### Frontend (React.js)

- Interface de usuário responsiva e acessível
- Jogos educativos interativos
- Painéis de controle para diferentes tipos de usuários
- Visualização de relatórios e progresso

### Backend (Node.js com Express)

- API RESTful para comunicação com o frontend
- Autenticação e autorização com JWT
- Gerenciamento de usuários e permissões
- Armazenamento e recuperação de dados de progresso
- Geração de relatórios

## Tecnologias Utilizadas

### Frontend
- React.js
- TypeScript
- React Router
- Axios
- Tailwind CSS
- Chart.js

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT para autenticação
- Bcrypt para criptografia de senhas

## Instalação e Execução

### Pré-requisitos
- Node.js (v14 ou superior)
- PostgreSQL (v12 ou superior)

### Configuração do Banco de Dados
1. Crie um banco de dados PostgreSQL chamado `teaprende`
2. Execute o script SQL em `backend/src/database/init.sql` para criar as tabelas e inserir dados iniciais

### Backend
1. Navegue até a pasta `backend`
2. Copie o arquivo `.env.example` para `.env` e configure as variáveis de ambiente
3. Instale as dependências: `npm install`
4. Inicie o servidor: `npm run dev`

### Frontend
1. Navegue até a pasta `frontend`
2. Instale as dependências: `npm install`
3. Inicie o aplicativo: `npm start`

## Funcionalidades

### Gerenciamento de Usuários
- Cadastro e autenticação de usuários
- Diferentes níveis de acesso (terapeutas, professores, responsáveis, crianças)
- Perfis personalizados

### Jogos Educativos
- Jogos focados em reconhecimento de emoções
- Atividades de interação social
- Exercícios de comunicação
- Níveis de dificuldade progressivos

### Relatórios e Análises
- Acompanhamento do progresso ao longo do tempo
- Análise de habilidades desenvolvidas
- Recomendações personalizadas
- Exportação de relatórios

## Licença
Este projeto está licenciado sob a licença MIT.

