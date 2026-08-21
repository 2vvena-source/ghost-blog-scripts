/*!
 * SIDEBAR-B v2.8 STEP 3-1 (external hosted)
 * 배포: 2026-08-21
 * 로더 위치: Ghost Site Footer (single <script src=...> tag)
 * 
 * v2.8 변경사항 (v2.7 대비) — STEP 3-1 하이라이트 표시 로직:
 *   [+] 하이라이트 불록 구현
 *       - 저장: Ghost 게시글별 codeinjection_head 필드 안에
 *         <!--HL-START-->자유 텍스트<!--HL-END--> 마커로 감싸서 저장
 *       - 읽기: Content API 로 가져와서 마커 사이 내용만 추출 → 사이드바에 표시
 *       - 마커 사이가 비어있거나 필드 자체가 비어있으면 블록 숨김
 *       - HTML 태그 허용 (링크・강조・줄바꿈), <script>만 제거 (안전)
 *       - 본문 큰까지 자유롭게 허용 (글자수 제한 없음)
 *   [+] 관리자 전용 안내: 필드 비었을 때만 사용법 힌트 작게 노출
 *   [+] 파일명 v2.8 상향
 * 
 * v2.7 변경사항 (v2.6 대비):
 *   [!] 시리즈 블록: 페이지 로드 시 항상 접힘 상태로 시작 (사용자 요구)
 *       - 저장 값 무시, 사용자가 페치더라도 다음 글 로 이동하면 다시 접힘
 *       - 목차/하이라이트는 기존 동작 유지 (localStorage 유지)
 *   [+] applyCollapseState 에 forceCollapsed 옵션 추가
 *   [+] 파일명 v2.7 상향 (jsDelivr + 브라우저 캐시 우회)
 * 
 * v2.6 변경사항 (v2.5 대비):
 *   [!] 시리즈 접기 시 리스트 상단 여백 부여 (접힘 상태에서 현재 글이 구분선에 밀착되던 문제)
 *   [!] TOC 이중 방어:
 *       (a) 상위 셀렉터 좁힘 — 'article .gh-canvas' 제거 (header 도 gh-canvas 클래스를 가져 헤더 안 헤딩까지 오검지)
 *           → section.gh-content 만 사용
 *       (b) EXCLUDE 클래스 확대: gh-article-title, gh-article-author-name, gh-card-title, gh-container-title, gh-footer-signup-header 등
 *       (c) 조상 element 방어: .gh-article-header, .gh-article-meta, .gh-card, .gh-container, .gh-footer 안의 헤딩은 강제 제외
 *   [+] 파일명 v2.6 상향 (jsDelivr + 브라우저 캐시 완전 우회)
 * 
 * v2.5 변경사항 (v2.4 대비):
 *   [!] 시리즈 접기 재정의: 접혀도 "현재 글" 한 줄은 유지 (사용자 요구)
 *       - 제목바 + 구분선 + 현재 글 → 접기와 무관하게 항상 보임
 *       - 다른 회차와 "더 보기" 버튼만 접기로 숨김
 *   [+] 파일명 v2.5 로 상향: jsDelivr 캐시 회피
 * 
 * v2.4 변경사항 (v2.3 대비):
 *   [!] 시리즈 초기 안내 문구 제거 (사용자 요청과 어긋난 UI였음)
 *   [!] 접기 시 제목바 구분선(border-bottom) 유지 (사용자 요청)
 *   [!] TOC 필터 재작성: 부모 카드 검사 제거, 헤딩 자체 클래스만 체크
 *       → CTA 카드 등에 감싸진 본문 헤딩(H1/H2/H3/H4)도 정상 포함
 *       → 토글카드/헤더카드/콜아웃의 자동 헤딩은 여전히 제외
 * 
 * v2.3 변경사항 (v2.2 대비):
 *   [!] TOC 셀렉터 개선: 편집기 카드 내부 헤딩 제외
 *       (kg-toggle-heading-text, kg-header-card-heading, kg-callout-text 등)
 *       → 순수 본문 헤딩만 목차에 표시
 *   [+] 시리즈 초기 표시: 현재 회차 안내 문구 추가
 *       "전 N회 중 · 현재 05화 · 표시 1개" 형식으로 명확한 컨텍스트 제공
 * 
 * v2.2 변경사항 (v2.1 대비):
 *   [!] BUG FIX: createCollapsibleTitle / applyCollapseState 함수 정의 누락 → 시리즈/TOC 모두 안 뜨던 문제
 *   [+] TOC: H1 포함 (단 글 제목 gh-article-title 은 section.gh-content 밖이므로 자동 제외)
 *   [+] 시리즈: 초기 1개(현재 글)만 표시 → 더 보기 클릭 시 +10 누적
 *   [+] 시리즈 제목 텍스트 클릭 → 시리즈 페이지 이동 (우측 아이콘 = 접기)
 * 
 * v2.1 변경사항 (v2 대비):
 *   [!] TOC 셀렉터 범위 좀힘 (section.gh-content 만): 저자 이름 h4 오검지
 *   [+] 시리즈 많을 때: 10개 초과시 "더 보기/접기" 버튼 (현재글이 10 이후면 자동 펼침)
 *   [+] TOC 계층별 마커 추가 (H2 기본, H3 ·, H4 -, H5/H6 –)
 *   [+] 시리즈/목차/하이라이트 접기 토글 (각 블록마다 ▾/▸, localStorage 로 상태 유지)
 * 
 * v2 변경사항 (STEP 2 추가):
 *   [+] 시리즈 목록 구현 (Content API 로 현재 시리즈의 다른 글 가져오기)
 *       → 현재 글이 시리즈에 속하지 않으면 자리 자체 숭김
 *       → 현재 글은 강조 표시
 *   [+] 자동 TOC 구현 (본문 h2/h3 자동 추출, id 없으면 자동 부여)
 *       → 헤딩 없으면 자리 자체 숭김
 *       → 클릭 시 해당 지점으로 부드러운 스크롤
 *       → 스크롤 위치에 따라 현재 보고 있는 헤딩 자동 강조
 * 
 * v1.2 변경사항:
 *   [!] 썸네일 없는 글: 홈 카드 no-image 구조 삽입 (홈과 100% 동일 스타일)
 *   [+] 프로필 = 양쪽 페이지 공용
 *   [+] 인디케이터 = 화면 최하단 고정
 *   [+] 세로 이미지 대응 (max-height 520px)
 * 
 * 다음 STEP:
 *   - STEP 2: 시리즈 목록 + 자동 TOC
 *   - STEP 3: 하이라이트 담기 + 드래그 편집 UI + 크롭 편집 (원본 안 자름)
 * 
 * 안전장치:
 *   - 관리자 페이지(/ghost/*) 실행 안 함
 *   - 개별 글 페이지가 아니면 실행 안 함
 *   - 중복 로드 방지 (window.__DDL_SIDEBAR_B_LOADED)
 *   - try-catch 로 오류 격리
 */
(function(){
  'use strict';
  
  // ============================================================
  // 0. 관리자 페이지 격리
  // ============================================================
  var path = (typeof window !== 'undefined' && window.location) ? window.location.pathname : '';
  if (path.indexOf('/ghost') === 0 || path === '/ghost') return;
  
  // ============================================================
  // 1. 중복 로드 방지
  // ============================================================
  if (window.__DDL_SIDEBAR_B_LOADED) return;
  window.__DDL_SIDEBAR_B_LOADED = true;
  
  // ============================================================
  // 2. 페이지 타입 판별 (개별 글 페이지만)
  // ============================================================
  function isPostPage(){
    if (document.body && document.body.classList.contains('post-template')) return true;
    if (document.querySelector('article.gh-article')) return true;
    if (document.querySelector('section.gh-content')) return true;
    return false;
  }
  
  // ============================================================
  // 3. CSS 삽입 (DESIGN_RULES.md 준수)
  // ============================================================
  var CSS_TEXT = '' +
    /* ---- 사이드바 B 컨테이너 ---- */
    '#ddl-side.ddl-side-b {' +
    '  overflow: visible;' +           /* 인디케이터가 밖에 있어도 됨 */
    '  padding-bottom: 60px;' +        /* 하단 인디케이터 공간 */
    '}' +
    
    /* ---- 슬라이더 래퍼 (프로필 밖에서 시작) ---- */
    '#ddl-side.ddl-side-b .sb-slider {' +
    '  position: relative;' +
    '  width: 100%;' +
    '  overflow: hidden;' +            /* 페이지 간 넘침 완전 차단 */
    '  box-sizing: border-box;' +
    '}' +
    /* 트랙 = 두 페이지를 좌우로 붙임 */
    '#ddl-side.ddl-side-b .sb-track {' +
    '  display: flex;' +
    '  width: 200%;' +
    '  transition: transform 0.35s ease;' +
    '}' +
    '#ddl-side.ddl-side-b .sb-page {' +
    '  width: 50%;' +
    '  flex: 0 0 50%;' +
    '  box-sizing: border-box;' +
    '  padding: 0;' +                  /* 내부 블록이 자체 여백 관리 */
    '  min-height: 100px;' +           /* 최소 높이 */
    '}' +
    /* 페이지 전환 */
    '#ddl-side.ddl-side-b[data-page="0"] .sb-track { transform: translateX(0); }' +
    '#ddl-side.ddl-side-b[data-page="1"] .sb-track { transform: translateX(-50%); }' +
    
    /* ---- 프로필 영역 (양쪽 페이지 공용) ---- */
    '#ddl-side.ddl-side-b .sb-profile-fixed {' +
    '  margin-bottom: 2em;' +          /* 프로필 밑 여백 (썸네일과 딱 붙지 않게) */
    '}' +
    
    /* ---- 페이지 1 블록 사이 여백 ---- */
    '#ddl-side.ddl-side-b .sb-page-1 > .ddl-block,' +
    '#ddl-side.ddl-side-b .sb-page-1 > .sb-block {' +
    '  margin-bottom: 1.5em;' +
    '}' +
    /* 페이지 1 첫 블록은 위 여백 제거 (프로필 밑 여백으로 충분) */
    '#ddl-side.ddl-side-b .sb-page-1 > *:first-child {' +
    '  margin-top: 0;' +
    '}' +
    /* 페이지 2 블록 사이 여백 (홈 사이드바 스타일 그대로 상속) */
    '#ddl-side.ddl-side-b .sb-page-2 > .ddl-block {' +
    '  margin-bottom: 1.5em;' +
    '}' +
    
    /* ---- 썸네일 블록 ---- */
    '.sb-thumb {' +
    '  position: relative;' +
    '  width: 100%;' +
    '  max-height: 520px;' +           /* v1.1: 세로 이미지 대응. 원본 종횡비 유지 */
    '  overflow: hidden;' +
    '  border: 1px solid rgba(15, 58, 58, 0.35);' +
    '  background-color: var(--base, #F5F5F5);' +
    '  cursor: zoom-in;' +
    '  transition: outline 0.15s;' +
    '  box-sizing: border-box;' +
    '}' +
    '.sb-thumb:hover { outline: 1px solid var(--color, #0F3A3A); }' +
    '.sb-thumb img {' +
    '  display: block;' +
    '  width: 100%;' +
    '  height: auto;' +                /* 종횡비 유지 */
    '  max-height: 520px;' +
    '  object-fit: cover;' +
    '  object-position: center;' +     /* 중앙. 크롭 편집은 STEP 3 */
    '}' +
    
    /* ---- 썸네일 없는 경우: 홈 카드 no-image 구조 그대로 삽입 ---- */
    /* CSS 듰유 없음 — header CSS 의 \.gh-card.no-image 규칙이 모두 관리함 */
    /* 단, 사이드바 폭이 종을 수 있으므로 사이드바 안에서만 상하 여백 축소 */
    '#ddl-side.ddl-side-b .sb-thumb-block .gh-card.no-image {' +
    '  margin: 0 !important;' +
    '  width: 100% !important;' +
    '  max-width: 100% !important;' +
    '}' +
    
    /* ---- 자리 예약 표시 (개발 중 표시, 완성 후 자동 안 보임) ---- */
    '.sb-placeholder {' +
    '  padding: 0.8em 1em;' +
    '  border: 1px dashed rgba(15, 58, 58, 0.35);' +
    '  color: rgba(15, 58, 58, 0.6);' +
    '  font-size: 0.85em;' +
    '  font-family: \'Pretendard Variable\',\'Pretendard\',sans-serif;' +
    '  font-style: italic;' +
    '  text-align: center;' +
    '  border-radius: 4px;' +
    '}' +
    /* .sb-completed 클래스가 붙으면 (STEP 완료 시) 자동 숨김 */
    '.sb-block.sb-completed .sb-placeholder { display: none; }' +
    
    /* ============================================================
       [STEP 2] 시리즈 목록 및 TOC 공통 스타일
       DESIGN_RULES.md 준수:
         - Cafe24Danjunghae 헤딩
         - Pretendard 본문
         - 색상 --color / --point 만
         - 엉은 선 rgba(15, 58, 58, 0.35)
       ============================================================ */
    
    /* 시리즈 / TOC 블록 공통 제목 (접기 토글 포함) */
    '.sb-block-title {' +
    '  font-family: \'Cafe24Danjunghae\',\'Gowun Batang\',\'Nanum Myeongjo\',serif;' +
    '  letter-spacing: -0.03em;' +
    '  color: var(--color, #0F3A3A);' +
    '  font-size: 1em;' +
    '  padding: 0.3em 0 0.5em 0;' +
    '  border-bottom: 1px solid rgba(15, 58, 58, 0.35);' +
    '  margin-bottom: 0.6em;' +
    '  display: flex;' +
    '  align-items: baseline;' +
    '  gap: 0.4em;' +
    '  cursor: pointer;' +
    '  user-select: none;' +
    '  transition: color 0.15s;' +
    '}' +
    '.sb-block-title:hover { color: var(--point, #FF9A76); }' +
    '.sb-block-title .sb-title-text { flex: 1 1 auto; }' +
    '.sb-block-title .sb-title-badge {' +
    '  font-family: \'Pretendard Variable\',\'Pretendard\',sans-serif;' +
    '  font-size: 0.7em;' +
    '  color: rgba(15, 58, 58, 0.55);' +
    '  letter-spacing: 0;' +
    '  font-weight: normal;' +
    '}' +
    '.sb-block-title .sb-title-toggle {' +
    '  font-family: \'Pretendard Variable\',\'Pretendard\',sans-serif;' +
    '  font-size: 0.85em;' +
    '  color: rgba(15, 58, 58, 0.55);' +
    '  transition: transform 0.2s;' +
    '  display: inline-block;' +
    '  width: 1em;' +
    '  text-align: center;' +
    '}' +
    /* 접힌 상태: 아래 콘텐츠 숨김 + 상태 아이콘 회전 */
    '.sb-block.is-collapsed .sb-title-toggle { transform: rotate(-90deg); }' +
    /* 접기 상태: 리스트만 숨기고 제목바 구분선은 유지 (사용자 요구) */
    '.sb-block.is-collapsed .sb-block-title { margin-bottom: 0; }' +
    /* 기본 접기: body 통째 숨김 (TOC, 하이라이트 등) */
    '.sb-block.is-collapsed .sb-block-body { display: none !important; }' +
    /* 시리즈 블록 접기 예외: 현재 글 li 만은 유지 (사용자 요구) */
    '.sb-block.sb-series-block.is-collapsed .sb-block-body { display: block !important; }' +
    '.sb-block.sb-series-block.is-collapsed .sb-series-list { max-height: none; overflow: visible; display: block; padding-top: 8px; }' +
    '.sb-block.sb-series-block.is-collapsed .sb-series-list li:not(.is-current) { display: none !important; }' +
    '.sb-block.sb-series-block.is-collapsed .sb-series-toggle { display: none !important; }' +
    
    /* ---- 시리즈 목록 ---- */
    '.sb-series-block .sb-series-list {' +
    '  list-style: none;' +
    '  padding: 0;' +
    '  margin: 0;' +
    '  max-height: 260px;' +
    '  overflow-y: auto;' +
    '  scrollbar-width: thin;' +
    '}' +
    /* 압축 상태 = 처음 10개만 표시 */
    '.sb-series-block[data-collapsed="true"] .sb-series-list {' +
    '  max-height: none;' +
    '  overflow: visible;' +
    '}' +
    '.sb-series-block[data-collapsed="true"] .sb-series-list li.sb-series-hidden {' +
    '  display: none;' +
    '}' +
    /* 더 보기 / 접기 버튼 */
    '.sb-series-toggle {' +
    '  display: block;' +
    '  width: 100%;' +
    '  padding: 0.5em 0.8em;' +
    '  margin-top: 0.4em;' +
    '  background: transparent;' +
    '  border: 1px dashed rgba(15, 58, 58, 0.35);' +
    '  color: var(--color, #0F3A3A);' +
    '  font-family: \'Pretendard Variable\',\'Pretendard\',sans-serif;' +
    '  font-size: 0.8em;' +
    '  text-align: center;' +
    '  cursor: pointer;' +
    '  border-radius: 4px;' +
    '  transition: background 0.15s, border-color 0.15s, color 0.15s;' +
    '}' +
    '.sb-series-toggle:hover {' +
    '  background: rgba(255, 154, 118, 0.08);' +
    '  border-color: var(--point, #FF9A76);' +
    '  color: var(--point, #FF9A76);' +
    '}' +

    '.sb-series-block .sb-series-list li {' +
    '  padding: 0;' +
    '  margin: 0 0 0.4em 0;' +
    '  line-height: 1.35;' +
    '}' +
    '.sb-series-block .sb-series-list a {' +
    '  display: block;' +
    '  padding: 0.35em 0.5em;' +
    '  color: var(--color, #0F3A3A);' +
    '  font-family: \'Pretendard Variable\',\'Pretendard\',sans-serif;' +
    '  font-size: 0.85em;' +
    '  text-decoration: none;' +
    '  border-left: 2px solid transparent;' +
    '  transition: border-color 0.15s, background 0.15s, color 0.15s;' +
    '  overflow: hidden;' +
    '  text-overflow: ellipsis;' +
    '  white-space: nowrap;' +
    '}' +
    '.sb-series-block .sb-series-list a:hover {' +
    '  color: var(--point, #FF9A76);' +
    '  border-left-color: var(--point, #FF9A76);' +
    '  background: rgba(255, 154, 118, 0.08);' +
    '}' +
    /* 현재 글 강조 */
    '.sb-series-block .sb-series-list li.is-current a {' +
    '  color: var(--point, #FF9A76);' +
    '  font-weight: 600;' +
    '  border-left-color: var(--point, #FF9A76);' +
    '  background: rgba(255, 154, 118, 0.12);' +
    '  cursor: default;' +
    '  pointer-events: none;' +
    '}' +
    /* 시리즈 순번 표시 */
    '.sb-series-block .sb-series-list .sb-series-num {' +
    '  display: inline-block;' +
    '  min-width: 1.5em;' +
    '  color: rgba(15, 58, 58, 0.5);' +
    '  font-size: 0.85em;' +
    '  margin-right: 0.3em;' +
    '}' +
    '.sb-series-block .sb-series-list li.is-current .sb-series-num {' +
    '  color: var(--point, #FF9A76);' +
    '}' +
    
    /* ---- 하이라이트 ---- */
    '.sb-highlight-block .sb-highlight-body {' +
    '  padding: 0.1em 0.2em;' +
    '  font-size: 0.88em;' +
    '  line-height: 1.55;' +
    '  color: var(--color, #0F3A3A);' +
    '  word-break: break-word;' +
    '  white-space: pre-wrap;' +
    '}' +
    '.sb-highlight-block .sb-highlight-body a {' +
    '  color: var(--point, #FF9A76);' +
    '  text-decoration: underline;' +
    '  text-underline-offset: 2px;' +
    '}' +
    '.sb-highlight-block .sb-highlight-body strong,' +
    '.sb-highlight-block .sb-highlight-body b {' +
    '  font-weight: 700;' +
    '  color: var(--color, #0F3A3A);' +
    '}' +
    '.sb-highlight-block .sb-highlight-body em,' +
    '.sb-highlight-block .sb-highlight-body i {' +
    '  font-style: italic;' +
    '}' +
    '.sb-highlight-block .sb-highlight-body p {' +
    '  margin: 0 0 0.5em 0;' +
    '}' +
    '.sb-highlight-block .sb-highlight-body p:last-child {' +
    '  margin-bottom: 0;' +
    '}' +
    '.sb-highlight-block .sb-highlight-body ul,' +
    '.sb-highlight-block .sb-highlight-body ol {' +
    '  margin: 0.3em 0 0.5em 0;' +
    '  padding-left: 1.2em;' +
    '}' +
    '.sb-highlight-block .sb-highlight-body li {' +
    '  margin-bottom: 0.2em;' +
    '}' +
    /* 관리자에게만 보이는 안내 힌트 (필드 비었을 때) */
    '.sb-highlight-block .sb-highlight-hint {' +
    '  font-size: 0.75em;' +
    '  color: #999;' +
    '  padding: 0.5em 0.4em;' +
    '  line-height: 1.5;' +
    '  background: rgba(255, 154, 118, 0.06);' +
    '  border-radius: 4px;' +
    '  border: 1px dashed rgba(255, 154, 118, 0.3);' +
    '}' +
    '.sb-highlight-block .sb-highlight-hint code {' +
    '  background: rgba(0,0,0,0.06);' +
    '  padding: 1px 4px;' +
    '  border-radius: 3px;' +
    '  font-family: ui-monospace, monospace;' +
    '  font-size: 0.95em;' +
    '  color: var(--color, #0F3A3A);' +
    '}' +
    /* 비로그인(mf-guest) 에게는 힌트 자체 블록 숨김 */
    'html.mf-guest .sb-highlight-block:has(.sb-highlight-hint:only-child),' +
    'html.mf-guest .sb-highlight-block .sb-highlight-hint { display: none !important; }' +
    
    /* ---- 자동 TOC ---- */
    '.sb-toc-block .sb-toc-list {' +
    '  list-style: none;' +
    '  padding: 0;' +
    '  margin: 0;' +
    '  max-height: 320px;' +
    '  overflow-y: auto;' +
    '  scrollbar-width: thin;' +
    '}' +
    '.sb-toc-block .sb-toc-list li {' +
    '  padding: 0;' +
    '  margin: 0 0 0.15em 0;' +
    '  line-height: 1.35;' +
    '}' +
    '.sb-toc-block .sb-toc-list a {' +
    '  display: block;' +
    '  padding: 0.25em 0.5em;' +
    '  color: var(--color, #0F3A3A);' +
    '  font-family: \'Pretendard Variable\',\'Pretendard\',sans-serif;' +
    '  font-size: 0.85em;' +
    '  text-decoration: none;' +
    '  border-left: 2px solid transparent;' +
    '  transition: border-color 0.15s, background 0.15s, color 0.15s;' +
    '}' +
    '.sb-toc-block .sb-toc-list a:hover {' +
    '  color: var(--point, #FF9A76);' +
    '  border-left-color: rgba(255, 154, 118, 0.5);' +
    '  background: rgba(255, 154, 118, 0.06);' +
    '}' +
    /* 지금 스크롤 위치에 있는 헤딩 = 넘침 색 강조 */
    '.sb-toc-block .sb-toc-list li.is-active > a {' +
    '  color: var(--point, #FF9A76);' +
    '  border-left-color: var(--point, #FF9A76);' +
    '  background: rgba(255, 154, 118, 0.10);' +
    '  font-weight: 600;' +
    '}' +
    /* 레벨별 들여쓰기 + 마커 */
    '.sb-toc-block .sb-toc-list li[data-level="2"] > a { padding-left: 0.5em; }' +
    '.sb-toc-block .sb-toc-list li[data-level="3"] > a { padding-left: 1.3em; font-size: 0.8em; }' +
    '.sb-toc-block .sb-toc-list li[data-level="4"] > a { padding-left: 2.1em; font-size: 0.78em; }' +
    '.sb-toc-block .sb-toc-list li[data-level="5"] > a { padding-left: 2.9em; font-size: 0.76em; }' +
    '.sb-toc-block .sb-toc-list li[data-level="6"] > a { padding-left: 3.7em; font-size: 0.74em; }' +
    /* 계층별 마커 (a::before) */
    '.sb-toc-block .sb-toc-list li[data-level="3"] > a::before {' +
    '  content: "·";' +
    '  margin-right: 0.3em;' +
    '  color: rgba(15, 58, 58, 0.5);' +
    '}' +
    '.sb-toc-block .sb-toc-list li[data-level="4"] > a::before {' +
    '  content: "-";' +
    '  margin-right: 0.3em;' +
    '  color: rgba(15, 58, 58, 0.5);' +
    '}' +
    '.sb-toc-block .sb-toc-list li[data-level="5"] > a::before,' +
    '.sb-toc-block .sb-toc-list li[data-level="6"] > a::before {' +
    '  content: "–";' +
    '  margin-right: 0.3em;' +
    '  color: rgba(15, 58, 58, 0.4);' +
    '}' +
    
    /* 스크롤바 (사이드바 구조와 통일: hover 시에만) */
    '.sb-series-block .sb-series-list::-webkit-scrollbar,' +
    '.sb-toc-block .sb-toc-list::-webkit-scrollbar {' +
    '  width: 4px;' +
    '}' +
    '.sb-series-block .sb-series-list::-webkit-scrollbar-thumb,' +
    '.sb-toc-block .sb-toc-list::-webkit-scrollbar-thumb {' +
    '  background: rgba(15, 58, 58, 0.25);' +
    '  border-radius: 100px;' +
    '}' +
    '.sb-series-block .sb-series-list::-webkit-scrollbar-thumb:hover,' +
    '.sb-toc-block .sb-toc-list::-webkit-scrollbar-thumb:hover {' +
    '  background: var(--point, #FF9A76);' +
    '}' +
    
    /* ---- 인디케이터 (화면 최하단 고정, 사이드바 폭 안에서 중앙) ---- */
    '.sb-indicator {' +
    '  position: fixed;' +
    '  bottom: 0;' +                    /* 화면 최하단 */
    '  left: 0;' +                      /* 사이드바 시작 지점 */
    '  width: var(--side-width, 300px);' +
    '  padding: 14px 0;' +
    '  display: flex;' +
    '  justify-content: center;' +
    '  gap: 10px;' +
    '  z-index: 100;' +
    '  background: linear-gradient(to top,' +
    '    var(--base, #F5F5F5) 60%,' +
    '    rgba(245, 245, 245, 0.85) 85%,' +
    '    transparent 100%);' +          /* 자연스러운 페이드아웃 배경 */
    '  pointer-events: auto;' +
    '}' +
    /* 모바일 (사이드바가 화면 밖으로 갈 때) 인디케이터도 숨김 */
    '@media (max-width: 1000px) {' +
    '  .sb-indicator { display: none; }' +
    '}' +
    /* 사이드바가 열렸을 때는 인디케이터 표시 (모바일 슬라이드 열림 상태) */
    '@media (max-width: 1000px) {' +
    '  body:has(#ddl-side.open) .sb-indicator { display: flex; }' +
    '}' +
    
    '.sb-indicator button {' +
    '  width: 10px;' +
    '  height: 10px;' +
    '  border-radius: 50%;' +
    '  border: 1px solid var(--color, #0F3A3A);' +
    '  background: transparent;' +
    '  padding: 0;' +
    '  cursor: pointer;' +
    '  transition: background 0.15s, transform 0.15s;' +
    '}' +
    '.sb-indicator button:hover { background: rgba(255, 154, 118, 0.35); }' +
    '.sb-indicator button.active {' +
    '  background: var(--color, #0F3A3A);' +
    '  transform: scale(1.15);' +
    '}' +
    
    /* ---- 썸네일 클릭 팝업 ---- */
    '.sb-thumb-modal {' +
    '  position: fixed;' +
    '  top: 0; left: 0; right: 0; bottom: 0;' +
    '  background: rgba(0, 0, 0, 0.85);' +
    '  z-index: 99999;' +
    '  display: flex;' +
    '  align-items: center;' +
    '  justify-content: center;' +
    '  opacity: 0;' +
    '  pointer-events: none;' +
    '  transition: opacity 0.2s;' +
    '  cursor: zoom-out;' +
    '}' +
    '.sb-thumb-modal.open {' +
    '  opacity: 1;' +
    '  pointer-events: auto;' +
    '}' +
    '.sb-thumb-modal img {' +
    '  max-width: 92vw;' +
    '  max-height: 92vh;' +
    '  object-fit: contain;' +
    '  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);' +
    '}' +
    '.sb-thumb-modal-close {' +
    '  position: absolute;' +
    '  top: 20px;' +
    '  right: 24px;' +
    '  width: 40px;' +
    '  height: 40px;' +
    '  border-radius: 50%;' +
    '  border: 1px solid rgba(255, 255, 255, 0.6);' +
    '  background: transparent;' +
    '  color: #fff;' +
    '  font-size: 20px;' +
    '  line-height: 1;' +
    '  cursor: pointer;' +
    '  z-index: 3;' +
    '  transition: background 0.15s;' +
    '}' +
    '.sb-thumb-modal-close:hover {' +
    '  background: rgba(255, 154, 118, 0.85);' +
    '}';
  
  function injectCSS(){
    if (document.getElementById('ddl-sidebar-b-style')) return;
    var st = document.createElement('style');
    st.id = 'ddl-sidebar-b-style';
    st.setAttribute('data-ddl-skin', '1');
    st.appendChild(document.createTextNode(CSS_TEXT));
    (document.head || document.documentElement).appendChild(st);
  }
  
  // ============================================================
  // 4. 현재 글 대표 이미지 (썸네일)
  //    v1.1: publication-cover(사이트 기본 커버) 는 "썸네일 없음" 처리
  // ============================================================
  function isSiteDefaultCover(src){
    if (!src) return true;
    // Ghost 기본 커버 이미지 판정
    if (/publication-cover/i.test(src)) return true;
    return false;
  }
  
  function getFeatureImage(){
    // (a) 페이지 안 실제 대표이미지 img (Source 테마의 gh-article-image)
    var img = document.querySelector('.gh-article-image img, figure.gh-article-image img');
    if (img) {
      var s = img.getAttribute('src') || img.currentSrc;
      if (s && !isSiteDefaultCover(s)) return s;
    }
    // (b) og:image 폴백 (사이트 기본 커버 아니면)
    var og = document.querySelector('meta[property="og:image"]');
    if (og) {
      var content = og.getAttribute('content');
      if (content && !isSiteDefaultCover(content)) return content;
    }
    return null;  // 진짜 대표 이미지 없음
  }
  
  // ============================================================
  // 5. 현재 글 제목
  // ============================================================
  function getPostTitle(){
    var h = document.querySelector('.gh-article-title, h1.gh-article-title, article h1');
    if (h) return h.textContent.trim();
    var og = document.querySelector('meta[property="og:title"]');
    if (og && og.getAttribute('content')) return og.getAttribute('content');
    return document.title || '';
  }
  
  function escapeHTML(s){
    if (!s) return '';
    return String(s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }
  
  // ============================================================
  // 5-B. 예상 요약 (온페이지에서 추출)
  // ============================================================
  function getPostExcerpt(){
    // Ghost 가 젊은 excerpt 는 meta description 으로 내려줌
    var m = document.querySelector('meta[name="description"]');
    if (m) {
      var c = m.getAttribute('content');
      if (c && c.trim()) return c.trim();
    }
    var og = document.querySelector('meta[property="og:description"]');
    if (og) {
      var c2 = og.getAttribute('content');
      if (c2 && c2.trim()) return c2.trim();
    }
    return '';
  }
  
  // ============================================================
  // 5-C. 작성일
  // ============================================================
  function getPostDate(){
    // <time class="gh-article-meta-date" datetime="...">표시용</time>
    var t = document.querySelector('time.gh-article-meta-date, time.gh-card-date, article time');
    if (t) {
      var iso = t.getAttribute('datetime') || '';
      var txt = t.textContent ? t.textContent.trim() : '';
      return { iso: iso, display: txt };
    }
    // meta 에서 published_time 폴백
    var meta = document.querySelector('meta[property="article:published_time"]');
    if (meta) {
      var v = meta.getAttribute('content');
      if (v) {
        // ISO 를 간단히 한국식 표시로
        try {
          var d = new Date(v);
          var mo = d.getMonth() + 1;
          var da = d.getDate();
          var yr = d.getFullYear();
          return { iso: v.split('T')[0], display: da + ' ' + mo + '월 ' + yr };
        } catch(e){}
        return { iso: v, display: v.split('T')[0] };
      }
    }
    return null;
  }
  
  // ============================================================
  // 5-D. 저자
  // ============================================================
  function getPostAuthor(){
    var a = document.querySelector('.gh-article-meta-name, .gh-article-author-name, a[href*="/author/"]');
    if (a) {
      var t = a.textContent.trim();
      if (t) return t;
    }
    return '';
  }
  
  // ============================================================
  // [STEP 2] 5-E. 현재 글이 속한 시리즈 슬러그 찾기
  //   body class 에 tag-series-XXX 가 있으면 그것이 시리즈
  // ============================================================
  function getCurrentSeriesSlug(){
    if (!document.body) return null;
    var cls = document.body.className || '';
    // tag-series-XXX 패턴 (Hidden 계열 제외)
    var matches = cls.match(/tag-series-[a-z0-9\u3131-\uD79D-]+/gi);
    if (!matches) return null;
    for (var i = 0; i < matches.length; i++){
      var slug = matches[i].replace(/^tag-/, '');
      // hidden 가 암시적으로 들어간 것 제외
      if (/hidden/i.test(slug)) continue;
      return slug;   // 예: 'series-test'
    }
    return null;
  }
  
  function getCurrentPostSlug(){
    var path = window.location.pathname || '';
    var m = path.match(/^\/([^\/\?#]+)\/?$/);
    if (m) return m[1];
    return null;
  }
  
  // ============================================================
  // [STEP 2] 5-F. 시리즈 목록 렌더링
  //   Content API 로 해당 시리즈의 글 목록 가져옷
  //   데이터 없으면 블록 자체를 숭김
  // ============================================================
  var CONTENT_API_KEY = '39b17c3fb020743b7da0116c24';
  var CONTENT_API_BASE = window.location.origin + '/ghost/api/content';
  
  function renderSeriesBlock(blockEl){
    var seriesSlug = getCurrentSeriesSlug();
    if (!seriesSlug) {
      blockEl.style.display = 'none';
      return;
    }
    
    var url = CONTENT_API_BASE + '/posts/?key=' + CONTENT_API_KEY 
      + '&filter=' + encodeURIComponent('tag:' + seriesSlug + '+visibility:public')
      + '&limit=all&order=published_at%20asc&fields=slug,title,url,published_at';
    
    fetch(url)
      .then(function(r){ return r.json(); })
      .then(function(data){
        var posts = (data && Array.isArray(data.posts)) ? data.posts : [];
        if (posts.length === 0) {
          blockEl.style.display = 'none';
          return;
        }
        
        var currentSlug = getCurrentPostSlug();
        var currentIdx = -1;
        for (var pi = 0; pi < posts.length; pi++){
          if (posts[pi].slug === currentSlug) { currentIdx = pi; break; }
        }
        
        // 시리즈 이름 (slug 에서 "series-" 제거)
        var seriesName = seriesSlug.replace(/^series-/i, '');
        // 시리즈 페이지 URL (사용자가 시리즈 제목 클릭 시 이동)
        var seriesPageURL = '/tag/' + seriesSlug + '/';
        
        // 초기 표시 개수 = 1 (현재 글만) 
        // 더보기 클릭 시 STEP 마다 +10
        var INITIAL_SHOW = 1;
        var STEP_INCREMENT = 10;
        
        // 현재 글이 없으면 (예: 목록형 리스트) 첫 글부터 1개
        var initialVisible = INITIAL_SHOW;
        var currentShownCount = initialVisible;
        
        // 제목바 (제목 클릭 = 시리즈 페이지 이동, 접기 아이콘 = 접기)
        var titleWrap = createCollapsibleTitle(
          '시리즈 · ' + seriesName,
          '전 ' + posts.length + '회',
          'sb-series-collapsed'
        );
        var title = titleWrap.titleEl;
        
        var body = document.createElement('div');
        body.className = 'sb-block-body';
        
        var ul = document.createElement('ul');
        ul.className = 'sb-series-list';
        
        // 모든 li 를 미리 만들어놓고 표시할 개수만 결정
        var allLis = [];
        posts.forEach(function(p, idx){
          var li = document.createElement('li');
          li.setAttribute('data-idx', String(idx));
          var isCurrent = (p.slug === currentSlug);
          if (isCurrent) li.classList.add('is-current');
          
          var a = document.createElement('a');
          a.setAttribute('href', p.url || ('/' + p.slug + '/'));
          
          var num = document.createElement('span');
          num.className = 'sb-series-num';
          num.textContent = String(idx + 1).padStart(2, '0');
          a.appendChild(num);
          
          var titleText = document.createTextNode(p.title || p.slug);
          a.appendChild(titleText);
          
          li.appendChild(a);
          ul.appendChild(li);
          allLis.push({ el: li, isCurrent: isCurrent, idx: idx });
        });
        
        // 표시할 항목 결정 함수
        // 정책: 현재 글은 항상 표시. 그 다음 currentShownCount 개까지 인접한 앞뒤 항목 표시.
        //   - 현재 글이 있으면: 현재 글 하나만 (초기)
        //   - 없으면: 처음 1개
        //   - 더 보기 클릭 시 앞뒤로 확장 (현재 글 위주 확장)
        function updateVisibility(){
          // 표시 대상 인덱스 집합 계산
          var visibleSet = {};
          if (currentIdx >= 0) {
            visibleSet[currentIdx] = true;
            var need = currentShownCount - 1;   // 현재 글 제외 몇 개 더
            // 우선 현재 글 다음 항목부터 (같은 시리즈 다음 회차부터)
            var forward = currentIdx + 1;
            var backward = currentIdx - 1;
            while (need > 0 && (forward < posts.length || backward >= 0)){
              if (forward < posts.length){
                visibleSet[forward] = true;
                forward++;
                need--;
                if (need <= 0) break;
              }
              if (backward >= 0){
                visibleSet[backward] = true;
                backward--;
                need--;
              }
            }
          } else {
            // 현재 글이 시리즈에 없으면 (드묾): 첫 currentShownCount 개
            for (var k = 0; k < Math.min(currentShownCount, posts.length); k++){
              visibleSet[k] = true;
            }
          }
          
          // li 표시/숨김 적용
          allLis.forEach(function(item){
            if (visibleSet[item.idx]) {
              item.el.classList.remove('sb-series-hidden');
            } else {
              item.el.classList.add('sb-series-hidden');
            }
          });
          
          // 버튼 상태 업데이트
          updateToggleBtns();
        }
        
        body.appendChild(ul);
        
        // "더 보기" 버튼: 표시 개수 < 전체이면 표시
        var moreBtn = null;
        var collapseBtn = null;
        
        function updateToggleBtns(){
          if (moreBtn) {
            var remaining = posts.length - currentShownCount;
            if (remaining <= 0) {
              moreBtn.style.display = 'none';
            } else {
              moreBtn.style.display = '';
              var addCount = Math.min(STEP_INCREMENT, remaining);
              moreBtn.textContent = '▾ 더 보기 (+' + addCount + ')';
            }
          }
          if (collapseBtn) {
            if (currentShownCount <= INITIAL_SHOW) {
              collapseBtn.style.display = 'none';
            } else {
              collapseBtn.style.display = '';
            }
          }
        }
        
        // 항상 두 버튼 다 만들고 상태에 따라 표시/숨김
        if (posts.length > INITIAL_SHOW) {
          moreBtn = document.createElement('button');
          moreBtn.type = 'button';
          moreBtn.className = 'sb-series-toggle';
          moreBtn.addEventListener('click', function(e){
            e.stopPropagation();
            currentShownCount = Math.min(posts.length, currentShownCount + STEP_INCREMENT);
            updateVisibility();
          });
          body.appendChild(moreBtn);
          
          collapseBtn = document.createElement('button');
          collapseBtn.type = 'button';
          collapseBtn.className = 'sb-series-toggle';
          collapseBtn.textContent = '▴ 처음으로 접기';
          collapseBtn.style.marginTop = '0.3em';
          collapseBtn.addEventListener('click', function(e){
            e.stopPropagation();
            currentShownCount = INITIAL_SHOW;
            updateVisibility();
          });
          body.appendChild(collapseBtn);
        }
        
        // 초기 표시 적용
        updateVisibility();
        
        blockEl.innerHTML = '';
        blockEl.appendChild(title);
        blockEl.appendChild(body);
        blockEl.style.display = '';
        
        // v2.7: 시리즈는 항상 접힘 상태로 시작 (forceCollapsed)
        applyCollapseState(blockEl, titleWrap.storageKey, {
          titleHref: seriesPageURL,
          forceCollapsed: true
        });
      })
      .catch(function(e){
        if (window.console && console.warn){
          console.warn('[sidebar-b] series fetch failed:', e);
        }
        blockEl.style.display = 'none';
      });

  }
  
  // ============================================================
  // [STEP 2] 5-G. 자동 TOC 렌더링
  //   본문 안 h1~h6 자동 추출
  //   헤딩에 id 없으면 자동 부여 (본문 건드리지 않음: 임시 허용)
  //   데이터 없으면 블록 자체를 숭김
  // ============================================================
  function slugifyText(t){
    if (!t) return 'sec';
    // 한글 포함 대부분 문자 허용, 공백은 하이픈
    return t.trim().toLowerCase()
      .replace(/[\s\t\n]+/g, '-')
      .replace(/[^\w\u3131-\uD79D-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'sec';
  }
  
  function renderTocBlock(blockEl){
    // 본문 영역 내 헤딩 수집
    // v2.6: 'article .gh-canvas' 제거 — <header class="gh-article-header gh-canvas"> 도 매칭되어
    //       글 제목/작성자 h1/h4 가 잘못 포함되던 문제 방지.
    //       section.gh-content 만 사용 (실사이트 실측으로 확정)
    var content = document.querySelector('section.gh-content');
    if (!content) {
      blockEl.style.display = 'none';
      return;
    }
    
    // h1 은 보통 글 제목자체 → TOC 에서 제외
    var allHeadings = content.querySelectorAll('h1, h2, h3, h4, h5, h6');
    // v2.6 이중 방어:
    //   (a) 헤딩 자체 클래스로 제외 판정 (특수 카드 자동 헤딩 + 사이트 UI 헤딩)
    //   (b) 조상 element 에 특정 컨테이너 클래스가 있으면 강제 제외 (안전벨트)
    var EXCLUDE_HEADING_SELECTORS = [
      '.kg-toggle-heading-text',      // 토글 카드 자동 헤딩
      '.kg-header-card-heading',      // 헤더 카드 자동 헤딩 (대형 배너 텍스트)
      '.kg-callout-text',             // 콜아웃 카드 자동 텍스트
      '.gh-article-title',            // 글 제목 (원래 section 밖이지만 방어)
      '.gh-article-author-name',      // 작성자 이름
      '.gh-card-title',               // 관련글 카드 제목
      '.gh-container-title',          // 관련글 컨테이너 제목
      '.gh-footer-signup-header',     // 푸터 가입 헤딩
      '.sb-block-title'               // 사이드바 B 자체의 블록 제목
    ].join(',');
    var EXCLUDE_ANCESTOR_SELECTORS = [
      '.gh-article-header',           // 글 헤더 (제목/작성자 감쌈)
      '.gh-article-meta',             // 글 메타 (작성자/날짜 감쌈)
      '.gh-card',                     // 관련글 카드
      '.gh-container',                // 관련글 컨테이너
      '.gh-footer',                   // 사이트 푸터
      '.gh-comments',                 // 댓글 영역
      '.sb-block'                     // 사이드바 B 자체
    ].join(',');
    var headings = [];
    for (var hi = 0; hi < allHeadings.length; hi++){
      var hh = allHeadings[hi];
      // 헤딩 자체가 특수 카드/사이트 UI 클래스면 스킵
      if (hh.matches && hh.matches(EXCLUDE_HEADING_SELECTORS)) continue;
      // 헤딩의 조상이 사이트 UI 컨테이너면 스킵
      if (hh.closest && hh.closest(EXCLUDE_ANCESTOR_SELECTORS)) continue;
      // 빈 텍스트 스킵
      var htxt = (hh.textContent || '').trim();
      if (!htxt) continue;
      headings.push(hh);
    }
    if (!headings.length) {
      blockEl.style.display = 'none';
      return;
    }
    
    // 유용 헤딩만 추린다 (빈 텍스트 제외)
    var used = [];
    var seenIds = {};
    headings.forEach(function(h){
      var text = (h.textContent || '').trim();
      if (!text) return;
      
      // id 없으면 부여
      var hid = h.id;
      if (!hid) {
        var base = 'toc-' + slugifyText(text);
        var id = base;
        var n = 2;
        while (seenIds[id]) { id = base + '-' + n; n++; }
        h.id = id;
        hid = id;
      }
      seenIds[hid] = true;
      
      used.push({
        el: h,
        id: hid,
        text: text,
        level: parseInt(h.tagName.substring(1), 10)   // 2, 3, 4, ...
      });
    });
    
    if (!used.length) {
      blockEl.style.display = 'none';
      return;
    }
    
    // HTML 조립 (v2.1: 접기 토글 포함)
    var titleWrap = createCollapsibleTitle('목차', used.length + '개 항목', 'sb-toc-collapsed');
    var title = titleWrap.titleEl;
    
    var body = document.createElement('div');
    body.className = 'sb-block-body';
    
    var ul = document.createElement('ul');
    ul.className = 'sb-toc-list';
    
    used.forEach(function(item){
      var li = document.createElement('li');
      li.setAttribute('data-level', String(item.level));
      li.setAttribute('data-target', item.id);
      
      var a = document.createElement('a');
      a.setAttribute('href', '#' + item.id);
      a.textContent = item.text;
      
      // 부드러운 스크롤
      a.addEventListener('click', function(e){
        e.preventDefault();
        var target = document.getElementById(item.id);
        if (target) {
          var top = target.getBoundingClientRect().top + window.pageYOffset - 20;
          window.scrollTo({ top: top, behavior: 'smooth' });
          // URL 해쉬 갱신 (보이지 않게)
          if (history.replaceState) {
            history.replaceState(null, '', '#' + item.id);
          }
        }
      });
      
      li.appendChild(a);
      ul.appendChild(li);
    });
    
    body.appendChild(ul);
    
    blockEl.innerHTML = '';
    blockEl.appendChild(title);
    blockEl.appendChild(body);
    blockEl.style.display = '';
    
    // 접기 상태 복원
    applyCollapseState(blockEl, titleWrap.storageKey);
    
    // 스크롤 스파이: 현재 보고 있는 섹션 강조
    setupTocScrollSpy(used, ul);
  }
  
  // ============================================================
  // [STEP 2 v2.1] 접기 토글 공통 헬퍼
  //   - 제목 + 뷰회수 배지 + 접기 아이콘을 함께 만드는 제목바
  //   - 제목 클릭 시 접기/펼치기 토글
  //   - localStorage 에 상태 저장 (다음 방문 시 유지)
  // ============================================================
  function createCollapsibleTitle(titleText, badgeText, storageKey, onTitleClickOverride){
    var titleEl = document.createElement('div');
    titleEl.className = 'sb-block-title';
    titleEl.setAttribute('role', 'button');
    titleEl.setAttribute('tabindex', '0');
    
    var textSpan = document.createElement('span');
    textSpan.className = 'sb-title-text';
    textSpan.textContent = titleText;
    
    var badgeSpan = document.createElement('span');
    badgeSpan.className = 'sb-title-badge';
    badgeSpan.textContent = badgeText || '';
    
    var toggleSpan = document.createElement('span');
    toggleSpan.className = 'sb-title-toggle';
    toggleSpan.textContent = '▾';
    toggleSpan.setAttribute('aria-hidden', 'true');
    
    titleEl.appendChild(textSpan);
    if (badgeText) titleEl.appendChild(badgeSpan);
    titleEl.appendChild(toggleSpan);
    
    return { 
      titleEl: titleEl, 
      storageKey: storageKey,
      textSpan: textSpan,
      badgeSpan: badgeSpan,
      toggleSpan: toggleSpan,
      onTitleClickOverride: onTitleClickOverride || null
    };
  }
  
  function applyCollapseState(blockEl, storageKey, options){
    options = options || {};
    // v2.7: forceCollapsed 옵션이 true 면 저장값 무시하고 항상 접힘 상태로 시작
    //       (시리즈 블록 전용: 페이지 로드 시 매번 접힘)
    if (options.forceCollapsed) {
      blockEl.classList.add('is-collapsed');
    } else {
      // 저장된 상태 읽기 (목차/하이라이트는 이쪽)
      var stored = null;
      try { stored = localStorage.getItem(storageKey); } catch(e){}
      if (stored === '1') {
        blockEl.classList.add('is-collapsed');
      }
    }
    
    // 제목 클릭 = 접기/펼치기 (또는 override 시 다른 동작)
    var titleEl = blockEl.querySelector('.sb-block-title');
    if (!titleEl) return;
    
    var toggleIcon = titleEl.querySelector('.sb-title-toggle');
    var textSpan = titleEl.querySelector('.sb-title-text');
    
    function toggle(){
      var isCol = blockEl.classList.toggle('is-collapsed');
      // v2.7: forceCollapsed 모드면 상태 저장하지 않음 (다음 방문 시 다시 접힘)
      if (options.forceCollapsed) return;
      try {
        if (isCol) localStorage.setItem(storageKey, '1');
        else localStorage.removeItem(storageKey);
      } catch(e){}
    }
    
    // 시리즈처럼 "제목 클릭 = 시리즈 페이지 이동" 인 경우
    // 접기 토글은 우측 아이콘만
    if (options.titleHref) {
      // 제목 텍스트 부분: 링크로
      textSpan.style.cursor = 'pointer';
      textSpan.style.textDecoration = 'underline';
      textSpan.style.textDecorationColor = 'transparent';
      textSpan.style.textUnderlineOffset = '3px';
      textSpan.style.transition = 'text-decoration-color 0.15s';
      textSpan.addEventListener('mouseenter', function(){
        textSpan.style.textDecorationColor = 'var(--point, #FF9A76)';
      });
      textSpan.addEventListener('mouseleave', function(){
        textSpan.style.textDecorationColor = 'transparent';
      });
      textSpan.addEventListener('click', function(e){
        e.stopPropagation();
        window.location.href = options.titleHref;
      });
      // 접기 아이콘만 접기 토글
      toggleIcon.style.cursor = 'pointer';
      toggleIcon.style.padding = '0 0.3em';
      toggleIcon.addEventListener('click', function(e){
        e.stopPropagation();
        toggle();
      });
    } else {
      // 기본: 제목 전체 클릭 = 접기 토글
      titleEl.addEventListener('click', toggle);
    }
    
    titleEl.addEventListener('keydown', function(e){
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  }
  
  // ============================================================
  // [STEP 3-1] 5-I. 하이라이트 렌더링
  //   codeinjection_head 필드 안의 <!--HL-START-->...<!--HL-END--> 마커 사이만 추출
  //   관리자에게만 필드 비었을 때 사용법 힌트 노출
  // ============================================================
  function extractHighlight(codeInjectionHead){
    if (!codeInjectionHead || typeof codeInjectionHead !== 'string') return '';
    // <!--HL-START--> 와 <!--HL-END--> 사이 내용 추출 (대소문자 무관, 여러줄 가능)
    var m = codeInjectionHead.match(/<!--\s*HL-START\s*-->([\s\S]*?)<!--\s*HL-END\s*-->/i);
    if (!m) return '';
    var raw = m[1].trim();
    if (!raw) return '';
    // 안전장치: <script> 태그 및 on* 이벤트 핸들러 제거
    raw = raw.replace(/<script\b[\s\S]*?<\/script>/gi, '');
    raw = raw.replace(/<style\b[\s\S]*?<\/style>/gi, '');
    raw = raw.replace(/\son\w+\s*=\s*"[^"]*"/gi, '');
    raw = raw.replace(/\son\w+\s*=\s*'[^']*'/gi, '');
    raw = raw.replace(/\son\w+\s*=\s*[^\s>]+/gi, '');
    return raw;
  }
  
  function getCurrentPostSlugForApi(){
    return getCurrentPostSlug();
  }
  
  function isAdminMode(){
    // <html class="mf-guest"> 이면 비로그인, 없으면 관리자
    return !document.documentElement.classList.contains('mf-guest');
  }
  
  function renderHighlightBlock(blockEl){
    var slug = getCurrentPostSlugForApi();
    if (!slug) { blockEl.style.display = 'none'; return; }
    
    var url = CONTENT_API_BASE + '/posts/slug/' + encodeURIComponent(slug)
      + '/?key=' + CONTENT_API_KEY
      + '&fields=slug,codeinjection_head';
    
    fetch(url)
      .then(function(r){ return r.json(); })
      .then(function(data){
        var post = (data && Array.isArray(data.posts) && data.posts[0]) ? data.posts[0] : null;
        var raw = post ? (post.codeinjection_head || '') : '';
        var content = extractHighlight(raw);
        
        if (content) {
          // 하이라이트 내용 있음 → 정상 표시
          var titleWrap = createCollapsibleTitle('하이라이트', '', 'sb-highlight-collapsed');
          var body = document.createElement('div');
          body.className = 'sb-block-body';
          var inner = document.createElement('div');
          inner.className = 'sb-highlight-body';
          inner.innerHTML = content;
          body.appendChild(inner);
          
          blockEl.innerHTML = '';
          blockEl.appendChild(titleWrap.titleEl);
          blockEl.appendChild(body);
          blockEl.style.display = '';
          applyCollapseState(blockEl, titleWrap.storageKey);
          return;
        }
        
        // 내용 없음 → 관리자에게만 사용법 힌트 표시, 비로그인은 숨김
        if (!isAdminMode()) { blockEl.style.display = 'none'; return; }
        
        var titleWrapA = createCollapsibleTitle('하이라이트', '비어 있음', 'sb-highlight-collapsed');
        var bodyA = document.createElement('div');
        bodyA.className = 'sb-block-body';
        var hint = document.createElement('div');
        hint.className = 'sb-highlight-hint';
        hint.innerHTML = ''
          + '편집기 → Post settings → Code injection → <b>Post header</b> 에'
          + '<br>'
          + '<code>&lt;!--HL-START--&gt;자유 내용<!--HL-END--&gt;</code>'
          + '<br>'
          + '형식으로 입력하세요. HTML 태그 사용 가능. 글자수 제한 없음.';
        bodyA.appendChild(hint);
        
        blockEl.innerHTML = '';
        blockEl.appendChild(titleWrapA.titleEl);
        blockEl.appendChild(bodyA);
        blockEl.style.display = '';
        applyCollapseState(blockEl, titleWrapA.storageKey);
      })
      .catch(function(e){
        if (window.console && console.warn){
          console.warn('[sidebar-b] highlight fetch failed:', e);
        }
        blockEl.style.display = 'none';
      });
  }
  
  // ============================================================
  // [STEP 2] 5-H. TOC 스크롤 스파이
  //   스크롤 위치 이동 시 현재 부쓰려지는 헤딩 강조
  // ============================================================
  function setupTocScrollSpy(items, ul){
    if (!items.length) return;
    var ticking = false;
    var currentActiveId = null;
    
    function update(){
      ticking = false;
      var scrollY = window.pageYOffset;
      var viewportH = window.innerHeight;
      var trigger = scrollY + viewportH * 0.3;   // 뷰포트 상단 30% 지점을 기준
      
      var activeItem = null;
      for (var i = 0; i < items.length; i++){
        var el = document.getElementById(items[i].id);
        if (!el) continue;
        var offsetTop = el.getBoundingClientRect().top + window.pageYOffset;
        if (offsetTop <= trigger) {
          activeItem = items[i];
        } else {
          break;
        }
      }
      
      // 안 바뀌면 지솔
      var newActiveId = activeItem ? activeItem.id : null;
      if (newActiveId === currentActiveId) return;
      currentActiveId = newActiveId;
      
      // 기존 active 제거
      var oldActive = ul.querySelectorAll('li.is-active');
      for (var j = 0; j < oldActive.length; j++){
        oldActive[j].classList.remove('is-active');
      }
      
      // 새 active 적용
      if (newActiveId) {
        var newLi = ul.querySelector('li[data-target="' + newActiveId + '"]');
        if (newLi) {
          newLi.classList.add('is-active');
          // 자동 스크롤 (TOC 목록이 길 때)
          if (ul.scrollHeight > ul.clientHeight) {
            var offset = newLi.offsetTop - (ul.clientHeight / 2) + (newLi.clientHeight / 2);
            ul.scrollTop = Math.max(0, offset);
          }
        }
      }
    }
    
    function onScroll(){
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }
    
    window.addEventListener('scroll', onScroll, { passive: true });
    // 장수 변경 때도 재계산
    window.addEventListener('resize', onScroll, { passive: true });
    // 초기 실행
    update();
  }
  
  // ============================================================
  // 6. 사이드바 B 렌더링 (v1.1)
  //    구조:
  //      #ddl-side.ddl-side-b
  //        > .sb-profile-fixed  (프로필, 양쪽 페이지 공용)
  //        > .sb-slider         (슬라이드 영역)
  //            > .sb-track
  //                > .sb-page.sb-page-1  (썸네일 + 시리즈 + TOC + 하이라이트)
  //                > .sb-page.sb-page-2  (홈/태그/시리즈 메뉴 + 카테고리 등)
  //        > .sb-indicator      (하단 고정)
  // ============================================================
  function renderSidebarB(){
    try {
      var side = document.getElementById('ddl-side');
      if (!side) return false;
      if (side.classList.contains('ddl-side-b')) return true;
      
      var profileEl = side.querySelector('.ddl-profile');
      if (!profileEl) return false;
      
      // 프로필 제외 나머지 요소 = 페이지 2 콘텐츠
      var otherBlocks = [];
      var children = Array.prototype.slice.call(side.children);
      children.forEach(function(ch){
        if (ch === profileEl) return;
        if (ch.tagName === 'STYLE' || ch.tagName === 'SCRIPT') return;
        otherBlocks.push(ch);
      });
      
      // 1) 프로필을 사이드바 최상단 고정 (슬라이더 밖)
      var profileWrap = document.createElement('div');
      profileWrap.className = 'sb-profile-fixed';
      profileWrap.appendChild(profileEl);  // 이동
      
      // 2) 슬라이더 컨테이너
      var slider = document.createElement('div');
      slider.className = 'sb-slider';
      
      var track = document.createElement('div');
      track.className = 'sb-track';
      
      // 페이지 1
      var page1 = document.createElement('div');
      page1.className = 'sb-page sb-page-1';
      
      // 페이지 2
      var page2 = document.createElement('div');
      page2.className = 'sb-page sb-page-2';
      
      // -------- 페이지 1 콘텐츠 --------
      
      // 썸네일 블록
      var thumbBlock = document.createElement('div');
      thumbBlock.className = 'sb-block sb-thumb-block';
      var featureImg = getFeatureImage();
      if (featureImg) {
        var thumb = document.createElement('div');
        thumb.className = 'sb-thumb';
        thumb.setAttribute('data-src', featureImg);
        var img = document.createElement('img');
        img.setAttribute('src', featureImg);
        img.setAttribute('alt', escapeHTML(getPostTitle()));
        img.setAttribute('loading', 'lazy');
        thumb.appendChild(img);
        thumbBlock.appendChild(thumb);
      } else {
        // 썸네일 없음 → 홈 카드 no-image 구조를 그대로 삽입
        // (header CSS 이 \.gh-card.no-image 규칙을 자동 적용 → 홈과 100% 동일)
        var postExcerpt = getPostExcerpt();
        var postDate = getPostDate();
        var postAuthor = getPostAuthor();
        var article = document.createElement('article');
        article.className = 'gh-card post no-image';
        var wrap = document.createElement('div');
        wrap.className = 'gh-card-wrapper';
        // 제목
        var h3 = document.createElement('h3');
        h3.className = 'gh-card-title is-title';
        h3.textContent = getPostTitle();
        wrap.appendChild(h3);
        // 요약 (있을 때만)
        if (postExcerpt) {
          var pExc = document.createElement('p');
          pExc.className = 'gh-card-excerpt is-body';
          pExc.textContent = postExcerpt;
          wrap.appendChild(pExc);
        }
        // 메타 (작성일/저자)
        var footer = document.createElement('footer');
        footer.className = 'gh-card-meta';
        if (postAuthor) {
          var spanAuthor = document.createElement('span');
          spanAuthor.className = 'gh-card-author';
          spanAuthor.textContent = 'By ' + postAuthor;
          footer.appendChild(spanAuthor);
        }
        if (postDate) {
          var timeEl = document.createElement('time');
          timeEl.className = 'gh-card-date';
          timeEl.setAttribute('datetime', postDate.iso);
          timeEl.textContent = postDate.display;
          footer.appendChild(timeEl);
        }
        wrap.appendChild(footer);
        article.appendChild(wrap);
        thumbBlock.appendChild(article);
      }
      page1.appendChild(thumbBlock);
      
      // 시리즈 목록 (STEP 2 구현): 시리즈에 속하지 않으면 자체 숭김
      var seriesBlock = document.createElement('div');
      seriesBlock.className = 'sb-block sb-series-block';
      seriesBlock.style.display = 'none';   // 일단 숨기고, 데이터 있을 때만 표시
      page1.appendChild(seriesBlock);
      renderSeriesBlock(seriesBlock);
      
      // 자동 TOC (STEP 2 구현): 헤딩 없으면 자체 숭김
      var tocBlock = document.createElement('div');
      tocBlock.className = 'sb-block sb-toc-block';
      tocBlock.style.display = 'none';
      page1.appendChild(tocBlock);
      renderTocBlock(tocBlock);
      
      // v2.8 STEP 3-1: 하이라이트 표시
      var highlightBlock = document.createElement('div');
      highlightBlock.className = 'sb-block sb-highlight-block';
      highlightBlock.style.display = 'none';
      page1.appendChild(highlightBlock);
      renderHighlightBlock(highlightBlock);
      
      // -------- 페이지 2 콘텐츠 (기존 사이드바 A 요소 이동) --------
      otherBlocks.forEach(function(el){
        page2.appendChild(el);
      });
      
      // -------- 조립 --------
      track.appendChild(page1);
      track.appendChild(page2);
      slider.appendChild(track);
      
      side.appendChild(profileWrap);
      side.appendChild(slider);
      side.classList.add('ddl-side-b');
      side.setAttribute('data-page', '0');
      
      // 인디케이터 (body 에 직접 삽입 = fixed bottom 안정)
      var indicator = document.createElement('div');
      indicator.className = 'sb-indicator';
      indicator.setAttribute('data-for', 'ddl-side-b');
      var btn0 = document.createElement('button');
      btn0.type = 'button';
      btn0.className = 'active';
      btn0.setAttribute('aria-label', '페이지 1');
      var btn1 = document.createElement('button');
      btn1.type = 'button';
      btn1.setAttribute('aria-label', '페이지 2');
      indicator.appendChild(btn0);
      indicator.appendChild(btn1);
      document.body.appendChild(indicator);   // body 에 붙임 (fixed 위치 안정)
      
      btn0.addEventListener('click', function(){ switchPage(0); });
      btn1.addEventListener('click', function(){ switchPage(1); });
      
      function switchPage(n){
        side.setAttribute('data-page', String(n));
        btn0.classList.toggle('active', n === 0);
        btn1.classList.toggle('active', n === 1);
      }
      
      // 팝업 (썸네일 있을 때만)
      if (featureImg) {
        setupThumbModal(featureImg);
      }
      
      return true;
    } catch(e){
      if (window.console && console.error){
        console.error('[sidebar-b v1.1] render error:', e);
      }
      return false;
    }
  }
  
  // ============================================================
  // 7. 썸네일 팝업 모달
  // ============================================================
  function setupThumbModal(imgSrc){
    if (document.querySelector('.sb-thumb-modal')) return;
    var modal = document.createElement('div');
    modal.className = 'sb-thumb-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = 
      '<button class="sb-thumb-modal-close" type="button" aria-label="닫기">✕</button>' +
      '<img alt="" />';
    var modalImg = modal.querySelector('img');
    var modalClose = modal.querySelector('.sb-thumb-modal-close');
    document.body.appendChild(modal);
    
    function open(){
      modalImg.setAttribute('src', imgSrc);
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function close(){
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
    
    document.addEventListener('click', function(e){
      var thumb = e.target.closest('.sb-thumb:not(.sb-thumb-noimage)');
      if (thumb) {
        e.preventDefault();
        open();
      }
    });
    modal.addEventListener('click', function(e){
      if (e.target === modal || e.target === modalClose) close();
    });
    modalClose.addEventListener('click', close);
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && modal.classList.contains('open')) close();
    });
  }
  
  // ============================================================
  // 8. 부팅
  // ============================================================
  function boot(){
    if (!isPostPage()) return;
    injectCSS();
    var attempts = 0, maxAttempts = 30;
    function tryRender(){
      if (renderSidebarB()) return;
      attempts++;
      if (attempts < maxAttempts) setTimeout(tryRender, 500);
      else if (window.console && console.warn){
        console.warn('[sidebar-b] sidebar A not found after 15s, aborted.');
      }
    }
    tryRender();
  }
  
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
