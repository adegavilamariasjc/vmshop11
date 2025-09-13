import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface IfoodOrder {
  orderId?: string;
  customer?: {
    name?: string;
    phone?: string;
  };
  address?: {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
  };
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total?: number;
  paymentMethod?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📨 Webhook iFood recebido');
    
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const chatId = Deno.env.get('TELEGRAM_CHAT_ID');
    
    if (!botToken || !chatId) {
      console.error('❌ Token do bot ou Chat ID não configurados');
      return new Response(
        JSON.stringify({ error: 'Bot não configurado' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse do pedido recebido
    const orderData: IfoodOrder = await req.json();
    console.log('📋 Dados do pedido:', orderData);

    // Formata a mensagem para o Telegram
    let message = '🍔 **NOVO PEDIDO iFOOD VIA WEBHOOK**\n\n';
    
    if (orderData.orderId) {
      message += `📋 **Pedido:** ${orderData.orderId}\n`;
    }
    
    if (orderData.customer?.name) {
      message += `👤 **Cliente:** ${orderData.customer.name}\n`;
    }
    
    if (orderData.customer?.phone) {
      message += `📱 **Telefone:** ${orderData.customer.phone}\n`;
    }
    
    // Formata endereço
    if (orderData.address) {
      const addr = orderData.address;
      let addressText = '';
      if (addr.street) addressText += addr.street;
      if (addr.number) addressText += `, ${addr.number}`;
      if (addr.complement) addressText += ` - ${addr.complement}`;
      if (addr.neighborhood) addressText += `\n🏘️ Bairro: ${addr.neighborhood}`;
      if (addr.city) addressText += ` - ${addr.city}`;
      
      if (addressText) {
        message += `📍 **Endereço:** ${addressText}\n`;
      }
    }
    
    // Lista os itens
    if (orderData.items && orderData.items.length > 0) {
      message += '\n🛒 **ITENS:**\n';
      orderData.items.forEach(item => {
        message += `• ${item.quantity}x ${item.name}`;
        if (item.price) {
          message += ` - R$ ${item.price.toFixed(2)}`;
        }
        message += '\n';
      });
    }
    
    if (orderData.total) {
      message += `\n💰 **Total:** R$ ${orderData.total.toFixed(2)}\n`;
    }
    
    if (orderData.paymentMethod) {
      message += `💳 **Pagamento:** ${orderData.paymentMethod}\n`;
    }
    
    message += `\n⏰ ${new Date().toLocaleString('pt-BR')}`;
    
    // Cria botões de controle
    const orderId = orderData.orderId || `WEBHOOK_${Date.now()}`;
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
    
    // Envia mensagem para o Telegram
    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
        reply_markup: inlineKeyboard
      })
    });

    const telegramResult = await telegramResponse.json();
    
    if (!telegramResponse.ok) {
      console.error('❌ Erro ao enviar mensagem para Telegram:', telegramResult);
      throw new Error('Falha ao enviar para Telegram');
    }
    
    console.log('✅ Pedido iFood enviado para Telegram com sucesso');
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Pedido processado e enviado para Telegram',
        orderId: orderId
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('❌ Erro ao processar webhook iFood:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});