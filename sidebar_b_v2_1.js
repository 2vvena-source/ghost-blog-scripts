/*!
 * SIDEBAR-B v2.1 STEP 2 (external hosted)
 * 배포: 2026-08-21
 * 로더 위치: Ghost Site Footer (single <script src=...> tag)
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
    '.sb-block.is-collapsed .sb-block-title { margin-bottom: 0; border-bottom: none; }' +
    '.sb-block.is-collapsed .sb-block-body { display: none !important; }' +
    
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
      // 시리즈에 속하지 않음 → 블록 숭김 (자리 자체도 안 보임)
      blockEl.style.display = 'none';
      return;
    }
    
    // Content API 호출: 이 시리즈 태그가 붙은 글 목록
    // filter=tag:SLUG+visibility:public 로 복합 필터 (Hidden- 제외)
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
        
        // 시리즈 이름 (slug 에서 "series-" 제거)
        var seriesName = seriesSlug.replace(/^series-/i, '');
        
        // HTML 조립 (v2.1: 접기 토글 + 10개 초과 시 더 보기 버튼)
        var currentSlug = getCurrentPostSlug();
        var currentIdx = -1;
        for (var pi = 0; pi < posts.length; pi++){
          if (posts[pi].slug === currentSlug) { currentIdx = pi; break; }
        }
        
        // 시리즈 압축 여부: 11개 이상이면 압축. 단 현재 글이 10번째 이후면 자동 펼침.
        var COLLAPSE_LIMIT = 10;
        var shouldCollapse = (posts.length > COLLAPSE_LIMIT) && (currentIdx < COLLAPSE_LIMIT || currentIdx === -1);
        
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
        
        posts.forEach(function(p, idx){
          var li = document.createElement('li');
          var isCurrent = (p.slug === currentSlug);
          if (isCurrent) li.classList.add('is-current');
          // 압축 상태에서 COLLAPSE_LIMIT 이후 항목은 숨김
          if (shouldCollapse && idx >= COLLAPSE_LIMIT) {
            li.classList.add('sb-series-hidden');
          }
          
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
        });
        
        body.appendChild(ul);
        
        // 더 보기 / 접기 버튼 (11개 이상일 때만)
        if (posts.length > COLLAPSE_LIMIT) {
          blockEl.setAttribute('data-collapsed', shouldCollapse ? 'true' : 'false');
          
          var toggleBtn = document.createElement('button');
          toggleBtn.type = 'button';
          toggleBtn.className = 'sb-series-toggle';
          function updateToggleBtn(){
            var isCol = blockEl.getAttribute('data-collapsed') === 'true';
            toggleBtn.textContent = isCol 
              ? '▾ 전체 ' + posts.length + '회 보기'
              : '▴ 처음 ' + COLLAPSE_LIMIT + '회만 보기';
          }
          updateToggleBtn();
          toggleBtn.addEventListener('click', function(e){
            e.stopPropagation();  // 상위 제목 접기 토글과 분리
            var isCol = blockEl.getAttribute('data-collapsed') === 'true';
            blockEl.setAttribute('data-collapsed', isCol ? 'false' : 'true');
            updateToggleBtn();
          });
          body.appendChild(toggleBtn);
        }
        
        blockEl.innerHTML = '';
        blockEl.appendChild(title);
        blockEl.appendChild(body);
        blockEl.style.display = '';
        
        // 접기 상태 복원 (블록 전체 접기)
        applyCollapseState(blockEl, titleWrap.storageKey);
        
        // 현재 글이 리스트 안에 있으면 스크롤 위치 조정 (눈에 보이게)
        setTimeout(function(){
          var currentLi = ul.querySelector('li.is-current');
          if (currentLi && ul.scrollHeight > ul.clientHeight) {
            var off = currentLi.offsetTop - (ul.clientHeight / 2) + (currentLi.clientHeight / 2);
            ul.scrollTop = Math.max(0, off);
          }
        }, 100);
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
    var content = document.querySelector('section.gh-content, .gh-content, article .gh-canvas');
    if (!content) {
      blockEl.style.display = 'none';
      return;
    }
    
    // h1 은 보통 글 제목자체 → TOC 에서 제외
    var headings = content.querySelectorAll('h2, h3, h4, h5, h6');
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
      
      // 자리 예약: 하이라이트 (STEP 3)
      var highlightPh = document.createElement('div');
      highlightPh.className = 'sb-block sb-highlight-placeholder';
      highlightPh.innerHTML = '<div class="sb-placeholder">하이라이트 자리 (STEP 3 에서 편집 UI 와 함께 구현)</div>';
      page1.appendChild(highlightPh);
      
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
