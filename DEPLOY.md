# 🚀 Deploy do Delivery Max na Netlify

O projeto é um app **Vite + React + TypeScript** (frontend estático) com banco de dados
**Supabase**. Tudo que a Netlify precisa já está no repositório: `netlify.toml` +
`public/_redirects`.

| Item | Valor |
|---|---|
| Comando de build | `npm run build` |
| Pasta publicada | `dist` |
| Versão do Node | 22 |
| Redirect SPA | `/*` → `/index.html` (200) |

O caminho completo tem **2 etapas**: (1) criar o banco no Supabase e (2) publicar na Netlify.
A ordem importa, porque a Netlify vai pedir as credenciais do Supabase durante o deploy.

---

# Etapa 1 — Banco de dados (Supabase)

> ⚠️ **Importante:** o projeto Supabase que estava fixo no código
> (`hnlxieskgpblbvftygye.supabase.co`) **não existe mais** — o domínio não resolve.
> Sem um projeto novo, o site sobe mas login, produtos e pedidos não funcionam.
>
> A criação automática foi bloqueada: **sua conta atingiu o limite de projetos do plano
> free**. Nada foi apagado nem alterado no projeto DivulgaAi (sistema separado, intocado).
> Para criar o novo projeto você precisa liberar espaço no plano free **ou** fazer upgrade.

### 1.1 Liberar espaço para o novo projeto

Escolha uma das opções (todas são feitas por você, no painel do Supabase):

- **Plano Pro** — https://supabase.com/dashboard/org/_/billing (permite mais projetos)
- **Pausar o projeto DivulgaAi** (o banco é mantido, só fica offline enquanto pausado) e
  criar o DeliveryMax em seguida: Project Settings → General → *Pause project*
- **Criar o DeliveryMax em outra conta/organização** do Supabase

### 1.2 Criar o projeto

1. https://supabase.com/dashboard → **New project**
2. Nome: `DeliveryMax` · Região: **South America (São Paulo) – sa-east-1**
3. Defina a senha do banco e guarde-a

### 1.3 Criar as tabelas (1 arquivo só)

1. No projeto novo, abra **SQL Editor → New query**
2. Cole **todo** o conteúdo de [`supabase/setup-completo.sql`](./supabase/setup-completo.sql)
3. Clique em **Run**

Esse arquivo único cria o schema inteiro, os dados de exemplo (categorias, produtos,
restaurante) e o usuário administrador inicial:

| Login inicial | |
|---|---|
| E-mail | `admin@deliverymax.com` |
| Senha | `Delivery@2026` |

➡️ **Troque a senha depois do primeiro acesso.** A autenticação atual guarda a senha em
texto puro na tabela `public.users` (comportamento do sistema original); o recomendado é
migrar para o Supabase Auth futuramente.

### 1.4 Copiar as credenciais

Em **Project Settings → API** copie:

- **Project URL** → `https://xxxxxxxxxxxx.supabase.co`
- **anon public** (em *Project API keys*) → `eyJhbGciOi...`

> Use **somente** a chave `anon public`. A `service_role` nunca deve ir para o frontend.

---

# Etapa 2 — Publicar na Netlify

## Opção A — Deploy pelo GitHub (recomendado, automático a cada push)

1. Abra o link do botão:
   **https://app.netlify.com/start/deploy?repository=https://github.com/rastreamentoveicula-dotcom/Delivery.max**
2. Autorize o acesso ao GitHub e escolha o repositório **Delivery.max**
3. A Netlify pede as duas variáveis (configuradas em `netlify.toml`):
   - `VITE_SUPABASE_URL` → a Project URL copiada no passo 1.4
   - `VITE_SUPABASE_PUBLISHABLE_KEY` → a chave `anon public`
4. Confirme o build (já detectado): `npm run build` → `dist`
5. **Deploy** — em ~1 minuto o sistema está em `https://seu-site.netlify.app`

Cada `git push` na branch `main` gera um novo deploy automaticamente.

### Depois, para trocar/ajustar as variáveis
**Site configuration → Environment variables** → edite e depois
**Deploys → Trigger deploy → Clear cache and deploy site**.

### Domínio próprio
**Domain management → Add a domain**, aponte o DNS (`CNAME` para `seu-site.netlify.app`
ou use os nameservers da Netlify) e ative o **HTTPS** (Let's Encrypt, automático e grátis).

## Opção B — Deploy pela CLI

```bash
npm install -g netlify-cli
netlify login
netlify init                      # vincula/cria o site
netlify env:set VITE_SUPABASE_URL "https://xxx.supabase.co"
netlify env:set VITE_SUPABASE_PUBLISHABLE_KEY "eyJhbGciOi..."
npm ci && npm run build
netlify deploy --prod --dir=dist
```

---

## 🔁 Rodando localmente

```bash
npm install
cp .env.example .env    # preencha com URL e chave anon
npm run dev             # http://localhost:8080
```

Sem o `.env`, o app **abre normalmente** mas mostra uma faixa amarela avisando que o
banco não está configurado (as consultas falham).

---

## ✅ Checklist pós-deploy

- [ ] `/` abre o catálogo do cliente, sem faixa amarela de configuração
- [ ] `/login` entra com `admin@deliverymax.com` e a senha definida
- [ ] `/dashboard` carrega métricas após o login
- [ ] Atualizar (F5) em `/dashboard` continua funcionando → redirect SPA OK
- [ ] Senha do admin trocada
- [ ] Domínio próprio com HTTPS

## 🧯 Problemas comuns

| Sintoma | Causa / solução |
|---|---|
| Faixa amarela "Banco de dados não configurado" | `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` ausentes na Netlify → cadastre e refaça o deploy **limpando o cache**. |
| Erros de rede para `*.supabase.co` no console | URL/chave incorretas ou projeto Supabase pausado (o free tier pausa após 7 dias sem uso). |
| Listagens vazias ou erro 401/403 | `setup-completo.sql` não foi executado, ou as políticas de RLS não foram criadas. |
| Página branca ao abrir `/dashboard` direto | `netlify.toml` fora da raiz da branch publicada; `public/_redirects` é o fallback. |
| Build falhou na Netlify | Veja **Deploys → Deploy log**. Reproduza local: `rm -rf node_modules dist && npm ci && npm run build`. |
| Login diz "e-mail ou senha incorretos" | Usuário não existe: rode a PARTE 3 do `setup-completo.sql` ou use a tela **Usuários**. |

---

## 📌 Resumo do que já está pronto no repositório

- `netlify.toml` — build, pasta `dist`, SPA redirects, headers de cache/segurança e
  template do botão de deploy
- `public/_redirects` — fallback do React Router
- Credenciais via `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` (`.env.example`)
- `supabase/setup-completo.sql` — schema + dados + admin em um único script
- `vite.config.ts` — build otimizado com code splitting
- `.gitignore` — protegendo `.env`
