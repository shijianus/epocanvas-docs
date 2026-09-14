---
title: Avisos, blocos de código e diagramas de exemplo
description: Utilização real e efeito de renderização autêntico, no EpoCanvas Docs, dos 4 blocos de aviso coloridos, dos títulos e do realce de linhas nos blocos de código, das comparações diff e da inserção de diagramas.
---

Escrever documentação técnica de qualidade exige não só texto claro, mas também avisos de destaque bem visíveis, exemplos de código com formatação cuidada e diagramas de leitura imediata. Todos os exemplos desta página usam sintaxe efetivamente ativa: o efeito que vê é o resultado da renderização — este próprio artigo é uma página de exemplo viva.

---

## 1. Os quatro blocos de aviso coloridos

Os blocos de aviso usam a sintaxe de três dois-pontos: começam com `:::tipo`, terminam com `:::` e o conteúdo escreve-se no meio. O site baseia-se no Starlight e suporta os quatro tipos **note, tip, caution e danger**.

### Comparação entre a sintaxe e o efeito real

:::note
**note (esclarecimento complementar)**: usado para apresentar conhecimentos de contexto, complementar detalhes de desenho ou indicar dependências prévias.
:::

:::tip
**tip (truque útil)**: usado para partilhar pequenas dicas ou boas práticas que aumentam a eficiência das operações.
:::

:::caution
**caution (aviso de atenção)**: assinala possíveis conflitos de compatibilidade, erros latentes ou operações que exigem cuidado especial.
:::

:::danger
**danger (aviso de alto risco)**: o nível máximo de alerta, para casos envolvendo perda de dados, sobrescrita em ambiente de produção ou operações irreversíveis.
:::

### Um bloco de aviso pode conter qualquer conteúdo

Dentro de um bloco de aviso é possível continuar a usar listas, blocos de código, tabelas e outras sintaxes:

:::tip[Acelerar a instalação]
Instalar dependências com pnpm é muito mais rápido do que com npm:

```bash
npm install -g pnpm
```
:::

:::caution
Duas formas inválidas frequentes, a evitar:

- A sintaxe de bloco de citação ao estilo GitHub `> [!NOTE]` não é suportada e aparece tal como foi escrita, como um bloco de citação normal;
- `:::important` e `:::warning` **não são tipos suportados neste site**: não originam erro, mas são renderizados silenciosamente como parágrafos normais, sem qualquer estilo de bloco de aviso.

Ao migrar documentação do GitHub, reescreva `> [!NOTE]` como `:::note`, `> [!WARNING]` como `:::caution` e `> [!CAUTION]` como `:::danger`.
:::

---

## 2. Formatação avançada de blocos de código

### 2.1 Barra de título com nome de ficheiro e realce de linhas indicadas

Anote na primeira linha da cerca de código com `title="caminho do ficheiro"` e use `{número da linha}` para destacar as linhas importantes:

````markdown
```typescript title="src/config/site.ts" {2}
export const siteConfig = {
  name: 'EpoCanvas Docs', // esta linha fica destacada com fundo de realce
  version: '1.2.0',
};
```
````

**Efeito renderizado:**

```typescript title="src/config/site.ts" {2}
export const siteConfig = {
  name: 'EpoCanvas Docs',
  version: '1.2.0',
};
```

### 2.2 Comparação de alterações de código (diff)

Ao apresentar uma atualização de configuração ou uma refatorização de código, use a linguagem `diff` para tornar as alterações de leitura imediata: as linhas que começam por `-` aparecem como removidas e as que começam por `+` como adicionadas:

````markdown
```diff
  export default defineConfig({
-   site: 'http://localhost:3000',
+   site: 'https://docs.epocanvas.com',
  });
```
````

**Efeito renderizado:**

```diff
  export default defineConfig({
-   site: 'http://localhost:3000',
+   site: 'https://docs.epocanvas.com',
  });
```

### 2.3 Comandos de terminal

As linguagens de terminal como `bash`, `sh` e `powershell` são renderizadas com uma moldura escura em estilo de terminal:

```bash
pnpm run build
```

---

## 3. Como inserir diagramas?

A versão atual **não inclui de origem a renderização de diagramas em texto, como o Mermaid**. Escrever diretamente uma cerca ` ```mermaid ` apenas apresenta o código-fonte como um bloco de código normal, sem gerar qualquer gráfico.

A prática recomendada é: escrever e exportar um **diagrama vetorial SVG** numa ferramenta como o [mermaid.live](https://mermaid.live), guardá-lo em `public/images/canvas/` e inseri-lo com a sintaxe de imagem. Os diagramas de arquitetura e o fluxograma de troca de idioma deste site foram feitos assim:

![Diagrama de arquitetura do sistema](/images/canvas/docs-architecture.svg)

*Figura: diagrama de arquitetura inserido como imagem SVG, que pode ser ampliado à vontade sem perder nitidez.*

Se for mesmo necessário que o código-fonte Mermaid seja renderizado diretamente como gráfico, é preciso introduzir no projeto um plugin de renderização adicional (como `rehype-mermaid`), o que já entra no âmbito de desenvolvimento adicional; avalie o custo de manutenção antes de o introduzir.

---

## 4. Outras formas úteis de formatação

- Código em linha: `pnpm run dev`, renderizado em letra mono na cor do tema;
- Teclas do teclado: <kbd>Ctrl</kbd> + <kbd>K</kbd>, renderizadas em estilo de tecla de teclado;
- Lista de tarefas:

```markdown
- [x] Suporte a realce de sintaxe
- [x] Suporte a cópia num só clique
- [ ] Renderização Mermaid integrada (planeado)
```

Renderizada como itens de lista com estado de seleção visível.

### 4.1 Notas de rodapé

Quando for preciso indicar a fonte de uma informação ou acrescentar um esclarecimento, pode usar-se a sintaxe de notas de rodapé do GFM:

````markdown
O índice estático é gerado pelo Pagefind durante o build[^pagefind].

[^pagefind]: [Documentação oficial do Pagefind](https://pagefind.app/) — biblioteca de pesquisa local para sites estáticos.
````

**Efeito renderizado:** no fim do parágrafo aparece uma marca de salto com número em expoente[^pagefind-demo]; ao clicar, a página desliza suavemente até à lista de notas de rodapé no fundo da página.

[^pagefind-demo]: Esta é a nota de rodapé propriamente dita, renderizada no fundo desta página.

Usar com destreza os blocos de aviso, as anotações de código e os diagramas melhora substancialmente o conforto de leitura e o aspeto profissional da documentação técnica. Para a convenção completa de sintaxe, leia **[Regras de renderização em detalhes](/canvas/rendering/)**.
