/*!
 * CATEGORY-LANDING v5 (external hosted)
 * 배포: 2026-08-21
 * 로더 위치: Ghost Site Footer
 *
 * v5 변경 (v4 대비):
 *   [!] 카드뷰 재설계 — 시리즈 그리드(.sg-card) 톤 반영:
 *       상단 정사각 썸네일 → 하단 직사각 정보영역(태그/큰 제목/날짜)
 *   [!] 리스트뷰 재설계 — 티스토리 실측 스크린샷 반영:
 *       좌측 세로 직사각 썸네일(고정 높이, hover 로 슬라이드) +
 *       우측 상하 2으로 분할(상: 태그 알약배지 + 제목 / 하: 날짜)
 *       이미지 높이 오류 수정 (position:absolute 제거, aspect 대신 고정 높이)
 *   [+] no-image 카드: 기존 대각선 stripe 유지 (티스토리 느낌은 스트라이프로 가능)
 *
 * v4 배경 (남겨둠):
 *   [!] v3 는 커스텀 헤더를 <header> 태그로 만들어 .gh-main 의 직계 자식으로 삽입 →
 *       Ghost Source 테마 CSS 의 main > header 규칙 에 걸려
 *       display:none 처리되어 화면에 안 보였음.
 *   [!] <header> → <div> 로 태그만 변경. 클래스명(.cl-header) 은 유지.
 *
 * v3 배경 (남겨둠):
 *   [!] .gh-archive-wrapper 는 사이트 Site Header 의 "히어로 배너 제거" 로직에 의해
 *       CSS 2중 + JS 1중 으로 통째 숨겨지는 요소였음 (인계 문서 §2-1 히어로 3중 방어)
 *       → v1/v2 는 이 요소 안에 필터바 삽입 → 필터바도 함께 숨겨짐 → 사용자에게 안 보였음
 *   [!] 삽입 위치를 .gh-feed 바로 위로 변경 (gh-feed 는 keep 리스트에 있어 살아있음)
 *   [+] 새 헤더 영역을 우리가 직접 만들어서 삽입 (제목 + 개수 배지 + 필터바)
 * 
 * 3뷰 정의 (v2 그대로):
 *   - grid = 홈 masonry
 *   - card = 시리즈 그리드뷰 톤 (4열 정사각 + outline)
 *   - list = 티스토리 리스트 재현 (좌측 세로 썸네일 + hover 슬라이드)
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
    // ─── 우리가 만들 커스텀 헤더 (사이트 톤 유지) ───
    + '.cl-header {'
    + '  padding: 2em 0 1em 0;'
    + '  margin: 0 0 1.5em 0;'
    + '  border-bottom: 1px solid rgba(15, 58, 58, 0.35);'
    + '  text-align: center;'
    + '  font-family: "Cafe24Danjunghae","Gowun Batang","Nanum Myeongjo",serif;'
    + '}'
    + '.cl-header-title {'
    + '  font-size: 2.4em;'
    + '  font-family: "Cafe24Danjunghae","Gowun Batang",serif;'
    + '  color: var(--color, #0F3A3A);'
    + '  margin: 0 0 0.3em 0;'
    + '  line-height: 1.2;'
    + '  letter-spacing: 0.02em;'
    + '  display: inline-block;'
    + '}'
    + '.cl-header-title .cl-count-badge {'
    + '  display: inline-block;'
    + '  margin-left: 0.4em;'
    + '  font-size: 0.4em;'
    + '  vertical-align: middle;'
    + '  padding: 0.3em 0.9em;'
    + '  border: 1px solid var(--color, #0F3A3A);'
    + '  border-radius: 100px;'
    + '  color: var(--color, #0F3A3A);'
    + '  opacity: 0.75;'
    + '  font-weight: 400;'
    + '  line-height: 1;'
    + '  font-family: "Pretendard Variable","Pretendard",sans-serif;'
    + '  letter-spacing: 0;'
    + '  vertical-align: super;'
    + '}'
    
    // ─── 필터 바 ───
    + '.cl-view-bar {'
    + '  display: flex; justify-content: center; align-items: center;'
    + '  gap: 0.4em;'
    + '  margin: 1em auto 0;'
    + '  padding: 0.4em 0.6em;'
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
    + '  letter-spacing: 0;'
    + '}'
    + '.cl-view-btn:hover { color: var(--point, #FF9A76); }'
    + '.cl-view-btn.is-active {'
    + '  color: var(--point, #FF9A76);'
    + '  text-decoration: underline double var(--point, #FF9A76);'
    + '  text-underline-offset: 4px;'
    + '  font-weight: 600;'
    + '}'
    + '.cl-view-sep { color: var(--color, #0F3A3A); opacity: 0.3; user-select: none; }'
    
    // ─── 공통 변수 (feed 스코프) ───
    + '.cl-feed {'
    + '  --cl-line: rgba(15, 58, 58, 0.35);'
    + '  --cl-line-strong: rgba(15, 58, 58, 0.55);'
    + '  --cl-stripe: linear-gradient(-45deg, transparent 49%, var(--color, #0F3A3A) 49%, var(--color, #0F3A3A) 51%, transparent 51%);'
    + '}'
    
    // ─── 뷰 1: grid — 홈 masonry (기본 렌더 유지) ───
    // 별도 CSS 없음
    
    // ─── 뷰 2: card — 시리즈 sg-card 톤 재현 ───
    // 상단 정사각 썸네일 + 하단 정보영역(태그·큰 제목·구분선·날짜)
    + '.cl-feed.cl-view-card {'
    + '  display: grid !important;'
    + '  grid-template-columns: repeat(4, minmax(0, 1fr)) !important;'
    + '  gap: 1.6em 1.4em !important;'
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
    + '  background: transparent !important;'
    + '  border: none !important;'
    + '  display: flex !important;'
    + '  flex-direction: column !important;'
    + '  transition: transform 0.2s;'
    + '  will-change: transform;'
    + '  border-radius: 0 !important;'
    + '}'
    + '.cl-feed.cl-view-card .gh-card:hover {'
    + '  transform: translateY(-3px);'
    + '}'
    + '.cl-feed.cl-view-card .gh-card-link {'
    + '  display: flex !important;'
    + '  flex-direction: column !important;'
    + '  height: 100%;'
    + '  text-decoration: none !important;'
    + '  color: inherit !important;'
    + '}'
    // ▷ 상단 정사각 썸네일 (시리즈 sg-thumb 감성 — 얇은 테두리, 배경만)
    + '.cl-feed.cl-view-card .gh-card-image {'
    + '  margin: 0 !important;'
    + '  width: 100%;'
    + '  aspect-ratio: 1 / 1;'
    + '  overflow: hidden;'
    + '  background-color: var(--base, #F5F5F5);'
    + '  border: 1px solid var(--cl-line);'
    + '  order: 1;'
    + '  position: relative;'
    + '}'
    + '.cl-feed.cl-view-card .gh-card-image img {'
    + '  width: 100% !important;'
    + '  height: 100% !important;'
    + '  object-fit: cover !important;'
    + '  display: block;'
    + '  transition: transform 0.4s ease;'
    + '}'
    + '.cl-feed.cl-view-card .gh-card:hover .gh-card-image img {'
    + '  transform: scale(1.04);'
    + '}'
    + '.cl-feed.cl-view-card .gh-card.no-image .gh-card-image {'
    + '  background-image: var(--cl-stripe);'
    + '  background-size: 5px 5px;'
    + '  background-repeat: repeat;'
    + '  background-color: var(--base, #F5F5F5);'
    + '}'
    // ▷ 하단 정보영역 (시리즈 sg-body 감성 — 여백 있는 텍스트 블록)
    + '.cl-feed.cl-view-card .gh-card-wrapper {'
    + '  padding: 1em 0.4em 0 !important;'
    + '  flex: 1;'
    + '  display: flex; flex-direction: column;'
    + '  order: 2;'
    + '}'
    + '.cl-feed.cl-view-card .gh-card-tag {'
    + '  font-size: 0.7em !important;'
    + '  margin: 0 0 0.5em !important;'
    + '  color: var(--point, #FF9A76) !important;'
    + '  opacity: 0.9;'
    + '  letter-spacing: 0.08em;'
    + '  text-transform: uppercase;'
    + '  font-family: "Pretendard Variable","Pretendard",sans-serif !important;'
    + '}'
    // 시리즈 sg-name 감성: 큰 명조 제목
    + '.cl-feed.cl-view-card .gh-card-title {'
    + '  font-size: 1.15em !important;'
    + '  margin: 0 0 0.6em !important;'
    + '  line-height: 1.35 !important;'
    + '  font-family: "Cafe24Danjunghae","Gowun Batang","Nanum Myeongjo",serif !important;'
    + '  color: var(--color, #0F3A3A) !important;'
    + '  display: -webkit-box;'
    + '  -webkit-line-clamp: 2;'
    + '  -webkit-box-orient: vertical;'
    + '  overflow: hidden;'
    + '  letter-spacing: 0.01em;'
    + '}'
    + '.cl-feed.cl-view-card .gh-card-excerpt {'
    + '  font-size: 0.78em !important;'
    + '  opacity: 0.55;'
    + '  display: -webkit-box;'
    + '  -webkit-line-clamp: 2;'
    + '  -webkit-box-orient: vertical;'
    + '  overflow: hidden;'
    + '  margin: 0 0 0.7em !important;'
    + '  line-height: 1.45 !important;'
    + '}'
    // 시리즈 sg-count 감성: 위쪽 얇은 선 + 작은 메타
    + '.cl-feed.cl-view-card .gh-card-meta {'
    + '  font-size: 0.7em !important;'
    + '  opacity: 0.55;'
    + '  margin-top: auto;'
    + '  padding-top: 0.5em;'
    + '  border-top: 1px solid var(--cl-line);'
    + '  font-family: "Pretendard Variable","Pretendard",sans-serif !important;'
    + '  letter-spacing: 0.03em;'
    + '}'
    
    // ─── 뷰 3: list — 티스토리 리스트 실측 스크린샷 재현 ───
    // 카드 = 얇은 테두리 사각형, 카드끼리 세로 여백
    // 좌측 세로 직사각 썸네일 (고정 높이 100px, hover 시 슬라이드)
    // 우측 = 상단 (알약 태그 + 제목) + 얇은 가로선 + 하단 (날짜)
    + '.cl-feed.cl-view-list {'
    + '  display: block !important;'
    + '  column-count: unset !important;'
    + '  column-gap: unset !important;'
    + '  max-width: 900px;'
    + '  margin: 0 auto !important;'
    + '}'
    + '.cl-feed.cl-view-list .gh-card {'
    + '  break-inside: unset !important;'
    + '  margin: 0 0 0.8em 0 !important;'
    + '  padding: 0 !important;'
    + '  border: 1px solid var(--cl-line) !important;'
    + '  background: transparent !important;'
    + '  border-radius: 0 !important;'
    + '  position: relative;'
    + '  transition: border-color 0.2s;'
    + '  overflow: hidden;'
    + '  height: 110px;'
    + '}'
    + '.cl-feed.cl-view-list .gh-card:hover {'
    + '  border-color: var(--cl-line-strong) !important;'
    + '}'
    + '.cl-feed.cl-view-list .gh-card-link {'
    + '  display: flex !important;'
    + '  flex-direction: row !important;'
    + '  align-items: stretch !important;'
    + '  height: 100% !important;'
    + '  text-decoration: none !important;'
    + '  color: inherit !important;'
    + '  position: relative;'
    + '}'
    // ▷ 좌측 세로 직사각 썸네일 박스
    + '.cl-feed.cl-view-list .gh-card-image {'
    + '  margin: 0 !important;'
    + '  width: 110px !important;'
    + '  min-width: 110px;'
    + '  height: 100% !important;'
    + '  position: relative;'
    + '  overflow: hidden;'
    + '  flex-shrink: 0;'
    + '  border-right: 1px solid var(--cl-line);'
    + '  background-color: var(--base, #F5F5F5);'
    + '}'
    // 기본: 이미지가 오른쪽으로 밀려 일부만 드러남
    + '.cl-feed.cl-view-list .gh-card-image img {'
    + '  width: 110px !important;'
    + '  height: 100% !important;'
    + '  max-width: none !important;'
    + '  position: absolute !important;'
    + '  top: 0;'
    + '  left: 22px;'
    + '  object-fit: cover !important;'
    + '  display: block;'
    + '  transition: left 0.5s ease;'
    + '}'
    // hover: 왼쪽으로 슬라이드 → 전체 드러남
    + '.cl-feed.cl-view-list .gh-card:hover .gh-card-image img {'
    + '  left: 0;'
    + '}'
    // 이미지 없는 카드: 사선 스트라이프 (티스토리 톤)
    + '.cl-feed.cl-view-list .gh-card.no-image .gh-card-image {'
    + '  background-image: var(--cl-stripe);'
    + '  background-size: 4px 4px;'
    + '  background-repeat: repeat;'
    + '}'
    // ▷ 우측 정보영역 (상하 2분할)
    + '.cl-feed.cl-view-list .gh-card-wrapper {'
    + '  padding: 0 !important;'
    + '  flex: 1;'
    + '  display: flex !important;'
    + '  flex-direction: column !important;'
    + '  min-width: 0;'
    + '  height: 100%;'
    + '}'
    // 상단: 태그(알약) + 제목
    + '.cl-feed.cl-view-list .gh-card-tag {'
    + '  display: inline-block !important;'
    + '  font-size: 0.72em !important;'
    + '  margin: 0 0 0.4em !important;'
    + '  padding: 0.2em 0.8em !important;'
    + '  color: var(--color, #0F3A3A) !important;'
    + '  border: 1px solid var(--cl-line);'
    + '  border-radius: 100px;'
    + '  letter-spacing: 0.04em;'
    + '  opacity: 0.85;'
    + '  font-family: "Pretendard Variable","Pretendard",sans-serif !important;'
    + '  width: auto !important;'
    + '  align-self: flex-start;'
    + '}'
    + '.cl-feed.cl-view-list .gh-card-title {'
    + '  font-size: 1.35em !important;'
    + '  margin: 0 !important;'
    + '  line-height: 1.3 !important;'
    + '  font-family: "Cafe24Danjunghae","Gowun Batang","Nanum Myeongjo",serif !important;'
    + '  color: var(--color, #0F3A3A) !important;'
    + '  display: -webkit-box;'
    + '  -webkit-line-clamp: 1;'
    + '  -webkit-box-orient: vertical;'
    + '  overflow: hidden;'
    + '  letter-spacing: 0.01em;'
    + '}'
    // excerpt 는 리스트뷰에서 숨김 (티스토리 원본에 없음)
    + '.cl-feed.cl-view-list .gh-card-excerpt {'
    + '  display: none !important;'
    + '}'
    // 상단 블록: 태그 + 제목 을 감싸는 영역 (padding 여유)
    + '.cl-feed.cl-view-list .gh-card-wrapper > :not(.gh-card-meta) {'
    + '  padding: 0 1em;'
    + '}'
    + '.cl-feed.cl-view-list .gh-card-wrapper > *:first-child {'
    + '  padding-top: 0.85em;'
    + '}'
    // 하단: 날짜 — 얇은 가로선 + 손글씨풍 폰트
    + '.cl-feed.cl-view-list .gh-card-meta {'
    + '  font-size: 0.85em !important;'
    + '  opacity: 0.75;'
    + '  margin-top: auto !important;'
    + '  padding: 0.35em 1em !important;'
    + '  border-top: 1px solid var(--cl-line);'
    + '  color: var(--color, #0F3A3A) !important;'
    + '  font-family: "NanumURiDdarSonGeurSsi","Gowun Batang",serif !important;'
    + '  letter-spacing: 0.02em;'
    + '  font-style: italic;'
    + '}'
    + '';
  
  function injectCSS(){
    try {
      var style = document.createElement('style');
      style.setAttribute('data-ddl-cat-landing', 'v5');
      style.textContent = CSS;
      (document.head || document.documentElement).appendChild(style);
    } catch(e){}
  }
  
  // ========== 커스텀 헤더 삽입 (.gh-feed 바로 위) ==========
  function insertCustomHeader(slug){
    var feed = document.querySelector('.gh-feed');
    if (!feed) return null;
    if (feed.previousElementSibling && feed.previousElementSibling.classList &&
        feed.previousElementSibling.classList.contains('cl-header')) {
      return feed.previousElementSibling; // 중복 방지
    }
    
    // 표시명: slug 에서 Vv 제거 후 대문자 유지
    // (Content API 태그명 대신 slug 사용 — 이미 소문자 slug 라 원본 Vv 대소문자 복원 불가.
    //  Ghost header 안의 h1 텍스트를 참고할 수 있으면 사용, 없으면 slug 대문자화)
    var raw = null;
    var hidden = document.querySelector('.gh-archive-wrapper .gh-article-title');
    if (hidden) raw = (hidden.textContent || '').trim();
    var displayName = raw ? stripVv(raw) : stripVv(slug);
    // slug 유래일 때 첫 글자만 대문자로
    if (!raw && displayName) {
      displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
    }
    
    // 카드 개수
    var cards = feed.querySelectorAll(':scope > .gh-card, :scope > article.gh-card');
    var count = cards.length;
    
    // v4: <header> 대신 <div> — Source 테마의 main > header 규칙 회피
    var header = document.createElement('div');
    header.className = 'cl-header';

    var title = document.createElement('h1');
    title.className = 'cl-header-title';
    title.textContent = displayName;
    if (count > 0) {
      var badge = document.createElement('span');
      badge.className = 'cl-count-badge';
      badge.textContent = count + '개';
      title.appendChild(badge);
    }
    header.appendChild(title);
    
    // 필터 바
    var bar = createFilterBar();
    header.appendChild(bar);
    
    feed.parentNode.insertBefore(header, feed);
    return header;
  }
  
  function markNoImageCards(){
    var cards = document.querySelectorAll('.gh-feed > .gh-card, .gh-feed > article.gh-card');
    cards.forEach(function(card){
      var img = card.querySelector('.gh-card-image img');
      if (!img || !img.getAttribute('src')) {
        card.classList.add('no-image');
      }
    });
  }
  
  function markFeed(){
    var feed = document.querySelector('.gh-feed');
    if (feed) feed.classList.add('cl-feed');
  }
  
  var STORAGE_KEY = 'cl-view-mode';
  var VIEWS = ['grid', 'card', 'list'];
  var VIEW_LABELS = { grid: '그리드', card: '카드', list: '리스트' };
  
  function getSavedView(){
    var v = null;
    try { v = localStorage.getItem(STORAGE_KEY); } catch(e){}
    if (VIEWS.indexOf(v) === -1) return 'grid';
    return v;
  }
  function saveView(v){ try { localStorage.setItem(STORAGE_KEY, v); } catch(e){} }
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
  function createFilterBar(){
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
    return bar;
  }
  
  function main(){
    if (!isTagPage()) return;
    var slug = getCurrentTagSlug();
    if (!slug || !isVvSlug(slug)) return;
    
    injectCSS();
    markNoImageCards();
    markFeed();
    insertCustomHeader(slug);
    applyView(getSavedView());
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
  } else {
    main();
  }
})();
