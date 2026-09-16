# EpoCanvas Docs

[![Release](https://img.shields.io/github/v/release/shijianus/epocanvas-docs?color=3b82f6&style=flat-square)](https://github.com/shijianus/epocanvas-docs/releases)
[![Build](https://img.shields.io/github/actions/workflow/status/shijianus/epocanvas-docs/build.yml?branch=main&style=flat-square)](https://github.com/shijianus/epocanvas-docs/actions/workflows/build.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](./LICENSE)
[![Built with Astro](https://img.shields.io/badge/Built_with-Astro_5-orange.svg?style=flat-square)](https://astro.build)

[English](./README.md) | [简体中文](./README.zh-CN.md) | [繁體中文](./README.zh-TW.md) | [Français](./README.fr.md) | [Español](./README.es.md) | [Deutsch](./README.de.md) | [Português](./README.pt.md) | [Русский](./README.ru.md) | [日本語](./README.ja.md) | [한국어](./README.ko.md)

EpoCanvas Docs는 EpoCanvas 프로젝트의 공식 문서 사이트입니다. Astro 5와 Starlight 기반으로 만들어졌으며, 3열 읽기 레이아웃, 2가지 모드의 검색, 콘텐츠 전체의 다국어 지원을 기본으로 갖추고 있습니다. 모든 콘텐츠는 표준 Markdown으로 작성되며 Cloudflare Pages에 게시됩니다.

**온라인 사이트**: [https://docs.epocanvas.com](https://docs.epocanvas.com) (미러: [https://epocanvas-docs.pages.dev](https://epocanvas-docs.pages.dev))

## 미리 보기

![EpoCanvas Docs 문서 홈페이지](./public/images/canvas/ui-home-landing.png)

사이트는 3열 레이아웃을 사용합니다. 왼쪽은 카테고리 내비게이션, 가운데는 본문, 오른쪽은 현재 페이지의 목차입니다. 다크 테마가 기본이며 시스템 설정을 따르고 상단 바에서 수동으로 전환할 수 있습니다.

## 주요 기능

- **3열 읽기 레이아웃** — 본문 행 폭은 긴 글 읽기에 맞게 제한되어 있습니다. 페이지를 이동해도 사이드바의 스크롤 위치가 유지되고, 오른쪽 목차는 스크롤에 따라 현재 절을 하이라이트합니다.
- **2가지 모드의 검색** — 상단 바의 검색 상자는 현재 페이지 안에서 찾고, `Ctrl+K` / `Cmd+K`는 Pagefind 기반의 사이트 전체 검색 대화상자를 엽니다. 색인은 빌드 시점에 생성되고 모든 검색은 브라우저 안에서 처리되므로, 외부 인터넷에 연결되지 않은 인트라넷에서도 동작합니다.
- **콘텐츠 전체 다국어 지원** — UI와 모든 문서의 본문이 10개 언어로 제공됩니다: 간체 중국어(기본), 번체 중국어, 영어, 일본어, 한국어, 스페인어, 프랑스어, 독일어, 러시아어, 포르투갈어. 언어마다 독립적인 URL 접두사(예: `/ko/`)를 사용하며, 번역이 없는 페이지는 404 대신 중국어 버전으로 자동 대체됩니다.
- **Markdown 확장** — 4종의 콜아웃(`:::note`, `:::tip`, `:::caution`, `:::danger`), 파일 이름 라벨·줄 하이라이트·diff 렌더링을 갖춘 Shiki 코드 하이라이트.
- **명령 한 줄 배포** — 사이트는 정적 파일로 빌드되며 명령 하나로 Cloudflare Pages에 게시됩니다. 커스텀 도메인과 HTTPS 인증서는 자동으로 구성됩니다.

## 요구 사항

- Node.js 20.3+ 또는 22+ (최소 18.20.8)
- pnpm 10

## 빠른 시작

```bash
git clone https://github.com/shijianus/epocanvas-docs.git
cd epocanvas-docs
pnpm install
pnpm run dev
```

브라우저에서 `http://localhost:4321`을 여세요. 개발 서버가 실행되는 동안 Markdown 변경 사항은 곧바로 페이지에 반영됩니다.

### 명령어

| 명령어 | 설명 |
| :--- | :--- |
| `pnpm run dev` | 핫 리로드가 있는 로컬 개발 서버를 시작합니다 |
| `pnpm run build` | 정적 사이트를 `dist/`로 빌드하고 검색 색인을 생성합니다 |
| `pnpm run preview` | 빌드 결과를 로컬에서 미리 봅니다 |
| `pnpm run deploy` | 빌드 후 Cloudflare Pages에 게시합니다 |

## 프로젝트 구조

```text
epocanvas-docs/
├── public/images/canvas/       # 문서에 사용되는 스크린샷과 다이어그램
├── src/
│   ├── components/starlight/   # 오버라이드한 Starlight 컴포넌트 (Header, Sidebar 등)
│   ├── config/navigation.ts    # 상단 내비게이션 바 설정
│   ├── content/docs/           # 언어별 문서 본문 (canvas/ = 중국어, en/ ja/ … = 번역)
│   ├── styles/custom.css       # 테마 색상과 레이아웃 스타일
│   └── utils/i18n.ts           # UI 문구와 언어 레지스트리
├── astro.config.mjs            # 사이트 설정: 제목, 사이드바, 리다이렉트
├── AGENTS.md                   # 기술 문서 작성 가이드라인
├── LICENSE
└── package.json
```

## 문서 작성하기

1. `src/content/docs/canvas/` 아래에 새 `.md` 파일을 만듭니다.
2. 파일 맨 위에 frontmatter를 추가합니다:

   ```yaml
   ---
   title: 문서 제목
   description: 페이지를 한 문장으로 설명한 내용
   ---
   ```

3. `astro.config.mjs`의 `sidebar` 배열에 페이지를 등록합니다. 등록되지 않은 페이지는 내비게이션에 나타나지 않습니다.
4. 이미지는 `public/images/canvas/`에 두고 절대 경로로 참조합니다:

   ```markdown
   ![대체 텍스트](/images/canvas/your-image.png)
   ```

커밋하기 전에 `pnpm run build`를 실행해 사이트가 오류 없이 빌드되는지 확인하세요.

## 배포

사이트는 Cloudflare Pages에서 호스팅됩니다:

- **로컬에서 게시** — `wrangler login`을 한 번 실행해 인증한 뒤에는 `pnpm run deploy`로 빌드와 게시가 한 번에 끝납니다.
- **커스텀 도메인** — Cloudflare 콘솔에서 Pages 프로젝트 `epocanvas-docs`를 열고 *Custom domains*에 도메인을 추가하세요. CNAME 레코드와 SSL 인증서는 자동으로 구성됩니다.

## 기여하기

Issue와 Pull Request를 환영합니다. PR을 보내기 전에 로컬에서 `pnpm run build`를 실행하고 빌드가 통과하는지 확인해 주세요.

## 라이선스

[MIT](./LICENSE)
