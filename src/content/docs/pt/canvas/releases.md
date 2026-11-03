---
title: Gestão de versões e fluxos de trabalho automatizados
description: Norma de numeração de versões do EpoCanvas Docs, passos padrão de publicação de uma nova versão e pipeline de publicação automática com GitHub Actions.
---

Para que os leitores saibam com clareza "a que versão do produto corresponde a documentação atual" e para que a equipa consiga acompanhar o histórico de alterações de forma organizada, o **EpoCanvas Docs** adota numeração de versões semântica e um fluxo de publicação fixo.

![Fluxo de publicação: cinco pontos de verificação, desde a edição do conteúdo e a execução local de pnpm run verify, passando pela revisão e merge em main, até a criação da tag v*; a tag cria apenas um GitHub Release, enquanto a implantação do site exige executar pnpm run deploy em main separadamente](/images/canvas/docs-release-flow.svg)

---

## 1. Regra de numeração semântica de versões (SemVer)

As versões estáveis usam `vMAJOR.MINOR.PATCH`; as preliminares acrescentam um identificador, como a candidata atual `v1.3.2-beta.1`. Isto não significa que tenha sido publicada uma Release ou implantada em produção.

| Tipo de alteração | Exemplo | Situação que o desencadeia |
| :--- | :--- | :--- |
| **Versão principal (Major)** | `v2.0.0` | Refatorização de grande escala do sistema de documentação (como atualizar a versão principal do Astro ou substituir por completo o layout). |
| **Versão secundária (Minor)** | `v1.2.0` | Funcionalidades de maior dimensão, como novos capítulos de documentação, novos idiomas ou atualização do sistema de desenho. |
| **Revisão (Patch)** | `v1.2.1` | Pequenas correções, como corrigir gralhas, atualizar exemplos de código ou ajustar estilos menores. |

---

## 2. Fluxo padrão de 3 passos para publicar uma nova versão

### Passo 1: registar as notas de atualização (`RELEASE_NOTES.md`)

Descreva a atualização em `RELEASE_NOTES.md`, na raiz do projeto; este ficheiro será o corpo da Release do GitHub. A primeira linha tem de ser exatamente `# EpoCanvas Docs v<versão>`, com a mesma versão de `package.json`; `verify:config` verifica este formato. O exemplo apenas ilustra o formato: numa publicação real, use uma versão ainda não utilizada. As notas de uma pré-versão também devem incluir `candidate` ou `prerelease` no texto.

```markdown
# EpoCanvas Docs v1.2.1

2026-09-14

### Correções
- Corrigido um erro ortográfico num comando do capítulo de implantação.
- Capturas de ecrã da interface atualizadas para a versão mais recente.
```

### Passo 2: atualizar o número de versão no package.json

O emblema de versão da barra de navegação está automaticamente associado ao campo `version` de `package.json`, que funciona como fonte única de dados (Single Source of Truth) da versão de todo o site. Atualize o número de versão em `package.json` (ou execute `pnpm version patch --no-git-tag-version`) e o emblema da barra superior sincroniza-se automaticamente com o número mais recente, sem necessidade de alterações manuais em vários locais:

```json
{
  "name": "epocanvas-docs",
  "version": "1.2.1"
}
```

### Passo 3: submeter o código e criar a tag Git

```bash
# 1. Submeter todas as alterações
git add .
git commit -m "chore(release): bump version to v1.2.1"
git push origin main

# 2. Criar a tag de versão correspondente e enviá-la
git tag v1.2.1
git push origin v1.2.1
```

---

## 3. Pipeline de publicação automática com GitHub Actions

O workflow de referência é [`.github/workflows/release.yml`](https://github.com/shijianus/epocanvas-docs/blob/main/.github/workflows/release.yml); o YAML completo não é copiado aqui. É acionado ao enviar uma tag `v*`. Antes de criar a tag, execute esta verificação local; ela não escreve Releases no GitHub nem implanta o site:

```bash
pnpm run verify
```

1. O job `validate` usa permissões apenas de leitura, `contents: read`, e executa primeiro a verificação completa `pnpm run verify`.
2. Só depois de a validação passar é que o job `publish` recebe permissões `contents: write` para criar ou atualizar a Release do GitHub com `RELEASE_NOTES.md`.
3. As releases existentes são atualizadas no local, sem eliminação nem recriação. O GitHub determina `Latest` segundo a versão das releases estáveis; as pré-versões não são marcadas como `Latest`. O emblema de versão do cabeçalho permite consultar o histórico.

:::note
Este workflow apenas cria ou atualiza Releases do GitHub; não implanta o site automaticamente. Fazer merge para `main` também não o implanta. A publicação usa `pnpm run deploy` em local ou uma integração Git do alojamento configurada separadamente; consulte [Implantação no Cloudflare Pages](/canvas/cloudflare/).
:::

---

## 4. Fluxo de trabalho de colaboração de conteúdo

Quando várias pessoas mantêm a documentação, a colaboração segue o fluxo fixo "branch → revisão → merge → publicação", garantindo que o conteúdo online está sempre compilável (build):

```text
Ramo main (origem das versões; o site só muda após uma implantação)
  │
  ├─ 1. Criar um ramo de funcionalidade a partir do main   git checkout -b docs/new-guide
  ├─ 2. Escrever/modificar Markdown
  ├─ 3. Verificação local                                  pnpm run verify
  ├─ 4. Enviar o ramo e abrir um Pull Request              aciona a validação completa de CI
  ├─ 5. Após aprovação, fazer merge para o main             não implanta o site automaticamente
  └─ 6. Quando for preciso publicar uma versão, criar tag v* aciona o pipeline de GitHub Release
```

### Pontos a verificar na revisão do Pull Request

O CI (`build.yml`) executa `pnpm run verify`: testes, verificações de configuração e tipos do Astro, build e verificações de conteúdo e artefactos. O aspeto visual continua a exigir revisão manual:

- **Validade dos links**: se os novos links internos e âncoras funcionam; se os documentos com caminhos alterados têm redirecionamento registado;
- **Efeito de renderização**: se a sintaxe `:::` dos blocos de aviso e as anotações dos blocos de código aparecem corretamente na página (o CI não verifica o aspeto visual);
- **Correspondência entre texto e imagem**: se as novas capturas de ecrã têm texto explicativo e se estão nítidas;
- **Normas de nomenclatura**: nomes de ficheiros em minúsculas com hífen, e `title` e `description` do Frontmatter completos.

### Sugestão de divisão de tarefas

| Papel | Responsabilidades |
| :--- | :--- |
| Autor da documentação | Escrever o conteúdo, fazer a verificação local, iniciar o PR |
| Revisor | Verificar o efeito de renderização e os links, fazer merge do código |
| Administrador de publicação | Criar as tags de versão, manter `RELEASE_NOTES.md`, sincronizar o emblema de versão da barra de navegação |

---

## 5. Verificações de build no CI

`.github/workflows/build.yml` executa a validação completa nos push para `main` e nos Pull Requests. O CI usa Node.js 22.23.4, fixado em `.node-version`, e pnpm 10.34.5. Execute a mesma verificação local antes de submeter:

```bash
pnpm run verify
```
