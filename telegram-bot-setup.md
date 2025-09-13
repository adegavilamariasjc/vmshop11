# BOT VM MELHORADO - Instruções de Instalação

## 🚀 Funcionalidades Implementadas

✅ **Anti-flood**: Controle de reações para evitar spam dos motoboys/preparadores  
✅ **Monitoramento de PDF**: Envia automaticamente PDFs da pasta C:/vmbot11bot para o grupo  
✅ **Detecção inteligente iFood**: Detecta pedidos por múltiplas palavras-chave e padrões  
✅ **Webhook iFood**: Endpoint para receber pedidos diretamente do iFood via API  
✅ **Extração de dados**: Extrai automaticamente informações dos pedidos (cliente, telefone, total, etc.)  
✅ **Logs melhorados**: Sistema de logging mais detalhado e organizado

## 📋 Dependências Necessárias

Antes de executar o bot, instale as dependências:

```bash
npm install node-telegram-bot-api chokidar
```

## 🔧 Configuração

1. **Criar a pasta monitorada:**
   - Crie a pasta `C:/vmbot11bot` (será criada automaticamente se não existir)

2. **Configurar Chat ID do grupo:**
   - No arquivo `telegram-bot.js`, linha 11, substitua o `GROUP_CHAT_ID` pelo ID real do seu grupo
   - Para descobrir o ID: envie uma mensagem no grupo e veja no console

3. **Verificar token do bot:**
   - Confirme se o token na linha 5 está correto

## 🏃‍♂️ Como Executar

```bash
node telegram-bot.js
```

## 📁 Como Funciona o Monitoramento de PDF

1. O bot monitora a pasta `C:/vmbot11bot/`
2. Quando um arquivo `.pdf` é criado/copiado para essa pasta
3. O bot automaticamente envia o PDF para o grupo do Telegram
4. Adiciona uma legenda com nome do arquivo e data/hora

### Exemplo de uso:
- Imprima ou salve sua comanda como `C:/vmbot11bot/comanda.pdf`
- O bot detectará e enviará automaticamente para o grupo

## 🍔 Suporte Inteligente para Pedidos iFood

### Detecção Automática Avançada:
- Detecta pedidos por múltiplas palavras-chave: "ifood", "pedido #", "delivery", "entrega", "cliente:", "total: r$"
- Reconhece padrões de pedidos mesmo sem mencionar "ifood"
- Extrai automaticamente: número do pedido, nome do cliente, telefone, total, endereço
- Adiciona botões de controle (Produzindo, Despachado, Entregue, Ligar)

### Webhook para Integração Direta:
- Endpoint: `https://zdtuvslyqayjedjsfvwa.supabase.co/functions/v1/ifood-webhook`
- Recebe pedidos diretamente do iFood via API
- Processa dados estruturados e formata automaticamente
- Comandos disponíveis:
  - `/ifood` - Simula um pedido iFood para teste

## 🔒 Sistema Anti-Flood

- Cada usuário tem um cooldown de 2 segundos entre reações
- Evita spam de botões pelos motoboys/preparadores
- Mensagem de aviso quando usuário tenta reagir muito rápido

## 📱 Comandos Disponíveis

- `/start` - Informações do bot
- `/status` - Status e estatísticas do bot
- `/test` - Testar botões (desenvolvimento)
- `/ifood` - Simular pedido iFood

## 🛠️ Logs e Monitoramento

O bot exibe logs detalhados no console:
- 💬 Mensagens recebidas
- 🔘 Cliques em botões
- 📄 PDFs detectados e enviados
- ❌ Erros e problemas
- 🧹 Limpeza de cache

## 🚨 Solução de Problemas

### Bot não recebe mensagens:
- Verifique se o token está correto
- Certifique-se que o bot foi adicionado ao grupo
- Verifique as permissões do bot no grupo

### PDFs não são enviados:
- Verifique se a pasta `C:/vmbot11bot` existe
- Certifique-se que o arquivo tem extensão `.pdf`
- Verifique as permissões da pasta

### Erro "chokidar not found":
```bash
npm install chokidar
```

### Webhook não funciona:
- Verifique se a URL do webhook está correta
- Confirme se a função Supabase está ativa
- Veja os logs da edge function no Supabase

## 🔄 Atualizações vs Versão Anterior

**Melhorias implementadas:**
- ✅ Controle de flood nas reações
- ✅ Monitoramento automático de PDFs
- ✅ Detecção inteligente de pedidos iFood (múltiplas palavras-chave)
- ✅ Extração automática de dados dos pedidos
- ✅ Webhook para integração direta com iFood
- ✅ Botão "Ligar" com exibição do telefone
- ✅ Logs mais organizados e informativos
- ✅ Comandos de status e diagnóstico
- ✅ Limpeza automática de memória
- ✅ Tratamento melhor de erros

**Como usar o webhook iFood:**
1. Configure sua integração iFood para enviar pedidos para: `https://zdtuvslyqayjedjsfvwa.supabase.co/functions/v1/ifood-webhook`
2. O webhook processa automaticamente os dados e envia para o grupo Telegram
3. Formato JSON esperado: `{ orderId, customer: { name, phone }, address: {...}, items: [...], total, paymentMethod }`

**Como migrar:**
1. Pare o bot antigo (`Ctrl+C`)
2. Instale as novas dependências: `npm install chokidar`
3. Substitua o arquivo `telegram-bot.js`
4. Execute: `node telegram-bot.js`