---
title: Visão geral do produto e valor central
description: Manual de produto oficial do EpoCanvas Docs — um site de documentação estático de alto desempenho criado para projetos de código aberto, com o posicionamento do produto, as vantagens principais e os problemas que resolve.
---

**EpoCanvas Docs** é o sistema oficial de sites de documentação técnica criado para o ecossistema de código aberto EpoCanvas. Baseia-se no framework moderno de sites estáticos **Astro 5** e no **Starlight**, e tem como objetivo oferecer aos programadores uma plataforma de documentação com tipografia profissional, abertura rápida, pesquisa cómoda e manutenção fácil.

Quer seja para escrever o manual de utilizador de um produto, a especificação de uma API ou registar o design da arquitetura de um sistema, o EpoCanvas Docs permite ao autor concentrar-se em escrever bom conteúdo em Markdown, proporcionando ao mesmo tempo aos leitores uma experiência de navegação confortável e natural.

---

## Problemas reais que resolve

No dia a dia do desenvolvimento e da escrita técnica, muitas equipas deparam-se frequentemente com as seguintes dificuldades ao manter documentação:

1. **Páginas lentas a abrir e com elevado consumo de memória**: muitas ferramentas de documentação geram páginas com um runtime de JavaScript pesado, que abre devagar em telemóveis ou redes lentas e facilmente trava ao fazer scroll em artigos longos.
2. **Navegação complicada em artigos longos**: os sites de documentação habituais têm normalmente apenas um menu à esquerda; ao ler instruções técnicas de milhares de palavras, é difícil perceber rapidamente a hierarquia das subsecções dentro do artigo atual.
3. **Pesquisa dependente de serviços externos**: serviços de pesquisa na cloud como o Algolia exigem registar uma conta adicional e configurar chaves de crawler, e ficam completamente inutilizáveis em ambientes de intranet sem acesso a serviços externos.
4. **Multilinguagem apenas pela metade**: muitos sites de documentação dizem suportar vários idiomas, mas na prática só traduzem os botões de navegação — ao abrir o corpo do artigo, o texto continua no idioma original; noutros, quando falta uma tradução, a página devolve directamente um 404 e o leitor tem de editar o URL à mão para encontrar o conteúdo.

O EpoCanvas Docs foi desenhado precisamente para resolver estes problemas concretos.

---

## Panorama das funcionalidades principais

![Efeito de renderização real da página de apresentação do produto do EpoCanvas Docs no navegador: catálogo de categorias à esquerda, corpo do texto ao centro e índice da página à direita](/images/canvas/ui-docs-reading.png)

*Figura: efeito de renderização real da página de apresentação do produto. À esquerda está o catálogo de categorias da documentação, ao centro o corpo do texto e à direita o índice da página gerado automaticamente, que destaca a subsecção atual à medida que se faz scroll.*

### 1. Interface de leitura clara em três colunas

- **Barra de navegação à esquerda**: organiza todas as categorias de documentos por módulo, com árvore recolhível, sem saltos ao trocar de página.
- **Área central do texto**: o corpo do texto tem uma largura máxima de 60rem, espaçamento entre linhas de 1,68, blocos de código com largura adaptável — menos fadiga em leituras prolongadas.
- **Barra de índice à direita**: extrai automaticamente os títulos `h2` e `h3` do artigo para gerar o índice da página, destaca a posição de leitura atual à medida que se faz scroll, e saltar suavemente para qualquer subsecção com um clique.

### 2. Pesquisa em dois modos: dentro da página + em todo o site

- **Localizar na página atual**: escreva palavras-chave directamente na caixa de pesquisa do topo e todos os textos correspondentes na página são imediatamente destacados, com um contador de progresso como `3/9`; prima Enter para saltar de ocorrência em ocorrência.
- **Janela de pesquisa em todo o site**: prima `Ctrl + K` (`Cmd + K` em Mac) para abrir a janela de pesquisa global, que se baseia no índice estático do Pagefind e lista todos os documentos correspondentes com pré-visualização dos parágrafos.
- Toda a capacidade de pesquisa é executada localmente no navegador, sem depender de qualquer serviço de backend — funciona mesmo alojado numa intranet.

### 3. Tradução completa em 10 idiomas

- Suporta 10 idiomas: chinês simplificado, chinês tradicional, inglês, japonês, coreano, espanhol, francês, alemão, russo e português; a navegação, a barra lateral e todo o corpo dos documentos estão integralmente traduzidos em cada idioma.
- Clique no botão de idioma no canto superior direito para saltar para a versão do mesmo artigo nesse idioma; o URL tem o prefixo do idioma (por exemplo, `/en/canvas/`), pelo que pode ser guardado nos favoritos ou partilhado directamente com colegas que usem outros idiomas.
- Quando a tradução de uma página para determinado idioma ainda não existe, essa página apresenta automaticamente o conteúdo predefinido em chinês, sem dar erro 404.

### 4. Tipografia profissional de Markdown e código

- Destaque de código baseado no Expressive Code, com suporte para títulos com nome de ficheiro nos blocos de código, destaque de linhas específicas e apresentação de diffs.
- Suporte nativo para 4 tipos de blocos de aviso coloridos (Note, Tip, Caution, Danger), com títulos personalizados.
- Suporta sintaxes extensas do Markdown de uso comum, como tabelas GFM, listas de tarefas e texto riscado; as regras completas estão em [Regras de renderização em detalhe](/canvas/rendering/).

### 5. Build rápido e alojamento gratuito

- Compilação estática baseada em Astro 5: o resultado do build é HTML e CSS puros com uma pequena quantidade de JS carregado a pedido; o site completo, com 10 idiomas e cerca de 180 páginas, faz o build completo em cerca de 25 segundos.
- Comandos de implantação pré-configurados para o Cloudflare Pages: uma única instrução publica a documentação online e obtém automaticamente o certificado HTTPS.

---

## Arquitetura geral do projeto

Para manter a documentação leve e fácil de manter, o sistema está dividido em quatro partes por responsabilidade:

![Diagrama da arquitetura do sistema do EpoCanvas Docs: o conteúdo em Markdown passa pela compilação do Astro, recebe os componentes de interface personalizados e gera páginas estáticas alojadas no Cloudflare Pages](/images/canvas/docs-architecture.svg)

*Figura: arquitetura do sistema. O autor só precisa de manter o conteúdo em Markdown; todas as restantes etapas são feitas automaticamente.*

- **Base e estilos**: assenta no núcleo estático do Astro 5; as variáveis de design são definidas em `src/styles/custom.css`, e o tema claro e o tema escuro partilham o mesmo conjunto de nomes de variáveis.
- **Gestão do conteúdo**: todos os documentos ficam no diretório `src/content/docs/`, escritos em Markdown puro (`.md`) ou em MDX (`.mdx`) que permite embutir componentes.
- **Componentes de interface**: ao sobrepor os componentes nativos do Starlight, foram personalizados a barra superior, a barra lateral, o índice da página e a janela de pesquisa.
- **Distribuição e acesso**: o resultado da compilação fica no diretório `dist/`, alojado no Cloudflare Pages, com resposta pelos nós de CDN globais mais próximos.

---

## Para quem é indicado

O EpoCanvas Docs é adequado aos seguintes cenários:

- **Site de documentação oficial de projetos de código aberto**: manual do produto, referência de API e descrição da arquitetura, tudo num único repositório;
- **Base de conhecimento interna de equipas**: totalmente estático e sem dependências de serviços externos, funciona por completo — incluindo a pesquisa — mesmo numa intranet;
- **Documentação ao estilo de blog técnico pessoal**: escreve-se apenas Markdown, sem se preocupar com engenharia de frontend, e publica-se com um comando.

**Não é adequado** para cenários que exijam autenticação com login, comentários e interação ou apresentação de dados em tempo real — um site puramente estático não tem backend, e essas necessidades exigem serviços adicionais.

---

## Comparação com ferramentas de documentação comuns

| Característica | EpoCanvas Docs | Docusaurus | VitePress | GitBook (versão comercial) |
| :--- | :--- | :--- | :--- | :--- |
| **Tecnologia de base** | Astro 5 + Starlight | React 18 | Vue 3 + Vite | Plataforma SaaS fechada |
| **Mecanismo de pesquisa** | Índice estático local do Pagefind | Depende do serviço cloud Algolia | Pesquisa em memória com Minisearch | Pesquisa com backend próprio |
| **Desenho da disposição** | Três colunas (menu à esquerda + texto ao centro + índice à direita) | Exige configurar plugins para alterar | Duas/três colunas por predefinição | Duas colunas fixas |
| **Forma de implantação** | Envio directo para o Cloudflare Pages | S3 / Vercel / GitHub | GitHub Pages | Alojamento privado da plataforma |
| **Grau de controlo próprio** | 100% código aberto, com o código-fonte totalmente em mão | 100% código aberto | 100% código aberto | Código fechado, com muitas funcionalidades pagas |

---

## Stack tecnológica e versões

Stack tecnológica realmente usada na versão atual (conforme o resultado do build):

| Componente | Versão | Função |
| :--- | :--- | :--- |
| **Astro** | v5.18.2 | Núcleo do site estático, responsável pelo build e pelas rotas |
| **Starlight** | v0.32.6 | Framework do site de documentação, fornece o esqueleto da disposição e o processamento de conteúdo |
| **Expressive Code** | Integrado com o Starlight | Destaque de blocos de código, barra de título e destaque de linhas |
| **Pagefind** | Integrado via `@pagefind/default-ui` 1.5.2 | Geração do índice de pesquisa estático durante o build |
| **Wrangler** | v4.131.0 | CLI oficial do Cloudflare, executa a implantação |
| **Ambiente de execução** | Node.js >= 18.14.1 + pnpm >= 9 | Ambiente de desenvolvimento e build local |

Ao atualizar dependências, leia também as notas sobre testes de regressão em [Componentes da interface e desenvolvimento personalizado](/canvas/components/).

---

## Estrutura de diretórios do projeto

O código do projeto está organizado da seguinte forma, com atribuições claras para cada diretório:

```text
epocanvas-docs/
├── public/                    # Diretório de recursos estáticos (imagens e ícones vetoriais ficam aqui)
│   └── images/canvas/         # Capturas de ecrã da interface e diagrama vetorial da arquitetura
├── src/
│   ├── components/starlight/  # Componentes de página personalizados (barra superior, barra lateral, índice da página, janela de pesquisa, etc.)
│   ├── config/navigation.ts   # Configuração da barra de navegação superior (acrescente ou remova itens de menu aqui)
│   ├── content/docs/          # Local onde ficam os ficheiros Markdown da documentação
│   │   ├── index.mdx          # Página inicial (landing page) do site de documentação
│   │   ├── canvas/            # Documentos de cada capítulo (chinês simplificado, idioma predefinido)
│   │   └── en/ ja/ ...        # Diretórios das traduções completas nos outros 9 idiomas
│   ├── styles/custom.css      # Estilos globais e variáveis de cor do tema
│   └── utils/i18n.ts          # Dicionário de termos da interface e lista de idiomas
├── astro.config.mjs           # Ficheiro principal de configuração do site (título, lista de idiomas e catálogo da barra lateral configuram-se aqui)
└── package.json               # Dependências do projeto e configuração dos comandos de execução
```

---

## Passos seguintes

- Quer executar o projeto localmente? Leia **[Início rápido (rodando em 3 minutos)](/canvas/deployment/)**.
- Quer conhecer a disposição concreta da interface e a forma de a usar? Leia **[Disposição da página e experiência de leitura](/canvas/layout/)**.
- Quer começar a escrever novos documentos? Leia o **[Guia de escrita e formatação em Markdown](/canvas/markdown/)** e as **[Regras de renderização em detalhe](/canvas/rendering/)**.
