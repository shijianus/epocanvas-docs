---
title: 자주 하는 커스터마이징 모음
description: "EpoCanvas Docs 자주 쓰는 커스터마이징 작업 빠른 참조: 문서 추가, 내비게이션 버튼, UI 언어, 테마 색상, 로고, 레이아웃 크기와 검색 문구의 전체 절차."
---

이 페이지는 가장 흔한 커스터마이징 요구를 "단계대로 따라 하면 되는" 빠른 참조 매뉴얼로 정리했습니다. 각 레시피의 수정 위치는 구체적인 파일까지 표시되어 있습니다. 시작하기 전에 [렌더링 규칙](/canvas/rendering/)과 [컴포넌트 체계](/canvas/components/)를 먼저 알아두면 시행착오를 줄일 수 있습니다.

---

## 레시피 1: 문서 새로 추가

1. `src/content/docs/canvas/` 아래에 새 `.md` 파일을 만듭니다(소문자 영어에 하이픈을 넣는 네이밍, 예: `user-guide.md`);
2. 파일 맨 앞에 Frontmatter를 작성합니다:

   ```yaml
   ---
   title: 사용자 사용 가이드
   description: 이 문서가 다루는 내용을 한 문장으로 설명합니다. 검색 결과와 공유 카드에 표시됩니다.
   ---
   ```

3. `astro.config.mjs`를 열어 `sidebar` 배열의 대상 그룹에 등록합니다:

   ```javascript
   { label: '사용자 사용 가이드', link: '/canvas/user-guide/' }
   ```

4. 저장 후 로컬 미리보기에서 왼쪽 목차에 나타나는지 확인하고, `pnpm run deploy`로 배포합니다.

:::warning
파일만 만들고 `sidebar`에 등록하지 않으면 페이지는 접근할 수 있지만 왼쪽 목차에는 나타나지 않습니다. 초보자가 가장 자주 겪는 함정입니다.
:::

---

## 레시피 2: 상단 내비게이션 버튼 추가

1. `src/config/navigation.ts`를 열어 `navigationConfig` 배열에 항목을 추가합니다:

   ```typescript
   {
     id: 'blog',
     labelKey: 'nav.blog',
     defaultLabel: '블로그',
     href: 'https://blog.epocanvas.com',
     isExternal: true,          // 외부 링크는 새 창에서 열립니다
   },
   ```

2. `src/utils/i18n.ts`를 열어 `nav.blog`에 10개 언어의 번역 항목을 보충합니다;
3. 저장하면 상단 바에 새 버튼이 즉시 나타납니다. 사이트 내 링크가 내비게이션 하이라이트에 참여하려면 `match` 함수를 설정하세요.

---

## 레시피 3: 페이지 하이라이트 규칙 조정

페이지 경로가 바뀌어 상단 바 하이라이트가 잘못될 때는 `navigation.ts`에서 해당 항목의 `match` 함수를 수정합니다:

```typescript
match: (pathname: string) =>
  pathname === '/canvas/' || pathname.includes('layout'),
```

규칙은 정확 매칭 우선, `includes`로 폴백하는 방식이며, 여러 버튼의 `match`에 교집합이 있으면 안 됩니다. 그렇지 않으면 두 버튼이 동시에 하이라이트됩니다.

---

## 레시피 4: 브랜드 테마 색상 교체

1. `src/styles/custom.css`를 엽니다;
2. 라이트 모드(`:root`)와 다크 모드(`:root[data-theme='dark']`) 두 블록의 메인 색상 세 가지를 함께 수정합니다:

   ```css
   --sl-color-accent: #10b981;      /* 메인 색상: 버튼, 선택 상태 */
   --sl-color-accent-low: rgba(16, 185, 129, 0.1);  /* 선택 항목의 밝은 배경 */
   --sl-color-accent-high: #047857; /* 링크와 강조 텍스트 */
   ```

3. 저장하면 사이트 전체의 버튼, 하이라이트, 링크 색상이 자동으로 바뀝니다. 한쪽만 수정하면 다른 테마에서 색상이 어긋납니다.

---

## 레시피 5: 로고 교체

| 위치 | 파일 | 용도 |
| :--- | :--- | :--- |
| 상단 바 왼쪽 | `public/images/logo.svg` | 내부 페이지 상단 바 아이콘, 경로는 `astro.config.mjs`의 `logo.src`에 설정 |
| 홈페이지 대형 이미지 | `src/assets/logo.svg` | 랜딩 페이지 오른쪽 장식 이미지 |

두 곳 모두 함께 교체하는 것을 권장합니다. 로고는 SVG 벡터 형식을 사용합니다; `astro.config.mjs`에서 `logo.replacesTitle`을 `true`로 설정하면 제목 텍스트를 숨기고 아이콘만 남길 수 있습니다.

---

## 레시피 6: 레이아웃 크기 조정

레이아웃 3요소는 `src/styles/custom.css` 상단에 모여 있습니다:

```css
:root {
  --sl-sidebar-width: 16.5rem;  /* 왼쪽 목차 너비 */
  --sl-content-width: 60rem;    /* 본문 최대 너비 */
  --sl-nav-height: 3.5rem;      /* 상단 바 높이 */
}
```

:::caution
오른쪽 목차 열의 너비는 이 변수들에 포함되어 있지 않으며, `src/components/starlight/TwoColumnContent.astro`의 `20rem`이 제어합니다(초와이드 스크린은 `21rem`). 오른쪽 열 너비를 조정할 때는 같은 파일에서 본문 영역의 `max-width: calc(100% - 20rem)`도 함께 수정해야 합니다.
:::

---

## 레시피 7: 검색창 안내 텍스트 수정

검색창 플레이스홀더, 버튼 안내 등 UI 문구는 모두 `src/utils/i18n.ts`의 다국어 사전에서 옵니다. 이 파일을 열어 "언어 → 항목 키"의 2단계 구조에 따라 `search.placeholder` 등의 항목을 수정합니다:

```typescript
// 파일 경로: src/utils/i18n.ts
export const UI_TRANSLATIONS = {
  'zh-CN': {
    'search.placeholder': '搜索文档与指令...',
    // ...해당 언어의 다른 항목
  },
  en: {
    'search.placeholder': 'Search documentation...',
    // ...해당 언어의 다른 항목
  },
  // 나머지 8개 언어도 동일한 방식으로 추가
};
```

수정을 누락한 언어는 자동으로 폴백되어 중국어 기본값이 표시되며 오류는 발생하지 않습니다. 저장하면 로컬 핫 리로드로 즉시 반영되며 빌드가 필요 없습니다.

---

## 레시피 8: 사이트에 검증용 `<head>` 태그 추가

Google Search Console, 바이두 웹마스터 플랫폼 등 서비스를 연결할 때는 `<head>`에 검증 태그를 주입해야 합니다. `astro.config.mjs`를 열어 Starlight 설정의 `head` 배열에 추가합니다:

```javascript
head: [
  // 기존 favicon 설정 ...
  {
    tag: 'meta',
    attrs: {
      name: 'google-site-verification',
      content: '검증 문자열',
    },
  },
],
```

저장하고 다시 배포한 뒤 플랫폼에서 제공하는 검증 버튼으로 확인합니다. 사이트 공개 후의 검색 엔진 설정은 [SEO 및 성능 최적화](/canvas/seo/)를 참조하세요.

---

## 수정 후 공통 확인 절차

어떤 커스터마이징이든 커밋 전에 이 순서대로 검증합니다:

```bash
pnpm run dev      # 1. 브라우저에서 페이지별로 효과 확인
pnpm exec astro check && pnpm run build   # 2. 타입 검사 + 전체 빌드
pnpm run preview  # 3. 빌드 결과물 미리보기, 이상 없음을 확인한 후 배포
```

배포 방법은 [Cloudflare Pages 배포](/canvas/cloudflare/)를 참조하세요.
