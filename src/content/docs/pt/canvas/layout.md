---
title: Layout da página e experiência de leitura
description: Descrição do layout de três colunas do EpoCanvas Docs, dos detalhes de interação de cada zona da interface, dos modos de tema claro/escuro e da experiência responsiva em vários dispositivos.
---

Para proporcionar aos leitores uma experiência de leitura confortável e eficiente, o **EpoCanvas Docs** adota um layout de página clássico e claro de três colunas. Ao folhear artigos longos, o leitor consegue perceber a qualquer momento "onde se encontra dentro do site" e "que secção do artigo está a ler".

---

## Descrição das zonas da interface

Ao abrir qualquer documento, a página divide-se em quatro zonas funcionais principais:

![Imagem anotada da interface de leitura de três colunas do EpoCanvas Docs: ① barra de navegação superior ② índice à esquerda ③ corpo do texto ao centro ④ índice da página](/images/canvas/ui-layout-annotated.png)

*Figura: imagem anotada do layout de três colunas, usando como exemplo a página "Regras de renderização em detalhes". ① barra de navegação global superior; ② índice de categorias à esquerda; ③ zona de leitura do corpo do texto ao centro; ④ esquema do "índice da página" à direita. As quatro zonas estão assinaladas na imagem com molduras e números.*

![Diagrama das zonas de layout do EpoCanvas Docs](/images/canvas/docs-layout-3tier.svg)

*Figura: esquema estrutural do layout de três colunas, com o nome e a função de cada zona assinalados.*

### 1. Barra de navegação global superior (Header)

Situada no topo da página, fixa e flutuante, permanece sempre visível ao fazer scroll para baixo, com uma altura de `3.5rem`. De esquerda para direita, a barra superior contém os seguintes elementos (ver imagem anotada abaixo):

![Close-up anotado dos elementos da barra superior: ① Logo ② campo de pesquisa ③ navegação principal ④ emblema de versão ⑤ troca de idioma ⑥ troca de tema ⑦ GitHub ⑧ Telegram](/images/canvas/ui-topnav-annotated.png)

*Figura: close-up anotado dos elementos da barra superior. ① Logo e nome do site; ② campo de pesquisa global; ③ grupo de botões da navegação principal; ④ emblema de versão; ⑤ seletor de idioma; ⑥ alternância do tema claro/escuro; ⑦ acesso ao repositório GitHub; ⑧ acesso à comunidade Telegram.*

- **Logo e título do site (①)**: à esquerda são apresentados o ícone do EpoCanvas e o nome do projeto; clicar regressa rapidamente à página inicial do site de documentação.
- **Campo de pesquisa global (②)**: escreva palavras-chave no campo para procurar diretamente no conteúdo da página atual; prima `Ctrl+K` / `Cmd+K` para abrir a janela de pesquisa de todo o site, ver [Pesquisa de texto completo e atalhos de teclado](/canvas/search-engine/).
- **Botões de navegação principal (③)**: fornecem atalhos para funções frequentes como "Início", "Produto" e "Início Rápido"; a secção atual fica automaticamente destacada.
- **Emblema de versão (④)**: mostra o número da versão de publicação correspondente à documentação atual (por exemplo, `v1.3.1`); clicar permite consultar o registo detalhado de atualizações no GitHub.
- **Seletor de idiomas (⑤)**: clicar no botão de idioma abre as 10 línguas disponíveis; após escolher uma, salta para a versão do mesmo artigo nesse idioma, com a navegação, a barra lateral e o corpo do texto a mudarem em conjunto.
- **Alternância de tema claro/escuro (⑥)**: apresenta os ícones de sol/lua para alternar entre o modo claro e o modo escuro.
- **GitHub e Telegram (⑦⑧)**: os ícones à direita levam respetivamente ao repositório open source e à comunidade técnica.

### 2. Índice de categorias à esquerda (Sidebar)

Situado no lado esquerdo da página (largura de `16.5rem`, cerca de 264 pixels), apresenta todos os capítulos da documentação por níveis lógicos:

- **Grupos recolhíveis**: os documentos estão organizados em grupos como "Visão geral do produto e primeiros passos" e "Funções principais e guia de utilização"; clicar no nome de um grupo expande-o ou recolhe-o.
- **Destaque da página atual**: o artigo que está a ser lido fica destacado no menu à esquerda com um fundo em cápsula na cor do tema.
- **Memória da posição de scroll**: ao saltar de um artigo para outro, a posição da barra de scroll da barra lateral esquerda mantém-se e não salta para o topo.

### 3. Zona central de leitura do corpo do texto (Main Content)

Situada ao centro do ecrã, é a zona principal que contém o conteúdo da documentação técnica:

- **Título da página e data de atualização**: no topo do corpo do texto são apresentados o título do artigo (retirado do campo `title` do Frontmatter) e a data "Última atualização em", para facilitar a avaliação da atualidade do conteúdo.
- **Largura de leitura adequada**: a largura máxima da zona do corpo do texto está limitada a `60rem`, evitando que ecrãs demasiado largos tornem as linhas de texto excessivamente longas e dificultem a leitura.
- **Links de navegação no rodapé**: no final de cada documento são gerados automaticamente os links "anterior" e "seguinte", permitindo uma leitura contínua pela ordem da barra lateral.
- **Botão de copiar nos blocos de código**: cada bloco de código tem um botão de copiar no canto superior direito, para copiar o código original num só clique.

### 4. Esquema do artigo à direita (Table of Contents)

Situado à direita do corpo do texto:

- **Extração automática dos títulos**: ao renderizar a página, o sistema analisa automaticamente os títulos de segundo nível (`##`) e de terceiro nível (`###`) do documento atual e gera o "índice da página".
- **Destaque dinâmico com o scroll**: durante a leitura, à medida que a página é deslocada para baixo, o índice destaca automaticamente a secção que está a ser lida.
- **Salto suave ao clicar**: clicar em qualquer subtítulo do índice faz a página deslizar suavemente até ao parágrafo correspondente e atualiza a âncora na barra de endereço (por exemplo, `#descrição-das-zonas-da-interface`), facilitando a partilha do link.

---

## Modos claro e escuro

O EpoCanvas Docs disponibiliza dois temas, claro e escuro, cujas paletas são definidas na totalidade por variáveis CSS em `src/styles/custom.css`:

- **Segue a preferência do sistema**: ao abrir o site pela primeira vez, este deteta a configuração de modo claro/escuro do sistema operativo e apresenta o tema correspondente.
- **Alternância manual com memória**: clicar no botão de alternância de tema na barra superior permite mudar manualmente; a escolha é guardada no LocalStorage do browser e mantém-se na próxima visita.

![Efeito da interface de leitura em modo claro](/images/canvas/ui-theme-light.png)

*Figura: aspeto do mesmo site em modo claro (usando como exemplo a página de primeiros passos).*

---

## Adaptação responsiva em telemóveis e tablets

Em ecrãs de diferentes dimensões, como telemóveis ou tablets, o layout ajusta-se automaticamente ao tamanho do ecrã:

| Tipo de dispositivo | Largura do ecrã | Comportamento do layout |
| :--- | :--- | :--- |
| **PC de secretária / portátil de ecrã largo** | `>= 1152px` | Apresenta integralmente o layout padrão de três colunas (menu à esquerda + texto ao centro + índice à direita). |
| **Tablet / janela estreita** | `800px ~ 1152px` | O índice à direita fica oculto, mantendo-se o layout de duas colunas (navegação à esquerda + corpo do texto). |
| **Telemóvel** | `< 800px` | As barras laterais recolhem na totalidade e o corpo do texto ocupa toda a largura. Clicar no botão de menu na barra superior desliza a barra lateral em gaveta. |

Quer num monitor ultralargo quer numa consulta rápida no telemóvel, a experiência de leitura mantém-se natural e confortável.
