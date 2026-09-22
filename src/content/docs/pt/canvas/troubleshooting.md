---
title: FAQ e solução de problemas
description: Lista de verificação do EpoCanvas Docs para erros de execução local, documentos que não aparecem, renderização anormal dos blocos de aviso, pesquisa avariada e implantação no Cloudflare Pages.
---

Quando surgir uma anomalia ao usar, escrever ou implantar o **EpoCanvas Docs**, comece por identificar aqui o seu caso. Os problemas estão ordenados por "arranque local → escrita de documentos → pesquisa → implantação" e cada um apresenta a causa e uma solução verificada.

---

## 1. Problemas de instalação e de arranque local

### Q1: O comando `pnpm run dev` indica que a porta 4321 está ocupada

- **Causa**: o servidor de desenvolvimento iniciado anteriormente não terminou por completo, ou outro programa está a ocupar a porta 4321.
- **Solução**: arranque com outra porta:

  ```bash
  pnpm run dev -- --port 4322
  ```

### Q2: Ao instalar as dependências, surge um erro de compilação do módulo Sharp

- **Causa**: o Sharp é o módulo C++ subjacente usado para comprimir imagens no build; após uma mudança da versão do Node.js, a cache antiga pode deixar de ser compatível.
- **Solução**: limpe as dependências e reinstale:

  ```bash
  rm -rf node_modules pnpm-lock.yaml
  pnpm install
  ```

### Q3: Ao executar `pnpm install`, surge o erro `packages field missing or empty`

- **Causa**: o `pnpm-workspace.yaml` está vazio ou com formato incompleto; o pnpm interpreta-o como ficheiro de configuração de workspace e devolve o erro.
- **Solução**: garanta que o ficheiro contém o campo `packages`:

  ```yaml
  packages:
    - .
  ```

---

## 2. Problemas de escrita e de renderização de documentos

### Q4: Criei um novo Markdown, mas não o vejo na barra lateral à esquerda

- **Causa**: o diretório da barra lateral é declarado manualmente; os ficheiros novos têm de ser registados na configuração.
- **Solução**: abra o `astro.config.mjs` e acrescente no grupo adequado do array `sidebar`:

  ```javascript
  { label: 'Novo recurso', link: '/canvas/new-feature/' }
  ```

### Q5: O terminal devolve o erro `"title" is required`

- **Causa**: falta o `title` no cabeçalho do Markdown, ou os três travessões `---` iniciais não estão no formato correto.
- **Solução**: verifique o Frontmatter no topo do ficheiro:

  ```yaml
  ---
  title: Título do artigo
  description: Descrição do artigo
  ---
  ```

### Q6: A página mostra dois títulos grandes exatamente iguais

- **Causa**: foi escrito um título de nível `#` no corpo do texto. O `title` do Frontmatter já é renderizado como título grande; escrever outro `#` no corpo cria necessariamente uma duplicação.
- **Solução**: remova o título `#` do corpo do texto e comece as secções em `##`. As regras completas estão em [Regras de renderização em detalhes](/canvas/rendering/#regras-dos-títulos).

### Q7: Escrevi `> [!TIP]` mas o bloco de aviso não muda de cor e o texto aparece tal e qual

- **Causa**: a sintaxe de citação ao estilo GitHub, `> [!TIP]`, não é suportada; o compilador de Markdown não a reconhece.
- **Solução**: use a sintaxe de três dois-pontos:

  ```markdown
  :::tip
  Esta é a forma correta de escrever.
  :::
  ```

### Q8: A imagem inserida aparece partida

- **Causa**: o caminho da imagem está errado, ou a imagem não foi colocada no diretório estático `public/`.
- **Solução**:
  1. Confirme que a imagem está guardada em `public/images/canvas/ui-docs-reading.png`;
  2. Ao referenciá-la, use um caminho absoluto começado por `/`: `![descrição](/images/canvas/ui-docs-reading.png)`; não escreva caminhos relativos como `../public/...`.

---

## 3. Problemas da funcionalidade de pesquisa

### Q9: Ao depurar com `pnpm dev` em local, a pesquisa global não encontra o artigo recém-escrito

- **Causa**: a pesquisa global depende do índice do Pagefind, gerado apenas no `pnpm run build`; em modo de desenvolvimento a caixa de diálogo `Ctrl+K` não carrega o índice (abre sem campo de pesquisa), pelo que a pesquisa global não está disponível. É o comportamento previsto do framework, não um defeito do site.
- **Solução**: depois de um build completo, valide com o servidor de pré-visualização:

  ```bash
  pnpm run build
  pnpm run preview
  ```

  A pesquisa dentro da página, na barra superior, não está sujeita a esta limitação; durante o desenvolvimento pode usá-la diretamente para localizar conteúdo da página atual.

### Q10: A janela de pesquisa não abre ao premir `Ctrl+K`

- **Causa**: alguns métodos de introdução, ferramentas de área de transferência ou aplicações de captura de ecrã ocupam o atalho `Ctrl+K` / `Cmd+K`.
- **Solução**: clique diretamente no pequeno emblema `Ctrl K` à direita do campo de pesquisa; também abre a janela de pesquisa em todo o site.

---

## 4. Problemas de implantação no Cloudflare Pages

### Q11: O domínio personalizado recém-associado indica falha no handshake SSL (Error 525)

- **Causa**: a emissão do certificado Universal SSL pelo Cloudflare para um domínio novo precisa de 2 a 5 minutos para ficar ativa a nível global.
- **Solução**: espere alguns minutos e force a atualização (`Ctrl+F5` / `Cmd+Shift+R`); entretanto pode aceder ao domínio predefinido `<nome-do-projeto>.pages.dev`, que está sempre disponível.

### Q12: O comando `pnpm run deploy` devolve o erro `Project not found`

- **Causa**: o parâmetro `--project-name` do comando de implantação não coincide com o nome do projeto na consola Cloudflare; também pode acontecer por a máquina não ter sessão iniciada.
- **Solução**:
  1. Execute primeiro `npx wrangler whoami` para confirmar que a sessão está iniciada;
  2. Confirme o nome do projeto na consola Cloudflare e, se necessário, corrija o parâmetro `--project-name` do script `deploy` em `package.json`.

---

## 5. Autoverificação local antes de submeter

Antes de enviar para o GitHub, execute o seguinte comando para uma autoverificação completa (verificação de tipos + build integral):

```bash
pnpm exec astro check && pnpm run build
```

Quando o `astro check` devolve `0 errors` e o build termina com `Complete!`, a documentação está sem erros de sintaxe e pode ser submetida com confiança. O CI do repositório (`build.yml`) executa o mesmo build após cada push; passar primeiro em local evita falhas no CI.
