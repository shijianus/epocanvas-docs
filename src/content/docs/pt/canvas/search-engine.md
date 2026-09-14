---
title: Pesquisa de texto completo e atalhos de teclado
description: "Guia de utilização da pesquisa de duplo modo do EpoCanvas Docs: pesquisa dentro da página pela barra superior e janela de pesquisa de todo o site com Ctrl+K, além do mecanismo de índice estático local."
---

Ao consultar um grande volume de documentação técnica, encontrar rapidamente a opção de configuração ou o parâmetro pretendido é fundamental. O **EpoCanvas Docs** inclui uma **pesquisa de duplo modo**: o campo de pesquisa da barra superior serve para localizar rapidamente conteúdo na página atual, e a janela `Ctrl+K` serve para pesquisar em todos os documentos do site. Ambas as pesquisas são executadas localmente no browser, sem necessidade de qualquer serviço de backend, e continuam a funcionar num site alojado numa intranet sem acesso à Internet.

---

## Quando usar cada modo de pesquisa?

| Cenário | Qual usar | Como fazer |
| :--- | :--- | :--- |
| Sabe que o texto está **neste artigo atual** | Pesquisa na página | Clicar diretamente no campo de pesquisa da barra superior e escrever as palavras-chave |
| Não sabe **em que artigo** está o conteúdo e precisa de pesquisar em todo o site | Pesquisa em todo o site | Premir `Ctrl + K` (`Cmd + K` no Mac) |

---

## Pesquisa na página: campo de pesquisa da barra superior

Clique no campo de pesquisa no centro superior da página (ícone de lupa) e escreva diretamente as palavras-chave:

![Imagem anotada da pesquisa na página pela barra superior: ① campo de entrada ② contador de correspondências ③ saltos para cima/baixo ④ limpar ⑤ destaque na página](/images/canvas/ui-inpage-search.png)

*Figura: efeito real anotado após escrever "部署" ("implantação") no campo de pesquisa da barra superior. ① campo de entrada na barra superior; ② contador de correspondências (por exemplo `3/9`); ③ botões de salto para a correspondência anterior / seguinte; ④ botão de limpar; ⑤ todo o texto correspondente na página atual fica automaticamente destacado.*

### Escrever palavras-chave

Suporta expressões em português (como "implantação", "componente"), palavras em inglês e fragmentos de código (como `pnpm`, `astro.config.mjs`). Durante a escrita, todo o texto correspondente na página atual recebe imediatamente um fundo de destaque e a página desloca-se automaticamente para a primeira correspondência.

### Saltar entre resultados

- Premir <kbd>Enter</kbd> ou clicar na seta para baixo: salta para a correspondência seguinte;
- Premir <kbd>Shift + Enter</kbd> ou clicar na seta para cima: volta à correspondência anterior;
- O campo de pesquisa mostra em tempo real o contador de progresso no formato `N/M` (por exemplo `3/9`), permitindo acompanhar o avanço da leitura.

### Limpar a pesquisa e restaurar a página

Prima <kbd>Esc</kbd> ou clique no botão `×` para limpar todos os destaques e restaurar o aspeto original da página.

---

## Pesquisa em todo o site: janela Ctrl+K

Esteja na página que estiver, prima o atalho <kbd>Ctrl</kbd> + <kbd>K</kbd> (<kbd>Cmd</kbd> + <kbd>K</kbd> no Mac) ou clique no emblema `Ctrl K` à direita do campo de pesquisa, e uma janela de pesquisa global surge no centro do ecrã:

![Imagem anotada da janela de pesquisa em todo o site: ① emblema de acionamento ② campo de pesquisa ③ lista de resultados ④ barra de atalhos de teclado](/images/canvas/ui-search-modal.png)

*Figura: efeito real anotado após escrever "部署" ("implantação") na janela. ① emblema `Ctrl K` à direita do campo de pesquisa (clicar nele também abre a janela); ② campo de entrada da pesquisa; ③ lista de resultados agrupada por documento, com as palavras encontradas destacadas; ④ barra inferior com sugestões de atalhos de teclado.*

### Escrever palavras-chave

Suporta expressões em português (como "implantação", "componente"), palavras em inglês e fragmentos de código (como `pnpm`, `astro.config.mjs`). Os resultados cujo título contém a palavra pesquisada aparecem primeiro.

### Percorrer a lista de resultados

Os resultados estão agrupados por documento; cada entrada mostra o título do documento, a secção onde se encontra e uma pré-visualização do contexto com a palavra-chave, que fica destacada. Clicar no título de um grupo expande ou recolhe os parágrafos encontrados nesse documento.

### Concluir todo o processo com o teclado

- <kbd>↑</kbd> <kbd>↓</kbd>: move a seleção entre os resultados;
- <kbd>Enter</kbd>: abre o resultado selecionado e salta para o parágrafo correspondente;
- <kbd>Esc</kbd>: fecha a janela.

Todo o processo dispensa o rato.

---

## Porque é que a pesquisa é tão rápida?

![Diagrama comparativo do mecanismo de pesquisa de duplo modo do EpoCanvas Docs: à esquerda a pesquisa na página pela barra superior (percursão do DOM com destaque, contagem em tempo real e scroll suave), à direita a janela de pesquisa em todo o site (acionada por Ctrl+K, correspondência em segundos com índice invertido em memória via Pagefind WASM)](/images/canvas/docs-search-flow.svg)

*Figura: comparação do funcionamento da pesquisa de duplo modo. À esquerda, a localização rápida de palavras-chave na página pela barra superior; à direita, a pesquisa em todo o site baseada no índice estático do Pagefind WASM. Ambas correm inteiramente localmente no browser.*

Em muitos sites, a pesquisa na documentação envia o pedido para uma base de dados num servidor remoto, e com uma rede lenta não passa de um círculo a girar.

O EpoCanvas Docs utiliza a solução de pesquisa estática local **Pagefind**:

1. **Extração do índice no build**: ao executar `pnpm run build`, o sistema recolhe automaticamente o conteúdo de cada documento e gera um conjunto de ficheiros de índice estático comprimidos.
2. **Download leve a pedido**: ao escrever no campo de pesquisa, o browser apenas descarrega os fragmentos de índice correspondentes aos caracteres introduzidos (de apenas alguns KB a algumas dezenas de KB).
3. **Correspondência local imediata**: a correspondência e a ordenação são feitas inteiramente no browser, pelo que não há latência de rede e tudo funciona por completo mesmo numa intranet sem acesso à Internet.

---

## Dicas para usar a pesquisa

- **Divisão em palavras**: para obter resultados mais precisos, escreva várias palavras separadas por espaços (por exemplo, `Cloudflare domínio`).
- **Dar prioridade aos títulos**: os títulos dos documentos e das secções têm o maior peso na ordenação; os resultados cujo título contém a palavra pesquisada aparecem primeiro.
- **Limitações do modo de desenvolvimento**: o servidor de desenvolvimento iniciado com `pnpm run dev` não reconstrói em tempo real o índice de todo o site; para que um artigo recentemente escrito apareça na pesquisa global, é preciso executar primeiro `pnpm run build`. A pesquisa na página não está sujeita a esta limitação.
