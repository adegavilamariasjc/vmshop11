import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Create Supabase client with service role to query any data
    const supabase = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get database schema information
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    // Get basic stats from main tables
    const [pedidos, products, categories, bairros] = await Promise.all([
      supabase.from('pedidos').select('*', { count: 'exact', head: true }),
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('categories').select('*', { count: 'exact', head: true }),
      supabase.from('bairros').select('*', { count: 'exact', head: true }),
    ]);

    const dbContext = `
Base de dados disponível:
- ${pedidos.count || 0} pedidos
- ${products.count || 0} produtos
- ${categories.count || 0} categorias  
- ${bairros.count || 0} bairros

Tabelas principais: pedidos, products, categories, bairros, movimentacoes_estoque, product_stats, profiles, user_roles

A tabela pedidos contém: id, codigo_pedido, cliente_nome, cliente_endereco, cliente_bairro, cliente_whatsapp, status, total, taxa_entrega, itens (JSONB com array de produtos), forma_pagamento, data_criacao, observacao, entregador, discount_amount

A tabela products contém: id, name, price, category_id, quantidade_estoque, controlar_estoque, custo_compra, margem_lucro, estoque_minimo, is_paused, order_index

A tabela movimentacoes_estoque registra todas as movimentações de estoque (entradas, saídas, ajustes, vendas).
`;

    const systemPrompt = `Você é um agente de IA conectado a uma base Supabase. Sempre que receber uma pergunta, leia e analise TODO o banco de dados (todas as tabelas, colunas e relacionamentos). Entenda automaticamente o significado do pedido e traga somente informações reais encontradas no banco. Não invente, não sugira, não adivinhe.

${dbContext}

Formato de resposta:
📊 Resultado solicitado
────────────────────────────
🔍 O que foi encontrado:
<dados, valores, análises ou informações solicitadas>

📈 Interpretação:
<descrição objetiva do que esses dados representam>

💡 Observações:
<erros, dados ausentes ou detalhes importantes>

Regras:
- Analise sempre todo o banco Supabase.
- Entenda pedidos em linguagem natural.
- Forneça respostas diretas, completas e formatadas.
- Use linguagem profissional, clara e sem sugestões.
- Se não houver dados suficientes, diga explicitamente que não há informações para responder com precisão.
- Quando for necessário dados específicos do banco, você pode consultar via SQL ou APIs do Supabase.
- Use emojis para melhorar a visualização.`;

    // Call Lovable AI Gateway
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente mais tarde.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Créditos esgotados. Adicione créditos ao seu workspace Lovable.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    // Stream the response back to client
    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });

  } catch (error) {
    console.error('Error in chat-admin function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
