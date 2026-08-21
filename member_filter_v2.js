/*!
 * MEMBER-FILTER v2 (external hosted, footer part)
 * 배포: 2026-08-21
 * 로더 위치: Ghost Site Footer (single <script src=...> tag)
 * 
 * [v2 구조]
 *   - Header 인라인 (Site Header에 직접 삽입): 첫 프레임 은닉 CSS + 즉시 판정
 *   - Footer 로더 (이 파일, GitHub 호스팅): 부가 기능 전체
 * 
 * [이 파일의 역할]
 *   1. 관리자에게 자물쇠 아이콘 삽입 (Content API 로 멤버글 조회 후)
 *   2. body 에 mf-admin-view / mf-checked 클래스 부여
 *   3. MutationObserver 로 나중에 로드되는 카드 (시리즈 갤러리 등) 실시간 필터
 *   4. window.fetch 인터셉트 → Content API 응답에서 Hidden-*, 멤버글 제거
 *   5. RSS / sitemap 링크 페이지 노출 억제
 *   6. Portal 검색 iframe 결과 최대 은닉 시도
 * 
 * [안전장치]
 *   - 관리자 페이지 (/ghost/*): 즉시 종료
 *   - 중복 로드 방지: window.__DDL_MEMBER_FILTER_V2_LOADED
 *   - 오류 발생해도 사이트 나머지 부분에는 영향 없음 (try-catch)
 */
(function(){
  'use strict';
  
  // ============================================================
  // 0. 관리자 페이지에서는 절대 실행 안 함
  // ============================================================
  var path = (typeof window !== 'undefined' && window.location) ? window.location.pathname : '';
  if (path.indexOf('/ghost') === 0 || path === '/ghost') {
    return;
  }
  
  // ============================================================
  // 1. 중복 로드 방지
  // ============================================================
  if (window.__DDL_MEMBER_FILTER_V2_LOADED) return;
  window.__DDL_MEMBER_FILTER_V2_LOADED = true;
  
  // ============================================================
  // 1-B. CSS 삽입 (관리자 뱃지 + 자물쇠 아이콘 스타일)
  //      헤더 인라인은 은닉 CSS 만 담당. 여기서 표시용 CSS 추가.
  // ============================================================
  (function injectAdminCSS(){
    if (document.getElementById('mf-admin-style')) return;
    var css = ''
      + 'body.mf-admin-view::before{'
      +   'content:"\uD83D\uDC41 admin view";'
      +   'position:fixed;top:8px;right:8px;z-index:99998;'
      +   'padding:4px 10px;'
      +   'background:var(--color,#0F3A3A);'
      +   'color:var(--base,#F5F5F5);'
      +   'font-family:"Pretendard Variable","Pretendard",sans-serif;'
      +   'font-size:11px;letter-spacing:-0.02em;'
      +   'border-radius:12px;'
      +   'box-shadow:0 2px 8px rgba(0,0,0,0.15);'
      +   'pointer-events:none;opacity:0.65;'
      + '}'
      + 'body.mf-admin-view:hover::before{opacity:1;}'
      + 'body.ddl-admin-safe::before{display:none !important;}'
      + '.mf-admin-lock{'
      +   'display:inline-flex;align-items:center;justify-content:center;'
      +   'width:20px;height:20px;'
      +   'color:var(--color,#0F3A3A);opacity:0.65;'
      +   'vertical-align:middle;margin-right:0.3em;'
      + '}'
      + '.mf-admin-lock svg{width:100%;height:100%;}';
    var st = document.createElement('style');
    st.id = 'mf-admin-style';
    st.setAttribute('data-ddl-skin', '1');
    st.appendChild(document.createTextNode(css));
    (document.head || document.documentElement).appendChild(st);
  })();
  
  // ============================================================
  // 2. 판별 함수: 태그 문자열이 Hidden- 접두사인지
  //    - "Hidden-메모"      → 매치
  //    - "#Hidden-메모"     → 매치 
  //    - "hash-hidden-메모" → 매치
  //    - "HIDDEN-메모"      → 매치 (대소문자 무관)
  // ============================================================
  function isHiddenTagString(s){
    if (!s) return false;
    var t = String(s).toLowerCase();
    if (t.charAt(0) === '#') t = t.slice(1);
    if (t.indexOf('hash-') === 0) t = t.slice(5);
    return t.indexOf('hidden-') === 0;
  }
  
  // 카드 element 가 숨겨야 할 대상인지 판단
  function shouldHideCard(card){
    if (!card || !card.nodeType) return false;
    
    // (a) 자물쇠 SVG 존재 = 멤버공개글
    if (card.querySelector('svg[id^="Lock"]')) return true;
    if (card.querySelector('.post-card-access, .gh-card-access')) return true;
    
    // (b) data-* 접근 표시
    var access = card.dataset && (card.dataset.access || card.dataset.visibility);
    if (access && /members|paid|private/i.test(access)) return true;
    
    // (c) post_class 계열
    var cls = card.className || '';
    if (typeof cls !== 'string') cls = cls.toString();
    if (/\btag-hash-hidden-/i.test(cls)) return true;
    if (/\btag-hidden-/i.test(cls))      return true;
    
    // (d) 카드 안 태그 라벨 텍스트
    var labels = card.querySelectorAll('.gh-card-tags, .post-card-primary-tag, [class*="primary-tag"]');
    for (var i = 0; i < labels.length; i++){
      if (isHiddenTagString(labels[i].textContent)) return true;
    }
    
    // (e) 카드 안 링크가 /tag/hidden- 계열
    var links = card.querySelectorAll('a[href*="/tag/"]');
    for (var j = 0; j < links.length; j++){
      var href = links[j].getAttribute('href') || '';
      if (/\/tag\/(hash-)?hidden-/i.test(href)) return true;
    }
    
    return false;
  }
  
  // 모든 카드 셀렉터 (Source 테마 + 시리즈 갤러리)
  var CARD_SELECTORS = [
    '.gh-card',
    '.post-card',
    '.gh-postfeed article',
    '.sg-card',
    '.sg-list-item',
    '.sg-scroll-card',
    'article[class*="post"]',
    '[data-post-id]'
  ].join(',');
  
  // ============================================================
  // 3. 로그인 여부 (헤더 인라인이 이미 처리했지만 우리도 재확인)
  // ============================================================
  var isMember = (window.IS_MEMBER === true);
  
  // ============================================================
  // 4. 관리자 처리: mf-admin-view 뱃지 붙이기 + mf-checked
  // ============================================================
  function markAdminBody(){
    if (!document.body) return;
    document.body.classList.add('mf-admin-view');
    document.body.classList.add('mf-checked');
  }
  
  // ============================================================
  // 5. 비관리자 처리: 카드 필터 실행 + mf-checked (CSS 안전망 해제)
  // ============================================================
  function filterAllCards(root){
    var scope = root || document;
    var cards = scope.querySelectorAll(CARD_SELECTORS);
    var removed = 0;
    for (var i = 0; i < cards.length; i++){
      if (shouldHideCard(cards[i])){
        cards[i].style.display = 'none';
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
  
  function markGuestBody(){
    if (!document.body) return;
    document.body.classList.add('mf-checked');
    // 헤더의 mf-guest 는 그대로 유지 (CSS 계속 활성 = 새로 로드되는 카드도 즉시 숨김)
  }
  
  // ============================================================
  // 6. MutationObserver: 시리즈 갤러리 등 나중에 로드되는 카드도 필터
  // ============================================================
  function startObserver(){
    if (typeof MutationObserver === 'undefined') return;
    var observer = new MutationObserver(function(mutations){
      for (var i = 0; i < mutations.length; i++){
        var m = mutations[i];
        if (!m.addedNodes) continue;
        for (var j = 0; j < m.addedNodes.length; j++){
          var node = m.addedNodes[j];
          if (node.nodeType !== 1) continue;
          try {
            if (node.matches && node.matches(CARD_SELECTORS)){
              if (shouldHideCard(node)){
                node.style.display = 'none';
                if (node.parentNode) node.parentNode.removeChild(node);
                continue;
              }
            }
            filterAllCards(node);
          } catch(e){}
        }
      }
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }
  
  // ============================================================
  // 7. fetch 인터셉트: Content API 응답에서 Hidden-*, 멤버글 제거
  //    관리자에게는 필요없음 (다 보여야 함).
  //    비관리자에게만 필터.
  // ============================================================
  function setupFetchIntercept(){
    var origFetch = window.fetch ? window.fetch.bind(window) : null;
    if (!origFetch) return;
    
    window.fetch = function(input, init){
      var url = '';
      try {
        if (typeof input === 'string') url = input;
        else if (input && input.url) url = input.url;
      } catch(e){}
      
      var isGhostAPI = /\/ghost\/api\/(content|admin)\//i.test(url);
      var isPostsAPI = isGhostAPI && /\/posts\/?/i.test(url);
      var isTagsAPI  = isGhostAPI && /\/tags\/?/i.test(url);
      
      return origFetch(input, init).then(function(res){
        if (!isGhostAPI) return res;
        if (!isPostsAPI && !isTagsAPI) return res;
        
        return res.clone().json().then(function(data){
          try {
            if (Array.isArray(data.posts)){
              data.posts = data.posts.filter(function(p){
                if (p.visibility && p.visibility !== 'public') return false;
                if (p.access === false) return false;
                if (Array.isArray(p.tags)){
                  for (var k = 0; k < p.tags.length; k++){
                    var tg = p.tags[k];
                    if (isHiddenTagString(tg.slug) || isHiddenTagString(tg.name)) return false;
                  }
                }
                if (p.primary_tag){
                  if (isHiddenTagString(p.primary_tag.slug) ||
                      isHiddenTagString(p.primary_tag.name)) return false;
                }
                return true;
              });
              if (data.meta && data.meta.pagination){
                data.meta.pagination.total = data.posts.length;
              }
            }
            if (Array.isArray(data.tags)){
              data.tags = data.tags.filter(function(t){
                return !(isHiddenTagString(t.slug) || isHiddenTagString(t.name));
              });
            }
          } catch(e){
            return res;
          }
          var body = JSON.stringify(data);
          return new Response(body, {
            status: res.status,
            statusText: res.statusText,
            headers: res.headers
          });
        }).catch(function(){
          return res;
        });
      });
    };
  }
  
  // ============================================================
  // 8. RSS / sitemap 링크 페이지 노출 억제
  // ============================================================
  function hideDiscoveryLinks(){
    var sels = [
      'a[href$="/rss/"]',
      'a[href$="/rss"]',
      'a[href*="/sitemap"]',
      'link[rel="alternate"][type="application/rss+xml"]'
    ];
    sels.forEach(function(sel){
      try {
        document.querySelectorAll(sel).forEach(function(el){
          if (el.tagName === 'LINK'){
            if (el.parentNode) el.parentNode.removeChild(el);
          } else {
            el.style.display = 'none';
          }
        });
      } catch(e){}
    });
  }
  
  // ============================================================
  // 9. 검색 iframe 필터 (Portal / sodo-search)
  // ============================================================
  function trySearchFilter(){
    try {
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
        } catch(e){}
      });
    } catch(e){}
  }
  
  // ============================================================
  // 10. 관리자 전용: 카드에 인공 자물쇠 아이콘 삽입
  //     관리자 로그인 상태에서는 서버가 자물쇠를 안 그림.
  //     Content API 로 각 카드의 slug 뽑아 visibility 조회 후 삽입.
  // ============================================================
  var LOCK_SVG_MARKUP = 
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" height="20" width="20" id="Lock-1--Streamline-Ultimate">' +
    '<defs></defs><title>lock-1</title>' +
    '<path d="M4.375 8.125h11.25s1.25 0 1.25 1.25v8.75s0 1.25 -1.25 1.25H4.375s-1.25 0 -1.25 -1.25v-8.75s0 -1.25 1.25 -1.25" fill="none" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"></path>' +
    '<path d="M5.625 8.125V5a4.375 4.375 0 0 1 8.75 0v3.125" fill="none" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"></path>' +
    '<path d="m10 12.5 0 2.5" fill="none" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"></path>' +
    '</svg>';
  
  var CONTENT_API_KEY = '39b17c3fb020743b7da0116c24';
  var CONTENT_API_BASE = window.location.origin + '/ghost/api/content';
  
  function fetchMemberSlugs(){
    // 관리자 상태에서도 Content API 는 public 응답만 줌.
    // 그래서 "홈에 있는 카드 slug 목록" 뽑고, 그 중 API 응답에 없는 것 = 멤버글
    return fetch(CONTENT_API_BASE + '/posts/?key=' + CONTENT_API_KEY + '&filter=visibility:public&limit=all&fields=slug')
      .then(function(r){ return r.json(); })
      .then(function(d){
        var publicSlugs = new Set();
        if (d && Array.isArray(d.posts)){
          d.posts.forEach(function(p){ publicSlugs.add(p.slug); });
        }
        return publicSlugs;
      })
      .catch(function(){ return new Set(); });
  }
  
  function insertAdminLocks(publicSlugs){
    // 화면상 모든 카드 순회 → 카드 링크에서 slug 뽑아 publicSlugs 에 없으면 멤버글
    document.querySelectorAll(CARD_SELECTORS).forEach(function(card){
      // 이미 자물쇠 표시된 카드는 스킵 (중복 방지)
      if (card.querySelector('.mf-admin-lock, svg[id^="Lock"]')) return;
      
      // 카드에서 게시글 slug 추출: <a href="/some-slug/">
      var link = card.querySelector('a[href^="/"]:not([href*="/tag/"]):not([href*="/author/"])');
      if (!link) return;
      var href = link.getAttribute('href') || '';
      // "/some-slug/" 또는 "/some-slug" 에서 슬래시 사이 부분 추출
      var m = href.match(/^\/([^\/\?#]+)\/?$/);
      if (!m) return;
      var slug = m[1];
      
      // 이 slug 가 공개 카드 목록에 없으면 = 멤버글
      if (publicSlugs.has(slug)) return;  // 공개글 → 자물쇠 안 붙임
      
      // 이 카드는 멤버글. 자물쇠 삽입.
      // 원본 서버가 넣던 위치와 동일하게 <footer.gh-card-meta> 안 맨 앞에
      var metaFooter = card.querySelector('.gh-card-meta, .post-card-meta, footer');
      var lockSpan = document.createElement('span');
      lockSpan.className = 'mf-admin-lock';
      lockSpan.innerHTML = LOCK_SVG_MARKUP;
      lockSpan.title = '멤버 전용 글';
      
      if (metaFooter){
        metaFooter.insertBefore(lockSpan, metaFooter.firstChild);
      } else {
        // 메타 영역 없으면 카드 안 맨 앞에
        card.insertBefore(lockSpan, card.firstChild);
      }
    });
  }
  
  function setupAdminLockDisplay(){
    fetchMemberSlugs().then(function(publicSlugs){
      insertAdminLocks(publicSlugs);
      // 시리즈 갤러리는 나중에 로드되므로 여러 번 재시도
      setTimeout(function(){ insertAdminLocks(publicSlugs); }, 800);
      setTimeout(function(){ insertAdminLocks(publicSlugs); }, 2000);
      setTimeout(function(){ insertAdminLocks(publicSlugs); }, 4000);
    });
  }
  
  // ============================================================
  // 11. 부팅
  // ============================================================
  function boot(){
    try {
      if (isMember) {
        // 관리자
        markAdminBody();
        setupAdminLockDisplay();     // 자물쇠 아이콘 삽입
        // 관리자에게는 fetch/DOM 필터 안 함 (다 보여야 함)
      } else {
        // 비관리자
        filterAllCards();            // 이미 CSS 로 숨겨진 것을 DOM 에서도 제거
        markGuestBody();
        startObserver();             // 나중에 로드되는 카드도 필터
        setupFetchIntercept();       // API 응답 필터
        hideDiscoveryLinks();        // RSS/sitemap 링크 감춤
        setTimeout(trySearchFilter, 800);
        setTimeout(trySearchFilter, 2500);
        setInterval(trySearchFilter, 4000);
      }
    } catch(e){
      // 어떤 오류가 있어도 사이트 나머지 부분에 영향 없게
      if (window.console && console.error){
        console.error('[member-filter v2] boot error:', e);
      }
      // 안전망: mf-guest 해제 (사이트 텅비지 않게)
      if (document.documentElement){
        document.documentElement.classList.remove('mf-guest');
      }
    }
  }
  
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
