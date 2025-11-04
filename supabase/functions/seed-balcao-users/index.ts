import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type BalcaoUser = { email: string; password: string; nome: string };

const USERS: BalcaoUser[] = [
  { email: "andre@balcao.local", password: "vm11", nome: "Andre" },
  { email: "ramon@balcao.local", password: "vm11", nome: "Ramon" },
  { email: "lucas@balcao.local", password: "vm11", nome: "Lucas" },
  { email: "vinicius@balcao.local", password: "vm11", nome: "Vinicius" },
  { email: "mariana@balcao.local", password: "vm11", nome: "Mariana" },
];

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function deleteExistingBalcaoUsersByRole() {
  // Get all user_ids that currently have the 'balcao' role
  const { data, error } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("role", "balcao");
  if (error) throw error;

  const ids = Array.from(new Set((data ?? []).map((r: any) => r.user_id))).filter(Boolean);
  for (const id of ids) {
    try {
      await supabase.auth.admin.deleteUser(id);
    } catch (_e) {
      // ignore
    }
  }
}

async function ensureUser(u: BalcaoUser) {
  // Create user with password and confirmed email
  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email: u.email,
    password: u.password,
    email_confirm: true,
    user_metadata: { nome_completo: u.nome },
  });
  if (createError) throw createError;
  const newUser = created.user!;

  // Insert role in public.user_roles
  const { error: roleErr } = await supabase
    .from("user_roles")
    .insert({ user_id: newUser.id, role: "balcao" })
    .select()
    .single();
  if (roleErr && roleErr.code !== "23505") {
    throw roleErr;
  }

  // Ensure profile exists
  const { data: prof } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", newUser.id)
    .maybeSingle();

  if (!prof) {
    await supabase.from("profiles").insert({
      id: newUser.id,
      nome_completo: u.nome,
      ativo: true,
    });
  }

  return { id: newUser.id, email: newUser.email };
}

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Use POST" }), {
        status: 405,
        headers: { "content-type": "application/json" },
      });
    }

    // First, clean up any existing users tied to the 'balcao' role
    await deleteExistingBalcaoUsersByRole();

    const results: unknown[] = [];
    for (const u of USERS) {
      const r = await ensureUser(u);
      results.push(r);
    }

    return new Response(JSON.stringify({ ok: true, results }), {
      headers: { "content-type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
});
