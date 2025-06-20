# URL Shortener API

API para encurtamento de URLs com autenticação JWT, contagem de cliques, documentação Swagger, e suporte a deploy via Docker.

## Pré-requisitos

- Node.js v18.x (LTS) — veja abaixo
- Docker + Docker Compose
- PostgreSQL (se não usar o Docker Compose)

### Versão do Node.js

Este projeto **suporta e foi testado com Node.js v18.x (LTS)**.  
Recomenda-se utilizar exatamente essa versão para garantir compatibilidade com as dependências e evitar falhas na instalação ou execução.

Para gerenciar múltiplas versões do Node.js, você pode usar o [nvm](https://github.com/nvm-sh/nvm):

```bash
nvm install 18
nvm use 18
```

## Scripts úteis

- `npm run start:dev` — Inicia o servidor em modo desenvolvimento
- `npm run build` — Compila a aplicação
- `npm run test` — Executa testes unitários

## Como rodar localmente

### Rodar com Docker Compose (recomendado)

Clone o repositório:

```bash
git clone https://github.com/LennonXimenes/url-shortener-api
cd url-shortener-api
```

Copie o arquivo de exemplo `.env` e configure:

```bash
cp .env.example .env

# Edite o arquivo .env conforme necessário

```

Suba o ambiente com Docker Compose:

```bash
docker-compose up -d
```

A API estará disponível em [http://localhost:3000](http://localhost:3000).

---

### Rodar localmente sem Docker

Clone o repositório, copie o `.env` e instale dependências:

```bash
git clone https://github.com/LennonXimenes/url-shortener-api
cd url-shortener-api
cp .env.example .env
npm install
```

Rode as migrations do banco de dados:

```bash
npx prisma migrate deploy
```

Inicie a aplicação em modo desenvolvimento:

```bash
npm run start:dev
```

Acesse a API em [http://localhost:3000](http://localhost:3000).

---

## Endpoints principais

### Autenticação

- `POST /auth/register` – Cadastro de usuário
- `POST /auth/login` – Login e obtenção do JWT
- `POST /auth/refresh` – Renovação do token de acesso
- `GET /auth/profile` – Obter perfil do usuário autenticado (JWT)

### URLs

- `POST /url` – Encurtar URL (público ou autenticado)
- `GET /url/me` – Listar URLs do usuário autenticado
- `PATCH /url/:id` – Atualizar URL de destino (autenticado)
- `DELETE /url/:id/delete` – Soft delete de uma URL (autenticado)
- `GET /url/:shortCode` – Obter detalhes da URL a partir do shortCode
- `PATCH /url/:shortCode/click` – Incrementar contagem de cliques

### Redirecionamento Público

- `GET /r/:shortCode` – Redirecionar para a URL original e contar clique

---

## Documentação

A API está documentada com Swagger.  
Acesse: [http://localhost:3000/api](http://localhost:3000/api)

---

## Testes

Execute os testes unitários:

```bash
npm run test
```

Para rodar os testes em modo watch:

```bash
npm run test:watch
```

---

## Pontos de melhoria e escalabilidade

- Deploy com Kubernetes e Terraform para ambiente de produção
- Suporte multi-tenant para múltiplos clientes
- API Gateway com KrankeD para arquitetura de microsserviços

---

## Contato

lennon_ximenes@hotmail.com

---

## Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para mais detalhes.
