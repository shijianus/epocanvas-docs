---
title: 빠른 시작 (3분 만에 실행)
description: EpoCanvas Docs 로컬 환경 준비, 의존성 설치, 로컬 개발 서버 시작과 자주 쓰는 조작 명령어 빠른 참조.
---

이 문서 사이트를 실행하는 방법은 두 가지이며, 목적에 맞게 하나를 선택하면 됩니다:

- **온라인 사이트를 바로 보고 싶다면**: 아무 환경도 설치할 필요 없이 아래의 [원클릭 배포](#원클릭-배포-버튼-한-번으로-온라인에-게시) 소절로 바로 이동해 버튼을 클릭하세요. 2분 후면 자신만의 주소를 받을 수 있습니다.
- **문서를 쓰고 내용을 수정하고 싶다면**: 먼저 [준비 작업](#준비-작업)에 따라 프로젝트를 로컬에서 실행한 뒤 수정하면서 결과를 확인하고, 다 쓴 후 [자주 쓰는 명령어](#자주-쓰는-개발-명령어-빠른-참조)의 배포 명령어로 게시합니다.

---

## 원클릭 배포: 버튼 한 번으로 온라인에 게시

아래 버튼들은 Cloudflare, Vercel, Netlify 세 곳의 공식 "배포 버튼"입니다. 클릭하면 해당 플랫폼의 배포 마법사가 열리고, 플랫폼이 이 저장소를 자동으로 여러분의 GitHub 계정 아래로 복제한 뒤 클라우드 빌드와 게시를 자동으로 완료합니다. 전 과정에서 GitHub 계정 하나만 필요하며, 컴퓨터에 Node.js나 pnpm을 설치하거나 명령어를 입력할 필요가 전혀 없습니다.

### Cloudflare에 배포(권장)

[![Deploy to Cloudflare](/images/canvas/deploy/badge-cloudflare.svg)](https://deploy.workers.cloudflare.com/?url=https://github.com/shijianus/epocanvas-docs)

버튼을 클릭하면 마법사가 세 단계로 진행됩니다:

1. **승인 로그인**: GitHub와 Cloudflare에 차례로 로그인합니다. 둘 다 무료 플랜이 있으므로 계정이 없으면 그 자리에서 하나 만들면 됩니다.
2. **저장소 복제**: Cloudflare가 이 저장소를 자동으로 여러분의 GitHub 계정 아래에 한 벌 복사하며, 이후의 모든 콘텐츠 수정은 자신의 저장소에서 이루어집니다.
3. **설정 확인 후 배포**: 마지막에 설정 페이지가 표시되므로, 아래 표대로 확인한 뒤 Deploy를 클릭합니다:

| 설정 항목 | 마법사의 기본 표시 | 처리 방법 |
| :--- | :--- | :--- |
| 저장소 이름 / 프로젝트 이름 | `epocanvas-docs`가 미리 입력됨 | 기본값 유지 |
| 빌드 명령어 | 이 저장소의 `pnpm run build`로 자동 인식 | 기본값 유지 |
| 배포 명령어 | `pnpm run deploy`가 미리 입력됨 | **`npx wrangler deploy`로 변경** |

:::caution
배포 명령어는 반드시 `npx wrangler deploy`로 변경해야 합니다. 미리 입력된 `pnpm run deploy`는 이 사이트 관리자가 사용하는 Cloudflare Pages 직접 업로드 명령어로, 하드코딩된 프로젝트 이름으로 배포하기 때문에 버튼 배포 절차에서는 바로 오류가 발생합니다.
:::

첫 배포 시 Cloudflare는 저장소에 Workers 설정 파일이 없는 것을 감지하고 이것이 Astro 정적 사이트임을 자동으로 인식한 뒤, 자동 생성된 설정 Pull Request(PR)를 여러분의 저장소에 보냅니다. 그 PR을 병합하면 되고, 이후에는 푸시할 때마다 자동으로 빌드되어 온라인에 올라갑니다. 버튼 클릭부터 주소 확인까지, 순조로우면 2~3분 걸립니다.

배포가 완료되면 Cloudflare는 `https://epocanvas-docs.<여러분의 서브도메인>.workers.dev` 형식의 공개 주소를 할당하며, HTTPS 인증서가 기본 포함됩니다. 자신의 도메인으로 바꾸려면 콘솔에서 Workers & Pages → 내 프로젝트 → **Settings** → **Domains & Routes**로 이동해 추가하면 됩니다. 실제 공개 인스턴스는 Pages 기본 도메인 [https://epocanvas-docs.pages.dev](https://epocanvas-docs.pages.dev)과 사용자 도메인 [https://docs.epocanvas.com](https://docs.epocanvas.com)에서 바로 비교할 수 있습니다.

### Vercel과 Netlify에 배포

다른 플랫폼에 익숙하다면, 아래 두 버튼은 같은 일을 합니다. 두 플랫폼 모두 Astro 프로젝트를 자동으로 인식하므로 빌드 설정을 직접 입력할 필요가 없습니다:

[![Deploy with Vercel](/images/canvas/deploy/badge-vercel.svg)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fshijianus%2Fepocanvas-docs)

[![Deploy to Netlify](/images/canvas/deploy/badge-netlify.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/shijianus/epocanvas-docs)

- **Vercel**: 버튼 클릭 → GitHub 승인 → 기본 옵션을 유지한 채 Deploy 클릭. 완료 후 `epocanvas-docs.vercel.app` 도메인을 받으며, 개인 Hobby 플랜은 무료입니다.
- **Netlify**: 버튼 클릭 → GitHub 연결 → 플랫폼이 자동으로 저장소를 복제하고 첫 빌드를 완료합니다. 완료 후 `epocanvas-docs.netlify.app` 도메인을 받으며, 무료 등급으로도 충분합니다.

:::note
세 버튼의 동작 방식은 같습니다. 저장소를 여러분의 GitHub 계정으로 복제하고, "코드를 푸시하면 자동으로 다시 빌드해 게시하는" 지속적 배포를 설정합니다. 한 플랫폼을 골라 사용하면 되며 반복 배포할 필요가 없습니다. 이 사이트 자체는 Cloudflare Pages 직접 업로드 방식으로 호스팅되며([Cloudflare Pages 배포](/canvas/cloudflare/) 참고), 위 버튼 경로와 서로 영향을 주지 않습니다. 정적 문서 사이트의 경우 두 호스팅 방식 모두 독자가 경험하는 접속 환경은 동일합니다.
:::

---

## 준비 작업

원클릭 배포는 "사이트를 먼저 내보내는" 데 적합하지만, 문서를 작성하고 수정하는 일은 결국 로컬에서 이루어져야 합니다. 직접 내용을 작성할 계획이라면, 컴퓨터에 다음과 같은 기본 개발 환경이 설치되어 있는지 먼저 확인하세요:

| 도구 | 권장 버전 | 확인 명령어 | 설명 |
| :--- | :--- | :--- | :--- |
| **Node.js** | `>= 18.20.8`(20.3+ 또는 22 LTS 권장) | `node -v` | JavaScript를 실행하고 정적 페이지를 빌드하는 기반 환경 |
| **pnpm** | `>= 9`(CI 환경에서는 10) | `pnpm -v` | 권장 패키지 관리자. 설치 속도가 빠르고 디스크 공간을 절약합니다 |
| **Git** | 최신 안정 버전 | `git --version` | 코드 가져오기와 버전 관리에 사용 |

:::tip
컴퓨터에 `pnpm`이 아직 설치되어 있지 않다면, Node.js에 내장된 npm으로 빠르게 전역 설치할 수 있습니다:

```bash
npm install -g pnpm
```
:::

---

## 3단계로 로컬에서 실행하기

### 1단계: 코드 저장소를 로컬로 복제

터미널(Terminal)을 열고 다음 명령어를 실행해 프로젝트 코드를 복제하고 프로젝트 폴더로 이동합니다:

```bash
git clone https://github.com/shijianus/epocanvas-docs.git
cd epocanvas-docs
```

### 2단계: 프로젝트 의존성 설치

프로젝트 루트 디렉터리에서 설치 명령어를 실행합니다:

```bash
pnpm install
```

pnpm은 `pnpm-lock.yaml`에 따라 필요한 프런트엔드 의존성을 자동으로 내려받습니다. Astro, Starlight, 로컬 이미지 처리 모듈이 포함되며 보통 수십 초면 완료됩니다. 설치가 끝나면 터미널에 총 소요 시간이 표시됩니다:

```text
Done in 1m 3.2s using pnpm v9.15.9
```

### 3단계: 로컬 개발 미리보기 서버 시작

의존성 설치가 완료되면 시작 명령어를 실행합니다:

```bash
pnpm run dev
```

터미널에 아래와 비슷한 정보가 출력됩니다(첫 시작 시 의존성 사전 컴파일 때문에 몇 초가 걸립니다):

```text
astro  v5.18.2  ready in 5152 ms

┃ Local    http://localhost:4321/
┃ Network  use --host to expose

watching for file changes...
```

이 시점에서 브라우저로 `http://localhost:4321`에 접속하면 완전한 문서 사이트를 볼 수 있습니다. 아무 `.md` 파일이나 수정해 저장하면 브라우저 페이지가 자동으로 새로고침되어 최신 내용을 표시합니다.

![로컬 개발 서버에서 렌더링된 빠른 시작 페이지의 실제 모습](/images/canvas/ui-quickstart.png)

*그림: `http://localhost:4321/canvas/deployment/`의 실제 렌더링 결과로, 바로 지금 읽고 있는 이 페이지입니다.*

---

## 자주 쓰는 개발 명령어 빠른 참조

일상적으로 문서를 작성하거나 프로젝트를 관리할 때는 주로 다음 명령어들을 사용합니다:

| 명령어 | 적용 상황 | 상세 설명 |
| :--- | :--- | :--- |
| `pnpm run dev` | **일상적인 문서 작성** | 로컬 디버그 서버를 시작하며 핫 리로드(HMR)를 지원합니다. 아무 `.md` 파일이나 수정하면 브라우저가 자동으로 새로고침되어 내용을 갱신합니다. |
| `pnpm run build` | **패키징 테스트** | 사이트 전체 정적 페이지를 로컬에서 완전히 컴파일하고, `dist/` 디렉터리에 HTML, CSS, Pagefind 검색 인덱스를 생성합니다. |
| `pnpm run preview` | **빌드 결과물 미리보기** | 로컬에서 경량 웹 서버를 시작해 `dist/` 결과물을 실행하며, 정식 게시 전에 링크와 스타일이 정상인지 확인하는 데 사용합니다. |
| `pnpm run deploy` | **원클릭 게시** | 먼저 build를 자동 실행한 뒤 Wrangler 도구를 호출해 `dist/`를 Cloudflare Pages 온라인 프로덕션 환경으로 푸시합니다. |

전체 게시 절차와 온라인 확인 방법은 **[Cloudflare Pages 배포](/canvas/cloudflare/)**를 읽어 주세요.

---

## 핵심 설정 파일은 어디에 있나?

사이트의 기본 정보를 수정해야 한다면, 주로 다음 파일들을 살펴봅니다:

- **사이트 이름과 목차 메뉴**: 루트 디렉터리의 `astro.config.mjs`를 수정합니다. 사이트의 `title`(사이트 제목), `site`(온라인 도메인), `sidebar`(왼쪽 목차 메뉴)를 수정할 수 있습니다.
- **상단 내비게이션 바 버튼**: `src/config/navigation.ts`를 수정합니다. 여기서 상단의 "홈", "제품 소개" 등 버튼과 이동 경로를 추가하거나 삭제할 수 있습니다.
- **페이지 색상과 글꼴 스타일**: `src/styles/custom.css`를 수정합니다. 여기서 라이트 모드와 다크 모드의 테마 색상을 조정할 수 있습니다.
- **새 문서 추가**: `src/content/docs/canvas/` 디렉터리에 바로 `.md` 파일을 만들고 사이드바에 등록합니다. 자세한 내용은 [Markdown 작성 및 서식 가이드](/canvas/markdown/)를 참고하세요.

---

## 다음 단계

로컬 서버가 정상적으로 실행되었다면, 다음 내용을 이어서 알아볼 수 있습니다:

- **[페이지 레이아웃과 읽기 경험](/canvas/layout/)**: 상단 바, 사이드바, 본문 화면의 레이아웃 세부 사항을 알아봅니다.
- **[렌더링 규칙 상세](/canvas/rendering/)**: Markdown이 최종 페이지로 렌더링되는 과정을 파악해 조판 문법의 함정을 피합니다.
- **[Cloudflare Pages 배포](/canvas/cloudflare/)**: 문서를 공개 인터넷에 게시하고 독립 도메인을 연결합니다.
