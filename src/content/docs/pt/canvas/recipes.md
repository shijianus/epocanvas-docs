---
title: Receitas de personalização comuns
description: "Consulta rápida das operações de personalização mais frequentes no EpoCanvas Docs: passos completos para adicionar documentos, botões de navegação, idiomas da interface, cor do tema, logótipo, dimensões do layout e textos de pesquisa."
---

Esta página organiza as necessidades de personalização mais comuns num manual de consulta rápida em que basta seguir os passos. Em cada receita, a localização das alterações está indicada até ao ficheiro concreto; antes de começar, recomenda-se conhecer as [regras de renderização](/canvas/rendering/) e o [sistema de componentes](/canvas/components/), para evitar desencontros.

---

## Receita 1: Adicionar um documento

1. Crie um ficheiro `.md` em `src/content/docs/canvas/` (nome em minúsculas com hífenes, por exemplo `user-guide.md`);
2. Escreva o Frontmatter no início do ficheiro:

   ```yaml
   ---
   title: 用户使用指南
   description: 一句话说明本篇讲什么，会展示在搜索结果与分享卡片里。
   ---
   ```

3. Abra o `astro.config.mjs` e registe-o no grupo pretendido do array `sidebar`:

   ```javascript
   { label: '用户使用指南', link: '/canvas/user-guide/' }
   ```

4. Guarde, confirme na pré-visualização local que aparece no diretório à esquerda e só então execute `pnpm run deploy` para publicar.

:::warning
Se criar apenas o ficheiro sem o registar na `sidebar`, a página é acessível mas não aparece no diretório à esquerda — este é o erro mais comum entre iniciantes.
:::

---

## Receita 2: Adicionar um botão de navegação superior

1. Abra `src/config/navigation.ts` e acrescente uma entrada ao array `navigationConfig`:

   ```typescript
   {
     id: 'blog',
     labelKey: 'nav.blog',
     defaultLabel: '博客',
     href: 'https://blog.epocanvas.com',
     isExternal: true,          // links externos abrem numa nova janela
   },
   ```

2. Abra `src/utils/i18n.ts` e acrescente as traduções de `nav.blog` nos 10 idiomas;
3. Depois de guardar, o novo botão aparece de imediato na barra superior; se for um link interno e precisar de participar no realce da navegação, configure-lhe uma função `match`.

---

## Receita 3: Ajustar as regras de realce da página

Quando uma alteração no caminho da página faz o realce da barra superior ficar errado, modifique a função `match` da entrada correspondente em `navigation.ts`:

```typescript
match: (pathname: string) =>
  pathname === '/canvas/' || pathname.includes('layout'),
```

A regra é: correspondência exata primeiro, `includes` como recurso; os `match` de vários botões não devem ter interseções, senão dois botões podem ficar realçados ao mesmo tempo.

---

## Receita 4: Mudar a cor do tema da marca

1. Abra `src/styles/custom.css`;
2. Modifique o trio de cores principais nos dois blocos, claro (`:root`) e escuro (`:root[data-theme='dark']`):

   ```css
   --sl-color-accent: #10b981;      /* cor principal: botões, estados selecionados */
   --sl-color-accent-low: rgba(16, 185, 129, 0.1);  /* fundo claro do item selecionado */
   --sl-color-accent-high: #047857; /* links e texto destacado */
   ```

3. Depois de guardar, os botões, realces e links de todo o site mudam de cor automaticamente. Alterar apenas um dos blocos faz com que a paleta fique desarticulada no outro tema.

---

## Receita 5: Substituir o logótipo

| Localização | Ficheiro | Utilização |
| :--- | :--- | :--- |
| Esquerda da barra superior | `public/images/logo.svg` | Ícone da barra superior nas páginas internas; o caminho está configurado em `logo.src` no `astro.config.mjs` |
| Imagem grande da página inicial | `src/assets/logo.svg` | Imagem decorativa à direita da página de entrada |

Recomenda-se substituir ambos ao mesmo tempo. O logótipo usa o formato vetorial SVG; definir `logo.replacesTitle` como `true` no `astro.config.mjs` oculta o texto do título e deixa apenas o ícone.

---

## Receita 6: Ajustar as dimensões do layout

Os três elementos do layout estão concentrados no topo de `src/styles/custom.css`:

```css
:root {
  --sl-sidebar-width: 16.5rem;  /* largura do diretório à esquerda */
  --sl-content-width: 60rem;    /* largura máxima do corpo do texto */
  --sl-nav-height: 3.5rem;      /* altura da barra superior */
}
```

:::caution
A largura da coluna do índice à direita não está nestas variáveis; é controlada pelo valor `20rem` em `src/components/starlight/TwoColumnContent.astro` (`21rem` em ecrãs ultra-largos). Ao ajustar a largura da coluna direita, altere em sincronia o `max-width: calc(100% - 20rem)` da área do corpo do texto, no mesmo ficheiro.
:::

---

## Receita 7: Modificar os textos de ajuda do campo de pesquisa

O marcador de posição do campo de pesquisa, as dicas dos botões e outros textos da interface vêm todos do dicionário multilingue em `src/utils/i18n.ts`. Abra o ficheiro e modifique entradas como `search.placeholder` seguindo a estrutura de dois níveis "idioma → chave da entrada":

```typescript
// caminho do ficheiro: src/utils/i18n.ts
export const UI_TRANSLATIONS = {
  'zh-CN': {
    'search.placeholder': '搜索文档与指令...',
    // ...outras entradas deste idioma
  },
  en: {
    'search.placeholder': 'Search documentation...',
    // ...outras entradas deste idioma
  },
  // os restantes 8 idiomas seguem o mesmo princípio
};
```

Os idiomas não alterados recuem automaticamente para o valor predefinido em chinês, sem erros. Depois de guardar, a atualização em tempo real local é visível de imediato, sem necessidade de build.

---

## Receita 8: Adicionar etiquetas de verificação `<head>` ao site

Ao integrar serviços como o Google Search Console ou a Plataforma para Webmasters da Baidu, é preciso injetar etiquetas de verificação no `<head>`. Abra o `astro.config.mjs` e acrescente ao array `head` da configuração do Starlight:

```javascript
head: [
  // configuração favicon existente ...
  {
    tag: 'meta',
    attrs: {
      name: 'google-site-verification',
      content: '验证字符串',
    },
  },
],
```

Depois de guardar e reimplementar, use o botão de verificação fornecido pela plataforma. Para mais configurações de motores de pesquisa após o lançamento, ver [SEO e otimização de desempenho](/canvas/seo/).

---

## Fluxo de verificação universal após qualquer alteração

Independentemente do tipo de personalização, verifique nesta ordem antes de submeter:

```bash
pnpm run dev      # 1. rever o resultado página a página no navegador
pnpm exec astro check && pnpm run build   # 2. verificação de tipos + build completo
pnpm run preview  # 3. pré-visualizar o resultado do build e só publicar depois de confirmar que está tudo correto
```

O modo de publicação está descrito em [Implantação no Cloudflare Pages](/canvas/cloudflare/).
