---
title: Início rápido (a funcionar em 3 minutos)
description: Preparação do ambiente local do EpoCanvas Docs, instalação de dependências, arranque do servidor de desenvolvimento local e consulta rápida dos comandos de uso corrente.
---

Para pôr este site de documentação a funcionar há dois caminhos; escolha um consoante o seu objetivo:

- **Só quer ver um site online de imediato**: não precisa de instalar nada; salte diretamente para a secção [Implantação com um clique](#implantação-com-um-clique-basta-clicar-num-botão-para-ficar-online) abaixo, clique num botão e passados dois minutos terá um endereço seu;
- **Quer escrever e alterar documentação**: comece por pôr o projeto a correr localmente conforme a secção [Preparação](#preparação), veja o efeito enquanto edita e, quando terminar, publique com os comandos de implantação da [consulta rápida dos comandos](#consulta-rápida-dos-comandos-de-desenvolvimento-habituais).

---

## Implantação com um clique: basta clicar num botão para ficar online

Os botões abaixo são os "botões de implantação" oficiais da Cloudflare, da Vercel e da Netlify. Ao clicar, abre-se o assistente de implantação da plataforma correspondente, que clona automaticamente este repositório para a sua própria conta GitHub e depois faz automaticamente o build e a publicação na cloud. Só precisa de uma conta GitHub durante todo o processo; não é preciso instalar Node.js nem pnpm no computador, nem escrever qualquer comando.

### Implantação no Cloudflare (recomendado)

[![Deploy to Cloudflare](/images/canvas/deploy/badge-cloudflare.svg)](https://deploy.workers.cloudflare.com/?url=https://github.com/shijianus/epocanvas-docs)

Depois de clicar no botão, o assistente tem três passos:

1. **Autorização e login**: inicie sessão no GitHub e depois na Cloudflare. Ambos têm planos gratuitos; se não tiver conta, registe-a na hora;
2. **Clonar o repositório**: a Cloudflare copia automaticamente este repositório para a sua conta GitHub; todas as alterações de conteúdo seguintes fazem-se no seu próprio repositório;
3. **Confirmar a configuração e implantar**: no fim, o assistente mostra uma página de configuração; confirme conforme a tabela abaixo e clique em Deploy:

| Item de configuração | O que o assistente mostra por predefinição | O que fazer |
| :--- | :--- | :--- |
| Nome do repositório / do projeto | Pré-preenchido com `epocanvas-docs` | Manter o valor predefinido |
| Comando de build | Detetado automaticamente como `pnpm run build` deste repositório | Manter o valor predefinido |
| Comando de implantação | Pré-preenchido com `pnpm run deploy` | **Alterar para `npx wrangler deploy`** |

:::caution
Altere obrigatoriamente o comando de implantação para `npx wrangler deploy`. O `pnpm run deploy` pré-preenchido é o comando de envio direto para o Cloudflare Pages reservado aos responsáveis por este site; ele implanta para um nome de projeto fixo no código e dá diretamente um erro no fluxo de implantação por botão.
:::

Na primeira implantação, como a Cloudflare deteta que o repositório não tem ficheiro de configuração de Workers, identifica automaticamente que se trata de um site estático Astro e cria no seu repositório um Pull Request (PR) com a configuração gerada automaticamente — basta aceitá-lo (merge); a partir daí, cada push é automaticamente construído e publicado. Do clique no botão à visualização do endereço, em condições normais, levam dois a três minutos.

Concluída a implantação, a Cloudflare atribui um endereço público do tipo `https://epocanvas-docs.<seu-subdomínio>.workers.dev`, com certificado HTTPS incluído. Para usar o seu próprio domínio, na consola entre em Workers & Pages → o seu projeto → **Settings** → **Domains & Routes** e adicione-o. A instância publicada serve de referência: o domínio padrão do Pages [https://epocanvas-docs.pages.dev](https://epocanvas-docs.pages.dev) e o domínio próprio [https://docs.epocanvas.com](https://docs.epocanvas.com).

### Implantação no Vercel e no Netlify

Se está habituado a outras plataformas, os dois botões seguintes fazem o mesmo; ambas as plataformas detetam automaticamente projetos Astro e não é preciso preencher manualmente nenhuma configuração de build:

[![Deploy with Vercel](/images/canvas/deploy/badge-vercel.svg)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fshijianus%2Fepocanvas-docs)

[![Deploy to Netlify](/images/canvas/deploy/badge-netlify.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/shijianus/epocanvas-docs)

- **Vercel**: clique no botão → autorize o GitHub → mantenha as opções predefinidas e clique em Deploy. No fim obtém o domínio `epocanvas-docs.vercel.app`; o plano Hobby pessoal é gratuito;
- **Netlify**: clique no botão → ligue o GitHub → a plataforma clona o repositório e faz o primeiro build automaticamente. No fim obtém o domínio `epocanvas-docs.netlify.app`; o plano gratuito chega.

:::note
O mecanismo dos três botões é o mesmo: clonar o repositório para a sua conta GitHub e configurar a implantação contínua "novo push, novo build e publicação automáticos". Escolha uma plataforma e utilize-a; não precisa de implantar em duplicado. Este site próprio está alojado por envio direto para o Cloudflare Pages (ver [Implantação no Cloudflare Pages](/canvas/cloudflare/)), caminho que não interfere com os botões acima — num site de documentação estático, a experiência de acesso vista pelo leitor é a mesma nas duas formas de alojamento.
:::

---

## Preparação

A implantação com um clique serve para "publicar o site primeiro", mas escrever e alterar a documentação acaba por se fazer sempre localmente. Se tenciona escrever conteúdo, confirme primeiro que o seu computador tem o seguinte ambiente de desenvolvimento básico:

| Ferramenta | Versão recomendada | Comando de verificação | Descrição |
| :--- | :--- | :--- | :--- |
| **Node.js** | `>= 18.20.8` (recomendado 20.3+ ou 22 LTS) | `node -v` | Ambiente de base para executar JavaScript e construir as páginas estáticas |
| **pnpm** | `>= 9` (10 em ambientes de CI) | `pnpm -v` | Gestor de pacotes recomendado, instala depressa e poupa espaço em disco |
| **Git** | Versão estável mais recente | `git --version` | Usado para obter o código e gerir versões |

:::tip
Se ainda não tem o `pnpm` instalado, pode instalá-lo rapidamente de forma global através do npm que vem com o Node.js:

```bash
npm install -g pnpm
```
:::

---

## 3 passos para correr localmente

### Primeiro passo: clonar o repositório de código para o computador

Abra o terminal (Terminal) e execute os seguintes comandos para clonar o código do projeto e entrar na pasta do projeto:

```bash
git clone https://github.com/shijianus/epocanvas-docs.git
cd epocanvas-docs
```

### Segundo passo: instalar as dependências do projeto

No diretório raiz do projeto, execute o comando de instalação:

```bash
pnpm install
```

O pnpm descarrega automaticamente as dependências de frontend necessárias conforme o `pnpm-lock.yaml`, incluindo o Astro, o Starlight e o módulo de processamento local de imagens; normalmente conclui-se em dezenas de segundos. No fim da instalação, o terminal mostra o tempo total:

```text
Done in 1m 3.2s using pnpm v9.15.9
```

### Terceiro passo: iniciar o servidor de pré-visualização de desenvolvimento local

Concluída a instalação das dependências, execute o comando de arranque:

```bash
pnpm run dev
```

O terminal produzirá uma saída semelhante à seguinte (o primeiro arranque precisa de pré-compilar as dependências e leva alguns segundos):

```text
astro  v5.18.2  ready in 5152 ms

┃ Local    http://localhost:4321/
┃ Network  use --host to expose

watching for file changes...
```

Neste momento, abra o navegador e aceda a `http://localhost:4321` para ver o site de documentação completo. Depois de alterar e gravar qualquer ficheiro `.md`, a página no navegador atualiza-se automaticamente com o conteúdo mais recente.

![Efeito de renderização real da página de início rápido no servidor de desenvolvimento local](/images/canvas/ui-quickstart.png)

*Figura: efeito de renderização real de `http://localhost:4321/canvas/deployment/`, ou seja, a página que está agora a ler.*

---

## Consulta rápida dos comandos de desenvolvimento habituais

No dia a dia de escrita de documentação ou de manutenção do projeto, usam-se sobretudo os seguintes comandos:

| Comando | Quando utilizar | Explicação detalhada |
| :--- | :--- | :--- |
| `pnpm run dev` | **Escrita de documentação no dia a dia** | Inicia o servidor de depuração local, com suporte para atualização em quente (HMR). Após alterar e gravar qualquer ficheiro `.md`, o navegador atualiza-se automaticamente. |
| `pnpm run build` | **Teste de compilação** | Compila localmente todas as páginas estáticas do site e gera no diretório `dist/` o HTML, o CSS e o índice de pesquisa do Pagefind. |
| `pnpm run preview` | **Pré-visualizar o resultado do build** | Inicia localmente um servidor Web leve para correr o resultado em `dist/`, para verificar se links e estilos estão corretos antes da publicação oficial. |
| `pnpm run deploy` | **Publicação online com um clique** | Executa primeiro automaticamente o build e depois chama a ferramenta Wrangler para enviar o `dist/` para o ambiente de produção online do Cloudflare Pages. |

Para os passos completos de publicação e os métodos de verificação online, leia **[Implantação no Cloudflare Pages](/canvas/cloudflare/)**.

---

## Onde ficam os ficheiros de configuração principais?

Se precisar de alterar as informações básicas do site, atenção sobretudo aos seguintes ficheiros:

- **Nome do site e menu do catálogo**: altere o ficheiro `astro.config.mjs` na raiz. Pode modificar o `title` (título do site), o `site` (domínio online) e a `sidebar` (menu do catálogo à esquerda).
- **Botões da barra de navegação superior**: altere o ficheiro `src/config/navigation.ts`. Aqui pode acrescentar ou remover botões do topo como "Início" e "Produto" e os respetivos caminhos de destino.
- **Cores das páginas e estilos de letra**: altere o ficheiro `src/styles/custom.css`. Aqui pode ajustar as cores do tema no modo claro e no modo escuro.
- **Acrescentar novos documentos**: crie diretamente um ficheiro `.md` na pasta `src/content/docs/canvas/` e registe-o na barra lateral; ver [Guia de escrita e formatação em Markdown](/canvas/markdown/).

---

## Passos seguintes

Com o servidor local a funcionar corretamente, pode continuar a explorar:

- **[Layout da página e experiência de leitura](/canvas/layout/)**: conhecer os detalhes da disposição da barra superior, da barra lateral e da área de texto.
- **[Regras de renderização em detalhe](/canvas/rendering/)**: perceber como o Markdown é transformado na página final, para evitar tropeçar na sintaxe de formatação.
- **[Implantação no Cloudflare Pages](/canvas/cloudflare/)**: publicar a documentação na internet e associar um domínio próprio.
