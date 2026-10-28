# 🚀 Deploy do Delivery Max na Netlify

**Status: o banco de dados já está criado e populado. Falta apenas 1 clique na Netlify.**

| Infraestrutura | Situação |
|---|---|
| Banco de dados (Supabase) | ✅ **DeliveryMax** criado em São Paulo · schema + 14 produtos + admin |
| Código (GitHub) | ✅ `rastreamentoveicula-dotcom/Delivery.max` na `main` |
| Site (Netlify) | ⏳ pronto para o deploy de 1 clique |

---

## 1. Deploy do site (único passo manual)

Abra este link e siga os 3 cliques:

### 👉 https://app.netlify.com/start/deploy?repository=https://github.com/rastreamentoveicula-dotcom/Delivery.max

1. **Connect to GitHub** → autorize e escolha o repositório `Delivery.max`
2. **Deploy site** (não precisa preencher nada: o build, a pasta `dist`, as rotas e as
   credenciais do banco já estão configurados no repositório)
3. Aguarde ~1 minuto → seu sistema está em `https://nome-aleatorio.netlify.app`

> Não é pedido nenhum cartão de crédito. O plano gratuito da Netlify é suficiente.

### Deixar o endereço bonito
**Site configuration → Site details → Change site name** → por exemplo
`delivery-max` → o endereço vira `https://delivery-max.netlify.app`.

### Usar seu próprio domínio (opcional)
**Domain management → Add a domain** → informe o domínio → a Netlify mostra os dados de
DNS para colocar no registro.br/GoDaddy/etc. O **HTTPS** é emitido sozinho.

---

## 2. Acessar o sistema

| O que | Onde |
|---|---|
| Loja (cliente) | `https://seu-site.netlify.app/` |
| Painel administrativo | `https://seu-site.netlify.app/login` |

| Login inicial | |
|---|---|
| **E-mail** | `admin@deliverymax.com` |
| **Senha** | `Delivery@2026` |

> ⚠️ **Troque a senha** depois do primeiro acesso (menu **Usuários** no painel).
> A autenticação do sistema original guarda a senha em texto puro na tabela
> `public.users` — funciona, mas o ideal no futuro é migrar para o Supabase Auth.

---

## 3. O banco de dados (já feito)

Projeto **DeliveryMax** no Supabase · ref `hfjwbevdbuwjygkjngnf` · região `sa-east-1`

- Painel: https://supabase.com/dashboard/project/hfjwbevdbuwjygkjngnf
- URL da API: `https://hfjwbevdbuwjygkjngnf.supabase.co`

O que já está lá:

| Item | Quantidade |
|---|---|
| Tabelas (pedidos, produtos, entregas, usuários…) | 17 |
| Categorias | 4 |
| Produtos de exemplo | 14 |
| Adicionais | 8 |
| Formas de pagamento | 5 |
| Regiões de entrega | 5 |
| Horários de funcionamento | 7 dias |
| Restaurante de exemplo ("Burger House") | 1 |
| Usuário admin | 1 |

Para recriar do zero em outro projeto: rode [`supabase/setup-completo.sql`](./supabase/setup-completo.sql)
no **SQL Editor** do Supabase (cria schema + dados + admin em um arquivo).

### Credenciais usadas pelo app

Ficam em [`.env.production`](./.env.production) e são lidas automaticamente no build:

```env
VITE_SUPABASE_URL=https://hfjwbevdbuwjygkjngnf.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOi...   # chave anon public
```

> A chave `anon` é **pública** por definição (vai dentro do JavaScript entregue ao
> navegador de qualquer forma). A chave `service_role` **nunca** deve ir para o frontend.
>
> Para apontar para outro projeto Supabase: edite o `.env.production` e faça commit,
> ou (sem mexer no código) cadastre as duas variáveis em
> **Netlify → Site configuration → Environment variables** e refaça o deploy com
> **Deploys → Trigger deploy → Clear cache and deploy site**.

---

## 4. Atualizações futuras do site

Cada `git push` na branch `main` dispara um deploy automático. Nada mais precisa ser feito.

---

## 5. Rodando na sua máquina (opcional)

```bash
npm install
cp .env.example .env    # preencha com a URL e a chave anon
npm run dev             # http://localhost:8080
```

---

## 6. Problemas comuns

| Sintoma | Solução |
|---|---|
| Faixa amarela "Banco de dados não configurado" | Faltou o `.env.production`. Cadastre as variáveis no painel da Netlify e refaça o deploy **limpando o cache**. |
| Login diz "e-mail ou senha incorretos" | Confira `admin@deliverymax.com` / `Delivery@2026`. Para recriar: rode a PARTE 3 do `setup-completo.sql`. |
| Página branca ao abrir `/dashboard` direto | O `netlify.toml` precisa estar na raiz da branch publicada (`main`). O `public/_redirects` é o fallback. |
| Site abre mas listas vazias / erro 401 | Projeto Supabase pausado (o free tier pausa após 7 dias sem uso) → painel do Supabase → **Restore project**. |
| Build falhou na Netlify | Veja **Deploys → Deploy log**. Reproduza local: `rm -rf node_modules dist && npm ci && npm run build`. |

---

## 📌 Arquivos de configuração no repositório

| Arquivo | Função |
|---|---|
| `netlify.toml` | build, pasta `dist`, Node 22, redirect SPA, headers de cache/segurança |
| `public/_redirects` | fallback do React Router |
| `.env.production` | URL + chave `anon` do Supabase (lidas no build) |
| `.env.example` | modelo para rodar localmente |
| `supabase/setup-completo.sql` | schema + dados + admin em um único script |

---

## 🧯 Erro `sh: 1: vite: not found` (já corrigido no repositório)

**Causa:** a Netlify roda a instalação com `NODE_ENV=production`, e nesse modo o npm
**não instala as devDependencies** — onde ficam o Vite, o Tailwind e o TypeScript. Sem o
Vite, o build morre antes de gerar a pasta `dist`.

**Correção aplicada no `netlify.toml`** (dupla proteção):

```toml
[build]
  command = "npm install --include=dev --no-audit --no-fund && npm run build"
  publish = "dist"
  environment = { NODE_VERSION = "22", NPM_FLAGS = "--include=dev --no-audit --no-fund" }
```

Se o seu site foi criado antes desta correção, force um novo build:
**Deploys → Trigger deploy → Clear cache and deploy site**.

> Alternativa pelo painel, sem depender do arquivo:
> **Site configuration → Environment variables** → `NPM_FLAGS` = `--include=dev`.

### Outro erro comum: repositório vazio

Se o log mostrar `Deploy directory "dist" does not exist` e o repositório no GitHub
aparecer **sem nenhum arquivo**, a Netlify está conectada a um repositório vazio —
escolha o repositório correto em **Site configuration → Build & deploy → Repository**.
