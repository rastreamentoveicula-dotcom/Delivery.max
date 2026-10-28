// Cliente Supabase.
//
// Os valores são lidos das variáveis de ambiente do Vite, definidas na
// Netlify (Site settings > Environment variables) ou no arquivo .env local:
//
//   VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
//   VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOi...
//
// Se as variáveis não existirem, os valores abaixo (públicos, chave anon)
// são usados como fallback para o app continuar funcionando.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const FALLBACK_SUPABASE_URL = "https://hnlxieskgpblbvftygye.supabase.co";
const FALLBACK_SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhubHhpZXNrZ3BibGJ2ZnR5Z3llIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMTAzMDYsImV4cCI6MjA3MjY4NjMwNn0.JqP8BEykm-KLAsdzHoYQKhCEmPIBqLlyqBkhJ8u8qYc";

const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ||
  FALLBACK_SUPABASE_URL;

const SUPABASE_PUBLISHABLE_KEY =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined)?.trim() ||
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ||
  FALLBACK_SUPABASE_PUBLISHABLE_KEY;

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
