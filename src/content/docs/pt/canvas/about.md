---
title: O que é isto
description: "Comece por ler este artigo: EpoCanvas Docs é o projeto de documentação oficial do EpoCanvas. Esta página explica o que é, que relação tem com o repositório de código, que utilidade tem na prática e por onde deve começar a leitura, consoante o tipo de leitor."
---

**EpoCanvas Docs é o projeto de documentação oficial do projeto EpoCanvas**. Em termos simples: o que este repositório entrega é a própria documentação — todo o site que está agora a navegar é o seu produto final. O repositório não contém código funcional de qualquer outro software; o "produto" que procura é precisamente este site de documentação.

---

## O que significa "projeto de documentação"

Este termo tem dois sentidos, ambos válidos ao mesmo tempo:

1. **É um manual.** O conteúdo gira em torno de "o que é, como se usa, como se altera, como se publica": como operar a interface de leitura, como escrever novos documentos, onde alterar a configuração e qual é o comando de implantação. Só tem um objetivo — permitir a quem receber o EpoCanvas fazer as coisas seguindo a documentação, sem ter de perguntar a toda a gente.
2. **É também um sistema de site que corre diretamente.** Clone o repositório para o seu computador, execute os dois comandos `pnpm install` e `pnpm run dev`, e obterá um site exatamente igual ao que tem diante de si. Todo o código é baseado em Astro 5 e Starlight, sob licença MIT, e pode ser levado inteiro e transformado no site de documentação do seu próprio projeto.

Há ainda uma característica fácil de ignorar: **cada funcionalidade descrita nesta documentação está a ser usada por si neste momento**. A disposição de leitura em três colunas, a pesquisa em todo o site com `Ctrl + K`, a troca imediata entre 10 idiomas no canto superior direito — o que a documentação descreve são as capacidades que este próprio site implementa; basta ler e experimentar para confirmar.

---

## Qual é a sua utilidade concreta

Consoante o perfil do leitor, este projeto de documentação cumpre três funções:

| Quem é você | O que pode fazer por si | Onde começar |
| :--- | :--- | :--- |
| **Leitor que só quer consultar** | Ver como se usa uma funcionalidade ou como se resolve um erro | Caixa de pesquisa na barra superior ou pesquisa em todo o site com `Ctrl + K`, saltando diretamente para o capítulo correspondente |
| **Programador que quer montar o seu próprio site de documentação** | Fornece um conjunto completo e funcional de código-fonte de um site de documentação e o respetivo processo de implantação | Visão geral do produto → Início rápido → Implantação |
| **Autor que participa na escrita da documentação** | Define onde ficam os ficheiros, como escrever o formato, onde colocar as imagens e como publicar | Os três capítulos do grupo "Escrita de documentação e gestão de conteúdo" |

Em resumo: **permitir que o utilizador perceba, que o programador leve o código consigo e que o autor tenha regras a seguir.**

---

## O que contém este projeto

A barra lateral está dividida em cinco grupos, cada um a responder a uma pergunta:

- **Visão geral do produto e primeiros passos**: o que é isto? Como o pôr a correr localmente?
- **Funcionalidades principais e guias de utilização**: como se usam concretamente a interface de leitura, a pesquisa, o multilinguismo e a navegação?
- **Escrita de documentação e gestão de conteúdo**: como escrever novos documentos? Que regras existem para a formatação e renderização de Markdown?
- **Configuração e desenvolvimento personalizado**: onde se alteram o título do site, o menu de navegação e as cores do tema? Como se alteram os componentes?
- **Publicação e operações de implantação**: como publicar online, associar um domínio e tratar de SEO e da gestão de versões?

Cada artigo pode ser consultado de forma independente; não é preciso ler tudo por ordem.

---

## Dois mal-entendidos comuns

**Mal-entendido 1: "Isto é o manual de um qualquer software, vou à procura desse software."**
Neste repositório só existe o código-fonte do site de documentação, sem código de qualquer outro software; o objeto realmente explicado na documentação é a própria utilização, personalização e implantação deste sistema de site de documentação.

**Mal-entendido 2: "É um site só de leitura, pouco serve descarregá-lo."**
Pelo contrário: o código-fonte está totalmente aberto no GitHub e corre localmente com dois comandos; usá-lo como modelo para criar o site de documentação do seu próprio projeto é precisamente um dos seus fins concebidos.

---

## Passos seguintes

- Para ver a apresentação completa do posicionamento do produto, das funcionalidades principais e das escolhas tecnológicas, leia **[Visão geral do produto e valor central](/canvas/)**.
- Para pôr o site a correr localmente de imediato, leia **[Início rápido (a funcionar em 3 minutos)](/canvas/deployment/)**.
- Se só quer consultar um problema concreto, use diretamente a caixa de pesquisa da barra superior ou a pesquisa com `Ctrl + K`.
