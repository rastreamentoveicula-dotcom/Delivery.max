# 🚀 Deploy do Delivery Max na Netlify

Guia completo para publicar o sistema. O projeto é um app **Vite + React + TypeScript**
(frontend estático) que usa **Supabase** como banco de dados. Tudo que a Netlify precisa
já está configurado no repositório (`netlify.toml` + `public/_redirects`).

| Item | Valor |
|---|---|
| Comando de build | `npm run build` |
| Pasta publicada | `dist` |
| Versão do Node | 22 |
| Redireciona SPA | `/*` → `/index.html` (200) |

---

## Opção 1 — Deploy automático pelo GitHub (recomendado)

Assim cada `git push` na branch `main` gera um novo deploy automaticamente.

1. Acesse **https://app.netlify.com/start/deploy?repository=https://github.com/rastreamentoveicula-dotcom/Delivery.max**
   (ou no painel: **Add new site → Import an existing project → GitHub → Delivery.max**).
2. Autorize a Netlify a acessar o GitHub e selecione o repositório **Delivery.max**.
3. Confirme as configurações detectadas automaticamente:
   - **Branch to deploy:** `main`
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. (Opcional, mas recomendado) Em **Environment variables**, adicione:
   | Nome | Valor |
   |---|---|
   | `VITE_SUPABASE_URL` | `https://SEU-PROJETO.supabase.co` |
   | `VITE_SUPABASE_PUBLISHABLE_KEY` | sua chave `anon public` do Supabase |
5. Clique em **Deploy site**. Em ~1 minuto o site fica no ar em
   `https://nome-aleatorio.netlify.app`.

> Se as variáveis **não** forem cadastradas, o app usa os valores que já estão em
> `src/integrations/supabase/client.ts` (projeto Supabase atual). O build funciona dos
> dois jeitos — as variáveis servem para trocar de projeto sem mexer no código.

### Domínio próprio
**Site settings → Domain management → Add a domain**. Aponte o DNS do seu domínio
(registro `CNAME` para `seu-site.netlify.app` ou os nameservers da Netlify) e ative o
**HTTPS** (Let's Encrypt, gratuito e automático).

---

## Opção 2 — Deploy manual pela CLI (pasta `dist`)

```bash
npm install -g netlify-cli   # instala a CLI
netlify login                # abre o navegador para autorizar
npm install                  # dependências
npm run build                # gera a pasta dist
netlify deploy --prod --dir=dist   # publica em produção
```

Na primeira execução a CLI pergunta se você quer vincular a um site existente
ou criar um novo (`netlify init`). As variáveis de ambiente podem ser definidas com
`netlify env:set VITE_SUPABASE_URL "https://..."`.

---

## Backend (Supabase)

O frontend precisa de um projeto Supabase com as tabelas do sistema. Os SQLs estão em
`supabase/migrations/`:

| Arquivo | Conteúdo |
|---|---|
| `migration.sql` | Schema completo: tabelas, enums, funções, RLS e triggers |
| `dados-mockados.sql` | Dados de exemplo (restaurante, produtos, categorias) — opcional |

### Como aplicar em um projeto novo

1. Crie/abra o projeto em **https://supabase.com/dashboard**.
2. Vá em **SQL Editor → New query**, cole o conteúdo de `supabase/migrations/migration.sql`
   e execute (**Run**).
3. (Opcional) Repita com `dados-mockados.sql` para já ter produtos de exemplo.
4. Copie **Project URL** e **anon public key** em **Project Settings → API**.
5. Cadastre essas duas informações nas variáveis de ambiente da Netlify
   (`VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`) e refaça o deploy
   (**Deploys → Trigger deploy → Clear cache and deploy site**).

### Criar o primeiro usuário de acesso

O login do sistema usa a função RPC `authenticate_user`. Para criar um admin:

```sql
select create_user('admin@deliverymax.com', 'SuaSenhaForte123', 'Admin', 'Delivery');
-- depois promova para admin, se necessário:
update public.users set role = 'admin' where email = 'admin@deliverymax.com';
```

Depois entre em `https://seu-site.netlify.app/login` com esse e-mail e senha.
O painel administrativo abre em `/dashboard`; a loja pública é a rota `/`.

---

## Checklist pós-deploy

- [ ] Site abre em `/` (catálogo do cliente) sem erros no console
- [ ] Login em `/login` funciona com o usuário criado no Supabase
- [ ] `/dashboard` carrega métricas após o login
- [ ] Atualizar a página em `/dashboard` (F5) continua funcionando → redirect SPA OK
- [ ] Domínio próprio com HTTPS ativo

## Problemas comuns

| Sintoma | Causa / solução |
|---|---|
| Página branca ao abrir `/dashboard` direto | `netlify.toml` não foi lido: confirme que o arquivo está na raiz da branch publicada. O `public/_redirects` é o fallback. |
| Erros de rede para `*.supabase.co` no console | URL/chave erradas nas variáveis de ambiente, ou o projeto Supabase está pausado. |
| `Failed to fetch` em todas as listagens | Tabelas não criadas (rode `migration.sql`) ou RLS bloqueando; revise **Project Settings → API** e as políticas. |
| Build falhou na Netlify | Confira em **Deploys → Deploy log**. Build local equivalente: `rm -rf node_modules && npm ci && npm run build`. |
