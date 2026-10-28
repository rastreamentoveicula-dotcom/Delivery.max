import { isSupabaseConfigured } from "@/integrations/supabase/client";
import { Database, ExternalLink } from "lucide-react";

/**
 * Aviso exibido apenas quando o app é aberto sem as variáveis de ambiente do
 * Supabase configuradas. Ajuda a identificar o problema durante o setup.
 */
export function SupabaseSetupBanner() {
  if (isSupabaseConfigured) return null;

  return (
    <div className="relative z-[9999] bg-amber-500 px-4 py-2 text-center text-sm font-medium text-amber-950 shadow-md">
      <span className="inline-flex flex-wrap items-center justify-center gap-2">
        <Database className="h-4 w-4 shrink-0" />
        <span>
          Banco de dados não configurado: defina{" "}
          <code className="rounded bg-amber-950/10 px-1">VITE_SUPABASE_URL</code> e{" "}
          <code className="rounded bg-amber-950/10 px-1">
            VITE_SUPABASE_PUBLISHABLE_KEY
          </code>{" "}
          na Netlify e refaça o deploy.
        </span>
        <a
          href="https://github.com/rastreamentoveicula-dotcom/Delivery.max/blob/main/DEPLOY.md"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 underline"
        >
          Ver instruções <ExternalLink className="h-3 w-3" />
        </a>
      </span>
    </div>
  );
}
