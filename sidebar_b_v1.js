/*!
 * SIDEBAR-B v1 STEP 1 (external hosted)
 * 배포: 2026-08-21
 * 로더 위치: Ghost Site Footer (single <script src=...> tag)
 * 
 * 역할 (STEP 1):
 *   - 개별 글 페이지에서만 좌측 사이드바를 사이드바 B 구조로 대체
 *   - 페이지 1 콘텐츠: 프로필 + 썸네일(팝업) + [시리즈/TOC/하이라이트 자리 예약]
 *   - 페이지 2 콘텐츠: 기존 사이드바 A 내용 그대로 (기존 스크립트가 이미 그림)
 *   - 페이지 슬라이드 + 하단 ● ○ 인디케이터
 * 
 * 다음 STEP:
 *   - STEP 2: 시리즈 목록 + 자동 TOC 실제 구현
 *   - STEP 3: 하이라이트 담기 + 드래그 편집 UI + 크롭 편집
 * 
 * 안전장치:
 *   - 관리자 페이지(/ghost/*) 실행 안 함
 *   - 개별 글 페이지가 아니면 실행 안 함 (홈/시리즈/태그는 사이드바 A 그대로)
 *   - 중복 로드 방지 (window.__DDL_SIDEBAR_B_LOADED)
 *   - 사이드바 A 스크립트와 충돌 방지: 사이드바 A 가 먼저 렌더된 후 우리가 덮어씀
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
  // 2. 페이지 타입 판별
  //    - 개별 글 페이지에만 사이드바 B 적용
  //    - 홈/태그/시리즈/카테고리 페이지는 기존 사이드바 A 유지
  // ============================================================
  function isPostPage(){
    // 여러 조건 중 하나라도 true 이면 개별 글 페이지로 간주
    // (a) body class 에 'post-template' 있음 (Source 테마 규칙)
    if (document.body && document.body.classList.contains('post-template')) return true;
    // (b) <article class="gh-article"> 존재
    if (document.querySelector('article.gh-article')) return true;
    // (c) <section class="gh-content ..."> 존재 (본문)
    if (document.querySelector('section.gh-content')) return true;
    return false;
  }
  
  // ============================================================
  // 3. 사이드바 B 관련 CSS 삽입
  //    DESIGN_RULES.md 준수:
  //      - 색상: --base #F5F5F5 / --color #0F3A3A / --point #FF9A76 만
  //      - 폰트: Pretendard 본문 / Cafe24Danjunghae 헤딩
  //      - 빗금 배경: linear-gradient(-45deg, ...) 4px
  //      - 얇은 선: rgba(15, 58, 58, 0.35)
  // ============================================================
  var CSS_TEXT = '' +
    /* ---- 사이드바 B 컨테이너 ---- */
    '#ddl-side.ddl-side-b {' +
    '  overflow-x: hidden;' +           /* 페이지 슬라이드 넘침 숨김 */
    '}' +
    /* 슬라이더 트랙 (2개 페이지를 좌우로 나열) */
    '#ddl-side.ddl-side-b .sb-track {' +
    '  display: flex;' +
    '  width: 200%;' +
    '  transition: transform 0.35s ease;' +
    '  padding-bottom: 60px;' +          /* 하단 인디케이터 공간 */
    '}' +
    '#ddl-side.ddl-side-b .sb-page {' +
    '  width: 50%;' +
    '  flex: 0 0 50%;' +
    '  padding: 0 4px;' +               /* 사이드바 원래 패딩과 자연 흡수 */
    '  box-sizing: border-box;' +
    '}' +
    /* 페이지 전환: pageIndex 로 제어 */
    '#ddl-side.ddl-side-b[data-page="0"] .sb-track { transform: translateX(0); }' +
    '#ddl-side.ddl-side-b[data-page="1"] .sb-track { transform: translateX(-50%); }' +
    
    /* ---- 페이지 1 블록 사이 여백 ---- */
    '#ddl-side.ddl-side-b .sb-page-1 > .ddl-block,' +
    '#ddl-side.ddl-side-b .sb-page-1 > .sb-block {' +
    '  margin-bottom: 1.5em;' +
    '}' +
    /* 프로필 아래 살짝 여백 (썸네일과 딱 붙지 않게) */
    '#ddl-side.ddl-side-b .sb-page-1 > .ddl-profile {' +
    '  margin-bottom: 2em;' +
    '}' +
    
    /* ---- 썸네일 블록 ---- */
    '.sb-thumb {' +
    '  position: relative;' +
    '  width: 100%;' +
    '  max-height: 260px;' +            /* 무식하게 크지 않게 */
    '  overflow: hidden;' +
    '  border: 1px solid rgba(15, 58, 58, 0.35);' +
    '  background-color: var(--base, #F5F5F5);' +
    '  cursor: zoom-in;' +
    '  transition: outline 0.15s;' +
    '}' +
    '.sb-thumb:hover { outline: 1px solid var(--color, #0F3A3A); }' +
    '.sb-thumb img {' +
    '  display: block;' +
    '  width: 100%;' +
    '  height: auto;' +                 /* 원본 종횡비 유지 */
    '  max-height: 260px;' +
    '  object-fit: cover;' +
    '  object-position: center;' +      /* 중앙 정렬 (크롭 편집은 STEP 3에서) */
    '}' +
    
    /* ---- 썸네일 없는 경우 (빗금 + 제목) 홈 카드와 통일 ---- */
    '.sb-thumb.sb-thumb-noimage {' +
    '  aspect-ratio: 4/3;' +
    '  max-height: 260px;' +
    '  background-color: var(--base, #F5F5F5);' +
    '  background-image: linear-gradient(-45deg,' +
    '    transparent 49%, var(--color, #0F3A3A) 49%,' +
    '    var(--color, #0F3A3A) 51%, transparent 51%);' +
    '  background-size: 4px 4px;' +
    '  display: flex;' +
    '  align-items: center;' +
    '  justify-content: center;' +
    '  padding: 1em;' +
    '  cursor: default;' +
    '}' +
    '.sb-thumb.sb-thumb-noimage:hover { outline: none; }' +
    '.sb-thumb.sb-thumb-noimage .sb-noimage-title {' +
    '  background: var(--base, #F5F5F5);' +
    '  color: var(--color, #0F3A3A);' +
    '  font-family: \'Cafe24Danjunghae\',\'Gowun Batang\',\'Nanum Myeongjo\',serif;' +
    '  letter-spacing: -0.04em;' +
    '  font-size: 1.1em;' +
    '  line-height: 1.4;' +
    '  padding: 0.5em 0.8em;' +
    '  text-align: center;' +
    '  max-width: 90%;' +
    '  border: 1px solid rgba(15, 58, 58, 0.35);' +
    '  display: -webkit-box;' +
    '  -webkit-line-clamp: 3;' +
    '  -webkit-box-orient: vertical;' +
    '  overflow: hidden;' +
    '}' +
    
    /* ---- 자리 예약 표시 (관리자에게만 표시) ---- */
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
    /* 방문자에겐 자리 예약 안 보임 (STEP 1 에서는 관리자만) */
    'body:not(.mf-admin-view) .sb-placeholder { display: none; }' +
    
    /* ---- 페이지 인디케이터 (하단 고정) ---- */
    '.sb-indicator {' +
    '  position: absolute;' +
    '  bottom: 12px;' +
    '  left: 0;' +
    '  right: 0;' +
    '  display: flex;' +
    '  justify-content: center;' +
    '  gap: 8px;' +
    '  z-index: 3;' +
    '  pointer-events: auto;' +
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
    '}' +
    
    /* ---- 사이드바 자체를 relative 로 (인디케이터 절대위치 기준) ---- */
    '#ddl-side.ddl-side-b { position: fixed; }' +
    
    /* ---- 모바일 대응 (사이드바가 좁아졌을 때) ---- */
    '@media (max-width: 1000px) {' +
    '  .sb-thumb { max-height: 200px; }' +
    '  .sb-thumb img { max-height: 200px; }' +
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
  // 4. 현재 글의 대표 이미지(썸네일) 획득
  //    Source 테마: <figure class="gh-article-image"><img src="..."></figure>
  //    OR og:image meta 태그 폴백
  // ============================================================
  function getFeatureImage(){
    // (a) 페이지 안 실제 대표이미지 img
    var img = document.querySelector('.gh-article-image img, figure.gh-article-image img');
    if (img && img.getAttribute('src')) return img.getAttribute('src');
    // (b) og:image meta
    var og = document.querySelector('meta[property="og:image"]');
    if (og && og.getAttribute('content')) return og.getAttribute('content');
    return null;
  }
  
  // ============================================================
  // 5. 현재 글의 제목 획득 (썸네일 없을 때 표시용)
  // ============================================================
  function getPostTitle(){
    // (a) <h1 class="gh-article-title">
    var h = document.querySelector('.gh-article-title, h1.gh-article-title, article h1');
    if (h) return h.textContent.trim();
    // (b) og:title
    var og = document.querySelector('meta[property="og:title"]');
    if (og && og.getAttribute('content')) return og.getAttribute('content');
    // (c) document.title
    return document.title || '';
  }
  
  // ============================================================
  // 6. HTML 엔티티 이스케이프 (제목 삽입 안전)
  // ============================================================
  function escapeHTML(s){
    if (!s) return '';
    return String(s)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#39;');
  }
  
  // ============================================================
  // 7. 사이드바 B 렌더링 (사이드바 A가 이미 그린 것을 기반으로 확장)
  //    STEP 1: 
  //      - 페이지 1 = 프로필(재활용) + 썸네일 + [자리 예약: 시리즈/TOC/하이라이트]
  //      - 페이지 2 = 기존 사이드바 A 의 프로필 이외 나머지
  //      - 하단 ● ○ 인디케이터
  // ============================================================
  function renderSidebarB(){
    try {
      var side = document.getElementById('ddl-side');
      if (!side) return false;  // 사이드바 A 스크립트가 아직 안 그림
      
      // 이미 사이드바 B 로 전환됐으면 스킵
      if (side.classList.contains('ddl-side-b')) return true;
      
      // 페이지 1 에 넣을 프로필 요소 (재활용)
      var profileEl = side.querySelector('.ddl-profile');
      if (!profileEl) return false;  // 아직 프로필 미렌더링. 재시도 필요.
      
      // 기존 자식 블록들 (프로필 제외) 을 페이지 2 로 보냄
      var otherBlocks = [];
      var children = Array.prototype.slice.call(side.children);
      children.forEach(function(ch){
        if (ch === profileEl) return;         // 프로필은 페이지 1
        if (ch.classList && ch.classList.contains('sb-track')) return; // 이미 처리한 것
        if (ch.tagName === 'STYLE' || ch.tagName === 'SCRIPT') return; // 스타일/스크립트는 제외
        otherBlocks.push(ch);
      });
      
      // 트랙 컨테이너 생성
      var track = document.createElement('div');
      track.className = 'sb-track';
      
      // 페이지 1
      var page1 = document.createElement('div');
      page1.className = 'sb-page sb-page-1';
      
      // 페이지 2
      var page2 = document.createElement('div');
      page2.className = 'sb-page sb-page-2';
      
      // 페이지 1 에 프로필 삽입 (기존 요소를 이동)
      page1.appendChild(profileEl);
      
      // 페이지 1 에 썸네일 블록 삽입
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
        // 썸네일 없음 → 홈 카드 no-image 스타일 (빗금 + 제목)
        var thumbNoImg = document.createElement('div');
        thumbNoImg.className = 'sb-thumb sb-thumb-noimage';
        var titleBox = document.createElement('div');
        titleBox.className = 'sb-noimage-title';
        titleBox.textContent = getPostTitle();  // textContent 로 안전 삽입
        thumbNoImg.appendChild(titleBox);
        thumbBlock.appendChild(thumbNoImg);
      }
      page1.appendChild(thumbBlock);
      
      // 자리 예약: 시리즈 목록 (STEP 2 에서 채움)
      var seriesPh = document.createElement('div');
      seriesPh.className = 'sb-block sb-series-placeholder';
      seriesPh.innerHTML = '<div class="sb-placeholder">시리즈 목록 자리 (STEP 2 에서 구현)</div>';
      page1.appendChild(seriesPh);
      
      // 자리 예약: TOC (STEP 2 에서 채움)
      var tocPh = document.createElement('div');
      tocPh.className = 'sb-block sb-toc-placeholder';
      tocPh.innerHTML = '<div class="sb-placeholder">자동 목차(TOC) 자리 (STEP 2 에서 구현)</div>';
      page1.appendChild(tocPh);
      
      // 자리 예약: 하이라이트 (STEP 3 에서 채움)
      var highlightPh = document.createElement('div');
      highlightPh.className = 'sb-block sb-highlight-placeholder';
      highlightPh.innerHTML = '<div class="sb-placeholder">하이라이트 자리 (STEP 3 에서 편집 UI 와 함께 구현)</div>';
      page1.appendChild(highlightPh);
      
      // 페이지 2 에 나머지 블록들 이동
      otherBlocks.forEach(function(el){
        page2.appendChild(el);
      });
      
      // 트랙에 두 페이지 삽입
      track.appendChild(page1);
      track.appendChild(page2);
      
      // 사이드바에 트랙 삽입 (기존 자식은 모두 비운 뒤)
      side.appendChild(track);
      
      // 사이드바에 클래스 부여 → 슬라이더 CSS 활성
      side.classList.add('ddl-side-b');
      side.setAttribute('data-page', '0');
      
      // 인디케이터 생성 (트랙 밖, 사이드바에 직접 삽입 → position: absolute 로 하단 고정)
      var indicator = document.createElement('div');
      indicator.className = 'sb-indicator';
      var btn0 = document.createElement('button');
      btn0.type = 'button';
      btn0.className = 'active';
      btn0.setAttribute('aria-label', '페이지 1');
      var btn1 = document.createElement('button');
      btn1.type = 'button';
      btn1.setAttribute('aria-label', '페이지 2');
      indicator.appendChild(btn0);
      indicator.appendChild(btn1);
      side.appendChild(indicator);
      
      // 인디케이터 클릭 → 페이지 전환
      btn0.addEventListener('click', function(){ switchPage(0); });
      btn1.addEventListener('click', function(){ switchPage(1); });
      
      function switchPage(n){
        side.setAttribute('data-page', String(n));
        btn0.classList.toggle('active', n === 0);
        btn1.classList.toggle('active', n === 1);
      }
      
      // 팝업 모달 생성 (썸네일 클릭 대비, 이미지 있을 때만 활성화)
      if (featureImg) {
        setupThumbModal(featureImg);
      }
      
      return true;
    } catch(e){
      if (window.console && console.error){
        console.error('[sidebar-b v1] render error:', e);
      }
      return false;
    }
  }
  
  // ============================================================
  // 8. 썸네일 클릭 → 팝업 모달
  // ============================================================
  function setupThumbModal(imgSrc){
    // 이미 모달 있으면 스킵
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
      document.body.style.overflow = 'hidden';  // 배경 스크롤 잠금
    }
    function close(){
      modal.classList.remove('open');
      document.body.style.overflow = '';
      // src 해제 (메모리 아끼기, 다시 열면 즉시 로드됨)
      // 그런데 src 유지가 사용성엔 나음 (매번 재로드 X). 유지.
    }
    
    // 썸네일 클릭 → 열기
    document.addEventListener('click', function(e){
      var thumb = e.target.closest('.sb-thumb:not(.sb-thumb-noimage)');
      if (thumb) {
        e.preventDefault();
        open();
      }
    });
    
    // 모달 배경 클릭 → 닫기 (이미지 클릭 제외)
    modal.addEventListener('click', function(e){
      if (e.target === modal || e.target === modalClose) close();
    });
    modalClose.addEventListener('click', close);
    
    // ESC 키 → 닫기
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && modal.classList.contains('open')) close();
    });
  }
  
  // ============================================================
  // 9. 부팅
  //    사이드바 A 스크립트가 프로필/메뉴를 다 그린 뒤 우리가 감쌈.
  //    A 스크립트 실행 완료 시점은 정확히 모르므로 여러 시점 재시도.
  // ============================================================
  function boot(){
    if (!isPostPage()) {
      // 개별 글 페이지 아니면 아무것도 안 함
      return;
    }
    
    injectCSS();
    
    // 사이드바 A 가 이미 렌더됐는지 확인 후 여러 번 재시도
    var attempts = 0;
    var maxAttempts = 30;      // 최대 15초 (500ms * 30)
    
    function tryRender(){
      if (renderSidebarB()) {
        return;  // 성공
      }
      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(tryRender, 500);
      } else {
        if (window.console && console.warn){
          console.warn('[sidebar-b] sidebar A not found after 15s, aborted.');
        }
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
