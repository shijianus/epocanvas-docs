---
title: Implantação no Cloudflare Pages
description: "Guia Cloudflare Pages: envio Wrangler, integração Git opcional, domínios e verificações após publicar."
---

Esta página explica como publicar documentação estática no **Cloudflare Pages** segundo os scripts do repositório. As capturas são exemplos existentes, não registos de implantação ou testes desta candidata. Se diferirem, siga a consola atual. O sucesso da verificação e da implantação deve ser confirmado pelos registos e estados reais, não deduzido deste guia.

---

## Preparação

### Do que precisa

| Item | Explicação |
| :--- | :--- |
| **Conta Cloudflare** | Registo gratuito em [dash.cloudflare.com](https://dash.cloudflare.com/); o serviço Pages não exige plano pago |
| **Build completo em local** | Primeiro execute `pnpm run verify` com sucesso e confirme que o diretório `dist/` é gerado corretamente; ver [Início rápido](/canvas/deployment/) |
| **Node.js + pnpm** | Os comandos de implantação dependem do ambiente de desenvolvimento local; os requisitos de versão são os mesmos do capítulo de início rápido |

### Como escolher entre os dois métodos de implantação

![Envio local com Wrangler e build integrado com Git](/images/canvas/docs-deploy-compare.svg)

*Figura: build local e envio Wrangler à esquerda, build na nuvem por Git à direita. O diagrama não comprova testes destes caminhos nesta revisão.*

| Item de comparação | Método 1: upload direto por linha de comandos | Método 2: build automático via Git |
| :--- | :--- | :--- |
| Modo de operação | Executar `pnpm run deploy` em local | Enviar o código para o GitHub aciona automaticamente |
| Dificuldade inicial | Baixa, dois comandos | Média, exige uma configuração na consola |
| Cenário adequado | Primeira publicação, manutenção por uma pessoa, atualizações rápidas | Colaboração de várias pessoas, desejo de "commit = online" |
| Verificações | Verify completo antes do envio | Configurar verify completo no comando da nuvem |

:::tip
Escolha Direct Upload ou integração Git ao criar o projeto. Não suponha que um projeto de envio direto pode passar diretamente para Git; crie o projeto adequado ao mudar de caminho. Envios urgentes com Wrangler também devem passar pelas verificações.
:::

:::tip[Não quer escrever comandos?]
A página [Início rápido](/canvas/deployment/) disponibiliza botões de implantação com um clique para Cloudflare, Vercel e Netlify: clique, autorize a conta, confirme a configuração e o site de documentação fica publicado na sua própria conta de nuvem; ver [implantação com um clique](/canvas/deployment/#implantação-com-um-clique-basta-clicar-num-botão-para-ficar-online). O botão do Cloudflare usa a hospedagem estática dos Workers, um caminho independente do método Pages apresentado nesta página; para um site de documentação estático a experiência de acesso é idêntica, basta escolher um dos caminhos.
:::

---

## Método 1: Upload direto pela linha de comandos local (recomendado na primeira vez)

Este caminho compila localmente e envia com Wrangler. `pnpm run deploy` destina-se ao projeto `epocanvas-docs` dos responsáveis, não a um botão genérico para qualquer fork sem configuração.

### Passo 1: Iniciar sessão na conta Cloudflare

O projeto já inclui o Wrangler (a ferramenta de linha de comandos oficial do Cloudflare); a primeira utilização exige autorização de sessão no navegador:

```bash
pnpm exec wrangler login
```

Ao executar, o terminal mostra `Opening a link in your default browser...`; o navegador abre a página de autorização do Cloudflare e, depois de clicar em **Allow**, o terminal confirma que a sessão foi iniciada. Confirme o estado da sessão com o comando:

```bash
pnpm exec wrangler whoami
```

:::caution
É necessária uma sessão ou token Cloudflare com permissões válidas. Se a autenticação falhar, confira `wrangler whoami`, a conta e as permissões. O texto exato do erro pode variar com a versão.
:::

### Passo 2: Build e upload num só comando

O projeto traz pré-definido em `scripts/verify-release.mjs` um comando de publicação com um só passo:

Autorize com `pnpm exec wrangler login`. `scripts/verify-release.mjs` exige `main`, árvore limpa incluindo ficheiros não acompanhados, upstream `origin/main` e HEAD igual ao commit remoto real. `pnpm run deploy` executa `pnpm run verify` completo, verifica novamente o Git e chama o Wrangler. O projeto é definido no script; configure o seu destino antes de o reutilizar.

```bash
pnpm run deploy
```

`pnpm run deploy` verifica configuração, tipos Astro, build, testes e conteúdo/artefactos antes de enviar. Para verificar apenas pré-requisitos, use o comando abaixo. Lê referências Git remotas, mas não executa verify completo, build ou envio. Um dry-run bem-sucedido não significa que os testes passaram.

```bash
pnpm run deploy --dry-run
```

O Wrangler mostra o URL após um envio bem-sucedido. O script define `--project-name epocanvas-docs --branch main`; confirme o projeto na conta e a configuração do ramo de produção.

### Passo 3: Localizar o seu projeto na consola

Abra [dash.cloudflare.com](https://dash.cloudflare.com/) e clique no menu à esquerda em **Compute (Workers & Pages)** para ver a lista de projetos. A imagem seguinte assinala três pontos-chave:

![Lista de projetos Workers & Pages da consola Cloudflare, com o menu à esquerda, o botão Create application e o projeto epocanvas-docs assinalados](/images/canvas/deploy/cf-01-projects-list.png)

*Figura: lista de projetos Workers & Pages. ① Entrada no menu à esquerda para Workers & Pages; ② botão Create application para criar um novo projeto; ③ o nosso projeto `epocanvas-docs`, com o domínio de acesso `epocanvas-docs.pages.dev` e a hora da última implantação.*

Clique no nome do projeto para entrar nos detalhes; o separador **Deployments** mostra o histórico completo de implantações:

![Página de histórico de implantações do projeto epocanvas-docs, com o domínio de produção, os registos de implantação e o estado assinalados](/images/canvas/deploy/cf-02-deployments.png)

*Figura: página de histórico de implantações. ① Nome do projeto; ② separador Deployments; ③ o domínio de produção tem associados `docs.epocanvas.com` (domínio personalizado) e `epocanvas-docs.pages.dev` (domínio predefinido); ④ cada registo de implantação indica o ramo e a mensagem de commit; ⑤ estado e hora da implantação.*

:::note
Só um envio bem-sucedido gera um registo. Confira estado, ramo, commit e domínio em Deployments. Um comando rejeitado ou uma verificação falhada não atualiza o site.
:::

---

## Conhecer a configuração de build do projeto de upload direto

No separador **Settings** pode ver-se a diferença entre projetos de upload direto e projetos Git:

![Página Settings com a configuração de build do projeto epocanvas-docs; a linha Git repository aparece sem ligação](/images/canvas/deploy/cf-03-settings.png)

*Figura: separador Settings. ① Entrada para Settings; ② a linha Git repository mostra Connect (não ligado) — os projetos de upload direto não precisam de configuração de build via Git; o build é feito inteiramente na sua máquina local.*

:::tip
O envio direto evita a fila de builds da nuvem. A máquina precisa dos Node, pnpm, Git e credenciais adequados; não tem de ser sempre o mesmo computador.
:::

---

## Método 2: Ligar um repositório Git com build automático (opcional)

Para compilar a cada push, crie um projeto Pages integrado com Git e ligue o repositório. Segue-se um guia de configuração, não uma afirmação de ativação ou de testes nesta revisão.

### Passo 1: Entrar no fluxo de criação

Na página da lista de projetos Workers & Pages, clique no botão **Create application** no canto superior direito (ver a marcação ② na imagem do [Passo 3 do Método 1](#passo-3-localizar-o-seu-projeto-na-consola)) e escolha o separador **Pages**.

### Passo 2: Ligar o repositório Git

1. No ecrã de criação, escolha **Connect to Git**;
2. Autorize o Cloudflare a aceder à sua conta GitHub;
3. Na lista de repositórios, escolha o repositório de documentação `epocanvas-docs`;
4. Clique em **Iniciar configuração**.

### Passo 3: Preencher a configuração de build

Em "Configurar builds e implantações", preencha a seguinte configuração:

| Item de configuração | Valor a preencher |
| :--- | :--- |
| Predefinição de framework | `Astro` |
| Comando de build | `pnpm install --frozen-lockfile && pnpm run verify` |
| Diretório de saída | `dist` |
| Node.js | `22.23.4`, como em `.node-version` |
| pnpm | `10.34.5`, como em `packageManager` |

### Passo 4: Verificar o build automático

Confira Node e pnpm na nuvem, selecione **Guardar e implementar** e leia os registos de Deployments. Instalação, verificação completa e envio devem ter sucesso. Os pushes seguintes dependem do ramo de produção e da automatização configurados. O sucesso do GitHub CI, por si só, não publica o Pages.

:::caution
Nas páginas Settings dos projetos com integração Git aparece um bloco adicional de configuração de build (predefinição de framework, comando de build, etc.), diferente da interface do [projeto de upload direto](#conhecer-a-configuração-de-build-do-projeto-de-upload-direto) — se não encontrar a configuração de build em Settings, o projeto atual é de upload direto; é um comportamento normal.
:::

---

## Associar um domínio personalizado

O Cloudflare fornece `<project-name>.pages.dev` e permite associar um domínio próprio. Os domínios abaixo são exemplos; os prazos de DNS e certificados dependem do estado real.

### Passo 1: Abrir as definições de domínio personalizado

Na página de detalhes do projeto, clique no separador **Custom domains** e depois em **Set up a custom domain**:

![Página de domínios personalizados do projeto epocanvas-docs, com docs.epocanvas.com já associado e SSL ativo](/images/canvas/deploy/cf-04-domains.png)

*Figura: separador Custom domains. ① Entrada do separador; ② botão Set up a custom domain; ③ `docs.epocanvas.com` já associado, com estado Active e SSL enabled.*

### Passo 2: Adicionar o domínio e aguardar a ativação

1. Clique em **Set up a custom domain** e introduza o seu subdomínio (por exemplo, `docs.epocanvas.com`);
2. Se o DNS do domínio já estiver alojado no Cloudflare, o sistema adiciona automaticamente o registo CNAME; domínios alojados noutro serviço exigem adicionar manualmente um registo CNAME a apontar para `<nome-do-projeto>.pages.dev`;
3. Aguarde a validação DNS e o certificado, e teste o domínio quando estiver **Active**. Um número fixo de minutos não garante a conclusão.

O certificado HTTPS é emitido e renovado automaticamente pelo Cloudflare, sem pedido nem configuração manual.

---

## Verificar o resultado da implantação

### Verificar o estado HTTP pela linha de comandos

```bash
curl -sI https://epocanvas-docs.pages.dev
```

Exemplo de resposta (a data e o estado dependem do pedido real):

```text
HTTP/2 200
date: Fri, 11 Sep 2026 15:32:39 GMT
content-type: text/html; charset=utf-8
```

`200` confirma apenas a resposta correta deste URL, não as traduções, recursos, pesquisa ou conteúdo recente. Continue as verificações abaixo em ambos os domínios.

### Confirmação item a item no navegador

| Item de verificação | Resultado esperado |
| :--- | :--- |
| A página inicial e qualquer página de documentação abrem | A página renderiza por completo, sem ecrã em branco |
| O conteúdo recém-modificado já está ativo | As secções acabadas de editar estão visíveis online |
| Pesquisa em todo o site com `Ctrl+K` | Encontra os artigos mais recentes (o índice é gerado no build) |
| Alternância entre tema claro e escuro | A alternância funciona e mantém-se após atualizar a página |

---

## Problemas de implantação comuns

### O conteúdo online não atualizou após a implantação?

Force a atualização no navegador (`Ctrl+F5` / `Cmd+Shift+R`) para eliminar a cache; se ainda assim não atualizar, confirme na página Deployments da consola a hora do registo mais recente e compare com o domínio de pré-visualização da implantação usando `curl -sI`.

### O domínio personalizado indica falha no handshake SSL (Error 525)?

Confira validação e certificado em Custom domains, depois DNS, proxy e detalhes do erro. Não se limite a esperar alguns minutos; compare com `pages.dev`.

### O comando `pnpm run deploy` devolve o erro `Project not found`?

Primeiro execute `pnpm exec wrangler whoami` para confirmar que a sessão está iniciada; depois verifique se o `--project-name` em `scripts/verify-release.mjs` coincide com o nome do projeto na consola.

Para mais pontos de verificação, veja [FAQ e solução de problemas](/canvas/troubleshooting/).
