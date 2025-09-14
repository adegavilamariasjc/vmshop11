import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!TELEGRAM_BOT_TOKEN || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variables');
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const update = await req.json();
    console.log('Received Telegram update:', JSON.stringify(update, null, 2));

    // Handle callback queries (button presses)
    if (update.callback_query) {
      const callbackQuery = update.callback_query;
      const callbackData = callbackQuery.data;
      const messageId = callbackQuery.message.message_id;
      const chatId = callbackQuery.message.chat.id;
      const userId = callbackQuery.from.id;
      const userName = callbackQuery.from.first_name || callbackQuery.from.username || 'Usuário';

      console.log('Processing callback:', callbackData);

      // Parse callback data
      if (callbackData.startsWith('status_')) {
        // Format: status_preparando_A1234 or status_em_deslocamento_A1234 or status_entregue_A1234
        const parts = callbackData.split('_');
        const status = parts[1];
        const codigoPedido = parts.slice(2).join('_'); // Handle codes that might have underscores

        console.log('Updating order status:', { codigoPedido, status });

        // Update order status in Supabase
        const { data, error } = await supabase
          .from('pedidos')
          .update({ status })
          .eq('codigo_pedido', codigoPedido)
          .select('id, codigo_pedido, cliente_nome, status');

        if (error) {
          console.error('Error updating order status:', error);
          throw error;
        }

        if (!data || data.length === 0) {
          console.error('Order not found:', codigoPedido);
          throw new Error(`Pedido ${codigoPedido} não encontrado`);
        }

        console.log('Order status updated successfully:', data[0]);

        console.log('Order updated successfully. Sending confirmation to Telegram...');

        // Send confirmation back to Telegram
        const statusMessages = {
          'preparando': '🔄 Em Produção',
          'em_deslocamento': '🚚 Despachado para Entrega',
          'entregue': '✅ Entregue com Sucesso'
        };

        const confirmationMessage = `✅ *Status Atualizado por ${userName}*\n\n📋 Pedido: *${codigoPedido}*\n👤 Cliente: ${data[0].cliente_nome}\n📊 Novo Status: *${statusMessages[status] || status}*\n⏰ ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}\n\n🔄 *Sistema sincronizado automaticamente*`;

        // Answer callback query first
        const callbackResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callback_query_id: callbackQuery.id,
            text: `✅ ${statusMessages[status] || status}`,
            show_alert: false
          })
        });

        if (!callbackResponse.ok) {
          console.error('Failed to answer callback query:', await callbackResponse.text());
        }

        // Send confirmation message
        const messageResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: confirmationMessage,
            parse_mode: 'Markdown',
            reply_to_message_id: messageId
          })
        });

        if (!messageResponse.ok) {
          console.error('Failed to send confirmation message:', await messageResponse.text());
        } else {
          console.log('✅ Confirmation message sent successfully');
        }

      } else if (callbackData.startsWith('call_')) {
        // Format: call_A1234_5511999999999
        const parts = callbackData.split('_');
        const codigoPedido = parts[1];
        const whatsapp = parts.slice(2).join('_');

        // Answer callback query with phone number
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callback_query_id: callbackQuery.id,
            text: `📞 Cliente: ${whatsapp}`,
            show_alert: true
          })
        });

        // Send message with call info
        const callMessage = `📞 *Ligar para Cliente*\n\n📋 Pedido: *${codigoPedido}*\n📱 WhatsApp: \`${whatsapp}\`\n\n_Clique no número acima para copiar_`;

        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: callMessage,
            parse_mode: 'Markdown',
            reply_to_message_id: messageId
          })
        });
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Webhook processed successfully' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in telegram-webhook function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});