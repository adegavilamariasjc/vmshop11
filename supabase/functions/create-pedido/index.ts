import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Variáveis SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY ausentes');
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const payload = await req.json();

    // Log minimal info for debugging (no PII beyond what is already necessary)
    console.log('📦 Recebido payload para create-pedido:', {
      codigo_pedido: payload?.codigo_pedido,
      total: payload?.total,
      cliente_bairro: payload?.cliente_bairro,
    });

    // Insert using service role to bypass client RLS issues safely
    const { data, error } = await supabaseAdmin
      .from('pedidos')
      .insert([payload])
      .select()
      .single();

    if (error) {
      const errObj = {
        message: (error as any).message,
        details: (error as any).details,
        hint: (error as any).hint,
        code: (error as any).code,
        status: (error as any).status,
      };
      console.error('❌ Erro ao inserir pedido (edge):', errObj);
      return new Response(JSON.stringify({ success: false, error: errObj }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('✅ Pedido criado com sucesso (edge):', data?.id);

    return new Response(
      JSON.stringify({ success: true, pedido: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('⚠️ Erro inesperado em create-pedido:', error);
    return new Response(JSON.stringify({ success: false, error: { message: String(error) } }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});