---
title: 버전 관리 및 자동화 워크플로
description: EpoCanvas Docs의 버전 번호 명명 규칙, 버전 업데이트의 표준 발행 단계와 GitHub Actions 자동 발행 파이프라인.
---

독자가 "현재 문서가 제품의 어느 버전에 대응하는지" 명확히 알 수 있게 하고, 팀이 수정 이력을 체계적으로 추적할 수 있도록 **EpoCanvas Docs**는 유의적 버전 번호와 고정된 발행 절차를 채택합니다.

---

## 1. 유의적 버전 번호 규칙 (SemVer)

안정 버전은 `vMAJOR.MINOR.PATCH`이며 사전 릴리스에는 식별자를 붙입니다. 현재 후보는 `v1.3.2-beta.1`로, Release 게시나 운영 배포가 완료되었다는 뜻이 아닙니다.

| 변경 유형 | 예시 | 발생 시나리오 |
| :--- | :--- | :--- |
| **주 버전 (Major)** | `v2.0.0` | 문서 시스템의 대대적인 재구성(예: Astro 주 버전 업그레이드, 레이아웃 완전 교체). |
| **부 버전 (Minor)** | `v1.2.0` | 새 문서 챕터 추가, 새 언어 추가, 디자인 시스템 업그레이드 등 비교적 큰 기능. |
| **수정 버전 (Patch)** | `v1.2.1` | 오탈자 수정, 코드 예제 업데이트, 자잘한 스타일 조정 등 작은 변경. |

---

## 2. 새 버전을 발행하는 표준 3단계 절차

### 첫 번째 단계: 업데이트 설명 기록 (`RELEASE_NOTES.md`)

프로젝트 루트의 `RELEASE_NOTES.md`에 업데이트 내용을 작성합니다. 이 파일은 GitHub Release의 본문이 됩니다. 첫 줄은 정확히 `# EpoCanvas Docs v<버전>`이어야 하며 `package.json`의 버전과 일치해야 합니다. `verify:config`가 이 형식을 검사합니다. 아래는 형식 예시이므로 실제 릴리스에는 아직 사용하지 않은 버전으로 바꾸세요. 사전 릴리스 본문에는 `candidate` 또는 `prerelease`도 명시해야 합니다.

```markdown
# EpoCanvas Docs v1.2.1

2026-09-14

### 수정
- 배포 챕터의 명령어 오탈자를 수정했습니다.
- 화면 스크린샷을 최신 버전으로 업데이트했습니다.
```

### 두 번째 단계: package.json 버전 번호 업데이트

내비게이션 바의 버전 배지는 이미 `package.json`의 `version` 필드와 자동으로 연동되어 사이트 전체 버전의 단일 데이터 원천(Single Source of Truth)으로 동작합니다. `package.json`에서 버전 번호를 업데이트하면(또는 `pnpm version patch --no-git-tag-version` 실행) 상단 바 배지가 자동으로 최신 버전 번호로 동기화되므로 여러 곳을 수동으로 고칠 필요가 없습니다:

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

정확한 정의는 [`.github/workflows/release.yml`](https://github.com/shijianus/epocanvas-docs/blob/main/.github/workflows/release.yml)을 참고하세요. 전체 YAML을 여기 복사하지 않습니다. `v*` 태그를 푸시하면 실행됩니다. 태그를 붙이기 전에 아래 로컬 검사를 실행할 수 있으며, GitHub Release를 쓰거나 사이트를 배포하지 않습니다.

```bash
pnpm run verify
```

1. `validate` job은 읽기 전용 `contents: read` 권한으로 먼저 `pnpm run verify` 전체 검증을 실행합니다.
2. 검증이 통과한 뒤에만 `publish` job이 `contents: write` 권한을 사용해 `RELEASE_NOTES.md`를 설명으로 GitHub Release를 만들거나 업데이트합니다.
3. 기존 Release는 삭제 후 재생성하지 않고 비파괴적으로 업데이트합니다. 안정 버전의 `Latest`는 GitHub가 버전에 따라 결정하며 사전 릴리스에는 `Latest`를 표시하지 않습니다. 헤더의 버전 배지에서 이전 릴리스를 확인할 수 있습니다.

:::note
이 워크플로는 GitHub Release만 만들거나 업데이트하며 사이트를 자동 배포하지 않습니다. `main`에 병합해도 자동 배포되지 않습니다. 로컬 `pnpm run deploy` 또는 별도로 설정한 호스팅 플랫폼의 Git 연동으로 게시합니다. [Cloudflare Pages 배포](/canvas/cloudflare/)를 참고하세요.
:::

---

## 4. 콘텐츠 협업 워크플로

여러 사람이 문서를 함께 관리할 때는 "브랜치 → 검토 → 병합 → 발행"의 고정 절차로 협업하여 온라인 내용이 항상 빌드 가능한 상태를 유지하도록 합니다:

```text
main 브랜치(릴리스 원본; 사이트는 배포 후에만 업데이트)
  │
  ├─ 1. main에서 기능 브랜치 생성     git checkout -b docs/new-guide
  ├─ 2. Markdown 작성/수정
  ├─ 3. 로컬 자가 점검                pnpm run verify
  ├─ 4. 브랜치 푸시 후 Pull Request 열기  CI 전체 검증 실행
  ├─ 5. 검토 통과 후 main에 병합      사이트를 자동 배포하지 않음
  └─ 6. 발행이 필요하면 v* 태그 부착   GitHub Release 파이프라인 트리거
```

### Pull Request 검토 핵심 항목

CI(`build.yml`)는 `pnpm run verify`로 테스트, 설정 검사, Astro 타입 검사, 빌드 및 콘텐츠/결과물 검사를 실행합니다. 화면은 여전히 직접 확인해야 합니다.

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

`.github/workflows/build.yml`은 `main` 푸시와 Pull Request에서 전체 검증을 실행합니다. CI는 `.node-version`에 고정된 Node.js 22.23.4과 pnpm 10.34.5를 사용합니다. 커밋 전에 로컬에서 같은 자가 점검을 실행하세요.

```bash
pnpm run verify
```
