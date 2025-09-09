import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID') || '-1002345678901'; // Default group ID (user will need to set this)

    if (!TELEGRAM_BOT_TOKEN) {
      throw new Error('TELEGRAM_BOT_TOKEN não configurado');
    }

    const {
      codigoPedido,
      clienteNome,
      clienteEndereco,
      clienteNumero,
      clienteComplemento,
      clienteReferencia,
      clienteBairro,
      taxaEntrega,
      clienteWhatsapp,
      formaPagamento,
      troco,
      observacao,
      itens,
      total,
      discountAmount
    } = await req.json();

    console.log('Preparing Telegram message for order:', codigoPedido);

    // Format items with detailed information
    const itensList = itens.map((item: any) => {
      const fullName = item.category?.toLowerCase() === 'batidas' && !item.name.toLowerCase().includes('batida de')
        ? `Batida de ${item.name}`
        : item.name;

      const iceText = item.ice
        ? "\n   🧊 Gelo: " + Object.entries(item.ice)
            .filter(([flavor, qty]: [string, any]) => qty > 0)
            .map(([flavor, qty]: [string, any]) => `${flavor} x${qty}`)
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

    // Calculate values
    const subtotal = itens.reduce((sum: number, item: any) => sum + (item.price || 0) * (item.qty || 1), 0);
    const totalFinal = total || (subtotal + (taxaEntrega || 0));
    const trocoValue = Number(troco) || 0;
    const trocoFinal = formaPagamento === "Dinheiro" && trocoValue > 0 ? trocoValue - totalFinal : 0;

    // Format complete message
    const message = `🎯 **NOVO PEDIDO** 🎯

📋 **CÓDIGO:** ${codigoPedido}

👤 **CLIENTE:**
${clienteNome}
📱 WhatsApp: ${clienteWhatsapp}

📍 **ENDEREÇO COMPLETO:**
${clienteEndereco}, Nº ${clienteNumero}${clienteComplemento ? ` - ${clienteComplemento}` : ''}
🏘️ Bairro: ${clienteBairro}
📍 Referência: ${clienteReferencia || 'Não informada'}

🛒 **PEDIDO:**
${itensList}

💸 **VALORES:**
💰 Subtotal: R$${subtotal.toFixed(2).replace('.', ',')}
🚚 Taxa de Entrega: R$${(taxaEntrega || 0).toFixed(2).replace('.', ',')}${discountAmount > 0 ? `\n🎁 Desconto: -R$${discountAmount.toFixed(2).replace('.', ',')}` : ''}
🏆 **TOTAL: R$${totalFinal.toFixed(2).replace('.', ',')}**

💳 **PAGAMENTO:**
${formaPagamento}${formaPagamento === "Dinheiro" && trocoValue > 0 
  ? `\n💵 Troco para: R$${trocoValue.toFixed(2).replace('.', ',')}\n💸 Troco a levar: R$${trocoFinal >= 0 ? trocoFinal.toFixed(2).replace('.', ',') : '0,00'}`
  : ''}

${observacao ? `📝 **OBSERVAÇÃO:** ${observacao}` : ''}

⏰ ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`;

    // Send to Telegram
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('Telegram API error:', result);
      throw new Error(`Erro ao enviar para Telegram: ${result.description || 'Erro desconhecido'}`);
    }

    console.log('Order sent to Telegram successfully:', codigoPedido);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Pedido enviado para Telegram com sucesso',
      telegramMessageId: result.result?.message_id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in send-telegram-order function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});