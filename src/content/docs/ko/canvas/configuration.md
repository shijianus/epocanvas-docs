---
title: 사이트 전역 설정 및 스타일 커스터마이징
description: EpoCanvas Docs 핵심 설정 파일 수정 가이드, 사이드바 메뉴 조정, 브랜드 로고 교체 및 테마 색상 커스터마이징.
---

**EpoCanvas Docs**를 자기 팀의 문서 사이트로 사용하거나, 사이트 제목, 로고(Logo), 목차 구조, 테마 색상을 조정하고 싶다면 이 장에서 자주 사용하는 커스터마이징 지점을 소개합니다. 모든 설정 변경 사항은 저장하면 로컬 개발 서버가 자동으로 핫 리로드되어 브라우저에 즉시 반영됩니다.

---

## 1. 사이트 기본 정보 (`astro.config.mjs`)

루트 디렉터리의 `astro.config.mjs`는 문서 사이트 전체의 기본 설정 파일입니다. 사이트 정보와 직접 관련된 옵션은 다음과 같습니다(주석에 수정 시점이 표시되어 있습니다):

```javascript
import { unified } from '@astrojs/markdown-remark';

// 도메인 변경 시 기존 SITE_ORIGIN과 public/robots.txt의 Sitemap URL을 함께 수정합니다.
// site와 hreflangXDefault()가 이 값을 공유하므로 site만 바꾸지 마세요.
const SITE_ORIGIN = 'https://docs.epocanvas.com';

export default defineConfig({
  // 사이트의 프로덕션 도메인. SEO 링크와 Sitemap 생성에 영향을 줍니다
  site: SITE_ORIGIN,

  markdown: {
    processor: unified({
      rehypePlugins: [rehypeWrapTables, rehypeLocalizeInternalLinks, rehypeLocalizeDiagramImages, rehypeLocalizeAsides, rehypeLocalizeFootnotes],
    }),
  },

  integrations: [
    starlight({
      // 웹사이트 제목. 브라우저 탭과 상단 바에 표시됩니다
      title: 'EpoCanvas Docs',
      // 사이트 설명. 검색 엔진 결과 요약에 사용됩니다
      description: 'EpoCanvas 全栈技术、架构与产品运维指南',

      // 상단 바 왼쪽에 표시되는 로고 이미지 경로
      logo: {
        src: './public/images/logo.svg',
        replacesTitle: false, // true로 설정하면 로고만 표시하고 제목 텍스트는 숨깁니다
      },

      // Starlight 사이드바의 소셜 링크.
      // 상단 바 GitHub/Telegram URL은 src/components/starlight/Header.astro에 별도로 정의합니다.
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/shijianus/epocanvas-docs' },
      ],

      // 커스텀 스타일시트 진입점
      customCss: ['./src/styles/custom.css'],

      // 사이드바 목차(다음 절 참조)
      sidebar: [/* ... */],
    }),
  ],

  // 이전 경로 리다이렉트 테이블. 링크가 깨지는 것을 방지합니다
  redirects: { '/mail': '/canvas/' },
});
```

Astro 7에서 이 사이트는 `@astrojs/markdown-remark` 7.3.5의 `unified()`로 `markdown.processor`를 설정합니다. 위의 `rehypePlugins`는 `astro.config.mjs`의 기존 플러그인을 사용하므로 설정을 변경할 때 해당 함수 정의를 유지하세요.

---

## 2. 왼쪽 목차 메뉴를 수정하는 방법은?

왼쪽의 문서 분류 목차는 `astro.config.mjs`에서 Starlight 설정의 `sidebar` 배열이 제어합니다:

```javascript
sidebar: [
  // 그룹 1: 제품 개요
  {
    label: '产品概览与入门',   // 그룹 이름
    items: [
      { label: '产品简介与核心价值', link: '/canvas/' },
      { label: '快速上手 (3分钟运行)', link: '/canvas/deployment/' },
    ],
  },
  // 그룹 2: 자신만의 업무 그룹을 새로 추가할 수 있습니다
  {
    label: '用户指南',
    items: [
      { label: 'Markdown 작성 및 서식 가이드', link: '/canvas/markdown/' },
    ],
  },
];
```

- **`label`**: 사이드바에 표시되는 분류명 또는 문서 제목으로, Frontmatter의 `title`과 달라도 됩니다(예: 더 짧은 표시 이름 사용);
- **`link`**: 문서의 접속 경로로, `src/content/docs/` 아래의 파일 위치에 해당합니다.

:::caution
새로 만든 `.md` 파일은 `sidebar` 배열에 등록해야 왼쪽 목차에 나타납니다. 파일만 만들고 등록하지 않는 것이 초보자가 가장 자주 겪는 함정입니다.
:::

---

## 3. 브랜드 테마 색상 커스터마이징 (`src/styles/custom.css`)

사이트의 모든 색상은 CSS 변수로 제어되며 `src/styles/custom.css`에 정의되어 있습니다. 파일 상단은 라이트 모드 변수이고, `:root[data-theme='dark']` 블록은 다크 모드 변수입니다:

```css
:root {
  /* 브랜드 메인 색상(라이트 모드) */
  --sl-color-accent: #2563eb;
  --sl-color-accent-low: rgba(37, 99, 235, 0.08);  /* 선택 항목의 밝은 배경 */
  --sl-color-accent-high: #1d4ed8;                  /* 링크와 강조 텍스트 */

  /* 페이지 배경색과 구분선 */
  --sl-color-bg: #ffffff;
  --sl-color-hairline: #e2e8f0;
}

:root[data-theme='dark'] {
  /* 다크 모드는 같은 이름의 변수를 사용하며 색상 값만 교체하면 됩니다 */
  --sl-color-accent: #3b82f6;
  --sl-color-accent-low: rgba(59, 130, 246, 0.12);
  --sl-color-accent-high: #60a5fa;

  --sl-color-bg: #0b0f19;
  --sl-color-hairline: #1e293b;
}
```

예를 들어 사이트 전체의 메인 색상을 생기 있는 초록색으로 바꾸고 싶다면 라이트 모드와 다크 모드 두 블록의 `--sl-color-accent`를 `#10b981` 계열 색상 값으로 변경하면 됩니다. 버튼, 선택 상태, 링크가 자동으로 함께 변합니다.

레이아웃 크기도 이 파일 상단에 모아서 정의되어 있습니다:

```css
:root {
  --sl-sidebar-width: 16.5rem;  /* 왼쪽 목차 너비 */
  --sl-content-width: 60rem;    /* 본문 최대 너비 */
  --sl-nav-height: 3.5rem;      /* 상단 바 높이 */
}
```

---

## 4. 사이트 로고 교체

1. 유효한 `.svg` 벡터 로고를 준비합니다. 이 절차는 SVG 전용이며 PNG의 확장자를 `.svg`로 바꾸면 안 됩니다.
2. 상단 바의 `public/images/logo.svg`와 홈페이지 이미지의 `src/assets/logo.svg`를 각각 교체합니다.
3. 로컬 개발 서버에서 브라우저를 새로 고쳐 두 로고를 확인합니다. 운영 사이트는 다시 빌드하고 배포한 뒤에 갱신됩니다.

:::tip
두 로고의 용도는 서로 다릅니다: `public/images/logo.svg`는 상단 바에 사용되고, `src/assets/logo.svg`는 홈페이지 오른쪽의 장식용 대형 이미지에 사용됩니다. 함께 교체하는 것을 권장합니다.
:::
