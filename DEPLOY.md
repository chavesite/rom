# Como publicar a Cris Variedades no Cloudflare Pages

O que mudou: agora os produtos e as configurações da loja são salvos numa
área de armazenamento do Cloudflay chamada **KV**, em vez do localStorage do
navegador. Assim, o que você cadastrar no painel admin aparece pra qualquer
cliente que abrir o link, em qualquer aparelho.

A senha padrão do painel admin é **admin** — troque isso assim que publicar,
na tela de Configurações da Loja.

## Passo 1 — Criar o namespace KV

1. Entre no painel do Cloudflare → **Workers e Pages** → **KV**.
2. Clique em **Criar namespace**. Dê um nome, por exemplo `cris-store`.
3. Não precisa colocar nada dentro dele — o próprio site cria os dados
   iniciais na primeira vez que alguém acessa.

## Passo 2 — Criar o projeto Pages

Você pode subir o código de duas formas:

**A) Conectando um repositório Git (GitHub/GitLab)** — recomendado, porque
facilita atualizações futuras:
1. Suba esta pasta para um repositório no GitHub.
2. No Cloudflare → **Workers e Pages** → **Criar aplicação** → **Pages** →
   **Conectar ao Git**.
3. Configuração de build:
   - **Comando de build:** `npm run build`
   - **Diretório de saída:** `dist`

**B) Upload direto (sem Git)**, usando o Wrangler CLI no seu computador:
```
npm install
npm run build
npx wrangler pages deploy dist --project-name=cris-variedades
```

## Passo 3 — Ligar o KV ao projeto

Isso é o passo que faz os produtos aparecerem pra todo mundo:

1. No projeto criado, vá em **Configurações** → **Functions** →
   **Vinculações de KV namespace** (KV namespace bindings).
2. Adicione uma vinculação:
   - **Nome da variável:** `STORE_KV` (exatamente assim, é o nome que o
     código espera)
   - **Namespace KV:** escolha o `cris-store` que você criou no Passo 1.
3. Salve e faça um novo deploy (ou clique em "Recriar implantação") para a
   vinculação entrar em vigor.

## Passo 4 — Testar

1. Abra o site publicado, entre em `/admin`, faça login com a senha `admin`.
2. Troque a senha, o nome da loja e o número de WhatsApp em
   **Configurações da Loja**.
3. Cadastre um produto de teste e confira se ele aparece na loja normal
   (pode testar em outro celular ou no navegador anônimo — é esse o
   comportamento que garante que os clientes vão ver).

## Observação sobre imagens

As fotos dos produtos continuam sendo por **URL** (você cola o link de uma
imagem já hospedada, ex: de um link do Unsplash, Imgur, ou de um serviço
de imagens). O painel não faz upload de arquivo.
