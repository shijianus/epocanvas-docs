---
title: UI 컴포넌트와 커스텀 개발
description: "EpoCanvas Docs UI 컴포넌트 아키텍처: Starlight 컴포넌트 오버라이드 메커니즘, 7개 커스텀 컴포넌트의 역할과 데이터 흐름, 그리고 커스텀 개발 시 주의 사항."
---

**EpoCanvas Docs**의 UI는 처음부터 새로 만들지 않고 Starlight 기본 컴포넌트를 기반으로 **필요한 부분만 오버라이드**하는 방식입니다: Starlight의 페이지 골격과 콘텐츠 처리 기능은 유지하되, 상단 바, 사이드바, 목차, 검색 등 표시 컴포넌트를 교체하여 원하는 3열 레이아웃과 인터랙션을 얻습니다. 이 페이지에서는 이 컴포넌트 체계의 구조와 수정 방법을 설명합니다.

---

## 컴포넌트 오버라이드 메커니즘

Starlight는 `astro.config.mjs`의 `components` 필드에서 임의의 기본 컴포넌트를 커스텀 구현으로 교체할 수 있게 해줍니다. 이 프로젝트에서는 7개의 컴포넌트를 오버라이드했습니다:

```javascript
// astro.config.mjs (발췌)
components: {
  Header: './src/components/starlight/Header.astro',
  Sidebar: './src/components/starlight/Sidebar.astro',
  TableOfContents: './src/components/starlight/TableOfContents.astro',
  PageTitle: './src/components/starlight/PageTitle.astro',
  TwoColumnContent: './src/components/starlight/TwoColumnContent.astro',
  Search: './src/components/starlight/Search.astro',
  Pagination: './src/components/starlight/Pagination.astro',
},
```

빌드 시 Starlight는 페이지를 렌더링하는 각 위치에서 여기에 지정된 파일을 우선 사용합니다. 오버라이드되지 않은 컴포넌트(예: 푸터 Footer, 모바일 메뉴)는 계속 기본 구현을 사용합니다.

---

## 7개 커스텀 컴포넌트의 역할

모든 소스 코드는 `src/components/starlight/`에 있으며, 규모와 역할은 다음과 같습니다:

| 컴포넌트 파일 | 규모 | 역할 |
| :--- | :--- | :--- |
| `Header.astro` | 약 713줄 | 상단 바의 전체 내용: 로고, 검색창, 메인 내비게이션, 버전 배지, 언어 전환, 테마 전환, GitHub 및 Telegram 진입점 |
| `Search.astro` | 약 840줄 | 듀얼 모드 검색: 상단 바 페이지 내 찾기(하이라이트와 카운트) + `Ctrl+K` 사이트 전체 검색 팝업(Pagefind UI) |
| `Pagination.astro` | 약 123줄 | 하단 "이전 페이지 / 다음 페이지" 카드: 얇은 평면 테두리, 테마 색상 제목, ↙/↘ 대각선 화살표로 페이지 이동 방향 표시 |
| `TwoColumnContent.astro` | 약 77줄 | 본문과 오른쪽 목차의 2열 골격, 오른쪽 열의 고정 너비와 스크롤 제어 |
| `TableOfContents.astro` | 약 64줄 | "이 페이지 목차" 제목, 아이콘과 목차 목록, 페이지 자체 제목은 필터링 |
| `PageTitle.astro` | 약 62줄 | 페이지 대제목(Frontmatter의 `title` 사용)과 "마지막 업데이트" 타임스탬프 |
| `Sidebar.astro` | 약 22줄 | 얇은 래퍼: Starlight 기본 `SidebarPersister`를 재사용하여 페이지 이동 시 사이드바 스크롤 위치 유지 |

---

## 데이터 흐름: 3개의 설정 파일이 전체 UI를 구동

커스텀 컴포넌트 자체는 업무 데이터를 담고 있지 않으며, UI 콘텐츠는 3개의 설정 파일이 구동합니다:

```text
astro.config.mjs ──→ locales + sidebar 배열 ──→ Sidebar.astro가 왼쪽 목차를 렌더링(언어별 번역 라벨 사용)
src/config/navigation.ts ──→ navigationConfig ──→ Header.astro가 상단 내비게이션과 하이라이트를 렌더링(링크에 언어 접두사 자동 추가)
src/utils/i18n.ts ──→ UI_TRANSLATIONS 사전 ──→ 각 컴포넌트가 빌드 시점에 현재 언어의 항목을 가져옴
```

- **왼쪽 목차**는 `astro.config.mjs`의 `sidebar` 선언만 인식하므로 새 문서는 반드시 여기에 등록해야 합니다; 각 항목의 `translations` 필드가 10개 언어의 메뉴 텍스트를 제공합니다;
- **상단 내비게이션** 각 항목의 표시 텍스트는 `labelKey`로 `i18n.ts` 사전에서 번역을 가져오며, `match` 함수가 현재 페이지에서 어떤 버튼을 하이라이트할지 결정합니다(매칭 전에 언어 접두사를 먼저 제거);
- **UI 문구**(검색창 플레이스홀더, "이 페이지 목차" 제목, 테마 전환 안내 등)는 각 컴포넌트가 `getTranslation(key, lang)`을 호출하여 빌드 시점에 해당 언어로 직접 출력하며, 페이지 안에 런타임 치환 스크립트는 없습니다.

즉, UI 콘텐츠를 바꾸려면 먼저 해당 설정 파일을 찾고, 외형(간격, 색상, 아이콘)을 바꿀 때만 컴포넌트 소스 코드를 수정하면 됩니다.

---

## 각 컴포넌트의 핵심 구현 세부 사항

### PageTitle: 페이지 제목과 실제 업데이트 시간

페이지 대제목은 Frontmatter의 `title`을 직접 읽으므로 **본문에 `#` 수준 1 제목을 다시 쓰지 마세요**. "마지막 업데이트" 타임스탬프는 빌드 시점의 Git 커밋 이력에서 가져옵니다(`astro.config.mjs`에서 `lastUpdated: true` 활성화). 커밋할 때마다 자동으로 갱신되므로 수동 관리가 필요 없습니다.

:::caution
업데이트 시간은 빌드 시점에 Git 이력에서 읽어옵니다. 따라서 **아직 커밋하지 않은 새 문서에는 날짜가 표시되지 않습니다**(제목 아래에는 규정된 서명만 유지됨). 커밋 후 다시 빌드하면 나타납니다. 빌드 환경이 얕은 클론(예: CI의 `fetch-depth: 1`)이면 Git 이력이 불완전하여 타임스탬프 역시 누락됩니다. 두 경우 모두 빌드에는 영향을 주지 않습니다.
:::

### Sidebar: 스크롤 위치 기억의 구현

`Sidebar.astro`는 20여 줄에 불과하며, 핵심은 Starlight 공식 `SidebarPersister` 컴포넌트를 재사용하는 것입니다: 페이지 전환 시 사이드바 DOM을 재생성하지 않아 스크롤 위치가 유지됩니다. 이것이 왼쪽 목차가 "페이지를 이동해도 흔들리지 않는" 원리입니다.

### TableOfContents: 이 페이지 목차 생성

목차 데이터는 Starlight가 빌드 시점에 본문 제목(`##`과 `###`)을 파싱하여 생성하며, 컴포넌트는 페이지 제목 자체를 필터링하고 렌더링하는 역할만 담당합니다. 스크롤 하이라이트는 `starlight-toc` 커스텀 엘리먼트가 브라우저 쪽에서 처리하며 어떤 프레임워크에도 의존하지 않습니다.

### TwoColumnContent: 오른쪽 열 너비의 유일한 출처

오른쪽 목차 열의 너비는 `@media (min-width: 72rem)`에서 `20rem`으로 고정되어 있고(초와이드 스크린 `90rem` 이상에서는 `21rem`), 본문 영역의 최대 너비는 여기서 오른쪽 열 너비를 뺀 값입니다. 오른쪽 열 너비를 조정하려면 이 파일 하나만 수정하면 되며, 다른 스타일시트에 흩어져서 오버라이드하지 마세요.

### Header: 내비게이션, 테마와 언어

- 내비게이션 버튼은 `navigationConfig`를 순회하며 렌더링되고, 활성 상태 스타일은 `match` 함수의 반환값으로 결정되며, 링크는 `localizedHref()`를 통해 현재 언어 접두사가 자동으로 붙습니다;
- 테마 전환은 LocalStorage의 `starlight-theme` 키에 기록되며, 페이지 로드 시 "로컬 선택 → 시스템 환경설정" 순서로 초기 테마를 결정합니다;
- 언어 드롭다운 메뉴의 각 항목은 현재 페이지의 해당 언어 버전을 가리키는 실제 링크이며, 클릭하면 바로 이동하고 별도의 상태 저장은 없습니다;
- 상단 바 오른쪽의 GitHub 링크는 `astro.config.mjs`의 `social.github`에서 오며, Telegram 링크(`https://t.me/epocanvas`)는 현재 컴포넌트 안에 하드코딩되어 있으므로 수정이 필요하면 `Header.astro`를 직접 편집하세요.

### Search: 듀얼 모드 검색

하나의 컴포넌트에 두 가지 검색이 구현되어 있습니다(자세한 내용은 [전체 텍스트 검색과 단축키 사용](/canvas/search-engine/) 참조):

1. **페이지 내 찾기**: 상단 바 입력창으로, Enter 키로 현재 페이지의 매칭 텍스트 사이를 이동하며 하이라이트는 스크립트가 마커를 표시하는 방식으로 구현됩니다;
2. **사이트 전체 검색**: `<dialog>` 팝업 + Pagefind 기본 UI, 인덱스는 `pnpm run build` 단계에서 생성됩니다.

### Pagination: 페이지 이동 카드

이전 페이지 / 다음 페이지 데이터는 Starlight가 빌드 시점에 `sidebar` 순서에 따라 계산합니다(`Astro.locals.starlightRoute.pagination`). 컴포넌트는 렌더링만 담당합니다: 같은 너비의 두 카드, 얇은 테두리에 그림자 없음, 제목은 테마 색상, ↙ / ↘ 대각선 화살표는 호버 시 페이지 이동 방향으로 이동합니다. 화살표는 인라인 SVG 경로이며, 사이트가 RTL 언어에 사용되면 방향이 자동으로 미러링됩니다.

---

## 커스텀 개발 주의 사항

:::caution
컴포넌트를 오버라이드하면 Starlight 기본 컴포넌트의 이후 업데이트를 받지 못하게 됩니다. Starlight 버전을 업그레이드할 때 컴포넌트의 props와 `Astro.locals.starlightRoute` 구조가 변경될 수 있으므로, 업그레이드 후에는 7개 오버라이드 컴포넌트 전부에 대해 회귀 테스트를 해야 합니다.
:::

- **스타일 변경은 우선 CSS 변수 사용**: 색상, 글꼴, 레이아웃 크기는 `src/styles/custom.css`의 `:root` 변수에 모여 있습니다. [사이트 전역 설정 및 스타일 커스터마이징](/canvas/configuration/)을 참조하세요. 대부분의 커스터마이징은 컴포넌트를 수정할 필요가 없습니다;
- **인터랙션 변경 시에만 컴포넌트 수정**: 버튼 추가, 구조 조정 시 UI 텍스트는 `getTranslation(key, lang)`으로 가져오고 `i18n.ts`에 10개 언어 항목을 보충하세요. 누락된 언어는 폴백되어 중국어가 표시됩니다;
- **수정 후 반드시 로컬 검증**: `pnpm run dev`로 인터랙션을 확인하고, `pnpm run build`로 타입과 빌드 통과를 확인합니다(로컬 명령어는 [자주 묻는 질문과 문제 해결 FAQ](/canvas/troubleshooting/) 참조).

자주 하는 구체적인 커스터마이징 작업은 [자주 하는 커스터마이징 모음](/canvas/recipes/)을 바로 참조하세요.
