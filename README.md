# Rytm

Rytm é um projeto desenvolvido com [Next.js](https://nextjs.org), projetado para simplificar sua rotina e maximizar sua produtividade.

## Pré-requisitos

Certifique-se de ter as seguintes ferramentas instaladas em sua máquina:

- [Node.js](https://nodejs.org/) (versão 18 ou superior recomendada)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)

## Instalação

1. Clone o repositório:

   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd rytm
   ```

2. Instale as dependências:
   ```bash
   npm install
   # ou
   yarn install
   ```

## Scripts Disponíveis

No diretório do projeto, você pode executar os seguintes comandos:

### `npm run dev`

Inicia o servidor de desenvolvimento. Abra [http://localhost:3000](http://localhost:3000) para visualizar no navegador.

### `npm run build`

Cria a versão de produção do aplicativo na pasta `build`.

### `npm run start`

Inicia o servidor Next.js para produção.

### `npm run lint:eslint:check`

Verifica o código com ESLint para encontrar problemas de estilo e erros.

### `npm run lint:prettier:check`

Verifica o código com Prettier para garantir formatação consistente.

### `npm run test`

Executa os testes configurados com Jest.

## Estrutura do Projeto

- `src/app/` - Contém os arquivos principais do aplicativo, incluindo páginas e layouts.
- `src/app/globals.css` - Arquivo de estilos globais utilizando Tailwind CSS.
- `postcss.config.mjs` - Configuração do PostCSS para Tailwind CSS.
- `eslint.config.mjs` - Configuração do ESLint para análise de código.

## Estrutura de Pastas

Abaixo está a estrutura atual de pastas do projeto:

```
rytm/
├── src/
│   ├── app/
|   ├── test/
|   ├── infra/
|   ├── public/
|   ├── models/
└── README.md
```

## Tecnologias Utilizadas

- [Next.js](https://nextjs.org)
- [React](https://reactjs.org)
- [Tailwind CSS](https://tailwindcss.com)
- [ESLint](https://eslint.org)
- [Prettier](https://prettier.io)
- [Jest](https://jestjs.io)

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e enviar pull requests.

## Licença

Este projeto está licenciado sob a licença MIT.
