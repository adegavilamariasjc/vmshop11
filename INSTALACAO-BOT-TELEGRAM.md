# 🤖 Instalação do Bot Telegram Completo

## 📋 Pré-requisitos

### 1. Node.js
```bash
# Baixe e instale Node.js (versão 16 ou superior)
# https://nodejs.org/
node --version  # Verificar instalação
```

### 2. Dependências
```bash
npm install node-telegram-bot-api @supabase/supabase-js
```

## 🔧 Configuração

### 1. Salvar o Arquivo
- Salve o arquivo `telegram-bot-complete.js` na sua máquina
- Local sugerido: `C:\vmbot11bot\telegram-bot-complete.js`

### 2. Configurar Tokens (OBRIGATÓRIO)
Abra o arquivo e configure suas informações reais:

```javascript
// ============= CONFIGURAÇÕES =============
const TELEGRAM_BOT_TOKEN = 'SEU_TOKEN_AQUI';        // Token do seu bot
const TELEGRAM_CHAT_ID = 'SEU_CHAT_ID_AQUI';       // ID do grupo (-100...)
const SUPABASE_URL = 'https://zdtuvslyqayjedjsfvwa.supabase.co';
const SUPABASE_SERVICE_KEY = 'SUA_SERVICE_KEY_AQUI'; // Service Role Key
```

### 3. Como Obter os Dados

#### Token do Bot:
1. Fale com @BotFather no Telegram
2. Use `/newbot` ou `/mybots`
3. Copie o token (formato: `123456789:ABC-DEF...`)

#### Chat ID do Grupo:
1. Adicione o bot ao grupo
2. Envie uma mensagem no grupo
3. Acesse: `https://api.telegram.org/bot<SEU_TOKEN>/getUpdates`
4. Procure por `"chat":{"id":-100...}` (número negativo)

#### Service Key do Supabase:
1. Acesse: https://supabase.com/dashboard/project/zdtuvslyqayjedjsfvwa/settings/api
2. Copie a "service_role" key (não a anon key)

## 🚀 Executar o Bot

### Opção 1: Terminal/Prompt
```bash
cd C:\vmbot11bot
node telegram-bot-complete.js
```

### Opção 2: Criar Arquivo .bat
Crie `iniciar-bot.bat`:
```batch
@echo off
cd /d "C:\vmbot11bot"
node telegram-bot-complete.js
pause
```

### Opção 3: Executar como Serviço
Instale PM2 para rodar sempre:
```bash
npm install -g pm2
pm2 start telegram-bot-complete.js --name "bot-pedidos"
pm2 save
pm2 startup
```

## ✅ Verificar Funcionamento

### Mensagens de Sucesso:
```
🤖 Bot Telegram iniciado com sucesso!
📞 Monitorando grupo: -4802207865
📊 Conectado ao Supabase: https://...
✅ Conexão com Supabase verificada
✅ Monitoramento de pedidos ativo
🎉 Sistema iniciado com sucesso!
```

### Testar:
1. Digite `/start` no grupo
2. Digite `/test` para testar botões
3. Digite `/status` para ver pedidos

## 🔄 Funcionalidades Implementadas

### ✅ Recebimento Automático:
- Novos pedidos aparecem automaticamente no grupo
- Formatação completa com todos os detalhes
- Botões de ação organizados

### ✅ Controle de Status:
- 🔄 **INICIAR PRODUÇÃO** → Status: preparando
- 🚚 **DESPACHAR PEDIDO** → Status: em_deslocamento  
- ✅ **MARCAR ENTREGUE** → Status: entregue
- 📞 **Ligar Cliente** → Mostra WhatsApp
- 💬 **WhatsApp** → Abre conversa

### ✅ Sincronização:
- Atualizações refletem no sistema web
- Tempo real via Supabase Realtime
- Confirmações visuais no Telegram

### ✅ Proteções:
- Anti-flood (3 segundos entre ações)
- Tratamento de erros
- Reconexão automática
- Logs detalhados

## 📱 Comandos Disponíveis

| Comando | Função |
|---------|---------|
| `/start` | Iniciar bot e ver status |
| `/test` | Testar botões com pedido fictício |
| `/status` | Ver quantos pedidos por status |
| `/help` | Lista de comandos e ajuda |

## ⚠️ Importante

### Configuração Obrigatória:
1. ✅ Token do bot configurado
2. ✅ Chat ID do grupo configurado  
3. ✅ Service key do Supabase configurada
4. ✅ Bot adicionado ao grupo como admin

### Manter Rodando:
- O bot precisa ficar executando na máquina
- Use PM2 ou execute em servidor para produção
- Monitore os logs para verificar funcionamento

## 🆘 Solução de Problemas

### Bot não conecta:
- Verifique token do bot
- Verifique conexão com internet

### Pedidos não aparecem:
- Verifique Chat ID do grupo
- Verifique se bot é admin do grupo

### Botões não funcionam:
- Verifique Service Key do Supabase
- Verifique logs para erros

### Logs Importantes:
```bash
🤖 Bot iniciado = Sucesso
📡 Realtime status: SUBSCRIBED = Conectado
✅ Status atualizado = Botão funcionou
❌ Erro = Verificar configuração
```

## 🎉 Pronto!

Com o bot rodando, o sistema estará 100% funcional:
- Pedidos chegam automaticamente no Telegram
- Funcionários controlam status pelos botões
- Sistema web atualiza em tempo real
- Fluxo de trabalho otimizado