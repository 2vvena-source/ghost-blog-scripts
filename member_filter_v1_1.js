/*!
 * MEMBER-FILTER v1.1 (external hosted)
 * 배포: 2026-08-21 (v1.1 개선)
 * 로더 위치: Ghost Site Footer (single <script src=...> tag)
 * 
 * v1.1 변경사항 (v1 대비):
 *   [+] FOUC(깜빡임) 제거 - 스크립트 실행 전에 카드 미리 숨김, 판정 후 노출
 *   [+] 3초 안전망 - 스크립트 실패해도 카드가 영원히 숨겨지지 않음
 *   [+] 관리자에게는 원래 자물쇠 아이콘 그대로 표시 (필터가 카드 제거만 함)
 * 
 * 동작 요약:
 *   비로그인: 자물쇠 카드 + Hidden-* 태그 카드 완전 제거 (깜빡임 없이)
 *   로그인:   즉시 필터 해제 (자물쇠 아이콘 포함 원본 그대로 표시)
 *   관리자 페이지(/ghost/*): 실행 안 함
 * 
 * 향후 태그 페이지 만들 때: 카드 셀렉터 (.gh-card, .post-card 등) 안에 
 *   자물쇠 SVG 또는 Hidden-* 태그가 있으면 자동으로 이 필터가 걸림.
 *   새 태그 페이지 카드에도 같은 셀렉터를 쓰면 별도 코드 불필요.
 */
(function(){
  'use strict';
  
  // ============================================================
  // 0. 관리자 페이지에서는 절대 실행 안 함
  //    → FOUC CSS도 없으므로 편집기 미리보기 안전
  // ============================================================
  var path = (typeof window !== 'undefined' && window.location) ? window.location.pathname : '';
  if (path.indexOf('/ghost') === 0 || path === '/ghost') {
    // 관리자 페이지에서는 mf-checked 를 강제로 붙여 카드가 절대 안 숨겨지도록
    if (document.documentElement) {
      document.documentElement.classList.add('mf-checked');
    }
    return;
  }
  
  // ============================================================
  // 1. 중복 로드 방지
  // ============================================================
  if (window.__DDL_MEMBER_FILTER_LOADED) return;
  window.__DDL_MEMBER_FILTER_LOADED = true;
  
  // ============================================================
  // 2. CSS 를 <head>에 최우선 삽입
  //    (관리자 뱃지 + FOUC 방지 CSS)
  //    가능하면 <head> 파싱 극초기 삽입이 이상적이지만,
  //    이 스크립트는 defer 로드이므로 이미 <head> 있음.
  // ============================================================
  var CSS_TEXT = `/* 관리자에게만 나타나는 아주 작은 뱃지. 사이트 톤 유지. */
  body.mf-admin-view::before {
    content: "👁 admin view";
    position: fixed;
    top: 8px;
    right: 8px;
    z-index: 99998;
    padding: 4px 10px;
    background: var(--color, #0F3A3A);
    color: var(--base, #F5F5F5);
    font-family: 'Pretendard Variable','Pretendard',sans-serif;
    font-size: 11px;
    letter-spacing: -0.02em;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    pointer-events: none;
    opacity: 0.65;
  }
  body.mf-admin-view:hover::before { opacity: 1; }
  
  /* 관리자 페이지(/ghost/)에서는 이 뱃지도 안 보이게 (EDITOR-SAFE 원칙) */
  body.ddl-admin-safe::before { display: none !important; }
  /* ============================================================
     FOUC 방지 (Flash Of Unfiltered Content 방지)
     - 스크립트 실행 전, 자물쇠 있을 만한 카드를 미리 숨김
     - 관리자면 즉시 다시 보이게 (mf-admin-view)
     - 3초 안전망: 스크립트 실패해도 콘텐츠 사라짐 방지
     ============================================================ */
  
  /* 1단계: 스크립트가 아직 판정 못 한 상태 = 카드 전체 살짝 감춤 */
  /*        (사용자에게 완전 흰 화면 X, 카드만 살짝 반투명) */
  html:not(.mf-checked) .gh-card,
  html:not(.mf-checked) .post-card,
  html:not(.mf-checked) .sg-card,
  html:not(.mf-checked) .sg-list-item,
  html:not(.mf-checked) .sg-scroll-card {
    visibility: hidden;
  }
  
  /* 2단계: mf-checked 붙는 순간 = 판정 완료 = 남아있는 카드 다시 보이게 */
  html.mf-checked .gh-card,
  html.mf-checked .post-card,
  html.mf-checked .sg-card,
  html.mf-checked .sg-list-item,
  html.mf-checked .sg-scroll-card {
    visibility: visible;
  }
  
  /* 3단계: 안전망 - 3초 지나면 mf-checked 없어도 강제로 보이게
     (스크립트 로드 실패/오류 등 극단적 상황 대비) */
  @keyframes mf-fallback-show {
    to { visibility: visible; }
  }
  html:not(.mf-checked) .gh-card,
  html:not(.mf-checked) .post-card,
  html:not(.mf-checked) .sg-card,
  html:not(.mf-checked) .sg-list-item,
  html:not(.mf-checked) .sg-scroll-card {
    animation: mf-fallback-show 0s linear 3s forwards;
  }
`;
  
  function injectCSS(){
    if (document.getElementById('ddl-member-filter-style')) return;
    var st = document.createElement('style');
    st.id = 'ddl-member-filter-style';
    st.setAttribute('data-ddl-skin', '1');
    st.appendChild(document.createTextNode(CSS_TEXT));
    (document.head || document.documentElement).appendChild(st);
  }
  injectCSS();
  
  // ============================================================
  // 3. 필터 로직 (v1 원본 + v1.1 FOUC 해제 지점 추가)
  // ============================================================
(function(){
  'use strict';
  
  // ------------------------------------------------------------
  // 0. 관리자면 즉시 종료 (다 보이게)
  // ------------------------------------------------------------
  if (window.IS_MEMBER === true) {
    // 관리자 본인. 필터 미적용.
    // 즉시 html.mf-checked 붙여 FOUC 해제 (모든 카드 다시 보이게)
    document.documentElement.classList.add('mf-checked');
    // body 클래스는 body 존재 시점에 부여 (관리자 뱃지 표시용)
    if (document.body) document.body.classList.add('mf-admin-view');
    else document.addEventListener('DOMContentLoaded', function(){
      document.body.classList.add('mf-admin-view');
    });
    return;
  }
  
  // ------------------------------------------------------------
  // 1. 판별 함수들
  // ------------------------------------------------------------
  
  // 태그 slug/이름이 Hidden- 접두사인지 검사 (대소문자 무시)
  // - 일반 태그 "Hidden-메모"    → slug "hidden-메모"      → 매치
  // - 내부 태그 "#Hidden-메모"   → slug "hash-hidden-메모" → 매치
  // - name 원문 "Hidden-메모"    → 소문자화 "hidden-메모"  → 매치
  function isHiddenTagString(s){
    if (!s) return false;
    var t = String(s).toLowerCase();
    // 앞의 # 이나 hash- 접두어를 벗겨서 검사
    if (t.charAt(0) === '#') t = t.slice(1);
    if (t.indexOf('hash-') === 0) t = t.slice(5);
    return t.indexOf('hidden-') === 0;
  }
  
  // 카드 element 하나가 숨겨야 할 대상인지 판단
  function shouldHideCard(card){
    if (!card || !card.nodeType) return false;
    
    // (a) 자물쇠 SVG 존재 = 멤버공개글
    // Source 테마 post-card.hbs 에서 {{> "icons/lock"}} 로 삽입됨.
    // svg id 에 Lock 이 들어가거나, .post-card-access 같은 클래스가 붙음.
    if (card.querySelector('svg[id*="Lock"], svg[id*="lock"]')) return true;
    if (card.querySelector('.post-card-access, .gh-card-access')) return true;
    
    // (b) data-* 접근 표시
    var access = card.dataset && (card.dataset.access || card.dataset.visibility);
    if (access && /members|paid|private/i.test(access)) return true;
    
    // (c) post_class 계열 클래스: tag-hash-hidden-*, tag-hidden-*
    var cls = card.className || '';
    if (typeof cls !== 'string') cls = cls.toString();
    if (/\btag-hash-hidden-/i.test(cls)) return true;
    if (/\btag-hidden-/i.test(cls))      return true;
    
    // (d) 카드 안에 태그 라벨 텍스트가 노출된 경우 (Hidden-XXX)
    //     Source 테마에서 primary_tag 는 카드 위에 이름으로 표시됨.
    var labels = card.querySelectorAll('.gh-card-tags, .post-card-primary-tag, [class*="primary-tag"]');
    for (var i = 0; i < labels.length; i++){
      if (isHiddenTagString(labels[i].textContent)) return true;
    }
    
    // (e) 카드 안 링크 href 가 /tag/hidden-* 또는 /tag/hash-hidden-* 인지
    var links = card.querySelectorAll('a[href*="/tag/"]');
    for (var j = 0; j < links.length; j++){
      var href = links[j].getAttribute('href') || '';
      // /tag/hidden-XXX/ 또는 /tag/hash-hidden-XXX/
      if (/\/tag\/(hash-)?hidden-/i.test(href)) return true;
    }
    
    return false;
  }
  
  // 모든 카드 셀렉터 (Source 테마 + 우리 시리즈 갤러리 카드)
  var CARD_SELECTORS = [
    '.gh-card',                    // Source 홈 카드
    '.post-card',                  // Source 대체 셀렉터
    '.gh-postfeed article',        // 피드 아이템
    '.sg-card',                    // 시리즈 갤러리 카드 (우리 v5)
    '.sg-list-item',               // 시리즈 리스트형 (우리 v5)
    '.sg-scroll-card',             // 시리즈 가로형 (우리 v5)
    'article[class*="post"]',      // 안전망
    '[data-post-id]'               // 안전망
  ].join(',');
  
  // ------------------------------------------------------------
  // 2. 초기 필터: 페이지 로드 즉시
  // ------------------------------------------------------------
  function filterAllCards(root){
    var scope = root || document;
    var cards = scope.querySelectorAll(CARD_SELECTORS);
    var removed = 0;
    for (var i = 0; i < cards.length; i++){
      if (shouldHideCard(cards[i])){
        cards[i].style.display = 'none';   // 1차: 즉시 숨김 (레이아웃 튐 방지)
        // 2차: DOM에서 제거 (탐지 방지)
        // requestAnimationFrame 이후 지연 제거해서 다른 스크립트와 충돌 최소화
        (function(el){
          try {
            requestAnimationFrame(function(){
              if (el && el.parentNode) el.parentNode.removeChild(el);
            });
          } catch(e){}
        })(cards[i]);
        removed++;
      }
    }
    return removed;
  }
  
  // ------------------------------------------------------------
  // 3. MutationObserver: 나중에 추가되는 카드도 즉시 필터
  //    (시리즈 갤러리 v5 는 fetch 후 카드를 렌더하므로 이게 필수)
  // ------------------------------------------------------------
  function startObserver(){
    if (typeof MutationObserver === 'undefined') return;
    var observer = new MutationObserver(function(mutations){
      for (var i = 0; i < mutations.length; i++){
        var m = mutations[i];
        if (!m.addedNodes) continue;
        for (var j = 0; j < m.addedNodes.length; j++){
          var node = m.addedNodes[j];
          if (node.nodeType !== 1) continue;   // Element 만
          // 이 노드 자체가 카드인가?
          if (node.matches && node.matches(CARD_SELECTORS)){
            if (shouldHideCard(node)){
              node.style.display = 'none';
              if (node.parentNode) node.parentNode.removeChild(node);
              continue;
            }
          }
          // 이 노드 하위에 카드가 들어있는가?
          filterAllCards(node);
        }
      }
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }
  
  // ------------------------------------------------------------
  // 4. Content API fetch 인터셉트
  //    Ghost Content API 를 호출하는 자체 코드(시리즈 갤러리 등)
  //    가 응답을 받기 전에 서버측 필터를 강제로 붙이거나,
  //    이미 받은 응답에서 Hidden-/members 항목을 제거한다.
  // ------------------------------------------------------------
  var origFetch = window.fetch ? window.fetch.bind(window) : null;
  if (origFetch){
    window.fetch = function(input, init){
      var url = '';
      try {
        if (typeof input === 'string') url = input;
        else if (input && input.url) url = input.url;
      } catch(e){}
      
      var isGhostAPI = /\/ghost\/api\/(content|admin)\//i.test(url);
      var isPostsAPI = isGhostAPI && /\/posts\/?/i.test(url);
      var isTagsAPI  = isGhostAPI && /\/tags\/?/i.test(url);
      
      // 요청 URL 을 필요에 따라 강화 (public 만 요청)
      // 주의: Admin API 는 손대지 않음. Content API 만.
      // 우리는 이미 응답 필터도 하므로 URL 강화는 옵션.
      // (여기서는 응답 필터 위주로 안전하게 처리)
      
      return origFetch(input, init).then(function(res){
        if (!isGhostAPI) return res;
        if (!isPostsAPI && !isTagsAPI) return res;
        
        // 응답을 복제해서 JSON 파싱, 필터, 새 Response 반환
        return res.clone().json().then(function(data){
          try {
            // posts 배열 필터
            if (Array.isArray(data.posts)){
              data.posts = data.posts.filter(function(p){
                // 멤버공개글 제외
                if (p.visibility && p.visibility !== 'public') return false;
                // access 필드 (일부 응답에 있음)
                if (p.access === false) return false;
                // Hidden-* 태그가 붙었는지
                if (Array.isArray(p.tags)){
                  for (var k = 0; k < p.tags.length; k++){
                    var tg = p.tags[k];
                    if (isHiddenTagString(tg.slug) || isHiddenTagString(tg.name)) return false;
                  }
                }
                // primary_tag
                if (p.primary_tag){
                  if (isHiddenTagString(p.primary_tag.slug) ||
                      isHiddenTagString(p.primary_tag.name)) return false;
                }
                return true;
              });
              // meta.pagination.total 도 감소된 개수로 (근사)
              if (data.meta && data.meta.pagination){
                data.meta.pagination.total = data.posts.length;
              }
            }
            // tags 배열 필터 (태그 목록 API 응답)
            if (Array.isArray(data.tags)){
              data.tags = data.tags.filter(function(t){
                return !(isHiddenTagString(t.slug) || isHiddenTagString(t.name));
              });
            }
          } catch(e){
            // 파싱 실패시 원본 반환
            return res;
          }
          // 새 Response 로 반환
          var body = JSON.stringify(data);
          var newRes = new Response(body, {
            status: res.status,
            statusText: res.statusText,
            headers: res.headers
          });
          return newRes;
        }).catch(function(){
          // JSON 아님 → 원본 반환
          return res;
        });
      });
    };
  }
  
  // ------------------------------------------------------------
  // 5. XMLHttpRequest 인터셉트 (일부 구식 코드 대비)
  //    portal / sodo-search 가 XHR 로 요청할 경우 대비.
  //    응답을 완전히 재작성하는 건 XHR 구조상 복잡 → 여기서는
  //    응답 도착 후 DOM 상 카드/링크만 후속 정리.
  //    별도 처리 없이 MutationObserver 로 충분.
  // ------------------------------------------------------------
  
  // ------------------------------------------------------------
  // 6. RSS / sitemap / 검색창 관련 링크 페이지 노출 억제
  // ------------------------------------------------------------
  function hideDiscoveryLinks(){
    // 페이지 내에 RSS 아이콘 / sitemap 링크가 있을 경우 감춤
    var sels = [
      'a[href$="/rss/"]',
      'a[href$="/rss"]',
      'a[href*="/sitemap"]',
      'link[rel="alternate"][type="application/rss+xml"]'  // <head> 링크 (SEO에는 불리하지만 사용자 요구)
    ];
    sels.forEach(function(sel){
      document.querySelectorAll(sel).forEach(function(el){
        // link 태그(head)는 제거, a 태그는 감춤
        if (el.tagName === 'LINK'){
          if (el.parentNode) el.parentNode.removeChild(el);
        } else {
          el.style.display = 'none';
        }
      });
    });
  }
  
  // ------------------------------------------------------------
  // 7. 검색창(portal search / sodo-search) 결과 필터
  //    sodo-search 는 iframe 안에서 동작하므로 직접 접근 어려움.
  //    대신 검색 iframe 등장 시점을 감지하고, 그 안의 결과 링크가
  //    /tag/hidden- / /tag/hash-hidden- 이면 감춤 시도.
  //    (iframe cross-origin 이면 실패 가능. 최대 시도.)
  // ------------------------------------------------------------
  function trySearchFilter(){
    var iframes = document.querySelectorAll('iframe[src*="sodo-search"], iframe[title*="earch"], iframe[title*="검색"]');
    iframes.forEach(function(f){
      try {
        var doc = f.contentDocument;
        if (!doc) return;
        var results = doc.querySelectorAll('a[href*="/"]');
        results.forEach(function(a){
          var h = a.getAttribute('href') || '';
          if (/\/tag\/(hash-)?hidden-/i.test(h)) {
            var card = a.closest('article, li, .search-result, .result-item, div');
            if (card) card.style.display = 'none';
            else a.style.display = 'none';
          }
        });
      } catch(e){
        // cross-origin → 무시
      }
    });
  }
  
  // ------------------------------------------------------------
  // 8. 실행 순서
  // ------------------------------------------------------------
  function boot(){
    filterAllCards();
    // FOUC 해제: 필터 완료 → 남은 카드는 즉시 보이게
    document.documentElement.classList.add('mf-checked');
    startObserver();
    hideDiscoveryLinks();
    // 검색 필터는 조금 늦게 (iframe 로드 후)
    setTimeout(trySearchFilter, 800);
    setTimeout(trySearchFilter, 2500);
    // 사용자가 검색창을 나중에 열 수도 있으므로 주기적 재시도
    setInterval(trySearchFilter, 4000);
  }
  
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
})();
