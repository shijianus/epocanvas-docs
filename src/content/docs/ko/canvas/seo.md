---
title: SEO 및 성능 최적화
description: EpoCanvas Docs에 내장된 SEO 기능(meta 태그, Open Graph, sitemap, robots.txt)과 성능 메커니즘 설명, 그리고 검색 엔진 제출 방법.
---

문서는 사람이 보라고 쓰는 것이며, 그 전제는 검색에 노출되고 빠르게 열리는 것입니다. **EpoCanvas Docs**는 빌드 계층에 바로 사용할 수 있는 SEO 기능과 성능 메커니즘을 내장하고 있습니다. 이 페이지에서는 각각이 무엇인지, 어떻게 검증하는지, 그리고 사이트 공개 후 추가로 해야 할 몇 가지 일을 설명합니다.

---

## 내장 SEO 기능

다음 기능은 모두 빌드 시점에 자동으로 적용되며 추가 설정이 필요 없습니다:

| 기능 | 구현 방식 | 검증 방법 |
| :--- | :--- | :--- |
| 페이지 제목 | `<title>아티클 제목 \| EpoCanvas Docs</title>`, Frontmatter에서 가져옴 | 웹페이지 소스 보기 또는 브라우저 탭 |
| 페이지 설명 | `<meta name="description">`, Frontmatter의 `description`에서 가져옴 | 소스 보기 |
| Open Graph 태그 | `og:title`, `og:type`, `og:url`, `og:locale`, `og:description`, 소셜 플랫폼에 공유할 때 카드 표시 | 링크를 채팅 도구에 붙여넣어 미리보기 |
| Canonical 링크 | 각 페이지에 자동으로 `<link rel="canonical">` 생성, 주 도메인을 가리킴 | 소스 보기 |
| Sitemap | 빌드 시 `sitemap-index.xml` 자동 생성 | `/sitemap-index.xml` 접속 |
| robots.txt | 프로젝트에 `public/robots.txt` 내장, 모든 크롤러를 허용하고 sitemap 위치를 선언 | `/robots.txt` 접속 |

:::tip
Frontmatter의 `title`과 `description`은 검색 엔진이 표시하는 주요 소재입니다. 문서를 작성할 때 짧고 정확한 `description`을 반드시 작성하세요. 이것이 SEO에서 가장 중요한 단일 최적화 포인트입니다.
:::

### Canonical과 미러 도메인

사이트의 주 도메인은 `docs.epocanvas.com`이며 `<site>` 설정도 이와 일치합니다. 각 페이지의 canonical과 `og:url`은 모두 주 도메인을 가리킵니다. 콘텐츠가 `epocanvas-docs.pages.dev` 미러로도 동시에 접근 가능하더라도 검색 엔진은 가중치를 주 도메인에 통합하며 중복 콘텐츠로 판정하지 않습니다.

---

## 성능 메커니즘

### 순수 정적 출력, 프레임워크 런타임 없음

빌드 결과물은 순수 HTML + CSS입니다. 페이지 내비게이션, 읽기, 목차 스크롤 하이라이트에는 어떤 프런트엔드 프레임워크도 다운로드할 필요가 없고(React/Vue 등 런타임 용량은 0), 검색, 테마 전환, 언어 전환 등 인터랙티브 컴포넌트만 필요할 때 소량의 스크립트를 로드합니다. 첫 화면 렌더링이 JavaScript를 기다리지 않으므로 느린 네트워크와 저사양 기기에서도 원활합니다.

### 이미지 용량은 근원에서 제어

이 사이트는 빌드 시점의 이미지 처리를 사용하지 않습니다. `astro.config.mjs`에서 `image.service`를 `passthroughImageService()`로 설정하므로 `public/`의 이미지는 압축이나 크기 조정 없이 `dist/`로 그대로 복사됩니다. sharp를 쓰지 않는 이유는 pnpm의 격리된 디렉터리 구조에서 네이티브 의존성을 해석하지 못해, 캐시가 없는 환경(CI, 최초 빌드)에서 `MissingSharp`로 빌드가 중단되기 때문입니다. 따라서 용량은 커밋 이전에 통제합니다 — 인터페이스 스크린샷은 너비 1440픽셀로 통일해 사전 압축하고, 구조 다이어그램은 모두 SVG 벡터로 작성합니다.

### 검색 인덱스 필요 시 로드

Pagefind는 `pnpm run build` 시 고압축 인덱스 샤드를 생성합니다. 독자가 페이지를 열 때는 인덱스를 전혀 다운로드하지 않으며, 실제로 사이트 전체 검색을 사용할 때만 브라우저가 키워드에 따라 해당 샤드(수 KB에서 수십 KB)를 가져오므로 첫 화면 속도에 영향을 주지 않습니다.

### 성능 검증 방법

1. 브라우저 개발자 도구의 **Network** 패널을 열고 페이지를 새로 고쳐 첫 화면 전송 용량을 확인합니다;
2. Chrome 시크릿 창에서 **Lighthouse** 감사(Performance 카테고리)를 실행하여 점수를 확인합니다;
3. `curl -sI https://docs.epocanvas.com`으로 응답 헤더의 `Cache-Control` 등 CDN 캐시 정책이 적용되는지 확인합니다.

---

## 사이트 공개 후 권장하는 세 가지 작업

배포가 완료되면([Cloudflare Pages 배포](/canvas/cloudflare/) 참조) 다음 작업을 순서대로 완료하는 것을 권장합니다:

### 1. Google Search Console에 Sitemap 제출

1. [Google Search Console](https://search.google.com/search-console)을 열고 리소스 `docs.epocanvas.com`을 추가합니다;
2. 안내에 따라 DNS TXT 레코드로 도메인 소유권을 검증합니다(도메인이 Cloudflare에 위임되어 있으면 몇 분 안에 적용됩니다);
3. 왼쪽의 "사이트맵"에서 `https://docs.epocanvas.com/sitemap-index.xml`을 제출합니다.

### 2. 색인 결과 확인

사이트 공개 일주일 후 Google에서 `site:docs.epocanvas.com`으로 검색하여 문서가 색인되었는지 확인합니다. Search Console의 "페이지" 보고서에서 색인된 페이지 수가 문서 수와 일치하는지 확인하세요.

### 3. 주기적으로 깨진 링크 점검

문서 개편, 경로 이름 변경 후에는 사이트 외부에서 참조하던 옛 링크가 깨질 수 있습니다. Search Console의 "페이지" 보고서에서 "찾을 수 없음 (404)" 항목을 확인하고, `astro.config.mjs`의 `redirects` 표에서 방문량이 많은 깨진 경로에 리다이렉트를 보충할 수 있습니다.

:::caution
`epocanvas-docs.pages.dev` 미러 도메인은 예비 접속 경로일 뿐이며, canonical이 검색 엔진이 주 도메인만 색인하도록 보장합니다. 미러 주소를 사이트 외부에서 적극 퍼뜨리지 마세요. 독자가 여러분이 통제할 수 없는 도메인을 즐겨찾기하게 되는 일을 막기 위함입니다.
:::
