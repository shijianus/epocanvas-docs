---
title: Guia de escrita e formatação em Markdown
description: "Normas de armazenamento dos ficheiros de documentação do EpoCanvas Docs, requisitos dos metadados de cabeçalho (Frontmatter) e lista completa de todos os formatos suportados: correspondência entre a forma de escrever e o resultado real de renderização do Markdown básico e das sintaxes estendidas."
---

Acrescentar ou editar documentos no **EpoCanvas Docs** é muito simples. Todo o conteúdo do corpo é escrito com a sintaxe padrão de **Markdown**; quem sabe escrever Markdown pode participar de imediato na escrita e na manutenção da documentação.

Esta página é a lista completa dos formatos suportados em todo o site: a secção 3 enumera item a item os formatos básicos de Markdown e a secção 4 lista as sintaxes estendidas que o site suporta adicionalmente. Cada item traz a correspondência entre "como se escreve" e "como fica renderizado"; o efeito que está a ver agora é o resultado real de renderização.

---

## 1. Onde ficam os ficheiros de documentação?

Todos os ficheiros de documentação ficam no diretório `src/content/docs/` do projeto:

```text
src/content/docs/
├── index.mdx          # Página inicial (landing page) do site
├── canvas/            # Capítulos centrais da documentação (chinês simplificado, idioma predefinido)
│   ├── index.md       # Introdução ao produto
│   ├── deployment.md  # Início rápido
│   ├── layout.md      # Disposição da página
│   ├── ...            # Outros documentos
└── en/ ja/ ...        # Traduções nos outros 9 idiomas; a estrutura de diretórios corresponde inteiramente à da versão chinesa
```

- **Requisitos do nome do ficheiro**: use letras minúsculas e travessões (por exemplo, `quickstart-guide.md`); não inclua caracteres chineses nem espaços. O nome do ficheiro determina o caminho de acesso: `canvas/deployment.md` corresponde a `/canvas/deployment/`.
- **Extensão**: normalmente basta um ficheiro `.md` de texto simples; se precisar de incorporar componentes interativos no artigo (como a grelha de cartões da página inicial), use o formato `.mdx`.
- **Registo na barra lateral**: depois de criar um ficheiro, é preciso registá-lo no array `sidebar` do `astro.config.mjs`, caso contrário não aparece no catálogo da esquerda.
- **Traduções multilingues**: as traduções para outros idiomas ficam em `src/content/docs/<idioma>/`, com a estrutura de subdiretórios idêntica à da versão chinesa (por exemplo, `en/canvas/deployment.md` corresponde ao início rápido em inglês); as páginas que ainda não têm tradução apresentam automaticamente o conteúdo em chinês.

---

## 2. Como escrever os metadados de cabeçalho (Frontmatter)?

No topo de cada documento Markdown tem de constar um bloco de metadados YAML envolvido por três traços `---`:

```yaml
---
title: Início rápido (rodando em 3 minutos)
description: Guia de preparação do ambiente local, instalação de dependências e arranque do servidor do EpoCanvas Docs.
---
```

### Descrição dos campos

| Nome do campo | Obrigatório? | Descrição da função |
| :--- | :--- | :--- |
| `title` | **Obrigatório** | Título principal do artigo. É renderizado como o grande título no topo da página e usado como título do separador do navegador. |
| `description` | Recomendado | Resumo breve do artigo. Serve como texto descritivo nos resultados de pesquisa do navegador e nos cartões de partilha em plataformas sociais. |
| `template` | Apenas na página inicial | Quando definido como `splash`, usa o modelo de página inicial sem barra lateral. |

:::tip
Se escrever um documento sem `title`, durante o build o Astro dá um erro claro no terminal e indica o nome do ficheiro; basta acrescentá-lo conforme a mensagem.
:::

---

## 3. Panorama dos formatos básicos de Markdown

Este site renderiza Markdown padrão com as extensões GFM; todos os formatos abaixo são suportados. Veja primeiro o panorama e, em seguida, cada item com a correspondência entre a forma de escrever e o resultado renderizado:

| Formato | Escrita rápida | Utilização |
| :--- | :--- | :--- |
| Títulos | `## título da subsecção` | Organizar a estrutura dos capítulos; entram automaticamente no índice da página à direita |
| Parágrafos e quebras de linha | Parágrafo novo com linha em branco | Unidade básica do corpo do texto |
| Negrito / itálico / texto riscado | `**negrito**` `*itálico*` `~~texto riscado~~` | Realçar os pontos importantes |
| Código em linha | `` `comando` `` | Marcar comandos, nomes de ficheiros, atalhos de teclado |
| Teclas do teclado | `<kbd>Ctrl</kbd>` | Identificação das teclas com estilo de tecla |
| Listas não ordenadas / ordenadas | `- item` / `1. item` | Enumerar conteúdo em paralelo ou por passos |
| Listas de tarefas | `- [x] concluído` | Listas de verificação com caixas de seleção |
| Blocos de citação | `> texto citado` | Citar texto original, acrescentar observações à margem |
| Blocos de código | Envolver com três acentos graves | Código em várias linhas, com destaque e botão de copiar |
| Tabelas | Colunas separadas por barras verticais | Comparação de parâmetros, listagem de dados |
| Ligações | `[texto](endereço)` | Saltar para outras páginas do site ou para sites externos |
| Imagens | `![descrição](caminho)` | Inserir capturas de ecrã e diagramas de arquitetura |
| Linha divisória | `---` | Separar grandes blocos |

### 3.1 Hierarquia de títulos

No corpo do texto **não escreva títulos de primeiro nível (`#`)** — o `title` do Frontmatter já é renderizado automaticamente como o grande título da página; escrever outro `#` no corpo faz a página ficar com dois grandes títulos. As subsecções de cada nível começam no título de segundo nível (`##`):

```markdown
## Título de segundo nível (capítulo)

### Subtítulo de terceiro nível (subsecção)
```

**Resultado renderizado**: a página que está a ler é já um exemplo pronto — "3. Panorama dos formatos básicos de Markdown" é um título de segundo nível e esta secção "3.1 Hierarquia de títulos" é um título de terceiro nível; ambos já aparecem no "índice da página" à direita. Os títulos de quarto nível (`####`) recebem apenas o estilo do corpo do texto e deixam de entrar no índice, sendo adequados para subsecções pequenas que não se pretende listar.

### 3.2 Parágrafos e quebras de linha

O Markdown separa parágrafos com linhas em branco; é aqui que os principiantes mais tropeçam:

```markdown
Este é o primeiro parágrafo; entre as duas frases só foi premido Enter uma vez,
pelo que depois de renderizado continuam no mesmo parágrafo.

Esta linha está separada do texto anterior por uma linha em branco e, depois de renderizada, forma um novo parágrafo.

Esta linha termina com uma barra invertida\
pelo que a linha seguinte começa realmente numa nova linha.
```

**Resultado renderizado:**

Este é o primeiro parágrafo; entre as duas frases só foi premido Enter uma vez,
pelo que depois de renderizado continuam no mesmo parágrafo.

Esta linha está separada do texto anterior por uma linha em branco e, depois de renderizada, forma um novo parágrafo.

Esta linha termina com uma barra invertida\
pelo que a linha seguinte começa realmente numa nova linha.

Resumo das regras: **um único Enter = muda de linha no código-fonte sem separar o parágrafo**; para começar um novo parágrafo, deixe uma linha em branco; para forçar uma quebra de linha dentro do parágrafo, use uma barra invertida no fim da linha ou dois espaços no fim da linha.

### 3.3 Ênfase de texto e estilos em linha

```markdown
Isto é **negrito**, isto é *itálico*, isto é ***negrito e itálico***, isto é ~~texto riscado~~.

Use o código em linha para marcar comandos e nomes de ficheiros: execute `pnpm run dev` para abrir o servidor de desenvolvimento.

As teclas do teclado usam etiquetas HTML: <kbd>Ctrl</kbd> + <kbd>K</kbd> abre a pesquisa em todo o site.
```

**Resultado renderizado:**

Isto é **negrito**, isto é *itálico*, isto é ***negrito e itálico***, isto é ~~texto riscado~~.

Use o código em linha para marcar comandos e nomes de ficheiros: execute `pnpm run dev` para abrir o servidor de desenvolvimento.

As teclas do teclado usam etiquetas HTML: <kbd>Ctrl</kbd> + <kbd>K</kbd> abre a pesquisa em todo o site.

### 3.4 Listas e listas de tarefas

```markdown
Lista não ordenada, os subitens têm avanço de dois espaços:
- Funcionalidade principal um
- Funcionalidade principal dois
  - Subfuncionalidade do dois
  - Outra subfuncionalidade do dois

Lista ordenada:
1. Primeiro passo: instalar o Node.js
2. Segundo passo: clonar o repositório de código
3. Terceiro passo: iniciar o servidor de desenvolvimento

Lista de tarefas:
- [x] Suporta destaque de sintaxe
- [x] Suporta cópia com um clique
- [ ] Tarefa pendente
```

**Resultado renderizado:**

Lista não ordenada, os subitens têm avanço de dois espaços:

- Funcionalidade principal um
- Funcionalidade principal dois
  - Subfuncionalidade do dois
  - Outra subfuncionalidade do dois

Lista ordenada:

1. Primeiro passo: instalar o Node.js
2. Segundo passo: clonar o repositório de código
3. Terceiro passo: iniciar o servidor de desenvolvimento

Lista de tarefas:

- [x] Suporta destaque de sintaxe
- [x] Suporta cópia com um clique
- [ ] Tarefa pendente

### 3.5 Blocos de citação

```markdown
> Isto é uma citação. Serve para excertos de texto original, notas de contexto ou observações à margem.
> As linhas consecutivas escrevem-se no mesmo bloco de citação.

> > Dentro de uma citação também se pode encaixar outra citação.

> Dentro de uma citação também se pode pôr listas:
>
> - Primeiro item
> - Segundo item
```

**Resultado renderizado:**

> Isto é uma citação. Serve para excertos de texto original, notas de contexto ou observações à margem.
> As linhas consecutivas escrevem-se no mesmo bloco de citação.

> > Dentro de uma citação também se pode encaixar outra citação.

> Dentro de uma citação também se pode pôr listas:
>
> - Primeiro item
> - Segundo item

:::note
O bloco de citação é apenas um estilo sóbrio e **não substitui os blocos de aviso**. Quando precisar de um destaque colorido bem visível, use a sintaxe dos blocos de aviso da secção 4.1.
:::

### 3.6 Blocos de código

Envolva o conteúdo com três acentos graves e indique a linguagem a seguir aos acentos da primeira linha para obter destaque de sintaxe; cada bloco de código traz à direita um botão de cópia com um clique:

````markdown
```js
export function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}
```
````

**Resultado renderizado:**

```js
export function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}
```

O identificador da linguagem determina o esquema de destaque; as linguagens mais comuns, como `js`, `ts`, `bash`, `json`, `yaml`, `html`, `css` e `python`, são todas suportadas. Linguagens de terminal como `bash` são renderizadas com uma moldura escura em estilo de terminal:

```bash
pnpm run build
```

Para utilizações avançadas dos blocos de código, como o título com nome de ficheiro e o destaque de linhas específicas, veja a secção 4.2.

### 3.7 Tabelas

Na linha de traços sob o cabeçalho, os dois-pontos controlam o alinhamento (dois-pontos à esquerda: alinhado à esquerda; de ambos os lados: ao centro; à direita: alinhado à direita):

```markdown
| Comando | Parâmetro | Descrição |
| :--- | :---: | ---: |
| `astro dev` | `--host` | Exemplo de alinhamento à esquerda |
| `astro build` | nenhum | Exemplo de alinhamento ao centro |
| `astro preview` | `--port` | Exemplo de alinhamento à direita |
```

**Resultado renderizado:**

| Comando | Parâmetro | Descrição |
| :--- | :---: | ---: |
| `astro dev` | `--host` | Exemplo de alinhamento à esquerda |
| `astro build` | nenhum | Exemplo de alinhamento ao centro |
| `astro preview` | `--port` | Exemplo de alinhamento à direita |

:::tip
Quando o conteúdo da tabela é demasiado largo, não é preciso tratar disso manualmente: o site acrescenta automaticamente uma barra de scroll horizontal às tabelas, legíveis por completo também no telemóvel.
:::

### 3.8 Ligações

```markdown
Link interno: [Início rápido](/canvas/deployment/)

Link externo: [Site oficial do Astro](https://astro.build)

Âncora nesta página: [Saltar para a secção "Tabelas"](#37-tabelas)

Link automático: <https://github.com/shijianus/epocanvas-docs>
```

**Resultado renderizado:**

Link interno: [Início rápido](/canvas/deployment/)

Link externo: [Site oficial do Astro](https://astro.build)

Âncora nesta página: [Saltar para a secção "Tabelas"](#37-tabelas)

Link automático: <https://github.com/shijianus/epocanvas-docs>

Convenções de escrita:

- Os **links internos** usam o caminho completo, começando e terminando por `/` (por exemplo, `/canvas/deployment/`); não escreva caminhos relativos;
- A **âncora** é o ID gerado a partir do texto do título; para títulos em português, a âncora é o próprio texto (em minúsculas, sem pontuação e com espaços trocados por hífenes); para copiar um link com âncora, basta copiar o endereço na barra de endereço do navegador;
- O texto do link deve indicar claramente o destino; não escreva "clique aqui".

### 3.9 Imagens e legendas

Guarde todos os recursos de imagem da documentação no diretório `public/images/canvas/` e, ao referenciá-los, use caminhos absolutos começados por `/`:

```markdown
![Efeito de renderização real da página de início rápido no servidor de desenvolvimento local](/images/canvas/ui-quickstart.png)

*Figura: o texto em itálico na linha imediatamente a seguir à imagem é apresentado como legenda.*
```

**Resultado renderizado:**

![Efeito de renderização real da página de início rápido no servidor de desenvolvimento local](/images/canvas/ui-quickstart.png)

*Figura: efeito de renderização real da página de início rápido, aqui apenas como demonstração.*

**Normas para as imagens**:

- **Diagramas de arquitetura e fluxogramas**: guarde como vetoriais `.svg`, que não ficam desfocados ao ampliar em telemóveis nem em ecrãs de alta definição. Os diagramas de arquitetura deste site estão todos em `public/images/canvas/docs-*.svg`.
- **Capturas de ecrã da interface**: guarde como `.png` comprimidas, com largura de cerca de 1440 píxeis; não envie directamente os originais com dezenas de MB.
- **Descrição obrigatória**: o texto dentro de `![ ]` é renderizado como texto alternativo da imagem; descreva com cuidado o conteúdo da imagem e não deixe em branco.

Depois de inserir uma imagem, **confirme sempre o resultado renderizado no navegador** — só submeta depois de verificar que o caminho está certo e que a imagem aparece corretamente.

### 3.10 Linhas divisórias

Três ou mais traços numa linha própria renderizam uma linha divisória, usada para separar grandes blocos:

```markdown
O conteúdo anterior fica por aqui.

---

Começa aqui um novo tema.
```

**Resultado renderizado:**

O conteúdo anterior fica por aqui.

---

Começa aqui um novo tema.

:::caution
É obrigatório deixar uma linha em branco acima da linha divisória. Um `---` imediatamente a seguir a uma linha de texto é interpretado como "outra forma de escrever títulos" e transforma o texto da linha anterior num grande título.
:::

---

## 4. Formatos estendidos: sintaxes acrescentadas pelo site

Os formatos seguintes são sintaxes estendidas que este site suporta para além do Markdown padrão, fornecidas pelo motor de renderização (blocos de aviso do Starlight e Expressive Code).

### 4.1 Os quatro blocos de aviso coloridos

Os blocos de aviso usam a sintaxe de três dois-pontos: começam com `:::tipo` e terminam com `:::` numa linha própria; há quatro tipos, com cores e ícones diferentes:

:::note
**note (informação complementar)**: conhecimentos de contexto, detalhes de design, dependências prévias.
:::

:::tip
**tip (dicas práticas)**: truques para ganhar eficiência, boas práticas.
:::

:::caution
**caution (aviso de atenção)**: operações propensas a erros, problemas potenciais de compatibilidade.
:::

:::danger
**danger (aviso de risco elevado)**: operações irreversíveis, como perda de dados ou sobreposição do ambiente de produção.
:::

Acrescentando parênteses retos após o tipo, pode personalizar o título:

````markdown
:::tip[Instalação mais rápida]
Instalar dependências com pnpm é muito mais rápido do que com npm:

```bash
npm install -g pnpm
```
:::
````

**Resultado renderizado:**

:::tip[Instalação mais rápida]
Instalar dependências com pnpm é muito mais rápido do que com npm:

```bash
npm install -g pnpm
```
:::

Dentro de um bloco de aviso pode continuar a usar listas, blocos de código, tabelas ou qualquer outra formatação; para mais exemplos, veja [Exemplos de blocos de aviso, blocos de código e tabelas](/canvas/syntax/).

### 4.2 Título com nome de ficheiro nos blocos de código e destaque de linhas

Na primeira linha da cerca de código, indique `title="caminho-do-ficheiro"` para mostrar a barra de título e use `{números de linha}` para destacar as linhas importantes, separando vários números por vírgulas:

````markdown
```typescript title="src/config/site.ts" {2,4}
export const siteConfig = {
  name: 'EpoCanvas Docs', // ← linha destacada
  version: '1.0.0',
  locale: 'zh-CN',        // ← linha destacada
};
```
````

**Resultado renderizado:**

```typescript title="src/config/site.ts" {2,4}
export const siteConfig = {
  name: 'EpoCanvas Docs',
  version: '1.0.0',
  locale: 'zh-CN',
};
```

### 4.3 Comparação incremental com diff

Use a linguagem `diff` para mostrar alterações de configuração; as linhas que começam por `-` aparecem como remoções e as que começam por `+` como adições:

````markdown
```diff
  export default defineConfig({
-   site: 'http://localhost:3000',
+   site: 'https://docs.epocanvas.com',
  });
```
````

**Resultado renderizado:**

```diff
  export default defineConfig({
-   site: 'http://localhost:3000',
+   site: 'https://docs.epocanvas.com',
  });
```

### 4.4 Notas de rodapé

Para indicar fontes ou acrescentar notas complementares, use a sintaxe de notas de rodapé do GFM:

````markdown
O índice de pesquisa em todo o site é gerado pelo Pagefind durante o build[^pf].

[^pf]: [Documentação oficial do Pagefind](https://pagefind.app/) — biblioteca de pesquisa local para sites estáticos.
````

**Resultado renderizado:** no corpo do texto aparece um marcador sobrescrito numerado[^md-page]; ao clicar, salta-se suavemente para a entrada de rodapé correspondente no fundo da página.

[^md-page]: Esta é a própria nota de rodapé renderizada no fundo desta página — independentemente de onde o conteúdo da nota esteja escrito no artigo, é sempre reunido no fundo da página.

### 4.5 Consulta rápida do que não é suportado e dos erros frequentes

As formas de escrever abaixo são comuns noutras plataformas, mas neste site **não produzem efeito** ou comportam-se de forma diferente do esperado; evite-as directamente ao escrever documentação:

| Escrita propensa a erros | Comportamento real | Alternativa correta |
| :--- | :--- | :--- |
| Cerca <code>```mermaid</code> | Mostra o código-fonte como um bloco de código comum, sem gerar o diagrama | Exporte o SVG no mermaid.live e insira-o como imagem |
| Sintaxe de avisos do GitHub `> [!NOTE]` | É renderizada como um bloco de citação comum | Reescreva como `:::note` |
| `:::warning` / `:::important` | Renderiza em silêncio como um parágrafo comum, sem estilo de bloco de aviso | Reescreva como `:::caution` |
| Escrever um título de primeiro nível `#` no corpo | A página fica com dois grandes títulos | Apague o `#` e comece o corpo em `##` |
| Premir Enter uma vez para mudar de linha | As duas linhas ficam unidas numa só | Separe os parágrafos com uma linha em branco, ou acrescente uma barra invertida no fim da linha |

---

## 5. Para ir mais longe

- Quer conhecer o pipeline completo de renderização do Markdown, do ficheiro à página, e todas as convenções? Leia **[Regras de renderização em detalhe](/canvas/rendering/)**.
- Quer ver os blocos de aviso, blocos de código, notas de rodapé e outras sintaxes reunidas numa "página de exemplos viva"? Leia **[Exemplos de blocos de aviso, blocos de código e tabelas](/canvas/syntax/)**.
