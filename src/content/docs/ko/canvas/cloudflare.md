---
title: Cloudflare Pages 배포
description: "EpoCanvas Docs 배포 공개 그림 튜토리얼: Wrangler 명령줄 직접 업로드, Git 자동 빌드, 커스텀 도메인 연결, 각 단계에 실제 콘솔 스크린샷 수록."
---

문서 작성이 끝나면 팀과 사용자가 접근할 수 있도록 공개 인터넷에 배포해야 합니다. **EpoCanvas Docs**는 **Cloudflare Pages** 호스팅을 권장합니다: 서버를 구매할 필요도, Nginx를 설정할 필요도 없이 정적 파일을 직접 업로드하기만 하면 되고 HTTPS 인증서도 자동으로 받습니다. 이 사이트 자체(`docs.epocanvas.com`)도 이 글의 방법으로 배포했으며, 아래의 모든 콘솔 스크린샷은 실제 배포 과정에서 캡처한 것입니다.

---

## 준비 작업

### 필요한 것

| 항목 | 설명 |
| :--- | :--- |
| **Cloudflare 계정** | [dash.cloudflare.com](https://dash.cloudflare.com/)에서 무료로 가입, Pages 서비스는 유료 플랜이 필요 없음 |
| **로컬에서 완전한 빌드 가능** | 먼저 `pnpm run build`를 통과하고 `dist/` 디렉터리가 정상 생성되는지 확인, [빠른 시작](/canvas/deployment/) 참조 |
| **Node.js + pnpm** | 배포 명령어는 로컬 개발 환경에 의존하며, 버전 요구 사항은 빠른 시작 장과 동일 |

### 두 가지 배포 방식의 선택

![Cloudflare Pages 배포 두 가지 경로 비교도: 왼쪽은 명령어 로컬 직접 업로드(이 사이트 방식), 오른쪽은 Git 저장소 자동 빌드(팀 협업 권장)](/images/canvas/docs-deploy-compare.svg)

*그림: Cloudflare Pages의 두 가지 배포 경로 비교. 왼쪽은 로컬에서 빌드한 후 Wrangler로 엣지에 직접 업로드(이 사이트의 실제 방식), 오른쪽은 GitHub Webhook으로 클라우드 자동 빌드를 트리거합니다.*

| 비교 항목 | 방식 1: 명령어 직접 업로드 | 방식 2: Git 자동 빌드 |
| :--- | :--- | :--- |
| 조작 방식 | 로컬에서 `pnpm run deploy` 실행 | GitHub에 코드 푸시 시 자동 트리거 |
| 진입 장벽 | 낮음, 두 개의 명령어 | 중간, 콘솔에서 한 번 설정 필요 |
| 적합한 상황 | 첫 배포, 1인 유지보수, 빠른 업데이트 | 여럿 협업, "커밋하면 바로 배포" 희망 |
| 이 사이트 채택 | ✅ 예(콘솔에서 확인 가능) | 미사용, 언제든 추가 가능 |

:::tip
두 가지 방식은 공존할 수 있습니다: 평소에는 Git 자동 빌드를 사용하고, 긴급 수정 시에는 로컬 `pnpm run deploy`로 직접 덮어써 배포합니다.
:::

:::tip[명령어를 아예 치고 싶지 않다면?]
[빠른 시작](/canvas/deployment/) 페이지에서는 Cloudflare, Vercel, Netlify 세 곳의 원클릭 배포 버튼을 제공합니다: 클릭하고, 계정을 승인하고, 설정을 확인하면 문서 사이트가 자신의 클라우드 계정에 배포됩니다. 자세한 내용은 [원클릭 배포](/canvas/deployment/#一键部署点一个按钮就上线)를 참조하세요. 이 중 Cloudflare 버튼은 Workers 정적 호스팅을 사용하며, 이 페이지에서 소개하는 Pages 방식과는 별개의 두 경로입니다. 정적 문서 사이트에서는 접속 경험이 동일하므로 한쪽을 선택해 진행하면 됩니다.
:::

---

## 방식 1: 로컬 명령어 직접 업로드(처음 배포 시 권장)

이 방식은 로컬에서 빌드한 후 Cloudflare에 직접 업로드하며, **이 사이트가 실제로 채택한** 배포 방식입니다.

### 1단계: Cloudflare 계정 로그인

프로젝트에는 Wrangler(Cloudflare 공식 명령줄 도구)가 미리 포함되어 있으며, 처음 사용할 때는 브라우저로 로그인 승인이 필요합니다:

```bash
npx wrangler login
```

실행하면 터미널에 `Opening a link in your default browser...`가 표시되고, 브라우저에 Cloudflare 승인 페이지가 열립니다. **Allow**를 클릭하면 터미널에 로그인 성공이 표시됩니다. 다음 명령어로 로그인 상태를 확인합니다:

```bash
npx wrangler whoami
```

:::caution
로그인을 건너뛰고 바로 배포를 실행하면 터미널에 `You are not authenticated. Please run 'wrangler login'.`이 표시되며 어떤 배포도 이루어지지 않습니다.
:::

### 2단계: 원클릭 빌드 및 업로드

프로젝트의 `package.json`에는 원클릭 배포 명령어가 미리 준비되어 있습니다:

```bash
pnpm run deploy
```

이는 두 단계를 순서대로 실행하는 것과 같습니다: 먼저 `astro build`가 사이트 전체를 `dist/` 디렉터리로 컴파일하고 검색 인덱스를 생성한 뒤, `wrangler pages deploy dist`를 호출하여 결과물을 Cloudflare에 직접 업로드합니다. 빌드 단계의 실제 출력은 다음과 같습니다:

```text
00:06:22 [build] 15 page(s) built in 18.73s
00:06:22 [build] Complete!
```

업로드가 완료되면 Wrangler가 이번 배포의 미리보기 주소를 출력합니다. 첫 배포 시 Wrangler가 프로젝트 이름을 대화형으로 물어보는데, 그냥 Enter를 눌러 `package.json`에 미리 설정된 `epocanvas-docs`를 사용하면 됩니다.

### 3단계: 콘솔에서 내 프로젝트 찾기

[dash.cloudflare.com](https://dash.cloudflare.com/)을 열고 왼쪽 메뉴에서 **Compute (Workers & Pages)**를 클릭하면 프로젝트 목록을 볼 수 있습니다. 아래 그림은 세 가지 핵심 위치를 표시했습니다:

![Cloudflare 콘솔의 Workers & Pages 프로젝트 목록, 왼쪽 메뉴 진입점, Create application 버튼과 epocanvas-docs 프로젝트가 표시됨](/images/canvas/deploy/cf-01-projects-list.png)

*그림: Workers & Pages 프로젝트 목록. ① 왼쪽 메뉴에서 Workers & Pages로 진입; ② Create application 버튼으로 새 프로젝트 생성; ③ 우리의 `epocanvas-docs` 프로젝트, 접속 도메인 `epocanvas-docs.pages.dev`와 최근 배포 시간이 표시됩니다.*

프로젝트 이름을 클릭해 상세 페이지로 들어가면 **Deployments** 탭에 전체 배포 이력이 표시됩니다:

![epocanvas-docs 프로젝트의 배포 이력 페이지, 프로덕션 도메인, 배포 기록과 상태가 표시됨](/images/canvas/deploy/cf-02-deployments.png)

*그림: 배포 이력 페이지. ① 프로젝트 이름; ② Deployments 탭; ③ 프로덕션 도메인에는 `docs.epocanvas.com`(커스텀 도메인)과 `epocanvas-docs.pages.dev`(기본 도메인)가 동시에 연결됨; ④ 각 배포 기록에 브랜치와 커밋 정보가 표시됨; ⑤ 상태와 배포 시간.*

:::note
`pnpm run deploy`를 실행할 때마다 목록 맨 위에 새 배포 기록이 추가되고 자동으로 현재 프로덕션 버전이 됩니다. 이력은 목록에 남아 있으므로 문제가 생기면 언제든 롤백할 수 있습니다.
:::

---

## 직접 업로드 프로젝트의 빌드 설정 살펴보기

**Settings** 탭으로 들어가면 직접 업로드 프로젝트와 Git 프로젝트의 차이를 볼 수 있습니다:

![epocanvas-docs 프로젝트의 Settings 빌드 설정 페이지, Git repository 항목에 연결되지 않음이 표시됨](/images/canvas/deploy/cf-03-settings.png)

*그림: Settings 탭. ① Settings 진입점; ② Git repository 항목에 Connect(연결 안 됨)가 표시됩니다. 직접 업로드 프로젝트는 Git 빌드 설정이 필요 없으며 빌드는 전부 로컬에서 완료됩니다.*

:::tip
이것이 직접 업로드 방식의 장점이기도 합니다: 빌드 환경이 바로 여러분의 로컬 컴퓨터이므로 Cloudflare 빌드 대기열의 영향을 받지 않습니다. 대신 업데이트할 때마다 배포를 실행하는 그 컴퓨터에서 명령어를 실행해야 합니다.
:::

---

## 방식 2: Git 저장소 연결 자동 빌드(선택)

"코드를 커밋하면 자동으로 배포되길" 원한다면 프로젝트를 GitHub 저장소에 연결하여 Cloudflare가 클라우드에서 자동으로 빌드하도록 할 수 있습니다.

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
| 빌드 명령어 | `pnpm run build` |
| 빌드 출력 디렉터리 | `dist` |

### 4단계: 자동 빌드 확인

**저장 및 배포**를 클릭하면 Cloudflare가 첫 빌드를 자동으로 완료합니다. 이후 `main` 브랜치에 코드를 푸시할 때마다 Cloudflare가 자동으로 가져오고 빌드하여 배포합니다. 각 배포의 빌드 로그는 프로젝트의 **Deployments** 탭에서 해당 배포를 클릭하면 볼 수 있습니다.

:::caution
Git 연동 프로젝트의 Settings 페이지에는 빌드 설정 블록(프레임워크 프리셋, 빌드 명령어 등)이 추가로 나타납니다. 이는 [직접 업로드 프로젝트](#직접-업로드-프로젝트의-빌드-설정-살펴보기)와는 화면이 다른 것으로, Settings에서 빌드 설정을 찾을 수 없다면 현재 프로젝트가 직접 업로드 프로젝트라는 뜻이며 정상입니다.
:::

---

## 커스텀 도메인 연결

Cloudflare가 기본으로 할당하는 `xxx.pages.dev` 도메인은 바로 사용할 수 있으며, 자기 도메인(예: `docs.epocanvas.com`)을 연결하는 데는 몇 분밖에 걸리지 않습니다.

### 1단계: 커스텀 도메인 설정 열기

프로젝트 상세 페이지에서 **Custom domains** 탭을 클릭한 다음 **Set up a custom domain**을 클릭합니다:

![epocanvas-docs 프로젝트의 커스텀 도메인 페이지, docs.epocanvas.com이 연결되어 있고 SSL이 적용된 상태](/images/canvas/deploy/cf-04-domains.png)

*그림: Custom domains 탭. ① 탭 진입점; ② Set up a custom domain 버튼; ③ 연결된 `docs.epocanvas.com`, 상태는 Active이며 SSL enabled입니다.*

### 2단계: 도메인 추가 후 적용 대기

1. **Set up a custom domain**을 클릭하고 자기의 서브도메인(예: `docs.epocanvas.com`)을 입력합니다;
2. 도메인 DNS가 이미 Cloudflare에 위임되어 있으면 시스템이 자동으로 CNAME 레코드를 추가합니다. 다른 곳에 위임된 도메인은 `<프로젝트명>.pages.dev`를 가리키는 CNAME 레코드를 수동으로 추가해야 합니다;
3. 인증서 발급을 기다립니다(보통 2~5분). 상태가 **Active**가 되면(위 그림 ③) 새 도메인으로 접근할 수 있습니다.

HTTPS 인증서는 Cloudflare가 자동으로 발급하고 갱신하므로 수동으로 신청하거나 설정할 필요가 없습니다.

---

## 배포 결과 확인

### 명령줄로 HTTP 상태 확인

```bash
curl -sI https://epocanvas-docs.pages.dev
```

실제 반환 결과:

```text
HTTP/2 200
date: Fri, 11 Sep 2026 15:32:39 GMT
content-type: text/html; charset=utf-8
```

`200`이 보이면 사이트가 정상이라는 뜻입니다. 커스텀 도메인을 연결한 후에는 URL을 자기 도메인으로 바꿔 한 번 더 테스트하세요.

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

인증서 발급에는 보통 2~5분의 전 세계 적용 시간이 필요하므로 기다린 후 강제 새로 고침하면 됩니다. 그동안은 `xxx.pages.dev` 기본 도메인으로 먼저 접근할 수 있습니다.

### `pnpm run deploy` 실행 시 `Project not found` 오류가 발생하나요?

먼저 `npx wrangler whoami`로 로그인 여부를 확인하고, 다음으로 `package.json`의 `deploy` 스크립트에 있는 `--project-name`이 콘솔 프로젝트 이름과 일치하는지 확인합니다.

추가 확인 항목은 [자주 묻는 질문과 문제 해결 FAQ](/canvas/troubleshooting/)를 참조하세요.
