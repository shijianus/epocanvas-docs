---
title: Cloudflare Pages 배포
description: "Cloudflare Pages 배포 안내: Wrangler 업로드, 선택적 Git 연동, 도메인과 배포 후 검사."
---

이 페이지는 저장소 스크립트를 기준으로 정적 문서를 **Cloudflare Pages**에 배포하는 방법을 설명합니다. 콘솔 이미지는 기존 예시이며 이번 후보 버전의 배포나 테스트 기록이 아닙니다. 차이가 있으면 현재 콘솔을 따르세요. 검증과 배포 성공 여부는 실제 로그와 배포 상태로 확인해야 합니다.

---

## 준비 작업

### 필요한 것

| 항목 | 설명 |
| :--- | :--- |
| **Cloudflare 계정** | [dash.cloudflare.com](https://dash.cloudflare.com/)에서 무료로 가입, Pages 서비스는 유료 플랜이 필요 없음 |
| **로컬에서 완전한 빌드 가능** | 먼저 `pnpm run verify`를 통과하고 `dist/` 디렉터리가 정상 생성되는지 확인, [빠른 시작](/canvas/deployment/) 참조 |
| **Node.js + pnpm** | 배포 명령어는 로컬 개발 환경에 의존하며, 버전 요구 사항은 빠른 시작 장과 동일 |

### 두 가지 배포 방식의 선택

![로컬 Wrangler 업로드와 Git 연동 빌드 경로](/images/canvas/docs-deploy-compare.svg)

*그림: 왼쪽은 로컬 빌드와 Wrangler 업로드, 오른쪽은 Git 연동 클라우드 빌드입니다. 이번 수정에서 두 경로를 실제 테스트했다는 뜻은 아닙니다.*

| 비교 항목 | 방식 1: 명령어 직접 업로드 | 방식 2: Git 자동 빌드 |
| :--- | :--- | :--- |
| 조작 방식 | 로컬에서 `pnpm run deploy` 실행 | GitHub에 코드 푸시 시 자동 트리거 |
| 진입 장벽 | 낮음, 두 개의 명령어 | 중간, 콘솔에서 한 번 설정 필요 |
| 적합한 상황 | 첫 배포, 1인 유지보수, 빠른 업데이트 | 여럿 협업, "커밋하면 바로 배포" 희망 |
| 배포 검사 | 전체 verify 통과 후 업로드 | 클라우드 빌드 명령에 전체 verify 설정 |

:::tip
프로젝트 생성 시 Direct Upload 또는 Git 연동을 선택하세요. 기존 직접 업로드 프로젝트를 그대로 Git 연동으로 바꿀 수 있다고 가정하지 마세요. 경로를 바꾸려면 해당 프로젝트를 만드세요. 긴급 Wrangler 배포도 검사를 건너뛰면 안 됩니다.
:::

:::tip[명령어를 아예 치고 싶지 않다면?]
[빠른 시작](/canvas/deployment/) 페이지에서는 Cloudflare, Vercel, Netlify 세 곳의 원클릭 배포 버튼을 제공합니다: 클릭하고, 계정을 승인하고, 설정을 확인하면 문서 사이트가 자신의 클라우드 계정에 배포됩니다. 자세한 내용은 [원클릭 배포](/canvas/deployment/#원클릭-배포-버튼-한-번으로-온라인에-게시)를 참조하세요. 이 중 Cloudflare 버튼은 Workers 정적 호스팅을 사용하며, 이 페이지에서 소개하는 Pages 방식과는 별개의 두 경로입니다. 정적 문서 사이트에서는 접속 경험이 동일하므로 한쪽을 선택해 진행하면 됩니다.
:::

---

## 방식 1: 로컬 명령어 직접 업로드(처음 배포 시 권장)

로컬 빌드 후 Wrangler로 업로드합니다. `pnpm run deploy`는 유지 관리자의 `epocanvas-docs` 프로젝트용이며 모든 fork가 그대로 쓸 수 있는 범용 배포 버튼이 아닙니다.

### 1단계: Cloudflare 계정 로그인

프로젝트에는 Wrangler(Cloudflare 공식 명령줄 도구)가 미리 포함되어 있으며, 처음 사용할 때는 브라우저로 로그인 승인이 필요합니다:

```bash
pnpm exec wrangler login
```

실행하면 터미널에 `Opening a link in your default browser...`가 표시되고, 브라우저에 Cloudflare 승인 페이지가 열립니다. **Allow**를 클릭하면 터미널에 로그인 성공이 표시됩니다. 다음 명령어로 로그인 상태를 확인합니다:

```bash
pnpm exec wrangler whoami
```

:::caution
유효한 Cloudflare 로그인이나 토큰 권한이 필요합니다. 인증 실패 시 `wrangler whoami`, 계정 및 프로젝트 권한을 확인하세요. 오류 문구는 버전에 따라 다를 수 있습니다.
:::

### 2단계: 원클릭 빌드 및 업로드

프로젝트의 `scripts/verify-release.mjs`에는 원클릭 배포 명령어가 미리 준비되어 있습니다:

`pnpm exec wrangler login`으로 인증합니다. `scripts/verify-release.mjs`는 `main`, 미추적 파일까지 없는 깨끗한 작업 트리, `origin/main` 업스트림, 실제 원격 커밋과 같은 HEAD를 요구합니다. `pnpm run deploy`는 전체 `pnpm run verify` 후 Git을 다시 확인하고 Wrangler를 호출합니다. 프로젝트 이름은 스크립트에 있으므로 재사용 전 자신의 배포 대상을 설정하세요.

```bash
pnpm run deploy
```

`pnpm run deploy`는 설정, Astro 타입, 빌드, 테스트 및 콘텐츠/결과물 검사 후 업로드합니다. 전제 조건만 확인하려면 아래 명령을 쓰세요. 원격 Git 참조는 읽지만 전체 검증, 빌드, 업로드는 하지 않습니다. dry-run 성공은 테스트 통과가 아닙니다.

```bash
pnpm run deploy --dry-run
```

업로드 성공 후 Wrangler가 URL을 출력합니다. 스크립트는 `--project-name epocanvas-docs --branch main`을 지정하므로 계정의 프로젝트 존재와 운영 브랜치 설정을 확인하세요.

### 3단계: 콘솔에서 내 프로젝트 찾기

[dash.cloudflare.com](https://dash.cloudflare.com/)을 열고 왼쪽 메뉴에서 **Compute (Workers & Pages)**를 클릭하면 프로젝트 목록을 볼 수 있습니다. 아래 그림은 세 가지 핵심 위치를 표시했습니다:

![Cloudflare 콘솔의 Workers & Pages 프로젝트 목록, 왼쪽 메뉴 진입점, Create application 버튼과 epocanvas-docs 프로젝트가 표시됨](/images/canvas/deploy/cf-01-projects-list.png)

*그림: Workers & Pages 프로젝트 목록. ① 왼쪽 메뉴에서 Workers & Pages로 진입; ② Create application 버튼으로 새 프로젝트 생성; ③ 우리의 `epocanvas-docs` 프로젝트, 접속 도메인 `epocanvas-docs.pages.dev`와 최근 배포 시간이 표시됩니다.*

프로젝트 이름을 클릭해 상세 페이지로 들어가면 **Deployments** 탭에 전체 배포 이력이 표시됩니다:

![epocanvas-docs 프로젝트의 배포 이력 페이지, 프로덕션 도메인, 배포 기록과 상태가 표시됨](/images/canvas/deploy/cf-02-deployments.png)

*그림: 배포 이력 페이지. ① 프로젝트 이름; ② Deployments 탭; ③ 프로덕션 도메인에는 `docs.epocanvas.com`(커스텀 도메인)과 `epocanvas-docs.pages.dev`(기본 도메인)가 동시에 연결됨; ④ 각 배포 기록에 브랜치와 커밋 정보가 표시됨; ⑤ 상태와 배포 시간.*

:::note
업로드 성공 시에만 배포 기록이 생성됩니다. Deployments에서 상태, 브랜치, 커밋, 운영 도메인을 확인하세요. 명령 거부나 검증 실패는 온라인 업데이트가 아닙니다.
:::

---

## 직접 업로드 프로젝트의 빌드 설정 살펴보기

**Settings** 탭으로 들어가면 직접 업로드 프로젝트와 Git 프로젝트의 차이를 볼 수 있습니다:

![epocanvas-docs 프로젝트의 Settings 빌드 설정 페이지, Git repository 항목에 연결되지 않음이 표시됨](/images/canvas/deploy/cf-03-settings.png)

*그림: Settings 탭. ① Settings 진입점; ② Git repository 항목에 Connect(연결 안 됨)가 표시됩니다. 직접 업로드 프로젝트는 Git 빌드 설정이 필요 없으며 빌드는 전부 로컬에서 완료됩니다.*

:::tip
직접 업로드는 클라우드 빌드 대기열을 피하지만 실행 기기에 필요한 Node, pnpm, Git과 인증 정보가 있어야 합니다. 특정 컴퓨터에만 제한되지는 않습니다.
:::

---

## 방식 2: Git 저장소 연결 자동 빌드(선택)

push로 빌드하려면 Git 연동 Pages 프로젝트를 만들고 저장소를 연결하세요. 아래는 설정 안내이지 이 경로가 활성화되었거나 이번에 검증되었다는 기록이 아닙니다.

### 1단계: 생성 흐름 진입

Workers & Pages 프로젝트 목록 페이지에서 오른쪽 위의 **Create application** 버튼을 클릭하고([방식 1의 3단계](#3단계-콘솔에서-내-프로젝트-찾기)의 그림 표시 ② 참조), **Pages** 탭을 선택합니다.

### 2단계: Git 저장소 연결

1. 생성 화면에서 **Connect to Git**을 선택합니다;
2. Cloudflare가 GitHub 계정에 접근하도록 승인합니다;
3. 저장소 목록에서 문서 저장소 `epocanvas-docs`를 선택합니다;
4. **설정 시작**을 클릭합니다.

### 3단계: 빌드 설정 입력

"빌드 및 배포 설정"에서 다음 구성을 입력합니다:

| 설정 항목 | 입력 값 |
| :--- | :--- |
| 프레임워크 프리셋 | `Astro` |
| 빌드 명령 | `pnpm install --frozen-lockfile && pnpm run verify` |
| 빌드 출력 | `dist` |
| Node.js | `22.23.4` (`.node-version`과 일치) |
| pnpm | `10.34.5` (`packageManager`와 일치) |

### 4단계: 자동 빌드 확인

클라우드의 Node와 pnpm을 확인한 뒤 **저장 및 배포**를 누르고 Deployments 로그를 확인하세요. 설치, 전체 검증, 업로드가 모두 성공해야 합니다. 이후 push는 설정한 운영 브랜치와 자동 배포 옵션을 따릅니다. GitHub CI 성공만으로 Pages가 배포되지는 않습니다.

:::caution
Git 연동 프로젝트의 Settings 페이지에는 빌드 설정 블록(프레임워크 프리셋, 빌드 명령어 등)이 추가로 나타납니다. 이는 [직접 업로드 프로젝트](#직접-업로드-프로젝트의-빌드-설정-살펴보기)와는 화면이 다른 것으로, Settings에서 빌드 설정을 찾을 수 없다면 현재 프로젝트가 직접 업로드 프로젝트라는 뜻이며 정상입니다.
:::

---

## 커스텀 도메인 연결

Cloudflare는 `<project-name>.pages.dev`를 제공하며 사용자 도메인도 연결할 수 있습니다. 아래는 예시이고 DNS와 인증서 반영 시간은 실제 상태에 따릅니다.

### 1단계: 커스텀 도메인 설정 열기

프로젝트 상세 페이지에서 **Custom domains** 탭을 클릭한 다음 **Set up a custom domain**을 클릭합니다:

![epocanvas-docs 프로젝트의 커스텀 도메인 페이지, docs.epocanvas.com이 연결되어 있고 SSL이 적용된 상태](/images/canvas/deploy/cf-04-domains.png)

*그림: Custom domains 탭. ① 탭 진입점; ② Set up a custom domain 버튼; ③ 연결된 `docs.epocanvas.com`, 상태는 Active이며 SSL enabled입니다.*

### 2단계: 도메인 추가 후 적용 대기

1. **Set up a custom domain**을 클릭하고 자기의 서브도메인(예: `docs.epocanvas.com`)을 입력합니다;
2. 도메인 DNS가 이미 Cloudflare에 위임되어 있으면 시스템이 자동으로 CNAME 레코드를 추가합니다. 다른 곳에 위임된 도메인은 `<프로젝트명>.pages.dev`를 가리키는 CNAME 레코드를 수동으로 추가해야 합니다;
3. DNS 검증과 인증서 발급을 기다린 뒤 **Active** 상태에서 새 도메인을 확인합니다. 몇 분 안에 끝난다는 보장은 없습니다.

HTTPS 인증서는 Cloudflare가 자동으로 발급하고 갱신하므로 수동으로 신청하거나 설정할 필요가 없습니다.

---

## 배포 결과 확인

### 명령줄로 HTTP 상태 확인

```bash
curl -sI https://epocanvas-docs.pages.dev
```

응답 예시(날짜와 상태는 실제 요청에 따라 달라집니다):

```text
HTTP/2 200
date: Fri, 11 Sep 2026 15:32:39 GMT
content-type: text/html; charset=utf-8
```

`200`은 해당 URL의 응답 성공만 뜻하며 번역, 리소스, 검색이나 최신 내용을 검증하지 않습니다. 기본 및 사용자 도메인에서 아래 항목도 확인하세요.

### 브라우저에서 항목별 확인

| 확인 항목 | 예상 결과 |
| :--- | :--- |
| 홈페이지와 아무 문서 페이지가 열림 | 페이지가 완전히 렌더링되고 빈 화면 없음 |
| 새로 수정한 내용이 적용됨 | 방금 편집한 절의 내용이 온라인에서 보임 |
| `Ctrl+K` 사이트 전체 검색 | 최신 글이 검색됨(인덱스는 빌드 시 생성) |
| 라이트/다크 모드 전환 | 전환이 정상이고 새로 고친 후에도 유지됨 |

---

## 흔한 배포 문제

### 배포 후 온라인 내용이 업데이트되지 않았나요?

브라우저 강제 새로 고침(`Ctrl+F5` / `Cmd+Shift+R`)으로 캐시를 배제합니다. 그래도 업데이트되지 않으면 콘솔 Deployments 페이지에서 최신 기록의 시간을 확인하고, `curl -sI`로 배포 미리보기 도메인과 비교해 보세요.

### 커스텀 도메인에서 SSL 핸드셰이크 실패(Error 525)가 표시되나요?

Custom domains의 도메인 검증과 인증서 상태를 확인하고 DNS, 프록시 설정, 오류 상세를 점검하세요. 몇 분 기다리는 것으로 단정하지 말고 기본 `pages.dev`와 비교하세요.

### `pnpm run deploy` 실행 시 `Project not found` 오류가 발생하나요?

먼저 `pnpm exec wrangler whoami`로 로그인 여부를 확인하고, 다음으로 `scripts/verify-release.mjs`에 있는 `--project-name`이 콘솔 프로젝트 이름과 일치하는지 확인합니다.

추가 확인 항목은 [자주 묻는 질문과 문제 해결 FAQ](/canvas/troubleshooting/)를 참조하세요.
