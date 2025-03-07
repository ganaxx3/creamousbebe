# creamousbebe

Aplicação web para gerenciamento de matchups de League of Legends.

## Descrição

Esta aplicação permite visualizar e gerenciar matchups de campeões do League of Legends, com funcionalidades de autenticação e painel administrativo.

## Tecnologias Utilizadas

- Node.js
- Express
- Supabase (Banco de dados e autenticação)
- HTML/CSS/JavaScript

## Requisitos

- Node.js (versão 14 ou superior)
- Conta no Supabase

## Configuração Local

1. Clone o repositório
2. Instale as dependências:
   ```
   npm install
   ```
3. Crie um arquivo `.env` na pasta `src` com as seguintes variáveis:
   ```
   SUPABASE_URL=sua_url_do_supabase
   SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
   ```
4. Inicie o servidor:
   ```
   npm start
   ```
5. Acesse a aplicação em `http://localhost:3000`

## Implantação

### Preparação para Implantação

1. Certifique-se de que todas as dependências estão listadas no `package.json`
2. Verifique se o script `start` está configurado corretamente
3. Garanta que as variáveis de ambiente estão configuradas no serviço de hospedagem

### Opções de Hospedagem

#### Render.com

1. Crie uma conta no [Render](https://render.com)
2. Crie um novo Web Service
3. Conecte ao repositório Git
4. Configure as variáveis de ambiente (SUPABASE_URL e SUPABASE_ANON_KEY)
5. Defina o comando de build como `npm install`
6. Defina o comando de start como `npm start`
7. Implante a aplicação

#### Railway.app

1. Crie uma conta no [Railway](https://railway.app)
2. Crie um novo projeto
3. Conecte ao repositório Git
4. Configure as variáveis de ambiente (SUPABASE_URL e SUPABASE_ANON_KEY)
5. Implante a aplicação

## Estrutura do Projeto

- `/src`: Código fonte da aplicação
  - `/assets`: Arquivos estáticos (imagens, etc.)
  - `/css`: Arquivos de estilo
  - `/html`: Páginas HTML
  - `/js`: Scripts JavaScript
  - `server.js`: Servidor Express
  - `supabase.js`: Configuração do Supabase

## Funcionalidades

- Autenticação de usuários
- Visualização de matchups de campeões
- Painel administrativo para gerenciamento de matchups