// Cliente Supabase.
//
// As credenciais vêm das variáveis de ambiente do Vite, cadastradas na Netlify
// (Site configuration > Environment variables) ou em um arquivo .env local:
//
//   VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
//   VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOi...
//
// A chave usada aqui é a "anon public" (segura para o frontend, respeita o RLS).
// NUNCA coloque a service_role key no frontend.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const rawUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const rawKey = (
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ??
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)
)?.trim();

/** true quando as variáveis de ambiente do Supabase estão preenchidas. */
export const isSupabaseConfigured = Boolean(rawUrl && rawKey);

// Valores usados apenas para o app conseguir renderizar quando ainda não há
// configuração. As requisições vão falhar e a interface mostra o aviso de setup.
const SUPABASE_URL = rawUrl || "https://placeholder.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = rawKey || "placeholder-anon-key";

if (!isSupabaseConfigured) {
  // eslint-disable-next-line no-console
  console.warn(
    "[Delivery Max] Supabase não configurado. Defina VITE_SUPABASE_URL e " +
      "VITE_SUPABASE_PUBLISHABLE_KEY nas variáveis de ambiente da Netlify " +
      "(e refaça o deploy) ou em um arquivo .env local. Veja DEPLOY.md."
  );
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
