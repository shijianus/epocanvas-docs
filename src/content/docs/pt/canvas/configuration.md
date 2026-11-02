---
title: Configuração do site e personalização de estilos
description: Guia de edição do ficheiro de configuração principal do EpoCanvas Docs, ajuste do menu da barra lateral, substituição do logótipo da marca e personalização das cores do tema.
---

Se quiser usar o **EpoCanvas Docs** como site de documentação da sua equipa, ou ajustar o título do site, o logótipo, a estrutura de diretórios e a cor do tema, esta secção apresenta os pontos de personalização mais comuns. Depois de guardar qualquer alteração de configuração, o servidor de desenvolvimento local aplica automaticamente a atualização em tempo real (hot reload), visível de imediato no navegador.

---

## 1. Informações básicas do site (`astro.config.mjs`)

O ficheiro `astro.config.mjs` na raiz do projeto é o ficheiro de configuração principal de todo o site de documentação. As opções diretamente relacionadas com as informações do site são as seguintes (os comentários indicam quando devem ser alteradas):

```javascript
import { unified } from '@astrojs/markdown-remark';

// Altere o SITE_ORIGIN existente e o URL Sitemap de public/robots.txt em conjunto.
// site e hreflangXDefault() partilham este valor; não altere apenas site.
const SITE_ORIGIN = 'https://docs.epocanvas.com';

export default defineConfig({
  // Domínio de produção do site, afeta os links de SEO e a geração do sitemap
  site: SITE_ORIGIN,

  markdown: {
    processor: unified({
      rehypePlugins: [rehypeWrapTables, rehypeLocalizeInternalLinks, rehypeLocalizeDiagramImages, rehypeLocalizeAsides, rehypeLocalizeFootnotes],
    }),
  },

  integrations: [
    starlight({
      // Título do site, exibido no separador do navegador e na barra superior
      title: 'EpoCanvas Docs',
      // Descrição do site, usada no resumo dos resultados dos motores de pesquisa
      description: 'EpoCanvas 全栈技术、架构与产品运维指南',

      // Caminho da imagem do logótipo no lado esquerdo da barra superior
      logo: {
        src: './public/images/logo.svg',
        replacesTitle: false, // ao definir como true, mostra apenas o logótipo e oculta o texto do título
      },

      // Links sociais na barra lateral do Starlight.
      // Os URL GitHub/Telegram do cabeçalho estão definidos à parte em src/components/starlight/Header.astro.
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/shijianus/epocanvas-docs' },
      ],

      // Entrada da folha de estilos personalizada
      customCss: ['./src/styles/custom.css'],

      // Diretório da barra lateral (ver secção seguinte)
      sidebar: [/* ... */],
    }),
  ],

  // Tabela de redirecionamento de caminhos antigos, para evitar links quebrados
  redirects: { '/mail': '/canvas/' },
});
```

No Astro 7, este site configura `markdown.processor` com `unified()` de `@astrojs/markdown-remark` 7.3.5. Os `rehypePlugins` acima reutilizam os plugins existentes em `astro.config.mjs`; mantenha as respetivas definições de funções ao alterar a configuração.

---

## 2. Como modificar o menu de diretórios da barra lateral?

O menu de categorias da documentação, à esquerda, é controlado pelo array `sidebar` na configuração do Starlight em `astro.config.mjs`:

```javascript
sidebar: [
  // Grupo um: visão geral do produto
  {
    label: '产品概览与入门',       // nome do grupo
    items: [
      { label: '产品简介与核心价值', link: '/canvas/' },
      { label: '快速上手 (3分钟运行)', link: '/canvas/deployment/' },
    ],
  },
  // Grupo dois: pode adicionar os seus próprios grupos de negócio
  {
    label: '用户指南',
    items: [
      { label: 'Guia de escrita e formatação em Markdown', link: '/canvas/markdown/' },
    ],
  },
];
```

- **`label`**: nome da categoria ou do artigo exibido na barra lateral; pode diferir do `title` do Frontmatter (por exemplo, usando um nome de exibição mais curto);
- **`link`**: caminho de acesso ao artigo, correspondente à localização do ficheiro em `src/content/docs/`.

:::caution
Um novo ficheiro `.md` só aparece no menu de diretórios da esquerda se for registado no array `sidebar`; criar o ficheiro sem o registar é o erro mais comum entre iniciantes.
:::

---

## 3. Personalizar a cor do tema da marca (`src/styles/custom.css`)

Todas as cores do site são controladas por variáveis CSS, definidas em `src/styles/custom.css`. No topo do ficheiro estão as variáveis do modo claro, e o bloco `:root[data-theme='dark']` contém as variáveis do modo escuro:

```css
:root {
  /* Cor principal da marca (modo claro) */
  --sl-color-accent: #2563eb;
  --sl-color-accent-low: rgba(37, 99, 235, 0.08);  /* fundo claro do item selecionado */
  --sl-color-accent-high: #1d4ed8;                  /* links e texto destacado */

  /* Cor de fundo da página e linhas divisórias */
  --sl-color-bg: #ffffff;
  --sl-color-hairline: #e2e8f0;
}

:root[data-theme='dark'] {
  /* O modo escuro usa variáveis com o mesmo nome; basta substituir os valores das cores */
  --sl-color-accent: #3b82f6;
  --sl-color-accent-low: rgba(59, 130, 246, 0.12);
  --sl-color-accent-high: #60a5fa;

  --sl-color-bg: #0b0f19;
  --sl-color-hairline: #1e293b;
}
```

Por exemplo, para mudar a cor principal de todo o site para um verde vibrante, basta alterar `--sl-color-accent` nos dois blocos (claro e escuro) para valores da gama `#10b981`; botões, estados de seleção e links mudam de cor automaticamente.

As dimensões do layout também são definidas de forma centralizada no topo deste ficheiro:

```css
:root {
  --sl-sidebar-width: 16.5rem;  /* largura do diretório à esquerda */
  --sl-content-width: 60rem;    /* largura máxima do corpo do texto */
  --sl-nav-height: 3.5rem;      /* altura da barra superior */
}
```

---

## 4. Substituir o logótipo do site

1. Prepare um logótipo vetorial `.svg` válido. Estes passos aplicam-se apenas a SVG; não mude a extensão de um PNG para `.svg`.
2. Substitua separadamente `public/images/logo.svg` para a barra superior e `src/assets/logo.svg` para a imagem da página inicial.
3. Atualize o navegador no servidor de desenvolvimento local e verifique os dois logótipos. O site publicado só muda após um novo build e uma implantação.

:::tip
Os dois logótipos têm utilizações diferentes: `public/images/logo.svg` é usado na barra superior e `src/assets/logo.svg` é usado na imagem decorativa grande à direita da página inicial; recomenda-se substituir ambos.
:::
