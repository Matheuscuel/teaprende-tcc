# 🎮 Guia de Teste - Interface de Cada Criança

## 📋 Como Funciona

**SIM, cada criança tem sua própria interface!** O sistema usa o parâmetro `childId` na URL para identificar qual criança está jogando e salvar os dados dela.

## 🔗 Como Acessar a Interface de Cada Criança

### Método 1: Pela Página do Perfil da Criança
1. Acesse `/children` (lista de crianças)
2. Clique na criança desejada
3. Na página do perfil, clique no botão **"👶 Acessar Modo Criança"**
4. Isso leva para `/kid?childId=X` (onde X é o ID da criança)

### Método 2: Direto pela URL
```
http://localhost:3000/kid?childId=1  (Criança com ID 1)
http://localhost:3000/kid?childId=2  (Criança com ID 2)
http://localhost:3000/kid?childId=3  (Criança com ID 3)
```

### Método 3: Pelos Dashboards
- **Admin/Terapeuta/Professor**: Dashboard → Card "Modo Criança" → Seleciona criança
- **Responsável**: Dashboard → "Acompanhar Criança" (vai direto para a criança vinculada)

## 🎯 Interface da Criança (`/kid?childId=X`)

A interface mostra 3 opções principais:
- **🎮 Jogos** → `/kid/games?childId=X`
- **📝 Tarefas** → `/kid/tasks?childId=X`
- **⭐ Recompensas** → `/rewards?childId=X`

## 💾 Como os Dados São Salvos

### 1. **Progresso de Tarefas**
Quando a criança completa uma tarefa:
- **Endpoint**: `POST /api/tasks/:id/progress`
- **Dados salvos**:
  - `child_id`: ID da criança (vem do `childId` na URL)
  - `task_id`: ID da tarefa
  - `score`: Pontuação obtida
  - `time_spent`: Tempo gasto em segundos
  - `status`: "completed"

**Exemplo de salvamento** (em `app/kid/tasks/ligar-pontos/page.jsx`):
```javascript
const saveProgress = async (score, timeSpent) => {
  await fetch(`${API_BASE}/tasks/${taskId}/progress`, {
    method: "POST",
    body: JSON.stringify({
      child_id: childId,  // ← ID da criança vem da URL
      score: score,
      time_spent: timeSpent,
      status: "completed"
    })
  });
};
```

### 2. **Progresso de Jogos**
Quando a criança joga um jogo:
- **Endpoint**: `POST /api/games/:id/progress` ou similar
- **Dados salvos**:
  - `child_id`: ID da criança
  - `game_id`: ID do jogo
  - `score`: Pontuação
  - `time_spent`: Tempo gasto

### 3. **Tabelas no Banco de Dados**
- `child_tasks`: Progresso das tarefas por criança
- `game_progress`: Progresso dos jogos por criança
- `game_sessions`: Sessões de jogos (se implementado)

## 🧪 Passo a Passo para Testar

### Teste 1: Criar e Testar uma Criança
1. **Criar uma criança**:
   - Acesse `/children/create`
   - Preencha: Nome, Idade, Gênero
   - Salve e anote o ID (ex: ID = 1)

2. **Acessar modo criança**:
   - Vá para `/children/1` (perfil da criança)
   - Clique em "👶 Acessar Modo Criança"
   - Ou acesse diretamente: `/kid?childId=1`

3. **Testar uma tarefa**:
   - Clique em "📝 Tarefas"
   - Escolha uma tarefa (ex: "Ligar os Pontos")
   - Complete a tarefa
   - Os dados são salvos automaticamente com `childId=1`

4. **Testar um jogo**:
   - Clique em "🎮 Jogos"
   - Escolha um jogo (ex: "Jogo da Memória")
   - Jogue e complete
   - Os dados são salvos automaticamente com `childId=1`

### Teste 2: Testar Múltiplas Crianças
1. **Criar Criança 1**:
   - Nome: "João"
   - Acesse: `/kid?childId=1`
   - Complete algumas tarefas

2. **Criar Criança 2**:
   - Nome: "Maria"
   - Acesse: `/kid?childId=2`
   - Complete outras tarefas

3. **Verificar dados separados**:
   - Volte para `/children/1` → Veja progresso do João
   - Vá para `/children/2` → Veja progresso da Maria
   - Cada criança tem seus próprios dados!

## 🔍 Verificar Dados Salvos

### Pela Interface Web
1. Acesse `/children/[id]` (perfil da criança)
2. Veja a aba "Histórico" ou "Progresso"
3. Deve mostrar as tarefas/jogos completados por aquela criança

### Pelo Banco de Dados (SQL)
```sql
-- Ver progresso de tarefas de uma criança
SELECT * FROM child_tasks WHERE child_id = 1;

-- Ver progresso de jogos de uma criança
SELECT * FROM game_progress WHERE child_id = 1;

-- Ver todas as crianças e seus progressos
SELECT 
  c.name,
  COUNT(DISTINCT ct.task_id) as tarefas_completas,
  COUNT(DISTINCT gp.game_id) as jogos_jogados
FROM children c
LEFT JOIN child_tasks ct ON c.id = ct.child_id AND ct.status = 'completed'
LEFT JOIN game_progress gp ON c.id = gp.child_id
GROUP BY c.id, c.name;
```

## 📝 Checklist de Teste

- [ ] Criar pelo menos 2 crianças diferentes
- [ ] Acessar `/kid?childId=1` e completar tarefas
- [ ] Acessar `/kid?childId=2` e completar tarefas diferentes
- [ ] Verificar que os dados estão separados por criança
- [ ] Testar jogos para cada criança
- [ ] Verificar progresso no perfil de cada criança
- [ ] Testar atribuição de jogos específicos para cada criança

## 🎯 URLs Importantes

```
/kid?childId=1              → Interface da criança ID 1
/kid/games?childId=1        → Jogos da criança ID 1
/kid/tasks?childId=1        → Tarefas da criança ID 1
/children/1                 → Perfil da criança ID 1
/children/1/assign-games     → Atribuir jogos à criança ID 1
```

## ⚠️ Importante

- **Cada criança tem sua própria interface**: O `childId` na URL identifica qual criança está jogando
- **Dados são salvos separadamente**: Cada criança tem seu próprio progresso
- **Atribuição de jogos**: Você pode atribuir jogos específicos para cada criança em `/children/[id]/assign-games`
- **Autenticação**: Você precisa estar logado como Admin, Terapeuta ou Professor para acessar o modo criança

## 🐛 Troubleshooting

**Problema**: Não consigo acessar `/kid?childId=X`
- **Solução**: Verifique se você está autenticado e se a criança existe

**Problema**: Os dados não estão sendo salvos
- **Solução**: Verifique o console do navegador (F12) para erros
- Verifique se o backend está rodando
- Verifique se o endpoint de progresso está funcionando

**Problema**: Não vejo progresso na página da criança
- **Solução**: Verifique se os dados foram salvos no banco
- Verifique se a página está carregando os dados corretamente

