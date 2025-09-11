# 🤖 Sistema de Bot Telegram com Botões Interativos

## 📋 Funcionalidades Implementadas

### 1. **Envio de Pedidos com Botões**
- Cada pedido enviado ao Telegram agora inclui botões interativos
- Botões disponíveis:
  - 🔄 **Produzindo** - Marca pedido como "preparando"
  - 🚚 **Despachado** - Marca pedido como "em_deslocamento" 
  - ✅ **Entregue** - Marca pedido como "entregue"
  - 📞 **Ligar Cliente** - Mostra o WhatsApp do cliente
  - 💬 **WhatsApp** - Abre conversa direta com cliente

### 2. **Atualização Automática no Sistema**
- Quando funcionários clicam nos botões, o status é atualizado automaticamente no Supabase
- Sistema registra quem fez a atualização e quando
- Confirmação visual no Telegram

## 🚀 Como Configurar

### 1. **Instalar Dependências do Bot**
```bash
npm install node-telegram-bot-api
```

### 2. **Executar o Bot**
```bash
node telegram-bot.js
```

### 3. **Configurar Webhook (Opcional)**
Para produção, recomenda-se usar webhook em vez de polling:
- Descomente a seção de webhook no código
- Configure sua URL de webhook

## 🔧 Configurações Necessárias

### **Supabase Edge Functions**
Duas funções foram criadas:

1. **`send-telegram-order`** - Envia pedidos com botões
2. **`telegram-webhook`** - Processa cliques nos botões

### **Segredos Configurados**
- ✅ `TELEGRAM_BOT_TOKEN` 
- ✅ `TELEGRAM_CHAT_ID` (-4802207865)

## 🎯 Como Usar

### **Para Funcionários no Telegram:**

1. **Receber Pedido**: Mensagem aparece no grupo com todos os detalhes
2. **Atualizar Status**: Clicar no botão correspondente:
   - 🔄 Quando começar a produzir
   - 🚚 Quando sair para entrega  
   - ✅ Quando entregar
3. **Contatar Cliente**: 
   - 📞 Ver número do WhatsApp
   - 💬 Abrir conversa direta

### **Para Administradores:**

- Todos os cliques são registrados no sistema
- Status dos pedidos é atualizado em tempo real
- Histórico de quem fez cada atualização

## 🧪 Testando o Sistema

Use o comando `/test` no chat do bot para testar os botões com um pedido fictício.

## 📊 Dados Retornados ao Sistema

Cada clique nos botões atualiza:
- Status do pedido na tabela `pedidos`
- Timestamp da atualização
- Registro de qual funcionário fez a atualização

## ⚠️ Importante

- Mantenha o bot rodando constantemente
- Para produção, use um servidor/container
- Configure logs para monitoramento
- Teste todos os botões antes de usar em produção

## 🔄 Fluxo de Status

```
📝 Pedido Criado → 🔄 Produzindo → 🚚 Despachado → ✅ Entregue
```

Cada etapa pode ser atualizada pelos funcionários via botões do Telegram.