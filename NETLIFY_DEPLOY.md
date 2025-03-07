# Guia de Implantação no Netlify

Este guia explica como implantar a aplicação creamousbebe no Netlify e configurar as variáveis de ambiente necessárias.

## Passos para Implantação

### 1. Preparação do Repositório

Certifique-se de que seu repositório contém os seguintes arquivos:
- `netlify.toml` (já criado)
- Pasta `functions` com o arquivo `api.js` (já criado)
- Todos os arquivos da aplicação

### 2. Criar uma Conta no Netlify

1. Acesse [Netlify](https://www.netlify.com/) e crie uma conta ou faça login

### 3. Implantar o Site

1. No painel do Netlify, clique em "Add new site" e selecione "Import an existing project"
2. Conecte sua conta do GitHub, GitLab ou Bitbucket
3. Selecione o repositório do projeto creamousbebe
4. Na configuração de implantação, os campos já estarão preenchidos com base no arquivo `netlify.toml`:
   - Build command: `npm install`
   - Publish directory: `src`

### 4. Configurar Variáveis de Ambiente

1. Após a implantação inicial, vá para "Site settings" do seu site no Netlify
2. Navegue até "Environment variables"
3. Adicione as seguintes variáveis de ambiente:
   - Nome: `SUPABASE_URL` | Valor: `sua_url_do_supabase`
   - Nome: `SUPABASE_ANON_KEY` | Valor: `sua_chave_anon_do_supabase`

   ![Exemplo de configuração de variáveis de ambiente](https://i.imgur.com/example.png)

4. Clique em "Save"

### 5. Reimplantar o Site

Após configurar as variáveis de ambiente:

1. Vá para a aba "Deploys"
2. Clique em "Trigger deploy" e selecione "Deploy site"

### 6. Verificar a Implantação

1. Após a conclusão da implantação, clique no link do site fornecido pelo Netlify
2. Verifique se a aplicação está funcionando corretamente
3. Teste as funcionalidades que dependem do Supabase para garantir que as variáveis de ambiente estão configuradas corretamente

## Solução de Problemas

### Erro de Variáveis de Ambiente

Se a aplicação não conseguir se conectar ao Supabase:

1. Verifique se as variáveis de ambiente foram configuradas corretamente
2. Certifique-se de que os valores estão corretos
3. Reimplante o site após fazer alterações nas variáveis

### Erro 404 em Rotas da API

Se as rotas da API retornarem erro 404:

1. Verifique se a pasta `functions` está corretamente configurada
2. Certifique-se de que as chamadas de API no frontend estão usando o caminho correto: `/.netlify/functions/api/...`

## Notas Importantes

- As funções serverless do Netlify têm um tempo limite de execução de 10 segundos
- O arquivo `netlify.toml` já está configurado para redirecionar todas as rotas para o `index.html`, permitindo que o roteamento do lado do cliente funcione corretamente
- As chamadas de API devem ser atualizadas para usar o caminho `/.netlify/functions/api` em vez de `/api`