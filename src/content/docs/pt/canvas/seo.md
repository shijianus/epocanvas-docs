---
title: SEO e otimização de desempenho
description: Capacidades de SEO incluídas no EpoCanvas Docs (etiquetas meta, Open Graph, sitemap, robots.txt) e mecanismos de desempenho, além do método de submissão aos motores de pesquisa.
---

A documentação escreve-se para ser lida, mas para isso tem de ser encontrável e abrir depressa. O **EpoCanvas Docs** inclui, ao nível do build, um conjunto de capacidades de SEO e mecanismos de desempenho prontos a usar. Esta página explica o que são, como os verificar e o que ainda convém fazer depois do lançamento.

---

## Capacidades de SEO incluídas

Todas as capacidades seguintes ficam ativas automaticamente no momento do build, sem configuração adicional:

| Capacidade | Implementação | Método de verificação |
| :--- | :--- | :--- |
| Título da página | `<title>文章标题 \| EpoCanvas Docs</title>`, obtido do Frontmatter | Ver o código-fonte da página ou o separador do navegador |
| Descrição da página | `<meta name="description">`, obtida da `description` do Frontmatter | Ver o código-fonte |
| Etiquetas Open Graph | `og:title`, `og:type`, `og:url`, `og:locale`, `og:description`; mostram um cartão ao partilhar em plataformas sociais | Colar o link numa aplicação de conversa para pré-visualizar |
| Link canónico | Cada página gera automaticamente `<link rel="canonical">` a apontar para o domínio principal | Ver o código-fonte |
| Sitemap | Geração automática de `sitemap-index.xml` no build | Aceder a `/sitemap-index.xml` |
| robots.txt | O projeto inclui `public/robots.txt`, que autoriza todos os rastreadores e declara a localização do sitemap | Aceder a `/robots.txt` |

:::tip
O `title` e a `description` do Frontmatter são o material principal com que os motores de pesquisa apresentam a página. Ao escrever documentos, preencha sempre uma `description` breve e precisa; é a otimização pontual mais importante para o SEO.
:::

### Canonical e domínio espelho

O domínio principal do site é `docs.epocanvas.com` e a configuração `<site>` está alinhada com ele; o canonical e o `og:url` de cada página apontam para o domínio principal. Mesmo que o conteúdo seja também acedido em espelho através de `epocanvas-docs.pages.dev`, os motores de pesquisa concentram a relevância no domínio principal e não o classificam como conteúdo duplicado.

---

## Mecanismos de desempenho

### Saída puramente estática, sem runtime de framework

O resultado do build é HTML + CSS puros. A navegação entre páginas, a leitura e o realce do índice durante a rolagem não exigem o descarregamento de qualquer framework de front-end (React/Vue e similares têm peso de runtime zero); apenas os componentes interativos — pesquisa, alternância de tema, alternância de idioma — carregam alguns scripts conforme necessário. A primeira renderização não espera pelo JavaScript e mantém-se fluida em redes fracas e equipamentos modestos.

### Compressão de imagens no momento do build

Os recursos estáticos referenciados através de `public/` são distribuídos pela CDN na implantação; a cadeia de ferramentas de build inclui o módulo de processamento de imagem sharp, reservando capacidade para otimização de imagens em build no futuro. As normas atuais exigem capturas de ecrã com largura em torno de 1440 píxeis e preferência por SVG nos diagramas, controlando o tamanho das imagens na origem.

### Carregamento do índice de pesquisa a pedido

O Pagefind gera, no `pnpm run build`, fragmentos de índice altamente comprimidos. Quem abre uma página não descarrega qualquer índice; só quando a pesquisa em todo o site é realmente usada é que o navegador vai buscar os fragmentos correspondentes às palavras-chave (de poucas KB a algumas dezenas de KB), sem afetar a velocidade da primeira renderização.

### Como verificar o desempenho

1. Abra o painel **Network** das ferramentas de desenvolvedor do navegador, atualize a página e veja o volume transferido na primeira renderização;
2. Execute uma auditoria **Lighthouse** (categoria Performance) numa janela anónima do Chrome e confirme a pontuação;
3. Use `curl -sI https://docs.epocanvas.com` para verificar se as políticas de cache da CDN, como `Cache-Control`, estão ativas nos cabeçalhos de resposta.

---

## Três ações recomendadas após o lançamento

Depois de concluída a implantação (ver [Implantação no Cloudflare Pages](/canvas/cloudflare/)), recomenda-se completar, por esta ordem:

### 1. Submeter o Sitemap ao Google Search Console

1. Abra o [Google Search Console](https://search.google.com/search-console) e adicione o recurso `docs.epocanvas.com`;
2. Verifique a propriedade do domínio através de um registo DNS TXT, conforme as instruções (com o domínio alojado no Cloudflare, demora poucos minutos);
3. Em "Mapas do site" ("Sitemaps"), no menu à esquerda, submeta `https://docs.epocanvas.com/sitemap-index.xml`.

### 2. Verificar a indexação

Uma semana após o lançamento, pesquise `site:docs.epocanvas.com` no Google para confirmar que os artigos já foram indexados; no relatório "Páginas" do Search Console, verifique se o número de páginas indexadas corresponde ao número de documentos.

### 3. Verificar periodicamente os links quebrados

Após reestruturações da documentação ou renomeação de caminhos, links antigos referenciados fora do site podem deixar de funcionar. No relatório "Páginas" do Search Console pode consultar as entradas "Não encontrada (404)" e, na tabela `redirects` de `astro.config.mjs`, acrescentar redirecionamentos para os caminhos extintos com mais acessos.

:::caution
O domínio espelho `epocanvas-docs.pages.dev` serve apenas como ponto de acesso de recurso; o canonical garante que os motores de pesquisa indexam apenas o domínio principal. Não divulgue o endereço do espelho fora do site, para evitar que os leitores guardem nos favoritos um domínio que não controla.
:::
