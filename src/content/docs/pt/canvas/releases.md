---
title: Gestão de versões e fluxos de trabalho automatizados
description: Norma de numeração de versões do EpoCanvas Docs, passos padrão de publicação de uma nova versão e pipeline de publicação automática com GitHub Actions.
---

Para que os leitores saibam com clareza "a que versão do produto corresponde a documentação atual" e para que a equipa consiga acompanhar o histórico de alterações de forma organizada, o **EpoCanvas Docs** adota numeração de versões semântica e um fluxo de publicação fixo.

---

## 1. Regra de numeração semântica de versões (SemVer)

O número de versão segue o formato `vversão principal.versão secundária.revisão` (atualmente `v1.2.0`):

| Tipo de alteração | Exemplo | Situação que o desencadeia |
| :--- | :--- | :--- |
| **Versão principal (Major)** | `v2.0.0` | Refatorização de grande escala do sistema de documentação (como atualizar a versão principal do Astro ou substituir por completo o layout). |
| **Versão secundária (Minor)** | `v1.2.0` | Funcionalidades de maior dimensão, como novos capítulos de documentação, novos idiomas ou atualização do sistema de desenho. |
| **Revisão (Patch)** | `v1.2.1` | Pequenas correções, como corrigir gralhas, atualizar exemplos de código ou ajustar estilos menores. |

---

## 2. Fluxo padrão de 3 passos para publicar uma nova versão

### Passo 1: registar as notas de atualização (`RELEASE_NOTES.md`)

Escreva com clareza o conteúdo desta atualização em `RELEASE_NOTES.md`, na raiz do projeto; este ficheiro servirá como texto de descrição do GitHub Release:

```markdown
## [v1.2.1] - 2026-09-14

### Correções
- Corrigido um erro ortográfico num comando do capítulo de implantação.
- Capturas de ecrã da interface atualizadas para a versão mais recente.
```

### Passo 2: atualizar o número de versão no package.json

O emblema de versão da barra de navegação está automaticamente associado ao campo `version` de `package.json`, que funciona como fonte única de dados (Single Source of Truth) da versão de todo o site. Atualize o número de versão em `package.json` (ou execute `pnpm version patch`) e o emblema da barra superior sincroniza-se automaticamente com o número mais recente, sem necessidade de alterações manuais em vários locais:

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

O projeto inclui de origem, em `.github/workflows/release.yml`, um fluxo de trabalho de publicação automática, cujo conteúdo real é o seguinte:

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'   # acionado automaticamente ao enviar uma tag que comece por v

permissions:
  contents: write

jobs:
  release:
    name: Publish GitHub Release
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Create GitHub Release
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          TAG_NAME="${{ github.ref_name }}"
          echo "Publishing release for tag: ${TAG_NAME}"
          # 同名 release 已存在时（例如重新推送 tag，或 tag 删除后旧 release 转为草稿）先删掉，再按当前 RELEASE_NOTES.md 重新发布
          gh release delete "${TAG_NAME}" --yes 2>/dev/null || true
          gh release create "${TAG_NAME}" \
            --title "EpoCanvas Docs ${TAG_NAME}" \
            --notes-file RELEASE_NOTES.md \
            --latest
```

Depois de enviar a tag `v1.2.1`, o GitHub arranca automaticamente o pipeline:

1. Faz checkout do código do repositório;
2. Com `RELEASE_NOTES.md` como descrição, cria a versão oficial na página **Releases** do repositório e marca-a como latest;
3. Os leitores podem clicar no emblema de versão da barra superior para consultar todo o arquivo de versões anteriores.

:::note
Este pipeline apenas cria o GitHub Release e **não executa a implantação do site**. A atualização online é feita pelo build automático via Git do Cloudflare Pages (ou por `pnpm run deploy` local); ambos são independentes entre si, ver [Implantação no Cloudflare Pages](/canvas/cloudflare/).
:::

---

## 4. Fluxo de trabalho de colaboração de conteúdo

Quando várias pessoas mantêm a documentação, a colaboração segue o fluxo fixo "branch → revisão → merge → publicação", garantindo que o conteúdo online está sempre compilável (build):

```text
ramo main (sempre publicável, corresponde ao site online)
  │
  ├─ 1. Criar um ramo de funcionalidade a partir do main   git checkout -b docs/new-guide
  ├─ 2. Escrever/modificar Markdown
  ├─ 3. Verificação local                                  pnpm exec astro check && pnpm run build
  ├─ 4. Enviar o ramo e abrir um Pull Request              aciona o build de CI
  ├─ 5. Após aprovação na revisão, fazer merge para o main aciona a implantação automática online
  └─ 6. Quando for preciso publicar uma versão, criar tag v* aciona o pipeline de GitHub Release
```

### Pontos a verificar na revisão do Pull Request

O CI (`build.yml`) só garante que "o build passa"; as questões seguintes exigem revisão humana:

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

O repositório tem configurado `.github/workflows/build.yml`, que executa automaticamente a instalação de dependências e o build completo em cada push para o ramo `main` e em cada Pull Request, expondo antecipadamente problemas de build como links quebrados ou erros de Frontmatter. Executar localmente a mesma verificação antes de submeter evita falhas do CI depois do push:

```bash
pnpm exec astro check && pnpm run build
```
