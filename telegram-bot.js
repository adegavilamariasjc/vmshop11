const TelegramBot = require('node-telegram-bot-api');

// Seu token do bot
const token = '8256668487:AAHwhFCR_2RGsAE7Cv6TdeEbWZKgpFTr6Og';

// URL do seu webhook Supabase (substitua pela URL real da sua função)
const WEBHOOK_URL = 'https://zdtuvslyqayjedjsfvwa.supabase.co/functions/v1/telegram-webhook';

// Cria o bot em modo polling
const bot = new TelegramBot(token, { polling: true });

console.log('Bot rodando! Envie uma mensagem no chat ou grupo.');

// Captura qualquer mensagem recebida
bot.on('message', (msg) => {
  console.log('Mensagem recebida:', msg.text);
  console.log('Chat ID:', msg.chat.id);
  console.log('User ID:', msg.from.id);
  console.log('User Name:', msg.from.first_name || msg.from.username);
});

// Captura callback queries (cliques nos botões)
bot.on('callback_query', async (callbackQuery) => {
  console.log('Callback Query recebido:', callbackQuery);
  
  try {
    // Envia o callback para o webhook do Supabase
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
    console.log('Resposta do webhook:', result);
    
    if (!response.ok) {
      console.error('Erro no webhook:', result);
    }
    
  } catch (error) {
    console.error('Erro ao enviar callback para webhook:', error);
    
    // Responde ao callback query mesmo em caso de erro
    bot.answerCallbackQuery(callbackQuery.id, {
      text: 'Erro ao processar ação',
      show_alert: true
    });
  }
});

// Tratamento de erros do bot
bot.on('error', (error) => {
  console.error('Erro no bot:', error);
});

// Configuração do webhook (opcional, se você quiser usar webhook em vez de polling)
/*
const WEBHOOK_ENDPOINT = 'https://your-domain.com/webhook';

// Configura o webhook
bot.setWebHook(`${WEBHOOK_ENDPOINT}/${token}`)
  .then(() => {
    console.log('Webhook configurado com sucesso');
  })
  .catch((error) => {
    console.error('Erro ao configurar webhook:', error);
  });
*/

// Para testar se o bot está funcionando
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, '🤖 Bot ativo e funcionando!\n\nEste bot recebe pedidos e permite controle de status através de botões interativos.');
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
  
  bot.sendMessage(chatId, '🧪 **TESTE DE BOTÕES**\n\nPedido: TEST123\nCliente: Cliente Teste\n\nUse os botões abaixo para testar:', {
    parse_mode: 'Markdown',
    reply_markup: inlineKeyboard
  });
});

module.exports = bot;