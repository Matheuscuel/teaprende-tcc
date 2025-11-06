# 📘 Guia: Como Criar Criança para uma Conta de Usuário

## 🎯 Métodos Disponíveis

### **Método 1: Criação Automática (Recomendado)**

Quando você cria uma criança, ela é **automaticamente vinculada** ao seu usuário baseado no seu papel:

#### **Se você é RESPONSÁVEL:**
1. Acesse `/children/create` ou clique em "Cadastrar Criança"
2. Preencha os dados da criança
3. Ao salvar, a criança é **automaticamente vinculada** a você via `owner_id`
4. ✅ Pronto! A criança já está vinculada

#### **Se você é TERAPEUTA ou PROFESSOR:**
1. Acesse `/children/create` ou clique em "Cadastrar Criança"
2. Preencha os dados da criança
3. Ao salvar, a criança é **automaticamente vinculada** a você via `user_children`
4. ✅ Pronto! A criança já está vinculada

---

### **Método 2: Criação + Vinculação Manual (Para Admin)**

Como **ADMIN**, você pode criar uma criança e depois vinculá-la a qualquer usuário:

#### **Passo 1: Criar a Criança**
1. Acesse `/children/create`
2. Preencha os dados da criança
3. Salve a criança

#### **Passo 2: Vincular a Criança ao Usuário**
1. Acesse `/quem-usa` (gerenciamento de usuários)
2. Na tabela, encontre o usuário desejado
3. Clique no botão **"👶 Vincular"**
4. Selecione a criança no dropdown
5. Clique em "Vincular"
6. ✅ Pronto! A criança está vinculada ao usuário

---

## 🔗 Como Funciona a Vinculação

### **Responsável (`owner_id`):**
- A criança pertence ao responsável
- Um responsável pode ter múltiplas crianças
- Vinculação via campo `owner_id` na tabela `children`

### **Terapeuta/Professor (`user_children`):**
- A criança é associada ao profissional
- Um profissional pode ter múltiplas crianças
- Uma criança pode ter múltiplos profissionais
- Vinculação via tabela `user_children`

---

## 📋 Exemplo Prático

### **Cenário: Criar criança para um Responsável**

1. **Faça login como RESPONSÁVEL** (ou como ADMIN)
2. Vá para `/children/create`
3. Preencha:
   - Nome: "Maria Silva"
   - Idade: 8
   - Gênero: Feminino
   - Preferências: "Gosta de desenhar e brincar"
   - Grau de Suporte: Médio
4. Clique em "Cadastrar Criança"
5. ✅ A criança "Maria Silva" está criada e vinculada ao seu usuário!

### **Cenário: Admin vincula criança a Terapeuta**

1. **Faça login como ADMIN**
2. Crie a criança em `/children/create` (ou use uma existente)
3. Vá para `/quem-usa`
4. Encontre o terapeuta na lista
5. Clique em "👶 Vincular" no terapeuta
6. Selecione a criança no dropdown
7. Clique em "Vincular"
8. ✅ A criança está vinculada ao terapeuta!

---

## ⚠️ Observações Importantes

- **Responsáveis** veem apenas suas próprias crianças
- **Terapeutas/Professores** veem apenas crianças vinculadas a eles
- **Admin** vê todas as crianças e pode gerenciar vínculos
- Uma criança pode ter **um responsável** e **múltiplos profissionais**
- Para desvincular, você precisaria editar diretamente no banco de dados (ou implementar essa funcionalidade)

---

## 🛠️ Verificar Vínculos

Para ver quais crianças estão vinculadas a um usuário:

1. Acesse `/quem-usa` como ADMIN
2. Na tabela, veja a coluna **"Crianças"**
3. Cada criança vinculada aparece como um badge azul com o nome

---

## 📞 Precisa de Ajuda?

Se tiver dúvidas ou problemas:
1. Verifique se o backend está rodando
2. Verifique se você tem permissões adequadas (role correto)
3. Verifique os logs do backend para erros

