---
title: Pesquisa de texto completo e atalhos de teclado
description: "Guia de utilização da pesquisa de duplo modo do EpoCanvas Docs: pesquisa dentro da página pela barra superior e janela de pesquisa de todo o site com Ctrl+K, além do mecanismo de índice estático local."
---

O **EpoCanvas Docs** oferece pesquisa na página e em todo o site. A partir de `64rem` de largura, a barra mostra o campo de pesquisa na página; abaixo disso, apenas o botão de pesquisa global. Esta usa o índice estático do Pagefind, sem backend de pesquisa.

---

## Quando usar cada modo de pesquisa?

| Cenário | Qual usar | Como fazer |
| :--- | :--- | :--- |
| O texto está no **artigo atual** | Pesquisa na página | Campo superior a partir de `64rem`; em ecrãs estreitos, Localizar na página do browser |
| Não sabe **em que artigo** está o texto | Pesquisa global | Botão da barra ou `Ctrl + K` (`Cmd + K` no Mac) |

---

## Pesquisa na página: campo de pesquisa da barra superior

Estas instruções aplicam-se a larguras de pelo menos `64rem`. Escreva no campo superior. Abaixo dessa largura, o campo, o contador e os controlos ficam ocultos; resta apenas a lupa que abre a pesquisa global. Para o artigo atual, use Localizar na página do browser.

![Imagem anotada da pesquisa na página pela barra superior: ① campo de entrada ② contador de correspondências ③ saltos para cima/baixo ④ limpar ⑤ destaque na página](/images/canvas/ui-inpage-search.png)

*Figura: captura existente para referência. Atualmente, o contador e os controlos anterior/seguinte e limpar aparecem abaixo do campo, não dentro, e ficam ocultos em ecrãs estreitos. Se as posições, os números ou o layout diferirem, siga a interface real.*

### Escrever palavras-chave

Escreva palavras ou código como `pnpm` e `astro.config.mjs`. As correspondências visíveis no corpo ficam destacadas e a página salta para a primeira. A navegação e o conteúdo oculto ficam excluídos.

### Saltar entre resultados

- Com o campo focado, <kbd>Enter</kbd> ou o botão de seta para baixo: correspondência seguinte;
- Com o campo focado, <kbd>Shift + Enter</kbd> ou o botão de seta para cima: correspondência anterior;
- Por baixo do campo, o contador `N/M` (por exemplo `3/9`) mostra a correspondência atual e o total.

### Limpar a pesquisa e restaurar a página

Com o foco no campo, prima <kbd>Esc</kbd>, ou clique em `×`, para apagar a consulta e os destaques.

---

## Pesquisa em todo o site: janela Ctrl+K

Prima <kbd>Ctrl</kbd> + <kbd>K</kbd> (<kbd>Cmd</kbd> + <kbd>K</kbd> no Mac) ou o botão de pesquisa da barra. Em ecrãs largos mostra o atalho; abaixo de `64rem`, uma lupa. Ambos abrem a pesquisa global, não um campo de pesquisa na página.

![Imagem anotada da janela de pesquisa em todo o site: ① emblema de acionamento ② campo de pesquisa ③ lista de resultados ④ barra de atalhos de teclado](/images/canvas/ui-search-modal.png)

*Figura: captura existente do campo e dos resultados. Se os botões ou atalhos diferirem do layout atual, siga a interface real e as instruções abaixo. Atualmente, Tab foca os links; as sugestões inferiores podem ficar ocultas em ecrãs estreitos.*

### Escrever palavras-chave

Introduza palavras no idioma da página ou código como `pnpm` e `astro.config.mjs`. O Pagefind ordena por relevância; uma correspondência no título não garante a primeira posição.

### Percorrer a lista de resultados

Os resultados agrupam-se por documento, com título, excerto e subresultados de secções disponíveis. Títulos e subresultados são links: o título abre o documento e a secção segue a sua âncora. O título não é um controlo para expandir ou recolher.

### Concluir todo o processo com o teclado

- <kbd>Tab</kbd> / <kbd>Shift + Tab</kbd>: mover o foco entre campos, botões e links de resultados;
- Num link de resultado focado, <kbd>Enter</kbd>: abrir o link; os links de secção seguem a sua âncora;
- <kbd>Esc</kbd>: fecha a janela.

A interface atual do Pagefind não seleciona resultados com <kbd>↑</kbd> / <kbd>↓</kbd> nem expande passagens ao clicar no título de um documento.

---

## Porque é que a pesquisa é tão rápida?

![Diagrama comparativo do mecanismo de pesquisa de duplo modo do EpoCanvas Docs: à esquerda a pesquisa na página pela barra superior (percursão do DOM com destaque, contagem em tempo real e scroll suave), à direita a janela de pesquisa em todo o site (acionada por Ctrl+K, correspondência em segundos com índice invertido em memória via Pagefind WASM)](/images/canvas/docs-search-flow.svg)

*Figura: comparação do funcionamento da pesquisa de duplo modo. À esquerda, a localização rápida de palavras-chave na página pela barra superior; à direita, a pesquisa em todo o site baseada no índice estático do Pagefind WASM. Ambas correm inteiramente localmente no browser.*

Em muitos sites, a pesquisa na documentação envia o pedido para uma base de dados num servidor remoto, e com uma rede lenta não passa de um círculo a girar.

O EpoCanvas Docs utiliza a solução de pesquisa estática local **Pagefind**:

1. **Extração do índice no build**: ao executar `pnpm run build`, o sistema recolhe automaticamente o conteúdo de cada documento e gera um conjunto de ficheiros de índice estático comprimidos.
2. **Download a pedido**: o browser carrega do site o código de pesquisa e os fragmentos necessários do índice. A primeira carga ou a falta de cache continuam a exigir pedidos de rede.
3. **Pesquisa no browser**: depois de carregar o índice, a pesquisa e a ordenação são locais. A intranet também tem de servir os ficheiros de pesquisa; isto não significa que a primeira visita funcione sem rede.

---

## Dicas para usar a pesquisa

- **Divisão em palavras**: para obter resultados mais precisos, escreva várias palavras separadas por espaços (por exemplo, `Cloudflare domínio`).
- **Use termos específicos**: títulos e nomes de secções ajudam a restringir a pesquisa; a ordem é determinada pelo Pagefind segundo a relevância.
- **Limitações do modo de desenvolvimento**: o índice de todo o site só é gerado na compilação, e no servidor de desenvolvimento iniciado com `pnpm run dev` a caixa de diálogo `Ctrl+K` não carrega o índice, pelo que a pesquisa global não está disponível. Para testá-la, execute `pnpm run build` e depois `pnpm run preview`. A pesquisa na página não está sujeta a esta limitação.
