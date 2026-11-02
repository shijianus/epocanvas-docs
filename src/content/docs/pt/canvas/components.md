---
title: Componentes de interface e desenvolvimento personalizado
description: "Arquitetura dos componentes de interface do EpoCanvas Docs: mecanismo de substituição de componentes do Starlight, responsabilidades e fluxo de dados dos componentes personalizados, e cuidados a ter no desenvolvimento adicional."
---

A interface do **EpoCanvas Docs** não foi construída do zero: baseia-se nos componentes nativos do Starlight com **substituições dirigidas**. Mantém o esqueleto de página e o processamento de conteúdo do Starlight e substitui os componentes de apresentação — barra superior, barra lateral, índice, pesquisa, etc. — para obter o layout de três colunas e as interações desejadas. Esta página explica a estrutura deste sistema de componentes e como modificá-lo.

---

## Mecanismo de substituição de componentes

Registe as substituições em `components` de `astro.config.mjs`, como abaixo; a configuração atual define a lista completa.

```javascript
// astro.config.mjs (excerto)
components: {
  Header: './src/components/starlight/Header.astro',
  MobileMenuToggle: './src/components/starlight/MobileMenuToggle.astro',
  Sidebar: './src/components/starlight/Sidebar.astro',
  TableOfContents: './src/components/starlight/TableOfContents.astro',
  PageTitle: './src/components/starlight/PageTitle.astro',
  TwoColumnContent: './src/components/starlight/TwoColumnContent.astro',
  Search: './src/components/starlight/Search.astro',
  Pagination: './src/components/starlight/Pagination.astro',
  SkipLink: './src/components/starlight/SkipLink.astro',
},
```

As substituições registadas têm prioridade no build. Os restantes componentes mantêm a implementação nativa do Starlight.

---

## Responsabilidades dos componentes personalizados

Os ficheiros estão em `src/components/starlight/`; seguem-se as funções principais.

| Ficheiro do componente | Responsabilidade |
| :--- | :--- |
| `Header.astro` | Todo o conteúdo da barra superior: logótipo, campo de pesquisa, navegação principal, emblema de versão, seletor de idioma, alternador de tema, entradas para GitHub e Telegram |
| `Search.astro` | Pesquisa em dois modos: pesquisa dentro da página na barra superior (realce e contagem) + janela modal de pesquisa em todo o site com `Ctrl+K` (UI do Pagefind) |
| `Pagination.astro` | Cartões de navegação "anterior / seguinte" no rodapé: bordas finas, títulos na cor do tema, setas diagonais ↙/↘ a indicar o sentido da navegação |
| `TwoColumnContent.astro` | Esqueleto de duas colunas para o corpo do texto e o índice à direita; controla a largura fixa da coluna direita e a rolagem |
| `TableOfContents.astro` | Título "Nesta página", ícone e lista do índice; filtra o próprio título da página |
| `PageTitle.astro` | Título grande da página (obtido do `title` do Frontmatter) e data de "última atualização" |
| `Sidebar.astro` | Encapsulamento fino: reutiliza o `SidebarPersister` nativo do Starlight para manter a posição de rolagem da barra lateral ao mudar de página |
| `SkipLink.astro` | Mostra um link de salto ao receber foco do teclado e move o foco para o título `_top` |
| `MobileMenuToggle.astro` | Abre e fecha a barra lateral móvel, sincroniza o estado e fecha com Esc devolvendo o foco |

---

## Fluxo de dados: três ficheiros de configuração comandam toda a interface

Os componentes personalizados não contêm dados de negócio; o conteúdo da interface é comandado por três ficheiros de configuração:

```text
astro.config.mjs ──→ array locales + sidebar ──→ Sidebar.astro renderiza o diretório à esquerda (cada idioma usa a respetiva etiqueta traduzida)
src/config/navigation.ts ──→ navigationConfig ──→ Header.astro renderiza a navegação superior e o realce (os links recebem automaticamente o prefixo do idioma)
src/utils/i18n.ts ──→ dicionário UI_TRANSLATIONS ──→ cada componente obtém os termos no idioma atual no momento do build
```

- O **diretório à esquerda** obedece apenas à declaração `sidebar` em `astro.config.mjs`; qualquer documento novo tem de ser registado aí; o campo `translations` de cada entrada fornece o texto do menu em 10 idiomas;
- O texto de cada item da **navegação superior** é obtido do dicionário `i18n.ts` através de `labelKey`; a função `match` determina que botão fica realçado na página atual (o prefixo do idioma é removido antes da correspondência);
- Os **textos da interface** (marcador de posição do campo de pesquisa, título "Nesta página", avisos do alternador de tema, etc.) são gerados por cada componente, no momento do build, chamando `getTranslation(key, lang)` para o idioma correspondente; não há scripts de substituição em tempo de execução na página.

Em resumo: para alterar o conteúdo da interface, procure primeiro o ficheiro de configuração correspondente; só é preciso tocar no código-fonte dos componentes para alterar a aparência (espaçamentos, cores, ícones).

---

## Detalhes de implementação de cada componente

### PageTitle: título da página e data real de atualização

O título da página vem do `title` do Frontmatter, por isso **não acrescente um título de nível 1 com `#` no corpo do texto**. Com `lastUpdated: true` em `astro.config.mjs`, sem uma data de substituição no Frontmatter, o build lê a data do último commit do Git que alterou esse ficheiro. Não é a data de cada commit do repositório nem de cada build; alterar outros ficheiros não atualiza a data desta página.

:::caution
Um documento novo ainda sem commit não tem histórico Git disponível e não mostra data. Alterações sem commit num ficheiro existente também não mudam a data do seu commit. Um clone superficial (como `fetch-depth: 1`) pode devolver a data do commit no limite do histórico truncado ou não devolver data; não equivale ao histórico completo. Para datas exatas, use todo o histórico Git (`fetch-depth: 0` no CI). Uma falha na leitura da data não faz falhar o build.
:::

### Sidebar: implementação da memória da posição de rolagem

`Sidebar.astro` reutiliza o `SidebarPersister` do Starlight para restaurar a posição de deslocamento entre páginas. `MobileMenuToggle.astro` gere o estado e o foco do menu móvel.

### TableOfContents: geração do índice da página

Os dados do índice são gerados pelo Starlight no momento do build ao analisar os títulos do corpo do texto (`##` e `###`); o componente apenas filtra o próprio título da página e renderiza. O realce durante a rolagem é feito no navegador pelo elemento personalizado `starlight-toc`, sem depender de qualquer framework.

### TwoColumnContent: fonte única para a largura da coluna direita

A largura da coluna do índice à direita é fixada em `20rem` sob `@media (min-width: 72rem)` (`21rem` em ecrãs ultra-largos a partir de `90rem`), e a largura máxima da área do corpo do texto subtrai em consequência a largura da coluna direita. Para ajustar essa largura, basta alterar este único ficheiro; não faça sobreposições espalhadas por outras folhas de estilo.

### Header: navegação, tema e idioma

- Os botões de navegação são renderizados percorrendo `navigationConfig`; o estilo ativo é determinado pelo valor devolvido pela função `match`, e os links recebem automaticamente o prefixo do idioma atual através de `localizedHref()`;
- A alternância de tema grava a chave `starlight-theme` no LocalStorage; ao carregar a página, o tema inicial é decidido pela ordem "escolha local → preferência do sistema";
- Cada item do menu pendente de idiomas é um link real para a versão da página atual nesse idioma; clicar navega imediatamente, sem estado adicional guardado;
- Os ícones do GitHub e do Telegram à direita da barra superior estão definidos em `src/components/starlight/Header.astro`; alterar um endereço significa editar esse ficheiro. O Telegram aponta para a página da conta `@epocanvas` e a dica de ferramenta é a cadeia `social.telegram`. A entrada `social` em `astro.config.mjs` controla o outro conjunto de ícones no fim da barra lateral; os dois não interferem entre si.

### Search: pesquisa em dois modos

Um único componente implementa dois sistemas de pesquisa (ver [Pesquisa em texto completo e atalhos de teclado](/canvas/search-engine/)):

1. **Pesquisa dentro da página**: campo de entrada na barra superior; Enter salta entre os trechos correspondentes na página atual, com realce feito por marcação de script;
2. **Pesquisa em todo o site**: janela modal `<dialog>` + UI predefinida do Pagefind, com o índice gerado na fase `pnpm run build`.

O campo de pesquisa na página só aparece a partir de `64rem`; abaixo fica o botão global. Use Localizar na página do browser para o artigo atual. Se as capturas diferirem, prevalece a interface atual.

### Pagination: cartões de navegação

Os dados de anterior/seguinte são calculados pelo Starlight no momento do build conforme a ordem da `sidebar` (`Astro.locals.starlightRoute.pagination`); o componente apenas renderiza: dois cartões de largura igual, bordas finas sem sombra, títulos na cor do tema, e setas diagonais ↙ / ↘ que se deslocam no sentido da navegação ao passar o cursor. As setas são caminhos SVG inline e espelham automaticamente a direção se o site for usado em idiomas RTL.

---

## Cuidados no desenvolvimento adicional

:::caution
Substituir componentes significa abdicar das atualizações futuras dos componentes nativos do Starlight. Ao atualizar a versão do Starlight, os props dos componentes e a estrutura de `Astro.locals.starlightRoute` podem mudar; após a atualização é obrigatório fazer testes de regressão aos componentes substituídos.
:::

- **Para alterar estilos, use primeiro variáveis CSS**: cores, tipos de letra e dimensões de layout estão concentrados nas variáveis `:root` de `src/styles/custom.css`; ver [Configuração do site e personalização de estilos](/canvas/configuration/); a maioria das personalizações não exige tocar nos componentes;
- **Só toque nos componentes para alterar interações**: ao acrescentar botões ou ajustar a estrutura, obtenha os textos da interface com `getTranslation(key, lang)` e complete as entradas dos 10 idiomas em `i18n.ts`; os idiomas em falta recuem para a exibição em chinês;
- **Depois de alterar, valide sempre localmente**: use `pnpm run dev` para verificar as interações e `pnpm run verify` para confirmar que os tipos e o build passam (comandos locais em [FAQ e solução de problemas](/canvas/troubleshooting/)).

Para as operações de personalização mais comuns, consulte diretamente [Receitas de personalização comuns](/canvas/recipes/).
