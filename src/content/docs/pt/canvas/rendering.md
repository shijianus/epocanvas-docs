---
title: Regras de renderização em detalhes
description: "Regras de renderização completas do EpoCanvas Docs: o fluxo do pipeline de um ficheiro Markdown até à página final, e todas as convenções de Frontmatter, títulos, blocos de aviso, blocos de código, imagens e links."
---

Esta página explica por inteiro as regras de renderização do **EpoCanvas Docs**: que etapas de processamento percorre um ficheiro Markdown, que efeito produce cada sintaxe e que sintaxes não são suportadas. Uma leitura completa antes de escrever a documentação evita a esmagadora maioria dos problemas de paginação.

---

## Pipeline de renderização: do ficheiro .md à página publicada

![Diagrama do pipeline de renderização de Markdown do EpoCanvas Docs: mostra o fluxo completo de 5 passos, desde a análise do código-fonte Markdown, à parseção AST GFM, ao realce de código, à montagem do layout com 7 componentes personalizados, até à geração de HTML estático e do índice do Pagefind](/images/canvas/docs-render-pipeline.svg)

*Figura: fluxo de 5 passos do pipeline de renderização de Markdown. Os passos são executados por ordem durante o build; o resultado do build são ficheiros puramente estáticos, sem qualquer custo de framework em tempo de execução no cliente.*

Um ficheiro Markdown, desde ser guardado até chegar ao leitor, passa pelas seguintes cinco etapas:

1. **Recolha do conteúdo**: quando o Astro arranca ou faz o build, percorre o diretório `src/content/docs/`, regista cada ficheiro `.md` / `.mdx` como entrada de conteúdo e valida o Frontmatter (a falta de `title` origina um erro imediato).
2. **Compilação do Markdown**: o corpo do texto é convertido em HTML pelo compilador de Markdown (com extensões GFM). As sintaxes estendidas como tabelas, listas de tarefas e texto riscado tomam efeito nesta etapa.
3. **Realce dos blocos de código**: todas as cercas de código são tratadas pelo Expressive Code, que gera blocos de código com realce de sintaxe, barra de título, números de linha e botão de copiar.
4. **Aplicação do layout do site**: o HTML compilado é inserido no esqueleto de página do Starlight — a barra superior, o índice à esquerda e o índice da página à direita são renderizados pelos componentes personalizados em `src/components/starlight/`.
5. **Geração do índice e dos ficheiros estáticos**: ao executar `pnpm run build`, o Pagefind percorre todas as páginas geradas e extrai o índice de texto completo; o HTML puro do diretório `dist/` pode ser alojado diretamente em qualquer servidor estático.

:::note
Todo este fluxo é concluído de uma só vez durante o build. Depois de o site entrar no ar não há qualquer participação do servidor; todas as interações (pesquisa, troca de tema, troca de idioma) acontecem no browser.
:::

---

## Regras do Frontmatter

- `title` é **obrigatório**; em falta, o build falha com o erro `InvalidInputError`;
- Recomenda-se preencher `description`, que é apresentada nos resultados dos motores de pesquisa e nos cartões de partilha;
- O Frontmatter tem de ser um bloco YAML válido no início absoluto do ficheiro; os três traços são indispensáveis.

---

## Regras dos títulos

| Regra | Explicação |
| :--- | :--- |
| Não escrever títulos de primeiro nível `#` no corpo do texto | O `title` do Frontmatter já é renderizado como título principal da página; escrever `#` no corpo origina dois títulos principais |
| O corpo do texto começa em títulos de segundo nível `##` | `##` e `###` entram automaticamente no "índice da página" à direita |
| `####` e níveis inferiores não entram no índice | Os níveis mais profundos são apenas renderizados com estilos de corpo do texto |
| O texto do título gera a âncora | Nos títulos em chinês, a âncora é o próprio texto chinês, como `#标题规则` |

---

## Regras dos blocos de aviso (Asides)

Os blocos de aviso utilizam a sintaxe de três dois-pontos do Starlight e suportam 4 tipos:

```markdown
:::note
Nota de esclarecimento complementar.
:::

:::tip
Truque para aumentar a produtividade.
:::

:::caution
Risco a ter em atenção ou operação propensa a erros.
:::

:::danger
Aviso de alto risco, envolvendo perda de dados ou operações irreversíveis.
:::
```

Também é possível acrescentar um título personalizado após o tipo: `:::tip[Acelerar a instalação]`.

:::caution
Dois equívocos frequentes a ter em atenção:

- A sintaxe de bloco de citação ao estilo GitHub `> [!TIP]` **não é suportada**; se for escrita, `[!TIP]` aparece como texto normal dentro do bloco de citação;
- `:::important` e `:::warning` **não são tipos válidos**: não originam erro, mas são renderizados silenciosamente como parágrafos normais.

Ao migrar documentação antiga: `> [!NOTE]` → `:::note`, `> [!WARNING]` → `:::caution`, `> [!CAUTION]` → `:::danger`.
:::

![Efeito real de renderização dos quatro blocos de aviso coloridos](/images/canvas/ui-markup-examples.png)

*Figura: aspeto real dos quatro blocos de aviso quando escritos com a sintaxe acima, extraído da página [Avisos, blocos de código e diagramas de exemplo](/canvas/syntax/).*

---

## Regras dos blocos de código

As cercas de código (três acentos graves) são renderizadas pelo Expressive Code e suportam as seguintes anotações (escritas após os acentos graves da primeira linha):

| Anotação | Função | Exemplo |
| :--- | :--- | :--- |
| Identificador de linguagem | Determina o esquema de realce de sintaxe | <code>```ts</code> |
| `title="..."` | Mostra uma barra de título com o nome do ficheiro | <code>```ts title="src/config/site.ts"</code> |
| `{2}` / `{2-4}` | Destaca as linhas indicadas | <code>```ts {2}</code> |
| `lang="diff"` ou `diff` | Mostra linhas adicionadas/removidas em contraste verde/vermelho | <code>```diff</code> |
| Linguagens de terminal como `bash` / `sh` | Renderiza com uma moldura em estilo de terminal | <code>```bash</code> |

Todos os blocos de código incluem automaticamente um botão de copiar num só clique; o texto do código é incluído pelo Pagefind no índice de pesquisa, pelo que os leitores conseguem encontrar diretamente palavras-chave dentro do código.

---

## Regras das imagens

- As imagens são colocadas uniformemente em `public/images/canvas/` e referenciadas com caminho absoluto: `![descrição](/images/canvas/ui-docs-reading.png)`;
- Os diagramas de arquitetura e de fluxo utilizam o formato vetorial `.svg`; as capturas de ecrã da interface utilizam `.png` comprimido;
- O texto descritivo tem de ser preenchido: é o texto alternativo quando a imagem falha ao carregar e é também a base da acessibilidade;
- **A versão atual não inclui renderização de diagramas Mermaid**: uma cerca ` ```mermaid ` é apenas apresentada como um bloco de código normal com o código-fonte. Quando for preciso um diagrama de fluxo, exporte primeiro o SVG numa ferramenta como o mermaid.live e insira-o depois como imagem.

---

## Regras dos links

- **Links internos do site**: utilizar o caminho completo, começando e terminando em `/`, como `/canvas/deployment/`. Quando um caminho da documentação mudar, o caminho antigo deve ser registado na tabela `redirects` de `astro.config.mjs`;
- **Links de âncora**: `/canvas/rendering/#regras-dos-blocos-de-código` permite saltar diretamente para uma secção desta página;
- **Links externos**: basta escrever o URL completo; no corpo do texto são apresentados na cor do tema.

---

## Outros comportamentos de renderização

| Sintaxe | Resultado da renderização |
| :--- | :--- |
| `**negrito**`, `*itálico*`, `~~texto riscado~~` | Os estilos de texto correspondentes |
| `código em linha` | Cápsula em letra mono na cor do tema |
| Escrita <kbd>Ctrl</kbd>+<kbd>K</kbd> | Identificação de tecla em estilo de tecla de teclado |
| Tabelas GFM | Tabelas de dados com moldura e destaque ao passar o rato |
| Listas de tarefas `- [x]` | Caixas de seleção visualizadas (em estado desativado) |
| Notas de rodapé `[^nome]` | Número em expoente no corpo do texto + lista de notas no fundo da página, com saltos de ida e volta ao clicar |
| Blocos de citação Markdown `>` | Linha vertical na cor do tema à esquerda + fundo claro |
| Linha separadora `---` | Linha fina de separação atravessando a zona do corpo do texto |

:::tip
Quando houver dúvidas sobre o efeito de renderização de uma sintaxe, a forma mais fiável é: arrancar `pnpm run dev`, escrever um pequeno excerto num documento de teste e confirmá-lo com os próprios olhos no browser antes de o usar formalmente.
:::
