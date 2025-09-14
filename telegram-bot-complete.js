const TelegramBot = require('node-telegram-bot-api');
const { createClient } = require('@supabase/supabase-js');

// ============= CONFIGURAÇÕES =============
// Substitua pelos seus dados reais
const TELEGRAM_BOT_TOKEN = '8256668487:AAHwhFCR_2RGsAE7Cv6TdeEbWZKgpFTr6Og';
const TELEGRAM_CHAT_ID = '-4802207865'; // ID do seu grupo
const SUPABASE_URL = 'https://zdtuvslyqayjedjsfvwa.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkdHV2c2x5cWF5amVkanNmdndhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzgzNTU2MiwiZXhwIjoyMDU5NDExNTYyfQ.Nz4rjfhWh6AiGHQNxb9LO8nG05jLojWV7_BZkEcBG5g';

// ============= INICIALIZAÇÃO =============
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log('🤖 Bot Telegram iniciado com sucesso!');
console.log('📞 Monitorando grupo:', TELEGRAM_CHAT_ID);
console.log('📊 Conectado ao Supabase:', SUPABASE_URL);

// ============= CONTROLE DE FLOOD =============
const userLastAction = new Map();
const FLOOD_TIMEOUT = 3000; // 3 segundos entre ações

function checkFlood(userId) {
    const now = Date.now();
    const lastAction = userLastAction.get(userId);
    
    if (lastAction && (now - lastAction) < FLOOD_TIMEOUT) {
        return true; // É flood
    }
    
    userLastAction.set(userId, now);
    return false; // Não é flood
}

// ============= FUNCIONALIDADES PRINCIPAIS =============

// Comando /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 
        '🤖 *Bot de Pedidos Ativo!*\n\n' +
        '✅ Sistema integrado com Supabase\n' +
        '🔄 Atualizações em tempo real\n' +
        '📱 Controle de status por botões\n\n' +
        '*Comandos disponíveis:*\n' +
        '/test - Testar botões\n' +
        '/status - Ver status do sistema\n' +
        '/help - Ajuda',
        { parse_mode: 'Markdown' }
    );
});

// Comando /status
bot.onText(/\/status/, async (msg) => {
    const chatId = msg.chat.id;
    
    try {
        // Buscar pedidos pendentes
        const { data: pendentes, error: errorPendentes } = await supabase
            .from('pedidos')
            .select('*')
            .eq('status', 'pendente');
            
        const { data: preparando, error: errorPreparando } = await supabase
            .from('pedidos')
            .select('*')
            .eq('status', 'preparando');
            
        const { data: deslocamento, error: errorDeslocamento } = await supabase
            .from('pedidos')
            .select('*')
            .eq('status', 'em_deslocamento');

        if (errorPendentes || errorPreparando || errorDeslocamento) {
            throw new Error('Erro ao buscar pedidos');
        }

        const statusMessage = 
            '📊 *STATUS DO SISTEMA*\n\n' +
            `📝 Pedidos Pendentes: ${pendentes?.length || 0}\n` +
            `🔄 Em Produção: ${preparando?.length || 0}\n` +
            `🚚 Em Deslocamento: ${deslocamento?.length || 0}\n\n` +
            `⏰ Última verificação: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`;

        bot.sendMessage(chatId, statusMessage, { parse_mode: 'Markdown' });
    } catch (error) {
        console.error('Erro ao verificar status:', error);
        bot.sendMessage(chatId, '❌ Erro ao verificar status do sistema');
    }
});

// Comando /test
bot.onText(/\/test/, (msg) => {
    const chatId = msg.chat.id;
    
    const inlineKeyboard = {
        inline_keyboard: [
            [
                { 
                    text: "🔄 INICIAR PRODUÇÃO", 
                    callback_data: "status_preparando_TEST123" 
                }
            ],
            [
                { 
                    text: "🚚 DESPACHAR PEDIDO", 
                    callback_data: "status_em_deslocamento_TEST123" 
                }
            ],
            [
                { 
                    text: "✅ MARCAR ENTREGUE", 
                    callback_data: "status_entregue_TEST123" 
                }
            ],
            [
                { 
                    text: "📞 Ligar Cliente", 
                    callback_data: "call_TEST123_5511999999999" 
                }
            ]
        ]
    };
    
    bot.sendMessage(chatId, 
        '🧪 *TESTE DE BOTÕES*\n\n' +
        '📋 Pedido: TEST123\n' +
        '👤 Cliente: Cliente Teste\n' +
        '💰 Total: R$ 25,00\n\n' +
        'Use os botões abaixo para testar o sistema:', 
        {
            parse_mode: 'Markdown',
            reply_markup: inlineKeyboard
        }
    );
});

// ============= PROCESSAMENTO DE PEDIDOS =============

// Monitorar novos pedidos no Supabase
async function monitorarNovos Pedidos() {
    console.log('🔍 Iniciando monitoramento de pedidos...');
    
    // Configurar realtime para novos pedidos
    const channel = supabase
        .channel('new-orders')
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'pedidos'
            },
            async (payload) => {
                console.log('🆕 Novo pedido recebido:', payload.new.codigo_pedido);
                await enviarPedidoParaTelegram(payload.new);
            }
        )
        .subscribe((status) => {
            console.log('📡 Status da conexão realtime:', status);
        });

    return channel;
}

// Enviar pedido formatado para o Telegram
async function enviarPedidoParaTelegram(pedido) {
    try {
        console.log('📤 Enviando pedido para Telegram:', pedido.codigo_pedido);
        
        // Formatação dos itens
        let itens;
        try {
            itens = typeof pedido.itens === 'string' ? JSON.parse(pedido.itens) : pedido.itens;
        } catch (e) {
            console.error('Erro ao parsear itens:', e);
            itens = [];
        }

        const itensList = itens.map((item) => {
            const fullName = item.category?.toLowerCase() === 'batidas' && !item.name.toLowerCase().includes('batida de')
                ? `Batida de ${item.name}`
                : item.name;

            const iceText = item.ice
                ? "\n   🧊 Gelo: " + Object.entries(item.ice)
                    .filter(([flavor, qty]) => qty > 0)
                    .map(([flavor, qty]) => `${flavor} x${qty}`)
                    .join(", ")
                : "";

            const alcoholText = item.alcohol ? ` (🥃 Álcool: ${item.alcohol})` : "";
            const balyText = item.balyFlavor ? ` (🍹 Baly: ${item.balyFlavor})` : "";
            const energyDrinkText = item.energyDrink 
                ? ` (⚡ Energético: ${item.energyDrink}${item.energyDrinkFlavor !== 'Tradicional' ? ' - ' + item.energyDrinkFlavor : ''})`
                : "";

            const itemPrice = (item.price || 0) * (item.qty || 1);
            
            return `${item.qty}x ${fullName}${alcoholText}${balyText}${energyDrinkText}${iceText}\n💰 R$${itemPrice.toFixed(2).replace('.', ',')}`;
        }).join('\n\n');

        // Calcular valores
        const subtotal = itens.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0);
        const totalFinal = pedido.total || (subtotal + (pedido.taxa_entrega || 0));
        const trocoValue = Number(pedido.troco) || 0;
        const trocoFinal = pedido.forma_pagamento === "Dinheiro" && trocoValue > 0 ? trocoValue - totalFinal : 0;

        // Mensagem formatada
        const message = `🎯 **NOVO PEDIDO** 🎯

📋 **CÓDIGO:** ${pedido.codigo_pedido}${pedido.entregador ? `\n🏍️ **ENTREGADOR:** ${pedido.entregador}` : ''}

👤 **CLIENTE:**
${pedido.cliente_nome}
📱 WhatsApp: ${pedido.cliente_whatsapp}

📍 **ENDEREÇO COMPLETO:**
${pedido.cliente_endereco}, Nº ${pedido.cliente_numero}${pedido.cliente_complemento ? ` - ${pedido.cliente_complemento}` : ''}
🏘️ Bairro: ${pedido.cliente_bairro}
📍 Referência: ${pedido.cliente_referencia || 'Não informada'}

🛒 **PEDIDO:**
${itensList || 'Sem itens'}

💸 **VALORES:**
💰 Subtotal: R$${subtotal.toFixed(2).replace('.', ',')}
🚚 Taxa de Entrega: R$${(pedido.taxa_entrega || 0).toFixed(2).replace('.', ',')}${pedido.discount_amount > 0 ? `\n🎁 Desconto: -R$${pedido.discount_amount.toFixed(2).replace('.', ',')}` : ''}
🏆 **TOTAL: R$${totalFinal.toFixed(2).replace('.', ',')}**

💳 **PAGAMENTO:**
${pedido.forma_pagamento}${pedido.forma_pagamento === "Dinheiro" && trocoValue > 0 
    ? `\n💵 Troco para: R$${trocoValue.toFixed(2).replace('.', ',')}\n💸 Troco a levar: R$${trocoFinal >= 0 ? trocoFinal.toFixed(2).replace('.', ',') : '0,00'}`
    : ''}

${pedido.observacao ? `📝 **OBSERVAÇÃO:** ${pedido.observacao}` : ''}

⏰ ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`;

        // Botões de ação
        const inlineKeyboard = {
            inline_keyboard: [
                [
                    { 
                        text: "🔄 INICIAR PRODUÇÃO", 
                        callback_data: `status_preparando_${pedido.codigo_pedido}` 
                    }
                ],
                [
                    { 
                        text: "🚚 DESPACHAR PEDIDO", 
                        callback_data: `status_em_deslocamento_${pedido.codigo_pedido}` 
                    }
                ],
                [
                    { 
                        text: "✅ MARCAR ENTREGUE", 
                        callback_data: `status_entregue_${pedido.codigo_pedido}` 
                    }
                ],
                [
                    { 
                        text: "📞 Ligar Cliente", 
                        callback_data: `call_${pedido.codigo_pedido}_${pedido.cliente_whatsapp}` 
                    },
                    { 
                        text: "💬 WhatsApp", 
                        url: `https://wa.me/${pedido.cliente_whatsapp.replace(/\D/g, '')}` 
                    }
                ]
            ]
        };

        // Enviar para o grupo
        await bot.sendMessage(TELEGRAM_CHAT_ID, message, {
            parse_mode: 'Markdown',
            reply_markup: inlineKeyboard
        });

        console.log('✅ Pedido enviado com sucesso para Telegram:', pedido.codigo_pedido);
        
    } catch (error) {
        console.error('❌ Erro ao enviar pedido para Telegram:', error);
        
        // Enviar mensagem de erro simplificada
        try {
            await bot.sendMessage(TELEGRAM_CHAT_ID, 
                `❌ **ERRO AO PROCESSAR PEDIDO**\n\n` +
                `📋 Código: ${pedido.codigo_pedido}\n` +
                `👤 Cliente: ${pedido.cliente_nome}\n` +
                `💰 Total: R$${(pedido.total || 0).toFixed(2).replace('.', ',')}\n\n` +
                `⚠️ Verifique o pedido manualmente no sistema.`,
                { parse_mode: 'Markdown' }
            );
        } catch (fallbackError) {
            console.error('❌ Erro ao enviar mensagem de fallback:', fallbackError);
        }
    }
}

// ============= PROCESSAMENTO DE BOTÕES =============

bot.on('callback_query', async (callbackQuery) => {
    const callbackData = callbackQuery.data;
    const messageId = callbackQuery.message.message_id;
    const chatId = callbackQuery.message.chat.id;
    const userId = callbackQuery.from.id;
    const userName = callbackQuery.from.first_name || callbackQuery.from.username || 'Usuário';

    console.log('🔘 Callback recebido:', callbackData, 'de:', userName);

    // Verificar flood
    if (checkFlood(userId)) {
        await bot.answerCallbackQuery(callbackQuery.id, {
            text: '⏳ Aguarde alguns segundos antes de clicar novamente',
            show_alert: true
        });
        return;
    }

    try {
        // Processar atualizações de status
        if (callbackData.startsWith('status_')) {
            const parts = callbackData.split('_');
            const status = parts[1];
            const codigoPedido = parts.slice(2).join('_');

            console.log('📊 Atualizando status:', { codigoPedido, status, userName });

            // Atualizar no Supabase
            const { data, error } = await supabase
                .from('pedidos')
                .update({ status })
                .eq('codigo_pedido', codigoPedido)
                .select('id, codigo_pedido, cliente_nome, status');

            if (error) {
                console.error('❌ Erro ao atualizar status no Supabase:', error);
                throw error;
            }

            if (!data || data.length === 0) {
                console.error('❌ Pedido não encontrado:', codigoPedido);
                throw new Error(`Pedido ${codigoPedido} não encontrado`);
            }

            console.log('✅ Status atualizado no Supabase:', data[0]);

            // Mensagens de confirmação
            const statusMessages = {
                'preparando': '🔄 Em Produção',
                'em_deslocamento': '🚚 Despachado para Entrega',
                'entregue': '✅ Entregue com Sucesso'
            };

            const confirmationMessage = `✅ *Status Atualizado por ${userName}*\n\n📋 Pedido: *${codigoPedido}*\n👤 Cliente: ${data[0].cliente_nome}\n📊 Novo Status: *${statusMessages[status] || status}*\n⏰ ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}\n\n🔄 *Sistema sincronizado automaticamente*`;

            // Responder ao callback
            await bot.answerCallbackQuery(callbackQuery.id, {
                text: `✅ ${statusMessages[status] || status}`,
                show_alert: false
            });

            // Enviar mensagem de confirmação
            await bot.sendMessage(chatId, confirmationMessage, {
                parse_mode: 'Markdown',
                reply_to_message_id: messageId
            });

        } else if (callbackData.startsWith('call_')) {
            // Processar chamadas para cliente
            const parts = callbackData.split('_');
            const codigoPedido = parts[1];
            const whatsapp = parts.slice(2).join('_');

            console.log('📞 Solicitação de contato:', { codigoPedido, whatsapp, userName });

            // Responder ao callback
            await bot.answerCallbackQuery(callbackQuery.id, {
                text: `📞 Cliente: ${whatsapp}`,
                show_alert: true
            });

            // Enviar mensagem com informações de contato
            const callMessage = `📞 *Ligar para Cliente*\n\n📋 Pedido: *${codigoPedido}*\n📱 WhatsApp: \`${whatsapp}\`\n👤 Solicitado por: ${userName}\n\n_Clique no número acima para copiar_`;

            await bot.sendMessage(chatId, callMessage, {
                parse_mode: 'Markdown',
                reply_to_message_id: messageId
            });
        }

    } catch (error) {
        console.error('❌ Erro ao processar callback:', error);
        
        await bot.answerCallbackQuery(callbackQuery.id, {
            text: '❌ Erro ao processar ação. Tente novamente.',
            show_alert: true
        });
    }
});

// ============= TRATAMENTO DE MENSAGENS =============

bot.on('message', (msg) => {
    // Log básico de mensagens recebidas (sem spam)
    if (!msg.text?.startsWith('/')) {
        console.log(`💬 Mensagem de ${msg.from?.first_name || 'Desconhecido'}: ${msg.text?.substring(0, 50) || 'Sem texto'}...`);
    }
});

// ============= TRATAMENTO DE ERROS =============

bot.on('error', (error) => {
    console.error('❌ Erro no bot Telegram:', error.message);
    
    // Tentar reconectar após erro
    setTimeout(() => {
        console.log('🔄 Tentando reconectar...');
    }, 5000);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Erro não capturado:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Exceção não capturada:', error.message);
    process.exit(1);
});

// ============= INICIALIZAÇÃO DO SISTEMA =============

async function iniciarSistema() {
    try {
        console.log('🚀 Iniciando sistema completo...');
        
        // Verificar conexão com Supabase
        const { data, error } = await supabase.from('pedidos').select('id').limit(1);
        if (error) {
            throw new Error(`Erro de conexão com Supabase: ${error.message}`);
        }
        console.log('✅ Conexão com Supabase verificada');
        
        // Iniciar monitoramento de pedidos
        await monitorarNovos Pedidos();
        console.log('✅ Monitoramento de pedidos ativo');
        
        // Enviar mensagem de status para o grupo
        await bot.sendMessage(TELEGRAM_CHAT_ID, 
            '🤖 *Bot de Pedidos Online!*\n\n' +
            '✅ Sistema integrado e funcionando\n' +
            '🔄 Monitoramento em tempo real ativo\n' +
            '📊 Pronto para receber pedidos\n\n' +
            `⏰ ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`,
            { parse_mode: 'Markdown' }
        );
        
        console.log('🎉 Sistema iniciado com sucesso!');
        console.log('📱 Bot aguardando interações...');
        
    } catch (error) {
        console.error('❌ Erro ao iniciar sistema:', error.message);
        console.log('🔄 Tentando novamente em 10 segundos...');
        setTimeout(iniciarSistema, 10000);
    }
}

// ============= COMANDOS ADMINISTRATIVOS =============

bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    
    const helpMessage = `🤖 *AJUDA - Bot de Pedidos*

*Comandos Disponíveis:*
• \`/start\` - Iniciar bot
• \`/status\` - Ver status do sistema  
• \`/test\` - Testar botões
• \`/help\` - Esta ajuda

*Funcionalidades:*
🔄 Atualização de status em tempo real
📱 Botões interativos para controle
📊 Sincronização com sistema web
🚨 Alertas automáticos de novos pedidos

*Fluxo de Trabalho:*
1. 📝 Pedido chega automaticamente
2. 🔄 Clique "INICIAR PRODUÇÃO"
3. 🚚 Clique "DESPACHAR PEDIDO" 
4. ✅ Clique "MARCAR ENTREGUE"

*Suporte:*
Em caso de problemas, verifique os logs do sistema.`;

    bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});

// ============= INICIAR BOT =============

// Aguardar um pouco antes de iniciar para garantir que tudo está carregado
setTimeout(iniciarSistema, 2000);

console.log('📋 Bot configurado e aguardando inicialização...');

// Exportar para uso em outros módulos se necessário
module.exports = { bot, supabase };