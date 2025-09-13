const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

// Seu token do bot
const token = '8256668487:AAHwhFCR_2RGsAE7Cv6TdeEbWZKgpFTr6Og';

// URL do seu webhook Supabase
const WEBHOOK_URL = 'https://zdtuvslyqayjedjsfvwa.supabase.co/functions/v1/telegram-webhook';

// Chat ID do grupo (você precisará obter isso enviando uma mensagem no grupo)
const GROUP_CHAT_ID = '-4802207865'; // Substitua pelo ID real do seu grupo

// Pasta para monitorar PDFs
const PDF_WATCH_FOLDER = 'C:/vmbot11bot';

// Controle de flood - armazena últimas reações por usuário
const userLastReaction = new Map();
const REACTION_COOLDOWN = 2000; // 2 segundos entre reações do mesmo usuário

// Cria o bot em modo polling
const bot = new TelegramBot(token, { polling: true });

console.log('🤖 Bot VM melhorado iniciado!');
console.log('📁 Monitorando pasta:', PDF_WATCH_FOLDER);

// Cria a pasta se não existir
if (!fs.existsSync(PDF_WATCH_FOLDER)) {
  fs.mkdirSync(PDF_WATCH_FOLDER, { recursive: true });
  console.log('📁 Pasta criada:', PDF_WATCH_FOLDER);
}

// Monitora a pasta para novos PDFs
const watcher = chokidar.watch(path.join(PDF_WATCH_FOLDER, '*.pdf'), {
  ignored: /^\./, 
  persistent: true,
  ignoreInitial: true
});

watcher.on('add', async (filePath) => {
  console.log('📄 Novo PDF detectado:', filePath);
  
  try {
    // Aguarda um pouco para garantir que o arquivo foi totalmente escrito
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Envia o PDF para o grupo
    await bot.sendDocument(GROUP_CHAT_ID, filePath, {
      caption: '📄 **COMANDA IMPRESSA**\n\n' + 
               `📁 Arquivo: ${path.basename(filePath)}\n` +
               `⏰ ${new Date().toLocaleString('pt-BR')}`,
      parse_mode: 'Markdown'
    });
    
    console.log('✅ PDF enviado para o grupo:', path.basename(filePath));
    
    // Remove o arquivo após enviar (opcional)
    // fs.unlinkSync(filePath);
    
  } catch (error) {
    console.error('❌ Erro ao enviar PDF:', error);
  }
});

// Função para verificar cooldown de reação
function canUserReact(userId) {
  const now = Date.now();
  const lastReaction = userLastReaction.get(userId) || 0;
  
  if (now - lastReaction < REACTION_COOLDOWN) {
    return false;
  }
  
  userLastReaction.set(userId, now);
  return true;
}

// Captura qualquer mensagem recebida
bot.on('message', (msg) => {
  console.log('💬 Mensagem recebida:', msg.text);
  console.log('📍 Chat ID:', msg.chat.id);
  console.log('👤 User:', msg.from.first_name || msg.from.username);
  
// Detecta pedidos do iFood por múltiplas palavras-chave e padrões
  const text = msg.text?.toLowerCase() || '';
  const ifoodKeywords = ['ifood', 'pedido #', 'delivery', 'entrega', 'cliente:', 'total: r$', 'pagamento:', 'endereço:'];
  
  // Verifica se é um pedido do iFood baseado em múltiplos indicadores
  const hasIfoodKeywords = ifoodKeywords.some(keyword => text.includes(keyword));
  const hasOrderPattern = /pedido\s*#?\d+/i.test(text) || /código\s*:?\s*\w+/i.test(text);
  const hasMoneyPattern = /r\$\s*\d+/i.test(text);
  
  if (hasIfoodKeywords || (hasOrderPattern && hasMoneyPattern)) {
    console.log('🍔 Possível pedido detectado - analisando...');
    handleIfoodOrder(msg);
  }
});

// Função para extrair informações de um pedido
function extractOrderInfo(text) {
  const info = {
    orderNumber: null,
    client: null,
    phone: null,
    total: null,
    address: null,
    items: []
  };
  
  // Extrai número do pedido
  const orderMatch = text.match(/(?:pedido\s*#?|código\s*:?\s*)(\w+)/i);
  if (orderMatch) info.orderNumber = orderMatch[1];
  
  // Extrai nome do cliente
  const clientMatch = text.match(/(?:cliente\s*:?\s*)([^\n\r]+)/i);
  if (clientMatch) info.client = clientMatch[1].trim();
  
  // Extrai telefone
  const phoneMatch = text.match(/(?:telefone|fone|cel)\s*:?\s*([^\n\r]+)/i);
  if (phoneMatch) info.phone = phoneMatch[1].trim();
  
  // Extrai total
  const totalMatch = text.match(/(?:total|valor)\s*:?\s*r?\$?\s*(\d+[,.]?\d*)/i);
  if (totalMatch) info.total = totalMatch[1];
  
  // Extrai endereço
  const addressMatch = text.match(/(?:endereço|endereco)\s*:?\s*([^\n\r]+)/i);
  if (addressMatch) info.address = addressMatch[1].trim();
  
  return info;
}

// Função para processar pedidos do iFood
async function handleIfoodOrder(msg) {
  try {
    console.log('🍔 Processando pedido detectado');
    
    const orderText = msg.text;
    const orderInfo = extractOrderInfo(orderText);
    
    // Gera um ID único se não conseguir extrair número do pedido
    const orderId = orderInfo.orderNumber || `AUTO_${Date.now()}`;
    
    console.log('📋 Informações extraídas:', orderInfo);
    
    // Cria botões de controle para o pedido
    const inlineKeyboard = {
      inline_keyboard: [
        [
          { 
            text: "🔄 Produzindo", 
            callback_data: `ifood_preparando_${orderId}` 
          },
          { 
            text: "🚚 Despachado", 
            callback_data: `ifood_despachado_${orderId}` 
          }
        ],
        [
          { 
            text: "✅ Entregue", 
            callback_data: `ifood_entregue_${orderId}` 
          },
          { 
            text: "📞 Ligar", 
            callback_data: `ifood_call_${orderId}` 
          }
        ]
      ]
    };
    
    // Formata a mensagem de forma mais organizada
    let formattedMessage = '🍔 **PEDIDO DETECTADO**\n\n';
    
    if (orderInfo.orderNumber) {
      formattedMessage += `📋 **Pedido:** ${orderInfo.orderNumber}\n`;
    }
    if (orderInfo.client) {
      formattedMessage += `👤 **Cliente:** ${orderInfo.client}\n`;
    }
    if (orderInfo.phone) {
      formattedMessage += `📱 **Telefone:** ${orderInfo.phone}\n`;
    }
    if (orderInfo.total) {
      formattedMessage += `💰 **Total:** R$ ${orderInfo.total}\n`;
    }
    if (orderInfo.address) {
      formattedMessage += `📍 **Endereço:** ${orderInfo.address}\n`;
    }
    
    formattedMessage += `\n📄 **PEDIDO COMPLETO:**\n${orderText}\n\n⬇️ **CONTROLES:**`;
    
    // Reenvia a mensagem com botões de controle
    await bot.sendMessage(msg.chat.id, formattedMessage, {
      parse_mode: 'Markdown',
      reply_markup: inlineKeyboard
    });
    
    console.log(`✅ Pedido ${orderId} processado com sucesso`);
    
  } catch (error) {
    console.error('❌ Erro ao processar pedido:', error);
  }
}

// Captura callback queries (cliques nos botões) com controle de flood
bot.on('callback_query', async (callbackQuery) => {
  const userId = callbackQuery.from.id;
  const userName = callbackQuery.from.first_name || callbackQuery.from.username || 'Usuário';
  
  // Verifica cooldown para evitar flood
  if (!canUserReact(userId)) {
    await bot.answerCallbackQuery(callbackQuery.id, {
      text: '⏳ Aguarde um pouco antes de reagir novamente',
      show_alert: false
    });
    return;
  }
  
  console.log('🔘 Callback Query recebido de:', userName);
  console.log('📊 Dados:', callbackQuery.data);
  
  try {
    // Processa pedidos iFood localmente
    if (callbackQuery.data.startsWith('ifood_')) {
      await handleIfoodCallback(callbackQuery);
      return;
    }
    
    // Envia callbacks normais para o webhook do Supabase
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        callback_query: callbackQuery
      })
    });

    const result = await response.json();
    console.log('✅ Resposta do webhook:', result);
    
    if (!response.ok) {
      console.error('❌ Erro no webhook:', result);
      await bot.answerCallbackQuery(callbackQuery.id, {
        text: '❌ Erro ao processar ação',
        show_alert: true
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao processar callback:', error);
    
    await bot.answerCallbackQuery(callbackQuery.id, {
      text: '❌ Erro interno do bot',
      show_alert: true
    });
  }
});

// Função para processar callbacks do iFood
async function handleIfoodCallback(callbackQuery) {
  const dataParts = callbackQuery.data.split('_');
  const action = dataParts[1];
  const orderId = dataParts.slice(2).join('_'); // Reconstrói o ID caso tenha underscores
  const userName = callbackQuery.from.first_name || callbackQuery.from.username || 'Staff';
  
  let statusText = '';
  let emoji = '';
  
  switch (action) {
    case 'preparando':
      statusText = 'EM PRODUÇÃO';
      emoji = '🔄';
      break;
    case 'despachado':
      statusText = 'DESPACHADO';
      emoji = '🚚';
      break;
    case 'entregue':
      statusText = 'ENTREGUE';
      emoji = '✅';
      break;
    case 'call':
      // Tenta extrair o telefone da mensagem original
      const originalText = callbackQuery.message.text;
      const phoneMatch = originalText.match(/(?:telefone|fone)\s*:?\s*([^\n\r]+)/i);
      const phone = phoneMatch ? phoneMatch[1].trim() : 'não informado';
      
      await bot.answerCallbackQuery(callbackQuery.id, {
        text: `📞 Telefone: ${phone}`,
        show_alert: true
      });
      
      console.log(`📞 Solicitação de ligação para: ${phone} por ${userName}`);
      return; // Não envia mensagem de status para ligações
  }
  
  // Responde ao usuário
  await bot.answerCallbackQuery(callbackQuery.id, {
    text: `${emoji} Status atualizado para: ${statusText}`,
    show_alert: false
  });
  
  // Envia mensagem de status no grupo
  await bot.sendMessage(callbackQuery.message.chat.id, 
    `${emoji} **PEDIDO ${orderId} - ${statusText}**\n\n` +
    `👤 Atualizado por: ${userName}\n` +
    `⏰ ${new Date().toLocaleString('pt-BR')}`,
    { parse_mode: 'Markdown' }
  );
  
  console.log(`✅ Status do pedido ${orderId} atualizado: ${statusText} por ${userName}`);
}

// Tratamento de erros do bot
bot.on('error', (error) => {
  console.error('❌ Erro no bot:', error);
});

// Tratamento de erros do watcher
watcher.on('error', (error) => {
  console.error('❌ Erro no monitoramento de arquivos:', error);
});

// Para testar se o bot está funcionando
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 
    '🤖 **BOT VM MELHORADO ATIVO!**\n\n' +
    '✅ Controle de pedidos com anti-flood\n' +
    '📄 Monitoramento automático de PDFs\n' +
    '🍔 Suporte para pedidos iFood\n' +
    '📁 Pasta monitorada: C:/vmbot11bot\n\n' +
    '🔧 **Comandos disponíveis:**\n' +
    '/status - Status do bot\n' +
    '/test - Testar botões\n' +
    '/ifood - Simular pedido iFood', 
    { parse_mode: 'Markdown' }
  );
});

// Comando para verificar status
bot.onText(/\/status/, (msg) => {
  const chatId = msg.chat.id;
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  
  bot.sendMessage(chatId, 
    '📊 **STATUS DO BOT**\n\n' +
    `⏰ Tempo ativo: ${hours}h ${minutes}m\n` +
    `📁 Pasta monitorada: ${PDF_WATCH_FOLDER}\n` +
    `👥 Reações controladas: ${userLastReaction.size} usuários\n` +
    `🔄 Webhook: ${WEBHOOK_URL}\n\n` +
    '✅ Bot funcionando normalmente', 
    { parse_mode: 'Markdown' }
  );
});

// Comando para testar botões (apenas para desenvolvimento)
bot.onText(/\/test/, (msg) => {
  const chatId = msg.chat.id;
  
  const inlineKeyboard = {
    inline_keyboard: [
      [
        { 
          text: "🔄 Produzindo", 
          callback_data: "status_preparando_TEST123" 
        },
        { 
          text: "🚚 Despachado", 
          callback_data: "status_em_deslocamento_TEST123" 
        }
      ],
      [
        { 
          text: "✅ Entregue", 
          callback_data: "status_entregue_TEST123" 
        },
        { 
          text: "📞 Ligar Cliente", 
          callback_data: "call_TEST123_5511999999999" 
        }
      ]
    ]
  };
  
  bot.sendMessage(chatId, 
    '🧪 **TESTE DE BOTÕES**\n\n' +
    'Pedido: TEST123\n' +
    'Cliente: Cliente Teste\n\n' +
    'Use os botões abaixo para testar:', 
    {
      parse_mode: 'Markdown',
      reply_markup: inlineKeyboard
    }
  );
});

// Comando para simular pedido iFood
bot.onText(/\/ifood/, (msg) => {
  const chatId = msg.chat.id;
  
  // Simula um pedido iFood
  const mockIfoodOrder = 
    '🍔 **PEDIDO iFOOD #12345**\n\n' +
    '👤 Cliente: João Silva\n' +
    '📱 Telefone: (11) 99999-9999\n\n' +
    '🍕 **Itens:**\n' +
    '• 1x Pizza Margherita\n' +
    '• 1x Coca-Cola 350ml\n' +
    '• 1x Batata Frita\n\n' +
    '💰 **Total:** R$ 45,90\n' +
    '💳 **Pagamento:** Cartão de Crédito\n\n' +
    '📍 **Endereço:**\n' +
    'Rua das Flores, 123\n' +
    'Centro - São Paulo/SP';
  
  // Simula a detecção automática
  handleIfoodOrder({ text: mockIfoodOrder, chat: { id: chatId } });
});

// Função para limpar cache de usuários periodicamente (evita vazamento de memória)
setInterval(() => {
  const now = Date.now();
  const cutoff = now - (60 * 60 * 1000); // 1 hora
  
  for (const [userId, lastReaction] of userLastReaction.entries()) {
    if (lastReaction < cutoff) {
      userLastReaction.delete(userId);
    }
  }
  
  console.log(`🧹 Cache de reações limpo. Usuários ativos: ${userLastReaction.size}`);
}, 60 * 60 * 1000); // Executa a cada hora

console.log('🚀 Todas as funcionalidades ativadas!');
console.log('📱 Aguardando mensagens e monitorando arquivos...');

module.exports = bot;