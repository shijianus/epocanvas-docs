---
title: 버전 관리 및 자동화 워크플로
description: EpoCanvas Docs의 버전 번호 명명 규칙, 버전 업데이트의 표준 발행 단계와 GitHub Actions 자동 발행 파이프라인.
---

독자가 "현재 문서가 제품의 어느 버전에 대응하는지" 명확히 알 수 있게 하고, 팀이 수정 이력을 체계적으로 추적할 수 있도록 **EpoCanvas Docs**는 유의적 버전 번호와 고정된 발행 절차를 채택합니다.

---

## 1. 유의적 버전 번호 규칙 (SemVer)

버전 번호는 `v主版本.次版本.修订号` 형식을 사용합니다(현재 `v1.2.0`):

| 변경 유형 | 예시 | 발생 시나리오 |
| :--- | :--- | :--- |
| **주 버전 (Major)** | `v2.0.0` | 문서 시스템의 대대적인 재구성(예: Astro 주 버전 업그레이드, 레이아웃 완전 교체). |
| **부 버전 (Minor)** | `v1.2.0` | 새 문서 챕터 추가, 새 언어 추가, 디자인 시스템 업그레이드 등 비교적 큰 기능. |
| **수정 버전 (Patch)** | `v1.2.1` | 오탈자 수정, 코드 예제 업데이트, 자잘한 스타일 조정 등 작은 변경. |

---

## 2. 새 버전을 발행하는 표준 3단계 절차

### 첫 번째 단계: 업데이트 설명 기록 (`RELEASE_NOTES.md`)

프로젝트 루트의 `RELEASE_NOTES.md`에 이번 업데이트 내용을 분명히 적습니다. 이 파일은 GitHub Release의 설명 텍스트로 사용됩니다:

```markdown
## [v1.2.1] - 2026-09-18

### 수정
- 배포 챕터의 명령어 오탈자를 수정했습니다.
- 화면 스크린샷을 최신 버전으로 업데이트했습니다.
```

### 두 번째 단계: package.json 버전 번호 업데이트

내비게이션 바의 버전 배지는 이미 `package.json`의 `version` 필드와 자동으로 연동되어 사이트 전체 버전의 단일 데이터 원천(Single Source of Truth)으로 동작합니다. `package.json`에서 버전 번호를 업데이트하면(또는 `pnpm version patch` 실행) 상단 바 배지가 자동으로 최신 버전 번호로 동기화되므로 여러 곳을 수동으로 고칠 필요가 없습니다:

```json
{
  "name": "epocanvas-docs",
  "version": "1.2.1"
}
```

### 세 번째 단계: 코드 커밋 및 Git 태그 부착

```bash
# 1. 모든 변경 사항 커밋
git add .
git commit -m "chore(release): bump version to v1.2.1"
git push origin main

# 2. 대응하는 버전 태그를 부착하고 푸시
git tag v1.2.1
git push origin v1.2.1
```

---

## 3. GitHub Actions 자동 발행 파이프라인

프로젝트는 `.github/workflows/release.yml`에 자동 발행 워크플로를 미리 준비해 두었으며 실제 내용은 다음과 같습니다:

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'   # v로 시작하는 태그를 푸시하면 자동으로 트리거됩니다

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
          gh release create "${TAG_NAME}" \
            --title "EpoCanvas Docs ${TAG_NAME}" \
            --notes-file RELEASE_NOTES.md \
            --latest
```

`v1.2.1` 태그를 푸시하면 GitHub가 자동으로 파이프라인을 시작합니다:

1. 저장소 코드를 체크아웃합니다;
2. `RELEASE_NOTES.md`를 설명으로 삼아 저장소의 **Releases** 페이지에 정식 버전을 만들고 latest로 표시합니다;
3. 독자는 상단 바의 버전 배지를 클릭해 모든 히스토리 버전 아카이브를 볼 수 있습니다.

:::note
이 파이프라인은 GitHub Release 생성만 담당하며 **사이트 배포는 실행하지 않습니다**. 온라인 업데이트는 Cloudflare Pages의 Git 자동 빌드(또는 로컬의 `pnpm run deploy`)로 완료되며, 둘은 서로 의존하지 않습니다. 자세한 내용은 [Cloudflare Pages 배포 및 출시](/canvas/cloudflare/)를 참조하세요.
:::

---

## 4. 콘텐츠 협업 워크플로

여러 사람이 문서를 함께 관리할 때는 "브랜치 → 검토 → 병합 → 발행"의 고정 절차로 협업하여 온라인 내용이 항상 빌드 가능한 상태를 유지하도록 합니다:

```text
main 브랜치(항상 발행 가능, 온라인 사이트와 대응)
  │
  ├─ 1. main에서 기능 브랜치 생성     git checkout -b docs/new-guide
  ├─ 2. Markdown 작성/수정
  ├─ 3. 로컬 자가 점검                pnpm exec astro check && pnpm run build
  ├─ 4. 브랜치 푸시 후 Pull Request 열기  CI 빌드 트리거
  ├─ 5. 검토 통과 후 main에 병합      온라인 자동 배포 트리거
  └─ 6. 발행이 필요하면 v* 태그 부착   GitHub Release 파이프라인 트리거
```

### Pull Request 검토 핵심 항목

CI(`build.yml`)는 "빌드가 통과하는지"만 보장하며, 다음 사항은 사람이 직접 검토해야 합니다:

- **링크 유효성**: 새로 추가된 사이트 내부 링크, 앵커가 이동되는지, 경로를 바꾼 문서에 리다이렉트가 등록되었는지;
- **렌더링 효과**: 콜아웃의 `:::` 문법, 코드 블록 표기가 페이지에 정상적으로 표시되는지(CI는 시각적 요소를 검사하지 않음);
- **그림과 글의 대응**: 새로 추가된 스크린샷에 설명 텍스트가 있는지, 선명한지;
- **명명 규범**: 파일 이름은 소문자+중간줄표, Frontmatter의 `title`, `description` 완전히 작성.

### 역할 분담 제안

| 역할 | 책임 |
| :--- | :--- |
| 문서 작성자 | 내용 작성, 로컬 자가 점검, PR 발행 |
| 검토자 | 렌더링 효과와 링크 대조, 코드 병합 |
| 발행 관리자 | 버전 태그 부착, `RELEASE_NOTES.md` 유지 관리, 내비게이션 바 버전 배지 동기화 |

---

## 5. CI 빌드 검사

저장소에는 `.github/workflows/build.yml`이 구성되어 있어 `main` 브랜치로의 모든 푸시와 모든 Pull Request에서 의존성 설치와 전체 빌드가 자동 실행되며, 끊어진 링크, Frontmatter 오류 등 빌드 시점 문제를 미리 드러냅니다. 커밋 전에 로컬에서 같은 검사를 한 번 실행하면 푸시 후 CI 실패를 피할 수 있습니다:

```bash
pnpm exec astro check && pnpm run build
```
