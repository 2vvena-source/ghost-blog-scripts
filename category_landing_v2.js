/*!
 * CATEGORY-LANDING v2 (external hosted)
 * 배포: 2026-08-21
 * 로더 위치: Ghost Site Footer
 * 
 * v2 변경 (v1 대비, 사용자님 지적 반영):
 *   [!] 그리드뷰 = 홈 masonry 그대로 (Ghost 기본 렌더 유지, CSS 개입 최소)
 *   [!] 카드뷰 = 시리즈 그리드뷰와 동일 톤 (4열 정사각 + outline + hover 뜨기 + 사이트 홈 빗금 배경)
 *   [!] 리스트뷰 = 티스토리 실측 재현
 *       - 각 카드가 가로로 넓은 컨테이너
 *       - 좌측 세로 직사각 썸네일 (width 110px, height 컨테이너 만큼)
 *       - 기본: 썸네일이 right 로 살짝 밀려있어 왼쪽 일부만 보임 (thumb-box overflow:hidden)
 *       - hover: 썸네일이 left 로 슬라이드 (transition 0.5s) → 전체 드러남
 *       - 우측 텍스트: 태그/제목/발췌/날짜
 * 
 * 역할 (v1 과 동일):
 *   - Ghost 태그 페이지(/tag/{slug}/) 에 3뷰 필터 (그리드/카드/리스트) 추가
 *   - 태그 이름에서 Vv 접두사 자동 제거 표시 (예: VvAI → AI)
 *   - Vv 태그가 아닌 태그 페이지는 실행 안 함
 *   - localStorage 로 뷰 선택 저장
 *   - 기본 뷰: 그리드 (홈과 일관성)
 * 
 * 안전장치:
 *   - 관리자 페이지(/ghost/*) 실행 안 함
 *   - 중복 로드 방지
 *   - body.tag-template 아니면 즉시 종료
 *   - Vv 접두사 태그가 아니면 즉시 종료
 *   - try-catch 로 오류 격리
 */

(function(){
  'use strict';
  
  if (window.__DDL_CAT_LANDING_LOADED) return;
  window.__DDL_CAT_LANDING_LOADED = true;
  
  if (location.pathname.indexOf('/ghost/') === 0) return;
  
  function isTagPage(){
    return document.body && document.body.classList.contains('tag-template');
  }
  
  function getCurrentTagSlug(){
    var m = location.pathname.match(/^\/tag\/([^\/]+)\/?$/);
    return m ? decodeURIComponent(m[1]) : null;
  }
  
  function isVvSlug(slug){
    return typeof slug === 'string' && /^vv/i.test(slug);
  }
  
  function stripVv(name){
    if (typeof name !== 'string') return name;
    return name.replace(/^Vv/i, '');
  }
  
  // ========== CSS 주입 ==========
  var CSS = ''
    // ─── 뷰 필터 바 (시리즈 필터바와 동일 톤) ───
    + '.cl-view-bar {'
    + '  display: flex; justify-content: center; align-items: center;'
    + '  gap: 0.4em;'
    + '  margin: 1em auto 2em;'
    + '  padding: 0.4em 0.6em;'
    + '  border-top: 1px solid rgba(15, 58, 58, 0.35);'
    + '  border-bottom: 1px solid rgba(15, 58, 58, 0.35);'
    + '  max-width: 480px;'
    + '  font-family: "Pretendard Variable","Pretendard",sans-serif;'
    + '}'
    + '.cl-view-btn {'
    + '  background: transparent;'
    + '  border: none;'
    + '  padding: 0.4em 1.1em;'
    + '  font-family: inherit;'
    + '  font-size: 0.95em;'
    + '  color: var(--color, #0F3A3A);'
    + '  cursor: pointer;'
    + '  border-radius: 0;'
    + '  transition: color 0.15s;'
    + '  line-height: 1.3;'
    + '}'
    + '.cl-view-btn:hover { color: var(--point, #FF9A76); }'
    + '.cl-view-btn.is-active {'
    + '  color: var(--point, #FF9A76);'
    + '  text-decoration: underline double var(--point, #FF9A76);'
    + '  text-underline-offset: 4px;'
    + '  font-weight: 600;'
    + '}'
    + '.cl-view-sep { color: var(--color, #0F3A3A); opacity: 0.3; user-select: none; }'
    
    // 아카이브 헤더 개수 배지 (사이트 폰트로)
    + '.gh-archive-wrapper .cl-count-badge {'
    + '  display: inline-block;'
    + '  margin-left: 0.4em;'
    + '  font-size: 0.35em;'
    + '  vertical-align: middle;'
    + '  padding: 0.25em 0.7em;'
    + '  border: 1px solid var(--color, #0F3A3A);'
    + '  border-radius: 100px;'
    + '  color: var(--color, #0F3A3A);'
    + '  opacity: 0.75;'
    + '  font-weight: 400;'
    + '  line-height: 1;'
    + '  font-family: "Pretendard Variable","Pretendard",sans-serif;'
    + '  letter-spacing: 0;'
    + '}'
    
    // ─── 공통 변수 ───
    + '.cl-feed {'
    + '  --cl-line: rgba(15, 58, 58, 0.35);'
    + '  --cl-line-strong: rgba(15, 58, 58, 0.55);'
    + '  --cl-stripe: linear-gradient(-45deg, transparent 49%, var(--color, #0F3A3A) 49%, var(--color, #0F3A3A) 51%, transparent 51%);'
    + '}'
    
    // ─── 뷰 1: grid — 홈 masonry 유지 ───
    // Ghost 기본 상태 그대로. 여기에 클래스만 붙여 표식용.
    // 별도 CSS 규칙 없음 (기본 gh-feed 렌더 유지)
    
    // ─── 뷰 2: card — 시리즈 그리드뷰 톤 (4열 정사각 카드) ───
    + '.cl-feed.cl-view-card {'
    + '  display: grid !important;'
    + '  grid-template-columns: repeat(4, minmax(0, 1fr)) !important;'
    + '  gap: 1.4em !important;'
    + '  column-count: unset !important;'
    + '  column-gap: unset !important;'
    + '  overflow: hidden;'
    + '}'
    + '@media (max-width: 1400px) {'
    + '  .cl-feed.cl-view-card { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }'
    + '}'
    + '@media (max-width: 900px) {'
    + '  .cl-feed.cl-view-card { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }'
    + '}'
    + '@media (max-width: 520px) {'
    + '  .cl-feed.cl-view-card { grid-template-columns: 1fr !important; }'
    + '}'
    + '.cl-feed.cl-view-card .gh-card {'
    + '  break-inside: unset !important;'
    + '  margin: 0 !important;'
    + '  padding: 0 !important;'
    + '  background: #fff;'
    + '  outline: 1px solid var(--cl-line);'
    + '  outline-offset: -1px;'
    + '  border: none !important;'
    + '  display: flex !important;'
    + '  flex-direction: column !important;'
    + '  transition: transform 0.2s, box-shadow 0.2s, outline-color 0.15s;'
    + '  will-change: transform;'
    + '  transform: translateZ(0);'
    + '  backface-visibility: hidden;'
    + '  border-radius: 0 !important;'
    + '}'
    + '.cl-feed.cl-view-card .gh-card:hover {'
    + '  transform: translateY(-4px) translateZ(0);'
    + '  box-shadow: 0 8px 24px rgba(15, 58, 58, 0.12);'
    + '  outline-color: var(--cl-line-strong);'
    + '}'
    + '.cl-feed.cl-view-card .gh-card-link {'
    + '  display: flex !important;'
    + '  flex-direction: column !important;'
    + '  height: 100%;'
    + '  text-decoration: none !important;'
    + '  color: inherit !important;'
    + '}'
    + '.cl-feed.cl-view-card .gh-card-image {'
    + '  margin: 0 !important;'
    + '  width: 100%;'
    + '  aspect-ratio: 1 / 1;'
    + '  overflow: hidden;'
    + '  background-color: var(--base, #F5F5F5);'
    + '  border-top: 1px solid var(--cl-line);'
    + '  border-bottom: 1px solid var(--cl-line);'
    + '  order: 1;'
    + '}'
    + '.cl-feed.cl-view-card .gh-card-image img {'
    + '  width: 100% !important;'
    + '  height: 100% !important;'
    + '  object-fit: cover !important;'
    + '  display: block;'
    + '}'
    // 이미지 없는 카드: 홈과 같은 빗금 배경
    + '.cl-feed.cl-view-card .gh-card.no-image .gh-card-image {'
    + '  background-image: var(--cl-stripe);'
    + '  background-size: 4px 4px;'
    + '  background-repeat: repeat;'
    + '}'
    + '.cl-feed.cl-view-card .gh-card.no-image .gh-card-image::before {'
    + '  content: "";'
    + '  display: block; width: 100%; height: 100%;'
    + '}'
    + '.cl-feed.cl-view-card .gh-card-wrapper {'
    + '  padding: 0.9em 1em !important;'
    + '  flex: 1;'
    + '  display: flex; flex-direction: column;'
    + '  order: 2;'
    + '}'
    + '.cl-feed.cl-view-card .gh-card-tag {'
    + '  font-size: 0.72em !important;'
    + '  margin: 0 0 0.3em !important;'
    + '  color: var(--point, #FF9A76) !important;'
    + '  opacity: 0.85;'
    + '  letter-spacing: 0.05em;'
    + '}'
    + '.cl-feed.cl-view-card .gh-card-title {'
    + '  font-size: 1em !important;'
    + '  margin: 0 0 0.4em !important;'
    + '  line-height: 1.35 !important;'
    + '  display: -webkit-box;'
    + '  -webkit-line-clamp: 2;'
    + '  -webkit-box-orient: vertical;'
    + '  overflow: hidden;'
    + '}'
    + '.cl-feed.cl-view-card .gh-card-excerpt {'
    + '  font-size: 0.82em !important;'
    + '  opacity: 0.65;'
    + '  display: -webkit-box;'
    + '  -webkit-line-clamp: 2;'
    + '  -webkit-box-orient: vertical;'
    + '  overflow: hidden;'
    + '  margin: 0 0 0.6em !important;'
    + '  line-height: 1.45 !important;'
    + '}'
    + '.cl-feed.cl-view-card .gh-card-meta {'
    + '  font-size: 0.72em !important;'
    + '  opacity: 0.55;'
    + '  margin-top: auto;'
    + '}'
    
    // ─── 뷰 3: list — 티스토리 실측 재현 (hover 슬라이드) ───
    + '.cl-feed.cl-view-list {'
    + '  display: block !important;'
    + '  column-count: unset !important;'
    + '  column-gap: unset !important;'
    + '  max-width: 900px;'
    + '  margin: 0 auto !important;'
    + '}'
    + '.cl-feed.cl-view-list .gh-card {'
    + '  break-inside: unset !important;'
    + '  margin: 0 0 1em 0 !important;'
    + '  padding: 0 !important;'
    + '  border: 1px solid var(--cl-line) !important;'
    + '  background: transparent !important;'
    + '  border-radius: 0 !important;'
    + '  position: relative;'
    + '  transition: border-color 0.2s;'
    + '  overflow: hidden;'
    + '}'
    + '.cl-feed.cl-view-list .gh-card:hover {'
    + '  border-color: var(--cl-line-strong) !important;'
    + '}'
    + '.cl-feed.cl-view-list .gh-card-link {'
    + '  display: flex !important;'
    + '  flex-direction: row !important;'
    + '  align-items: stretch !important;'
    + '  min-height: 120px;'
    + '  text-decoration: none !important;'
    + '  color: inherit !important;'
    + '  position: relative;'
    + '}'
    // ── 좌측 썸네일 박스 (일부만 드러남) ──
    + '.cl-feed.cl-view-list .gh-card-image {'
    + '  margin: 0 !important;'
    + '  width: 100px;'
    + '  min-width: 100px;'
    + '  position: relative;'
    + '  overflow: hidden;'
    + '  flex-shrink: 0;'
    + '  border-right: 1px solid var(--cl-line);'
    + '}'
    // 실제 이미지 = 절대 위치 + 기본 left:1em (오른쪽으로 살짝 밀림, 왼쪽 일부만 보임)
    + '.cl-feed.cl-view-list .gh-card-image img {'
    + '  width: 100px !important;'
    + '  height: 100% !important;'
    + '  max-width: none !important;'
    + '  position: absolute !important;'
    + '  top: 0;'
    + '  left: 1em;'
    + '  object-fit: cover !important;'
    + '  display: block;'
    + '  transition: left 0.5s ease;'
    + '}'
    // hover 시 왼쪽으로 슬라이드
    + '.cl-feed.cl-view-list .gh-card:hover .gh-card-image img {'
    + '  left: 0;'
    + '}'
    // 이미지 없는 카드: 빗금 배경
    + '.cl-feed.cl-view-list .gh-card.no-image .gh-card-image {'
    + '  background-image: var(--cl-stripe);'
    + '  background-size: 3px 3px;'
    + '  background-repeat: repeat;'
    + '}'
    // ── 우측 텍스트 영역 ──
    + '.cl-feed.cl-view-list .gh-card-wrapper {'
    + '  padding: 0.8em 1em !important;'
    + '  flex: 1;'
    + '  display: flex; flex-direction: column;'
    + '  min-width: 0;'
    + '  justify-content: center;'
    + '}'
    + '.cl-feed.cl-view-list .gh-card-tag {'
    + '  font-size: 0.75em !important;'
    + '  margin: 0 0 0.25em !important;'
    + '  color: var(--point, #FF9A76) !important;'
    + '  opacity: 0.85;'
    + '  letter-spacing: 0.05em;'
    + '}'
    + '.cl-feed.cl-view-list .gh-card-title {'
    + '  font-size: 1.05em !important;'
    + '  margin: 0 0 0.35em !important;'
    + '  line-height: 1.4 !important;'
    + '  display: -webkit-box;'
    + '  -webkit-line-clamp: 2;'
    + '  -webkit-box-orient: vertical;'
    + '  overflow: hidden;'
    + '}'
    + '.cl-feed.cl-view-list .gh-card-excerpt {'
    + '  font-size: 0.83em !important;'
    + '  opacity: 0.65;'
    + '  display: -webkit-box;'
    + '  -webkit-line-clamp: 1;'
    + '  -webkit-box-orient: vertical;'
    + '  overflow: hidden;'
    + '  margin: 0 0 0.35em !important;'
    + '  line-height: 1.4 !important;'
    + '}'
    + '.cl-feed.cl-view-list .gh-card-meta {'
    + '  font-size: 0.72em !important;'
    + '  opacity: 0.55;'
    + '  margin-top: auto;'
    + '}'
    + '';
  
  function injectCSS(){
    try {
      var style = document.createElement('style');
      style.setAttribute('data-ddl-cat-landing', 'v2');
      style.textContent = CSS;
      (document.head || document.documentElement).appendChild(style);
    } catch(e){}
  }
  
  // ========== 헤더 갈아끼우기 (Vv 제거 + 개수 배지) ==========
  function replaceHeader(){
    var h1 = document.querySelector('.gh-archive-wrapper .gh-article-title');
    if (!h1) return;
    var raw = (h1.textContent || '').trim();
    var displayName = stripVv(raw);
    
    var cards = document.querySelectorAll('.gh-feed > .gh-card');
    var count = cards.length;
    
    h1.textContent = displayName;
    if (count > 0) {
      var badge = document.createElement('span');
      badge.className = 'cl-count-badge';
      badge.textContent = count + '개';
      h1.appendChild(badge);
    }
  }
  
  // ========== 이미지 없는 카드 마킹 ==========
  function markNoImageCards(){
    var cards = document.querySelectorAll('.gh-feed > .gh-card');
    cards.forEach(function(card){
      var img = card.querySelector('.gh-card-image img');
      if (!img || !img.getAttribute('src')) {
        card.classList.add('no-image');
      }
    });
  }
  
  // ========== .gh-feed 에 표식 클래스 부여 (뷰 CSS 스코프 축소) ==========
  function markFeed(){
    var feed = document.querySelector('.gh-feed');
    if (feed) feed.classList.add('cl-feed');
  }
  
  // ========== 3뷰 필터 ==========
  var STORAGE_KEY = 'cl-view-mode';
  var VIEWS = ['grid', 'card', 'list'];
  var VIEW_LABELS = { grid: '그리드', card: '카드', list: '리스트' };
  
  function getSavedView(){
    var v = null;
    try { v = localStorage.getItem(STORAGE_KEY); } catch(e){}
    if (VIEWS.indexOf(v) === -1) return 'grid';
    return v;
  }
  function saveView(v){
    try { localStorage.setItem(STORAGE_KEY, v); } catch(e){}
  }
  function applyView(view){
    var feed = document.querySelector('.gh-feed');
    if (!feed) return;
    VIEWS.forEach(function(v){ feed.classList.remove('cl-view-' + v); });
    feed.classList.add('cl-view-' + view);
    var bar = document.querySelector('.cl-view-bar');
    if (bar) {
      bar.querySelectorAll('.cl-view-btn').forEach(function(btn){
        btn.classList.toggle('is-active', btn.getAttribute('data-view') === view);
      });
    }
  }
  function insertFilterBar(){
    var archive = document.querySelector('.gh-archive-wrapper');
    if (!archive) return;
    if (document.querySelector('.cl-view-bar')) return;
    var bar = document.createElement('div');
    bar.className = 'cl-view-bar';
    VIEWS.forEach(function(v, i){
      if (i > 0) {
        var sep = document.createElement('span');
        sep.className = 'cl-view-sep';
        sep.textContent = '/';
        bar.appendChild(sep);
      }
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cl-view-btn';
      btn.setAttribute('data-view', v);
      btn.textContent = VIEW_LABELS[v];
      btn.addEventListener('click', function(){
        applyView(v);
        saveView(v);
      });
      bar.appendChild(btn);
    });
    archive.appendChild(bar);
  }
  
  // ========== 메인 ==========
  function main(){
    if (!isTagPage()) return;
    var slug = getCurrentTagSlug();
    if (!slug || !isVvSlug(slug)) return;
    
    injectCSS();
    replaceHeader();
    markNoImageCards();
    markFeed();
    insertFilterBar();
    applyView(getSavedView());
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
  } else {
    main();
  }
})();
