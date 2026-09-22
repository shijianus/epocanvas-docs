---
title: Navegação superior e roteamento de páginas
description: Configuração da barra de navegação superior do EpoCanvas Docs, regras de destaque dinâmico do caminho atual, emblema de versão externo e configuração de redirecionamentos de links antigos.
---

A barra de navegação superior é o principal caminho de circulação do utilizador entre as várias secções funcionais. O **EpoCanvas Docs** concentra todos os itens de navegação num único ficheiro de configuração: alterar num único ponto faz efeito em todo o site, e inclui de origem um destaque preciso da página atual e um mecanismo de redirecionamento de links antigos.

---

## Centro de configuração da navegação (`src/config/navigation.ts`)

Todos os botões de navegação superiores são mantidos em `src/config/navigation.ts` sob a forma de um array declarativo. A definição dos campos de cada entrada é a seguinte:

```typescript
// Definição das propriedades de um item de navegação
export interface NavItem {
  id: string; // identificador único
  labelKey: string; // nome da chave no dicionário de traduções multilingue
  defaultLabel: string; // texto apresentado por predefinição (como "Início", "Introdução ao produto")
  href: string; // link de destino ou caminho relativo
  match?: (pathname: string) => boolean; // regra que determina se a página atual deve destacar este botão
  badge?: string; // pequeno emblema em cápsula adicional (como o número de versão "v1.2.0")
  isExternal?: boolean; // indica se é um salto para uma página externa (nesse caso abre numa nova janela)
}
```

### Configuração oficial atual (extrato)

```typescript
export const navigationConfig: NavItem[] = [
  {
    id: 'home',
    labelKey: 'nav.home',
    defaultLabel: '首页',
    href: '/',
    match: (pathname: string) => pathname === '/' || pathname === '',
  },
  {
    id: 'docs',
    labelKey: 'nav.docs',
    defaultLabel: '产品说明',
    href: '/canvas/',
    match: (pathname: string) =>
      pathname === '/canvas' ||
      pathname === '/canvas/' ||
      pathname.includes('about') ||
      pathname.includes('layout') ||
      pathname.includes('search-engine') ||
      pathname.includes('i18n') ||
      pathname.includes('navigation'),
  },
  {
    id: 'quickstart',
    labelKey: 'nav.quickstart',
    defaultLabel: '快速上手',
    href: '/canvas/deployment/',
    match: (pathname: string) => pathname.includes('deployment'),
  },
  // Seguem-se ainda guide (normas de escrita), deploy (implantação) e faq (perguntas frequentes)
  // bem como o item externo release, que aponta para os GitHub Releases
];
```

Para acrescentar ou remover itens de navegação basta adicionar ou eliminar entradas neste array; depois de guardar, o servidor de desenvolvimento local atualiza-se automaticamente (hot reload).

---

## Regras de ativação e destaque dinâmico

Se se fizesse apenas um teste simples como `pathname.startsWith('/canvas')`, ao visitar a página de primeiros passos `/canvas/deployment/`, os botões "Introdução ao produto" e "Começar rapidamente" poderiam acender-se ao mesmo tempo, o que seria confuso.

Por isso, cada item de navegação declara a sua própria área de destaque através da função `match`:

- Ao visitar a página inicial `/`, apenas o botão "Início" está ativo;
- Ao visitar documentos normais como `/canvas/layout/` ou `/canvas/about/`, o botão "Introdução ao produto" é ativado;
- Ao entrar em páginas do caminho `deployment`, o botão "Começar rapidamente" é ativado de forma exclusiva;
- O botão no estado ativo tem um fundo em cápsula na cor do tema, em claro contraste com os botões inativos.

Ao acrescentar novas páginas de documentação, lembre-se de acrescentar a palavra-chave do caminho à regra `match` do item de navegação correspondente; caso contrário, a barra superior não destacará corretamente.

---

## Links externos e interação com o emblema de versão

Se um item de navegação apontar para um site externo (por exemplo, a página de Releases do repositório GitHub):

1. Configure `isExternal: true`;
2. O sistema acrescenta automaticamente ao link os atributos de segurança `target="_blank" rel="noopener noreferrer"` e abre-o num novo separador;
3. Junto ao texto aparece um pequeno ícone de seta inclinada para fora (`↗`), a indicar ao leitor que, ao clicar, sairá do site atual.

O emblema de versão é uma cápsula dentro do botão e o texto vem de `CURRENT_DOCS_VERSION` em `src/config/navigation.ts`, que lê diretamente o campo `version` do `package.json`: ao publicar, muda-se apenas o `package.json` e o cabeçalho acompanha sozinho. Clicar no emblema abre a lista de releases do GitHub. O procedimento completo está em [Gestão de versões e fluxos de trabalho automatizados](/canvas/releases/).

---

## Regras de redirecionamento de páginas (`astro.config.mjs`)

Ao longo da iteração do projeto é inevitável ajustar caminhos da documentação. Para que os links antigos guardados nos favoritos dos leitores não se transformem em 404, pode registar a correspondência entre caminhos antigos e novos na tabela `redirects` de `astro.config.mjs`:

```javascript
export default defineConfig({
  redirects: {
    // Após a renomeação semântica dos caminhos dos capítulos do site, todos os links antigos mantêm o redirecionamento
    '/canvas/rule-engine': '/canvas/cloudflare/',
    '/canvas/dns-setup': '/canvas/layout/',
  },
});
```

No build, o Astro gera páginas de redirecionamento automático para estes caminhos; quem visitar o endereço antigo é levado suavemente para o novo, e o peso nos motores de pesquisa é igualmente herdado.
### Por que no site ativo a resposta é 301

As páginas de salto geradas pelo Astro são documentos meta-refresh servidos com estado `200`, que os motores de busca encaram como segunda cópia do destino. O Cloudflare Pages lê um ficheiro `_redirects` na raiz do site antes dos ficheiros estáticos, por isso `cloudflareRedirectsFile()` em `astro.config.mjs` escreve `dist/_redirects` a partir da mesma tabela `legacyRedirects` quando o build termina:

```text
/mail  /canvas/  301
/mail/  /canvas/  301
```

As duas regras só diferem na barra final, porque o Cloudflare compara caminhos de forma exata: um pedido com barra não encontra a regra sem barra e cairia naquela página 200. Um `pnpm run preview` local nunca lê `_redirects` e continua a usar a página do Astro, pelo que os dois mecanismos coexistem.

Registe apenas a forma **sem barra final**: o Astro converte-a em `<caminho antigo>/index.html`, e acrescentar também a variante com barra a `redirects` faz as duas colidirem na mesma rota, o que o build assinala como route collision (na próxima versão maior do Astro passa a erro).
