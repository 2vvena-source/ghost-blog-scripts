/*!
 * CATEGORY-LANDING v1 (external hosted)
 * 배포: 2026-08-21
 * 로더 위치: Ghost Site Footer
 * 
 * 역할:
 *   - Ghost 태그 페이지(/tag/{slug}/) 에 3뷰 필터 (그리드/카드/리스트) 추가
 *   - 태그 이름에서 Vv 접두사 자동 제거 표시 (예: VvAI → AI)
 *   - Vv 태그가 아닌 태그 페이지는 실행 안 함 (원래 렌더링 유지)
 *   - localStorage 로 뷰 선택 저장
 *   - 기본 뷰: 그리드 (홈과 일관성)
 * 
 * 3뷰 정의:
 *   - grid   = 홈화면 masonry 카드 (사이트 기본 스타일 유지)
 *   - card   = 시리즈 그리드형과 유사 (정사각 썸네일 3열)
 *   - list   = 좌측 정사각 썸네일 + 우측 텍스트 (티스토리 리스트 감성)
 * 
 * 안전장치:
 *   - 관리자 페이지(/ghost/*) 실행 안 함
 *   - 중복 로드 방지 (window.__DDL_CAT_LANDING_LOADED)
 *   - body.tag-template 아니면 즉시 종료
 *   - Vv 접두사 태그가 아니면 즉시 종료 (일반 태그 페이지는 원본 유지)
 *   - try-catch 로 오류 격리
 */

(function(){
  'use strict';
  
  if (window.__DDL_CAT_LANDING_LOADED) return;
  window.__DDL_CAT_LANDING_LOADED = true;
  
  if (location.pathname.indexOf('/ghost/') === 0) return;
  
  // 태그 페이지 아니면 종료
  function isTagPage(){
    return document.body && document.body.classList.contains('tag-template');
  }
  
  // 현재 태그 슬러그 뽑기 (URL /tag/xxx/ 에서)
  function getCurrentTagSlug(){
    var m = location.pathname.match(/^\/tag\/([^\/]+)\/?$/);
    return m ? decodeURIComponent(m[1]) : null;
  }
  
  // 태그 이름이 Vv 로 시작하는지 (사이드바 카테고리 시스템과 동일한 규칙)
  function isVvSlug(slug){
    return typeof slug === 'string' && /^vv/i.test(slug);
  }
  
  function stripVv(name){
    if (typeof name !== 'string') return name;
    return name.replace(/^Vv/i, '');
  }
  
  // ========== CSS 주입 ==========
  var CSS = ''
    // 뷰 필터 바
    + '.cl-view-bar {'
    + '  display: flex; justify-content: center; align-items: center;'
    + '  gap: 0.2em;'
    + '  margin: 1em auto 2em;'
    + '  padding: 0.4em 0.6em;'
    + '  border-top: 1px solid var(--color, #0F3A3A);'
    + '  border-bottom: 1px solid var(--color, #0F3A3A);'
    + '  max-width: 480px;'
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
    + '  transition: color 0.15s, background 0.15s;'
    + '  line-height: 1.3;'
    + '}'
    + '.cl-view-btn:hover {'
    + '  color: var(--point, #FF9A76);'
    + '}'
    + '.cl-view-btn.is-active {'
    + '  color: var(--point, #FF9A76);'
    + '  text-decoration: underline double var(--point, #FF9A76);'
    + '  text-underline-offset: 4px;'
    + '  font-weight: 600;'
    + '}'
    + '.cl-view-sep {'
    + '  color: var(--color, #0F3A3A);'
    + '  opacity: 0.3;'
    + '  user-select: none;'
    + '}'
    // 아카이브 헤더 개수 배지
    + '.gh-archive-wrapper .cl-count-badge {'
    + '  display: inline-block;'
    + '  margin-left: 0.4em;'
    + '  font-size: 0.5em;'
    + '  vertical-align: middle;'
    + '  padding: 0.15em 0.6em;'
    + '  border: 1px solid var(--color, #0F3A3A);'
    + '  border-radius: 100px;'
    + '  color: var(--color, #0F3A3A);'
    + '  opacity: 0.75;'
    + '  font-weight: 400;'
    + '  line-height: 1;'
    + '  font-family: "Pretendard Variable","Pretendard",sans-serif;'
    + '}'
    
    // ─── 뷰 1: grid (홈 masonry 유지, 별도 CSS 없음, 기본값) ───
    // Ghost 기본 .gh-feed 는 그대로 두고, view-grid 는 아무것도 안 함
    
    // ─── 뷰 2: card (시리즈 그리드형과 유사, 정사각 3열) ───
    + '.gh-feed.cl-view-card {'
    + '  display: grid !important;'
    + '  grid-template-columns: repeat(3, 1fr) !important;'
    + '  gap: 1.2em !important;'
    + '  column-count: unset !important;'   // masonry 해제
    + '  column-gap: unset !important;'
    + '}'
    + '@media (max-width: 1000px) {'
    + '  .gh-feed.cl-view-card { grid-template-columns: repeat(2, 1fr) !important; }'
    + '}'
    + '@media (max-width: 600px) {'
    + '  .gh-feed.cl-view-card { grid-template-columns: 1fr !important; }'
    + '}'
    + '.gh-feed.cl-view-card .gh-card {'
    + '  break-inside: unset !important;'
    + '  margin-bottom: 0 !important;'
    + '  display: flex !important;'
    + '  flex-direction: column !important;'
    + '  border: 1px solid rgba(15, 58, 58, 0.12);'
    + '  border-radius: 4px;'
    + '  overflow: hidden;'
    + '  background: var(--base, #F5F5F5);'
    + '  transition: border-color 0.15s, transform 0.15s;'
    + '}'
    + '.gh-feed.cl-view-card .gh-card:hover {'
    + '  border-color: var(--point, #FF9A76);'
    + '}'
    + '.gh-feed.cl-view-card .gh-card-link {'
    + '  display: flex !important;'
    + '  flex-direction: column !important;'
    + '  height: 100%;'
    + '}'
    + '.gh-feed.cl-view-card .gh-card-image {'
    + '  margin: 0 !important;'
    + '  aspect-ratio: 1 / 1;'
    + '  overflow: hidden;'
    + '  background: rgba(15, 58, 58, 0.05);'
    + '}'
    + '.gh-feed.cl-view-card .gh-card-image img {'
    + '  width: 100% !important;'
    + '  height: 100% !important;'
    + '  object-fit: cover !important;'
    + '}'
    + '.gh-feed.cl-view-card .gh-card-wrapper {'
    + '  padding: 0.8em 0.9em !important;'
    + '  flex: 1;'
    + '  display: flex; flex-direction: column;'
    + '}'
    + '.gh-feed.cl-view-card .gh-card-title {'
    + '  font-size: 1em !important;'
    + '  margin: 0 0 0.3em !important;'
    + '  line-height: 1.35 !important;'
    + '  display: -webkit-box;'
    + '  -webkit-line-clamp: 2;'
    + '  -webkit-box-orient: vertical;'
    + '  overflow: hidden;'
    + '}'
    + '.gh-feed.cl-view-card .gh-card-excerpt {'
    + '  font-size: 0.82em !important;'
    + '  opacity: 0.7;'
    + '  display: -webkit-box;'
    + '  -webkit-line-clamp: 2;'
    + '  -webkit-box-orient: vertical;'
    + '  overflow: hidden;'
    + '  margin: 0 0 0.5em !important;'
    + '}'
    + '.gh-feed.cl-view-card .gh-card-meta {'
    + '  font-size: 0.75em !important;'
    + '  opacity: 0.6;'
    + '  margin-top: auto;'
    + '}'
    // 이미지 없는 카드는 이미지 자리 대신 색상만
    + '.gh-feed.cl-view-card .gh-card.no-image .gh-card-image {'
    + '  display: none;'
    + '}'
    
    // ─── 뷰 3: list (좌측 썸네일 + 우측 텍스트) ───
    + '.gh-feed.cl-view-list {'
    + '  display: block !important;'
    + '  column-count: unset !important;'
    + '  column-gap: unset !important;'
    + '  max-width: 900px;'
    + '  margin: 0 auto !important;'
    + '}'
    + '.gh-feed.cl-view-list .gh-card {'
    + '  break-inside: unset !important;'
    + '  margin: 0 !important;'
    + '  padding: 1em 0 !important;'
    + '  border: none !important;'
    + '  border-bottom: 1px dashed rgba(15, 58, 58, 0.25) !important;'
    + '  background: transparent !important;'
    + '  border-radius: 0 !important;'
    + '  transition: background 0.15s;'
    + '}'
    + '.gh-feed.cl-view-list .gh-card:last-child {'
    + '  border-bottom: none !important;'
    + '}'
    + '.gh-feed.cl-view-list .gh-card:hover {'
    + '  background: rgba(255, 154, 118, 0.04) !important;'
    + '}'
    + '.gh-feed.cl-view-list .gh-card-link {'
    + '  display: grid !important;'
    + '  grid-template-columns: 130px 1fr !important;'
    + '  gap: 1.2em !important;'
    + '  align-items: start;'
    + '}'
    + '@media (max-width: 600px) {'
    + '  .gh-feed.cl-view-list .gh-card-link {'
    + '    grid-template-columns: 90px 1fr !important;'
    + '    gap: 0.8em !important;'
    + '  }'
    + '}'
    + '.gh-feed.cl-view-list .gh-card-image {'
    + '  margin: 0 !important;'
    + '  aspect-ratio: 1 / 1;'
    + '  overflow: hidden;'
    + '  border-radius: 3px;'
    + '  background: rgba(15, 58, 58, 0.05);'
    + '}'
    + '.gh-feed.cl-view-list .gh-card-image img {'
    + '  width: 100% !important;'
    + '  height: 100% !important;'
    + '  object-fit: cover !important;'
    + '}'
    + '.gh-feed.cl-view-list .gh-card.no-image .gh-card-image {'
    + '  background: repeating-linear-gradient(45deg, rgba(15,58,58,0.04), rgba(15,58,58,0.04) 8px, rgba(15,58,58,0.08) 8px, rgba(15,58,58,0.08) 16px);'
    + '}'
    + '.gh-feed.cl-view-list .gh-card-wrapper {'
    + '  padding: 0 !important;'
    + '  display: flex; flex-direction: column;'
    + '  min-width: 0;'
    + '}'
    + '.gh-feed.cl-view-list .gh-card-tag {'
    + '  font-size: 0.75em !important;'
    + '  opacity: 0.7;'
    + '  margin: 0 0 0.3em !important;'
    + '  color: var(--point, #FF9A76) !important;'
    + '}'
    + '.gh-feed.cl-view-list .gh-card-title {'
    + '  font-size: 1.1em !important;'
    + '  margin: 0 0 0.4em !important;'
    + '  line-height: 1.4 !important;'
    + '  display: -webkit-box;'
    + '  -webkit-line-clamp: 2;'
    + '  -webkit-box-orient: vertical;'
    + '  overflow: hidden;'
    + '}'
    + '.gh-feed.cl-view-list .gh-card-excerpt {'
    + '  font-size: 0.85em !important;'
    + '  opacity: 0.7;'
    + '  display: -webkit-box;'
    + '  -webkit-line-clamp: 2;'
    + '  -webkit-box-orient: vertical;'
    + '  overflow: hidden;'
    + '  margin: 0 0 0.5em !important;'
    + '}'
    + '.gh-feed.cl-view-list .gh-card-meta {'
    + '  font-size: 0.75em !important;'
    + '  opacity: 0.6;'
    + '  margin-top: auto;'
    + '}'
    + '';
  
  function injectCSS(){
    try {
      var style = document.createElement('style');
      style.setAttribute('data-ddl-cat-landing', 'v1');
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
    
    // 카드 개수 세기 (Ghost 가 이미 렌더한 결과)
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
  
  // ========== 3뷰 필터 삽입 ==========
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
    VIEWS.forEach(function(v){
      feed.classList.remove('cl-view-' + v);
    });
    feed.classList.add('cl-view-' + view);
    
    // 필터 바 버튼 활성 상태
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
    if (document.querySelector('.cl-view-bar')) return; // 중복 방지
    
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
    if (!slug || !isVvSlug(slug)) return; // Vv 태그 아닌 태그 페이지는 원본 유지
    
    injectCSS();
    replaceHeader();
    markNoImageCards();
    insertFilterBar();
    applyView(getSavedView());
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
  } else {
    main();
  }
})();
