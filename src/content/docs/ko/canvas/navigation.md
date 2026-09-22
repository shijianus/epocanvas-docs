---
title: 상단 내비게이션과 페이지 라우팅
description: EpoCanvas Docs의 상단 내비게이션 바 설정, 동적 경로 하이라이트 규칙, 외부 버전 배지와 히스토리 리다이렉트 설정.
---

상단 내비게이션 바는 사용자가 여러 기능 섹션 사이를 오갈 때 거치는 주요 통로입니다. **EpoCanvas Docs**는 모든 내비게이션 항목을 하나의 설정 파일에 모아 두어 한 곳만 수정하면 사이트 전체에 적용되며, 정확한 현재 페이지 하이라이트와 이전 링크 리다이렉트 메커니즘도 기본으로 갖추고 있습니다.

---

## 내비게이션 설정 센터 (`src/config/navigation.ts`)

모든 상단 내비게이션 버튼은 `src/config/navigation.ts`에서 선언형 배열로 관리됩니다. 각 항목의 필드 정의는 다음과 같습니다:

```typescript
// 내비게이션 항목 속성 정의
export interface NavItem {
  id: string; // 고유 식별자
  labelKey: string; // 다국어 번역 사전의 키 이름
  defaultLabel: string; // 기본 표시 텍스트(예: "首页", "产品说明")
  href: string; // 이동 링크 또는 상대 경로
  match?: (pathname: string) => boolean; // 현재 페이지가 이 버튼을 하이라이트해야 하는지 판단하는 규칙
  badge?: string; // 추가로 표시하는 작은 캡슐 배지(예: 버전 번호 "v1.2.0")
  isExternal?: boolean; // 외부 웹페이지 이동 여부(참이면 새 창으로 열림)
}
```

### 현재 공식 설정(발췌)

```typescript
export const navigationConfig: NavItem[] = [
  {
    id: 'home',
    labelKey: 'nav.home',
    defaultLabel: '首页',
    href: '/',
    match: (pathname: string) => pathname === '/' || pathname === '',
  },
  {
    id: 'docs',
    labelKey: 'nav.docs',
    defaultLabel: '产品说明',
    href: '/canvas/',
    match: (pathname: string) =>
      pathname === '/canvas' ||
      pathname === '/canvas/' ||
      pathname.includes('about') ||
      pathname.includes('layout') ||
      pathname.includes('search-engine') ||
      pathname.includes('i18n') ||
      pathname.includes('navigation'),
  },
  {
    id: 'quickstart',
    labelKey: 'nav.quickstart',
    defaultLabel: '快速上手',
    href: '/canvas/deployment/',
    match: (pathname: string) => pathname.includes('deployment'),
  },
  // 뒤이어 guide(작성 규범), deploy(배포 및 출시), faq(자주 묻는 질문) 항목이 있고
  // 그리고 GitHub Releases를 가리키는 release 외부 항목이 있습니다
];
```

내비게이션 항목을 추가하거나 삭제할 때는 이 배열에서 항목을 더하거나 빼기만 하면 되고, 저장하면 로컬 개발 서버가 자동으로 핫 리로드합니다.

---

## 동적 활성화와 하이라이트 규칙

단순히 `pathname.startsWith('/canvas')`로만 판단하면, "빠른 시작" 페이지인 `/canvas/deployment/`에 접속했을 때 "제품 소개"와 "빠른 시작" 두 버튼이 동시에 켜져 혼란을 줄 수 있습니다.

그래서 각 내비게이션 항목은 `match` 함수로 자신의 하이라이트 범위를 선언합니다:

- 홈 `/`에 접속하면 "홈" 버튼만 활성 상태가 됩니다;
- `/canvas/layout/`, `/canvas/about/` 등 일반 문서에 접속하면 "제품 소개" 버튼이 활성화됩니다;
- `deployment` 경로의 페이지로 들어가면 "빠른 시작" 버튼이 배타적으로 활성화됩니다;
- 활성 상태의 버튼은 테마 색 캡슐 배경을 가지며 비활성 버튼과 뚜렷이 대비됩니다.

새 문서 페이지를 추가할 때는 경로 키워드를 해당 내비게이션 항목의 `match` 규칙에 넣는 것을 잊지 마세요. 그렇지 않으면 상단 바가 올바르게 하이라이트되지 않습니다.

---

## 외부 링크와 버전 배지 인터랙션

어떤 내비게이션 항목이 외부 사이트(예: GitHub 저장소의 Releases 페이지)를 가리킨다면:

1. `isExternal: true`로 설정합니다;
2. 시스템이 해당 링크에 `target="_blank" rel="noopener noreferrer"` 보안 속성을 자동으로 붙여 새 탭에서 열립니다;
3. 텍스트 옆에 사선 방향의 작은 화살표 아이콘(`↗`)이 따라 붙어, 클릭하면 현재 사이트를 떠난다는 것을 알려 줍니다.

버전 배지는 버튼 안의 캡슐 형태로, 문구는 `src/config/navigation.ts`의 `CURRENT_DOCS_VERSION`에서 가져옵니다. 이 값은 `package.json`의 `version`을 바로 읽기 때문에 릴리스 때는 `package.json` 한 곳만 고치면 상단이 자동으로 따라갑니다. 배지를 누르면 GitHub 릴리스 목록이 열립니다. 전체 절차는 [버전 관리 및 자동화 워크플로](/canvas/releases/)에 있습니다.

---

## 페이지 리다이렉트 규칙 (`astro.config.mjs`)

프로젝트를 반복 개선하다 보면 문서 경로를 조정하게 됩니다. 독자의 즐겨찾기에 있는 오래된 링크가 404로 이어지지 않도록, `astro.config.mjs`의 `redirects` 테이블에 새 경로와 옛 경로의 대응 관계를 등록할 수 있습니다:

```javascript
export default defineConfig({
  redirects: {
    // 이 사이트의 챕터 경로를 의미 있게 이름 바꾼 뒤, 옛 링크는 전부 점프를 유지합니다
    '/canvas/rule-engine': '/canvas/cloudflare/',
    '/canvas/dns-setup': '/canvas/layout/',
  },
});
```

Astro는 빌드 시점에 이 경로들에 대한 자동 이동 페이지를 생성합니다. 독자가 옛 주소로 접속하면 새 주소로 부드럽게 안내되고, 검색 엔진 가중치도 이어받을 수 있습니다.
### 실제 서비스에서 301이 응답하는 이유

Astro가 만드는 전환 페이지는 `200` 상태의 meta-refresh 문서라 검색엔진이 새 주소를 별개 페이지로 봅니다. Cloudflare Pages는사이트 `_redirects`를 정적 파일보다 먼저 적용하므로, `astro.config.mjs`의 `cloudflareRedirectsFile()`이 빌드 뒤에 같은 `legacyRedirects` 표로 `dist/_redirects`를 써냅니다:

```text
/mail  /canvas/  301
/mail/  /canvas/  301
```

두 규칙은 끝 슬래시 하나만 다릅니다. Cloudflare는 경로를 정확히 비교해 슬래시가 있는 요청은 없는 규칙에 걸리지 않고 그 200 페이지로 떨어집니다. 로컬 `pnpm run preview`는 `_redirects`를 읽지 않아 Astro 전환 페이지를 쓰므로 두 장치는 함께 존재합니다.

옛 경로를 추가할 때는 **슬래시 없는** 한 줄만 등록하세요. Astro가 이를 `<옛 경로>/index.html`로 렌더링하는데, 슬래시 형태까지 `redirects`에 넣으면 같은 라우트로 충돌해 빌드 시 route collision 경고가 납니다(Astro 다음 메이저에서는 빌드가 실패합니다).
