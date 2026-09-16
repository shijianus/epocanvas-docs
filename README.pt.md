# EpoCanvas Docs

[![Release](https://img.shields.io/github/v/release/shijianus/epocanvas-docs?color=3b82f6&style=flat-square)](https://github.com/shijianus/epocanvas-docs/releases)
[![Build](https://img.shields.io/github/actions/workflow/status/shijianus/epocanvas-docs/build.yml?branch=main&style=flat-square)](https://github.com/shijianus/epocanvas-docs/actions/workflows/build.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](./LICENSE)
[![Built with Astro](https://img.shields.io/badge/Built_with-Astro_5-orange.svg?style=flat-square)](https://astro.build)

[English](./README.md) | [简体中文](./README.zh-CN.md) | [繁體中文](./README.zh-TW.md) | [Français](./README.fr.md) | [Español](./README.es.md) | [Deutsch](./README.de.md) | [Português](./README.pt.md) | [Русский](./README.ru.md) | [日本語](./README.ja.md) | [한국어](./README.ko.md)

O EpoCanvas Docs é o site de documentação oficial do projeto EpoCanvas. É construído com Astro 5 e Starlight e traz de origem uma disposição de leitura em três colunas, pesquisa de dois modos e conteúdo multilingue completo. Todo o conteúdo é escrito em Markdown normal e publicado no Cloudflare Pages.

**Site online**: [https://docs.epocanvas.com](https://docs.epocanvas.com) (réplica: [https://epocanvas-docs.pages.dev](https://epocanvas-docs.pages.dev))

## Pré-visualização

![Página inicial da documentação do EpoCanvas Docs](./public/images/canvas/ui-home-landing.png)

O site usa uma disposição de três colunas: navegação por categorias à esquerda, conteúdo do artigo ao centro e índice da página atual à direita. O tema escuro é o predefinido, segue a preferência do sistema e pode ser alternado manualmente na barra superior.

## Funcionalidades

- **Disposição de leitura em três colunas** — a largura do conteúdo é limitada para leituras longas; a barra lateral mantém a posição de rolagem ao mudar de página, e o índice à direita destaca a secção atual durante a rolagem.
- **Pesquisa de dois modos** — o campo de pesquisa na barra superior encontra correspondências na página atual, enquanto `Ctrl+K` / `Cmd+K` abre uma janela de pesquisa em todo o site baseada no Pagefind. O índice é gerado durante a compilação e todas as consultas correm no navegador, sem serviços de pesquisa de terceiros — o site também funciona em intranets sem acesso à Internet.
- **Conteúdo multilingue completo** — a interface e o corpo de cada artigo estão disponíveis em 10 idiomas: chinês simplificado (predefinido), chinês tradicional, inglês, japonês, coreano, espanhol, francês, alemão, russo e português. Cada idioma vive no seu próprio prefixo de URL (p. ex. `/pt/`), e as páginas sem tradução mostram a versão chinesa em vez de um 404.
- **Extensões de Markdown** — quatro tipos de blocos de aviso (`:::note`, `:::tip`, `:::caution`, `:::danger`), destaque de código com Shiki, etiquetas de nome de ficheiro, destaque de linhas e renderização de diff.
- **Implantação com um comando** — o site compila-se em ficheiros estáticos e publica-se no Cloudflare Pages com um único comando; domínios personalizados e certificados HTTPS são aprovisionados automaticamente.

## Requisitos

- Node.js 20.3+ ou 22+ (mínimo 18.20.8)
- pnpm 10

## Início rápido

```bash
git clone https://github.com/shijianus/epocanvas-docs.git
cd epocanvas-docs
pnpm install
pnpm run dev
```

Abra `http://localhost:4321` no navegador. Enquanto o servidor de desenvolvimento estiver em execução, as alterações em Markdown refletem-se de imediato.

### Comandos

| Comando | Descrição |
| :--- | :--- |
| `pnpm run dev` | Inicia o servidor de desenvolvimento local com recarga dinâmica |
| `pnpm run build` | Compila o site estático para `dist/` e gera o índice de pesquisa |
| `pnpm run preview` | Pré-visualiza o resultado da compilação em local |
| `pnpm run deploy` | Compila e publica no Cloudflare Pages |

## Estrutura do projeto

```text
epocanvas-docs/
├── public/images/canvas/       # Capturas de ecrã e diagramas usados pela documentação
├── src/
│   ├── components/starlight/   # Componentes de Starlight sobrepostos (Header, Sidebar, …)
│   ├── config/navigation.ts    # Configuração da barra de navegação superior
│   ├── content/docs/           # Conteúdo da documentação por idioma (canvas/ = chinês, en/ ja/ … = traduções)
│   ├── styles/custom.css       # Cores do tema e estilos de disposição
│   └── utils/i18n.ts           # Textos da interface e registo de idiomas
├── astro.config.mjs            # Configuração do site: título, sidebar, redirecionamentos
├── AGENTS.md                   # Guia de redação técnica
├── LICENSE
└── package.json
```

## Escrever documentação

1. Crie um novo ficheiro `.md` em `src/content/docs/canvas/`.
2. Acrescente o frontmatter no início do ficheiro:

   ```yaml
   ---
   title: Título do documento
   description: Uma descrição da página numa só frase
   ---
   ```

3. Registe a página no array `sidebar` de `astro.config.mjs`; páginas não registadas não aparecem na navegação.
4. Guarde as imagens em `public/images/canvas/` e referencie-as com um caminho absoluto:

   ```markdown
   ![texto alternativo](/images/canvas/a-sua-imagem.png)
   ```

Execute `pnpm run build` antes de submeter para confirmar que o site compila sem erros.

## Implantação

O site está alojado no Cloudflare Pages:

- **Publicação local** — execute `wrangler login` uma vez para autorizar; depois, `pnpm run deploy` compila e publica o site.
- **Domínio personalizado** — na consola da Cloudflare, abra o projeto de Pages `epocanvas-docs` e acrescente o domínio em *Custom domains*. O registo CNAME e o certificado SSL são aprovisionados automaticamente.

## Contribuir

Issues e pull requests são bem-vindos. Execute `pnpm run build` em local e confirme que passa antes de submeter um PR.

## Licença

[MIT](./LICENSE)
