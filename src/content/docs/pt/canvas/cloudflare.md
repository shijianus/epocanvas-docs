---
title: Implantação no Cloudflare Pages
description: "Tutorial ilustrado completo para publicar o EpoCanvas Docs: upload direto pela linha de comandos do Wrangler, build automático via Git e associação de domínio personalizado, com capturas de ecrã reais da consola em cada passo."
---

Depois de escrever a documentação, é preciso publicá-la na internet para que a equipa e os utilizadores a possam consultar. O **EpoCanvas Docs** recomenda alojamento no **Cloudflare Pages**: não é preciso comprar servidores nem configurar o Nginx, basta enviar os ficheiros estáticos diretamente e o certificado HTTPS é obtido automaticamente. Este próprio site (`docs.epocanvas.com`) foi publicado com o método descrito neste artigo, e todas as capturas de ecrã da consola abaixo provêm de uma implantação real.

---

## Preparação

### Do que precisa

| Item | Explicação |
| :--- | :--- |
| **Conta Cloudflare** | Registo gratuito em [dash.cloudflare.com](https://dash.cloudflare.com/); o serviço Pages não exige plano pago |
| **Build completo em local** | Primeiro execute `pnpm run build` com sucesso e confirme que o diretório `dist/` é gerado corretamente; ver [Início rápido](/canvas/deployment/) |
| **Node.js + pnpm** | Os comandos de implantação dependem do ambiente de desenvolvimento local; os requisitos de versão são os mesmos do capítulo de início rápido |

### Como escolher entre os dois métodos de implantação

![Diagrama comparativo dos dois caminhos de implantação no Cloudflare Pages: à esquerda upload direto local pela linha de comandos (usado por este site), à direita build automático a partir do repositório Git (recomendado para trabalho em equipa)](/images/canvas/docs-deploy-compare.svg)

*Figura: comparação dos dois caminhos de implantação no Cloudflare Pages. À esquerda, build na própria máquina seguido de upload direto para a edge com o Wrangler (o método realmente usado por este site); à direita, build automático na nuvem acionado por Webhook do GitHub.*

| Item de comparação | Método 1: upload direto por linha de comandos | Método 2: build automático via Git |
| :--- | :--- | :--- |
| Modo de operação | Executar `pnpm run deploy` em local | Enviar o código para o GitHub aciona automaticamente |
| Dificuldade inicial | Baixa, dois comandos | Média, exige uma configuração na consola |
| Cenário adequado | Primeira publicação, manutenção por uma pessoa, atualizações rápidas | Colaboração de várias pessoas, desejo de "commit = online" |
| Usado por este site | ✅ Sim (verificável na consola) | Não ativado; pode ser acrescentado a qualquer momento |

:::tip
Os dois métodos podem coexistir: use o build automático via Git no dia a dia e, para corrigir erros urgentes, faça upload direto com `pnpm run deploy` em local, sobrepondo o que está online.
:::

:::tip[Não quer escrever comandos?]
A página [Início rápido](/canvas/deployment/) disponibiliza botões de implantação com um clique para Cloudflare, Vercel e Netlify: clique, autorize a conta, confirme a configuração e o site de documentação fica publicado na sua própria conta de nuvem; ver [implantação com um clique](/canvas/deployment/#implantação-com-um-clique-basta-clicar-num-botão-para-ficar-online). O botão do Cloudflare usa a hospedagem estática dos Workers, um caminho independente do método Pages apresentado nesta página; para um site de documentação estático a experiência de acesso é idêntica, basta escolher um dos caminhos.
:::

---

## Método 1: Upload direto pela linha de comandos local (recomendado na primeira vez)

Neste método, o build é feito na sua máquina e o resultado é enviado diretamente para o Cloudflare; é o método de implantação **realmente usado por este site**.

### Passo 1: Iniciar sessão na conta Cloudflare

O projeto já inclui o Wrangler (a ferramenta de linha de comandos oficial do Cloudflare); a primeira utilização exige autorização de sessão no navegador:

```bash
npx wrangler login
```

Ao executar, o terminal mostra `Opening a link in your default browser...`; o navegador abre a página de autorização do Cloudflare e, depois de clicar em **Allow**, o terminal confirma que a sessão foi iniciada. Confirme o estado da sessão com o comando:

```bash
npx wrangler whoami
```

:::caution
Se saltar a sessão e executar a implantação diretamente, o terminal mostra `You are not authenticated. Please run 'wrangler login'.` e nenhuma implantação é efetuada.
:::

### Passo 2: Build e upload num só comando

O projeto traz pré-definido em `package.json` um comando de publicação com um só passo:

```bash
pnpm run deploy
```

É equivalente a executar duas etapas em sequência: primeiro `astro build` compila todo o site para o diretório `dist/` e gera o índice de pesquisa; depois `wrangler pages deploy dist` envia o resultado diretamente para o Cloudflare. O resultado real da fase de build é o seguinte:

```text
00:06:22 [build] 15 page(s) built in 18.73s
00:06:22 [build] Complete!
```

Concluído o upload, o Wrangler mostra o endereço de pré-visualização dessa implantação. Na primeira implantação, o Wrangler pergunta interativamente o nome do projeto; basta premir Enter para usar o `epocanvas-docs` pré-definido em `package.json`.

### Passo 3: Localizar o seu projeto na consola

Abra [dash.cloudflare.com](https://dash.cloudflare.com/) e clique no menu à esquerda em **Compute (Workers & Pages)** para ver a lista de projetos. A imagem seguinte assinala três pontos-chave:

![Lista de projetos Workers & Pages da consola Cloudflare, com o menu à esquerda, o botão Create application e o projeto epocanvas-docs assinalados](/images/canvas/deploy/cf-01-projects-list.png)

*Figura: lista de projetos Workers & Pages. ① Entrada no menu à esquerda para Workers & Pages; ② botão Create application para criar um novo projeto; ③ o nosso projeto `epocanvas-docs`, com o domínio de acesso `epocanvas-docs.pages.dev` e a hora da última implantação.*

Clique no nome do projeto para entrar nos detalhes; o separador **Deployments** mostra o histórico completo de implantações:

![Página de histórico de implantações do projeto epocanvas-docs, com o domínio de produção, os registos de implantação e o estado assinalados](/images/canvas/deploy/cf-02-deployments.png)

*Figura: página de histórico de implantações. ① Nome do projeto; ② separador Deployments; ③ o domínio de produção tem associados `docs.epocanvas.com` (domínio personalizado) e `epocanvas-docs.pages.dev` (domínio predefinido); ④ cada registo de implantação indica o ramo e a mensagem de commit; ⑤ estado e hora da implantação.*

:::note
Cada execução de `pnpm run deploy` acrescenta um registo no topo da lista, que se torna automaticamente a versão de produção atual. O histórico fica guardado na lista e, se algo correr mal, é possível reverter a qualquer momento.
:::

---

## Conhecer a configuração de build do projeto de upload direto

No separador **Settings** pode ver-se a diferença entre projetos de upload direto e projetos Git:

![Página Settings com a configuração de build do projeto epocanvas-docs; a linha Git repository aparece sem ligação](/images/canvas/deploy/cf-03-settings.png)

*Figura: separador Settings. ① Entrada para Settings; ② a linha Git repository mostra Connect (não ligado) — os projetos de upload direto não precisam de configuração de build via Git; o build é feito inteiramente na sua máquina local.*

:::tip
Isto explica a vantagem do upload direto: o ambiente de build é o seu próprio computador, sem ficar sujeito à fila de builds do Cloudflare; o preço é que cada atualização tem de ser executada a partir do computador que faz a implantação.
:::

---

## Método 2: Ligar um repositório Git com build automático (opcional)

Se quiser que "enviar código signifique ficar online automaticamente", pode ligar o projeto a um repositório do GitHub e deixar o Cloudflare fazer o build automaticamente na nuvem.

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
| Comando de build | `pnpm run build` |
| Diretório de saída do build | `dist` |

### Passo 4: Verificar o build automático

Clique em **Guardar e implementar**; o Cloudflare conclui automaticamente o primeiro build. Depois, cada push para o ramo `main` faz o Cloudflare obter, construir e publicar automaticamente. O registo de build de cada implantação pode ser consultado no separador **Deployments** do projeto, clicando na implantação correspondente.

:::caution
Nas páginas Settings dos projetos com integração Git aparece um bloco adicional de configuração de build (predefinição de framework, comando de build, etc.), diferente da interface do [projeto de upload direto](#conhecer-a-configuração-de-build-do-projeto-de-upload-direto) — se não encontrar a configuração de build em Settings, o projeto atual é de upload direto; é um comportamento normal.
:::

---

## Associar um domínio personalizado

O domínio `xxx.pages.dev` atribuído por predefinição pelo Cloudflare pode ser usado diretamente; associar o seu próprio domínio (por exemplo, `docs.epocanvas.com`) demora apenas alguns minutos.

### Passo 1: Abrir as definições de domínio personalizado

Na página de detalhes do projeto, clique no separador **Custom domains** e depois em **Set up a custom domain**:

![Página de domínios personalizados do projeto epocanvas-docs, com docs.epocanvas.com já associado e SSL ativo](/images/canvas/deploy/cf-04-domains.png)

*Figura: separador Custom domains. ① Entrada do separador; ② botão Set up a custom domain; ③ `docs.epocanvas.com` já associado, com estado Active e SSL enabled.*

### Passo 2: Adicionar o domínio e aguardar a ativação

1. Clique em **Set up a custom domain** e introduza o seu subdomínio (por exemplo, `docs.epocanvas.com`);
2. Se o DNS do domínio já estiver alojado no Cloudflare, o sistema adiciona automaticamente o registo CNAME; domínios alojados noutro serviço exigem adicionar manualmente um registo CNAME a apontar para `<nome-do-projeto>.pages.dev`;
3. Aguarde a emissão do certificado (normalmente 2 a 5 minutos); quando o estado passar a **Active** (como o ③ da imagem acima), o site já pode ser acedido pelo novo domínio.

O certificado HTTPS é emitido e renovado automaticamente pelo Cloudflare, sem pedido nem configuração manual.

---

## Verificar o resultado da implantação

### Verificar o estado HTTP pela linha de comandos

```bash
curl -sI https://epocanvas-docs.pages.dev
```

Resultado real devolvido:

```text
HTTP/2 200
date: Fri, 11 Sep 2026 15:32:39 GMT
content-type: text/html; charset=utf-8
```

Ver `200` significa que o site está a funcionar corretamente. Depois de associar o domínio personalizado, repita o teste com o URL do seu domínio.

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

A emissão do certificado precisa de 2 a 5 minutos para ficar ativa a nível global; aguarde e force a atualização; entretanto pode aceder ao domínio predefinido `xxx.pages.dev`.

### O comando `pnpm run deploy` devolve o erro `Project not found`?

Primeiro execute `npx wrangler whoami` para confirmar que a sessão está iniciada; depois verifique se o `--project-name` do script `deploy` em `package.json` coincide com o nome do projeto na consola.

Para mais pontos de verificação, veja [FAQ e solução de problemas](/canvas/troubleshooting/).
