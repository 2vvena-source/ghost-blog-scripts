/*!
 * RELATED-POSTS-TABS v1 (external hosted)
 * 배포: 2026-08-27
 * 로더 위치: Ghost Site Footer
 *
 * 역할:
 *   개별 글 페이지 하단의 Ghost 기본 관련글 (gh-container.is-grid) 을 숨기고
 *   그 자리에 3탭 관련글 섹션을 새로 렌더링.
 *
 *   [탭 1] 기본: 이전글 / (현재글) / 다음글
 *   [탭 2] 시리즈 최신글: 현재 글이 속한 시리즈 (tag-series-XXX) 의 최신 3개
 *   [탭 3] 사이트 최신글: 전체 사이트 최신 3개
 *
 * DESIGN_RULES 준수:
 *   - 3색 팔레트만 (#0F3A3A, #F5F5F5, #FF9A76)
 *   - 폰트: Pretendard / Gowun Batang
 *   - stroke 1.6px
 *
 * 안전장치:
 *   - 개별 글 페이지 (post-template) 에서만 실행
 *   - 관리자 페이지 (/ghost/*) 실행 안 함
 *   - 중복 로드 방지 (window.__DDL_RELATED_TABS_LOADED)
 *   - try-catch 로 오류 격리
 */
(function(){
  'use strict';

  // 관리자 페이지 격리
  var path = (typeof window !== 'undefined' && window.location) ? window.location.pathname : '';
  if (path.indexOf('/ghost') === 0 || path === '/ghost') return;

  // 중복 로드 방지
  if (window.__DDL_RELATED_TABS_LOADED) return;
  window.__DDL_RELATED_TABS_LOADED = true;

  var API_KEY = '39b17c3fb020743b7da0116c24';
  var API_BASE = window.location.origin + '/ghost/api/content';

  // ─── 페이지 판별 ───
  function isPostPage(){
    var body = document.body;
    if (!body || !body.classList) return false;
    // 개별 글 페이지만
    if (!body.classList.contains('post-template')) return false;
    return true;
  }

  // ─── CSS 주입 ───
  var CSS_TEXT = ''
    // 컨테이너
    + '.ddl-rt {'
    + '  max-width: var(--content-width, 720px);'
    + '  margin: 3em auto 2em auto;'
    + '  padding: 0 4vmin;'
    + '  font-family: "Pretendard Variable","Pretendard",sans-serif;'
    + '  color: #0F3A3A;'
    + '  box-sizing: border-box;'
    + '}'
    // 탭 헤더
    + '.ddl-rt-tabs {'
    + '  display: flex; justify-content: center; align-items: center;'
    + '  gap: 0.4em;'
    + '  padding: 0 0 0.9em 0;'
    + '  margin: 0 0 1.4em 0;'
    + '  border-bottom: 1px solid rgba(15,58,58,0.35);'
    + '  font-family: "Gowun Batang","Nanum Myeongjo",serif;'
    + '}'
    + '.ddl-rt-tab {'
    + '  background: transparent; border: none; padding: 0.4em 1em;'
    + '  font-family: inherit; font-size: 1em;'
    + '  color: #0F3A3A; cursor: pointer;'
    + '  transition: color 0.15s;'
    + '  line-height: 1.3;'
    + '}'
    + '.ddl-rt-tab:hover { color: #FF9A76; }'
    + '.ddl-rt-tab.is-active {'
    + '  color: #FF9A76;'
    + '  text-decoration: underline double #FF9A76;'
    + '  text-underline-offset: 4px;'
    + '  font-weight: 600;'
    + '}'
    + '.ddl-rt-sep { color: #0F3A3A; opacity: 0.3; user-select: none; }'
    // 패널
    + '.ddl-rt-panel { display: none; }'
    + '.ddl-rt-panel.is-active { display: block; }'
    // 카드 리스트
    + '.ddl-rt-list {'
    + '  display: grid; grid-template-columns: repeat(3, minmax(0, 1fr));'
    + '  gap: 1em;'
    + '  list-style: none; padding: 0; margin: 0;'
    + '}'
    + '@media (max-width: 720px) {'
    + '  .ddl-rt-list { grid-template-columns: 1fr; gap: 0.6em; }'
    + '}'
    // 카드
    + '.ddl-rt-card {'
    + '  border: 1px solid rgba(15,58,58,0.35);'
    + '  border-radius: 4px;'
    + '  overflow: hidden;'
    + '  transition: border-color 0.15s, transform 0.15s;'
    + '  background: #F5F5F5;'
    + '  display: flex; flex-direction: column;'
    + '  min-height: 100px;'
    + '}'
    + '.ddl-rt-card:hover {'
    + '  border-color: #FF9A76;'
    + '  transform: translateY(-2px);'
    + '}'
    + '.ddl-rt-card.is-current {'
    + '  border-color: #FF9A76;'
    + '  background: rgba(255,154,118,0.08);'
    + '}'
    + '.ddl-rt-card-link {'
    + '  display: flex; flex-direction: column;'
    + '  height: 100%;'
    + '  text-decoration: none !important; color: inherit !important;'
    + '  padding: 0;'
    + '}'
    + '.ddl-rt-card.is-current .ddl-rt-card-link { cursor: default; pointer-events: none; }'
    // 카드 라벨 (이전/현재/다음)
    + '.ddl-rt-card-label {'
    + '  font-size: 0.7em; letter-spacing: 0.05em;'
    + '  opacity: 0.6; padding: 0.6em 0.8em 0 0.8em;'
    + '  text-transform: uppercase;'
    + '}'
    + '.ddl-rt-card.is-current .ddl-rt-card-label { color: #FF9A76; opacity: 1; }'
    // 카드 썸네일
    + '.ddl-rt-card-thumb {'
    + '  width: 100%;'
    + '  aspect-ratio: 16 / 10;'
    + '  overflow: hidden;'
    + '  background: rgba(15,58,58,0.06);'
    + '  position: relative;'
    + '}'
    + '.ddl-rt-card-thumb img {'
    + '  width: 100%; height: 100%; object-fit: cover; display: block;'
    + '}'
    // 썸네일 없는 카드 (빗금)
    + '.ddl-rt-card-thumb.is-empty {'
    + '  background-image: linear-gradient(-45deg, transparent 49%, rgba(15,58,58,0.15) 49%, rgba(15,58,58,0.15) 51%, transparent 51%);'
    + '  background-size: 8px 8px;'
    + '}'
    // 카드 본문
    + '.ddl-rt-card-body {'
    + '  flex: 1; display: flex; flex-direction: column;'
    + '  padding: 0.7em 0.9em 0.9em 0.9em;'
    + '}'
    + '.ddl-rt-card-title {'
    + '  font-family: "Gowun Batang","Nanum Myeongjo",serif;'
    + '  font-size: 1em; line-height: 1.35;'
    + '  color: #0F3A3A;'
    + '  margin: 0 0 0.4em 0;'
    + '  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;'
    + '  overflow: hidden;'
    + '}'
    + '.ddl-rt-card-meta {'
    + '  font-size: 0.75em; opacity: 0.6; margin-top: auto;'
    + '}'
    // 빈 패널 안내
    + '.ddl-rt-empty {'
    + '  text-align: center; padding: 2em 1em;'
    + '  color: #0F3A3A; opacity: 0.6; font-size: 0.9em;'
    + '  font-family: "Gowun Batang",serif;'
    + '}'
    // 로딩
    + '.ddl-rt-loading {'
    + '  text-align: center; padding: 2em 1em;'
    + '  color: #0F3A3A; opacity: 0.5; font-size: 0.9em;'
    + '}'
    + '';

  function injectCSS(){
    if (document.getElementById('ddl-related-tabs-css')) return;
    var s = document.createElement('style');
    s.id = 'ddl-related-tabs-css';
    s.setAttribute('data-ddl-skin', '1');
    s.textContent = CSS_TEXT;
    (document.head || document.documentElement).appendChild(s);
  }

  // ─── Ghost API ───
  function apiGet(endpoint, params){
    var qs = Object.keys(params || {}).map(function(k){
      return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]);
    }).join('&');
    var url = API_BASE + endpoint + '?key=' + API_KEY + (qs ? '&' + qs : '');
    return fetch(url).then(function(r){
      if (!r.ok) throw new Error('API ' + r.status);
      return r.json();
    });
  }

  // ─── 현재 글 정보 ───
  function getCurrentSlug(){
    var m = path.match(/^\/([^\/]+)\/?$/);
    return m ? m[1] : null;
  }
  function getCurrentSeries(){
    var body = document.body;
    if (!body || !body.classList) return null;
    var cls = body.className || '';
    var m = cls.match(/tag-series-[a-z0-9\u3131-\uD79D-]+/i);
    if (!m) return null;
    return m[0].replace(/^tag-/, ''); // 'series-XXX'
  }

  // ─── 유틸: 날짜 포맷 ───
  function fmtDate(iso){
    if (!iso) return '';
    try {
      var d = new Date(iso);
      var y = d.getFullYear();
      var mo = String(d.getMonth() + 1).padStart(2, '0');
      var da = String(d.getDate()).padStart(2, '0');
      return y + '.' + mo + '.' + da;
    } catch(e){ return ''; }
  }

  // ─── 유틸: 카드 만들기 ───
  function makeCard(post, opts){
    opts = opts || {};
    var card = document.createElement(opts.isCurrent ? 'div' : 'a');
    card.className = 'ddl-rt-card' + (opts.isCurrent ? ' is-current' : '');
    if (!opts.isCurrent && post && post.url){
      card.href = post.url;
    }

    // 링크 래퍼 (a로 만들었으면 자체가 링크, div이면 안 감쌈)
    var linkEl = card;
    linkEl.classList.add('ddl-rt-card-link');

    // 라벨 (있으면)
    if (opts.label){
      var lb = document.createElement('div');
      lb.className = 'ddl-rt-card-label';
      lb.textContent = opts.label;
      linkEl.appendChild(lb);
    }

    // 썸네일
    var thumb = document.createElement('div');
    thumb.className = 'ddl-rt-card-thumb';
    if (post && post.feature_image){
      var img = document.createElement('img');
      img.src = post.feature_image;
      img.alt = post.title || '';
      img.loading = 'lazy';
      thumb.appendChild(img);
    } else {
      thumb.classList.add('is-empty');
    }
    linkEl.appendChild(thumb);

    // 본문
    var body = document.createElement('div');
    body.className = 'ddl-rt-card-body';
    var title = document.createElement('h3');
    title.className = 'ddl-rt-card-title';
    title.textContent = (post && post.title) || '(제목 없음)';
    body.appendChild(title);
    var meta = document.createElement('div');
    meta.className = 'ddl-rt-card-meta';
    meta.textContent = fmtDate(post && (post.published_at || post.updated_at));
    body.appendChild(meta);
    linkEl.appendChild(body);

    return card;
  }

  // ─── 탭 1: 이전/현재/다음 ───
  function loadTabBasic(panel, currentSlug){
    panel.innerHTML = '<div class="ddl-rt-loading">불러오는 중…</div>';
    // 발행일 내림차순으로 전체 목록 가져와서 현재 글의 앞뒤 찾기
    apiGet('/posts/', {
      limit: '100',
      fields: 'id,title,slug,url,feature_image,published_at',
      filter: 'visibility:public',
      order: 'published_at desc'
    }).then(function(data){
      var posts = (data && data.posts) || [];
      // 현재 글 인덱스
      var idx = -1;
      for (var i = 0; i < posts.length; i++){
        if (posts[i].slug === currentSlug){ idx = i; break; }
      }
      // 배열이 발행일 desc 이므로: 이전(더 최신) = idx-1, 다음(더 오래됨) = idx+1
      // 사용자 관점: 이전글=더 오래된 글, 다음글=더 새로운 글 (통상적 블로그 UX)
      // → prev = 오래된 방향 = idx+1, next = 최신 방향 = idx-1
      var prev = idx >= 0 && idx + 1 < posts.length ? posts[idx + 1] : null;
      var current = idx >= 0 ? posts[idx] : null;
      var next = idx > 0 ? posts[idx - 1] : null;

      panel.innerHTML = '';
      var list = document.createElement('div');
      list.className = 'ddl-rt-list';

      // 이전
      if (prev){
        list.appendChild(makeCard(prev, { label: '이전 글' }));
      } else {
        var emptyPrev = document.createElement('div');
        emptyPrev.className = 'ddl-rt-card';
        emptyPrev.innerHTML = '<div class="ddl-rt-card-link"><div class="ddl-rt-card-label">이전 글</div><div class="ddl-rt-card-thumb is-empty"></div><div class="ddl-rt-card-body"><h3 class="ddl-rt-card-title" style="opacity:0.4;">더 이전 글이 없습니다</h3></div></div>';
        list.appendChild(emptyPrev);
      }
      // 현재
      if (current){
        list.appendChild(makeCard(current, { label: '지금 이 글', isCurrent: true }));
      }
      // 다음
      if (next){
        list.appendChild(makeCard(next, { label: '다음 글' }));
      } else {
        var emptyNext = document.createElement('div');
        emptyNext.className = 'ddl-rt-card';
        emptyNext.innerHTML = '<div class="ddl-rt-card-link"><div class="ddl-rt-card-label">다음 글</div><div class="ddl-rt-card-thumb is-empty"></div><div class="ddl-rt-card-body"><h3 class="ddl-rt-card-title" style="opacity:0.4;">더 최신 글이 없습니다</h3></div></div>';
        list.appendChild(emptyNext);
      }

      panel.appendChild(list);
    }).catch(function(err){
      panel.innerHTML = '<div class="ddl-rt-empty">불러오지 못했습니다</div>';
      if (window.console) console.warn('[related-tabs] basic error:', err);
    });
  }

  // ─── 탭 2: 시리즈 최신 3개 ───
  function loadTabSeries(panel, seriesTag, currentSlug){
    if (!seriesTag){
      panel.innerHTML = '<div class="ddl-rt-empty">이 글은 시리즈에 속해있지 않습니다</div>';
      return;
    }
    panel.innerHTML = '<div class="ddl-rt-loading">불러오는 중…</div>';
    apiGet('/posts/', {
      limit: '5',
      fields: 'id,title,slug,url,feature_image,published_at',
      filter: 'tag:' + seriesTag,
      order: 'published_at desc'
    }).then(function(data){
      var posts = ((data && data.posts) || []).filter(function(p){
        return p.slug !== currentSlug;
      }).slice(0, 3);

      panel.innerHTML = '';
      if (posts.length === 0){
        panel.innerHTML = '<div class="ddl-rt-empty">이 시리즈에 다른 글이 없습니다</div>';
        return;
      }
      var list = document.createElement('div');
      list.className = 'ddl-rt-list';
      posts.forEach(function(p){ list.appendChild(makeCard(p, {})); });
      panel.appendChild(list);
    }).catch(function(err){
      panel.innerHTML = '<div class="ddl-rt-empty">불러오지 못했습니다</div>';
      if (window.console) console.warn('[related-tabs] series error:', err);
    });
  }

  // ─── 탭 3: 사이트 최신 3개 ───
  function loadTabLatest(panel, currentSlug){
    panel.innerHTML = '<div class="ddl-rt-loading">불러오는 중…</div>';
    apiGet('/posts/', {
      limit: '5',
      fields: 'id,title,slug,url,feature_image,published_at',
      filter: 'visibility:public',
      order: 'published_at desc'
    }).then(function(data){
      var posts = ((data && data.posts) || []).filter(function(p){
        return p.slug !== currentSlug;
      }).slice(0, 3);

      panel.innerHTML = '';
      if (posts.length === 0){
        panel.innerHTML = '<div class="ddl-rt-empty">다른 글이 없습니다</div>';
        return;
      }
      var list = document.createElement('div');
      list.className = 'ddl-rt-list';
      posts.forEach(function(p){ list.appendChild(makeCard(p, {})); });
      panel.appendChild(list);
    }).catch(function(err){
      panel.innerHTML = '<div class="ddl-rt-empty">불러오지 못했습니다</div>';
      if (window.console) console.warn('[related-tabs] latest error:', err);
    });
  }

  // ─── 렌더 ───
  function render(){
    // 기본 관련글 섹션 숨기기 (있으면)
    document.querySelectorAll('.gh-container.is-grid').forEach(function(el){
      el.style.setProperty('display', 'none', 'important');
    });

    // 이미 우리 것 있으면 skip
    if (document.querySelector('.ddl-rt')) return;

    var currentSlug = getCurrentSlug();
    var seriesTag = getCurrentSeries();

    // 컨테이너
    var container = document.createElement('section');
    container.className = 'ddl-rt';
    container.setAttribute('aria-label', '관련 글');

    // 탭 헤더
    var tabsBar = document.createElement('div');
    tabsBar.className = 'ddl-rt-tabs';

    var tab1 = document.createElement('button');
    tab1.type = 'button';
    tab1.className = 'ddl-rt-tab is-active';
    tab1.setAttribute('data-tab', 'basic');
    tab1.textContent = '기본';

    var sep1 = document.createElement('span');
    sep1.className = 'ddl-rt-sep';
    sep1.textContent = '·';

    var tab2 = document.createElement('button');
    tab2.type = 'button';
    tab2.className = 'ddl-rt-tab';
    tab2.setAttribute('data-tab', 'series');
    tab2.textContent = '시리즈 최신';

    var sep2 = document.createElement('span');
    sep2.className = 'ddl-rt-sep';
    sep2.textContent = '·';

    var tab3 = document.createElement('button');
    tab3.type = 'button';
    tab3.className = 'ddl-rt-tab';
    tab3.setAttribute('data-tab', 'latest');
    tab3.textContent = '사이트 최신';

    tabsBar.appendChild(tab1);
    tabsBar.appendChild(sep1);
    tabsBar.appendChild(tab2);
    tabsBar.appendChild(sep2);
    tabsBar.appendChild(tab3);
    container.appendChild(tabsBar);

    // 패널
    var panelBasic = document.createElement('div');
    panelBasic.className = 'ddl-rt-panel is-active';
    panelBasic.setAttribute('data-panel', 'basic');

    var panelSeries = document.createElement('div');
    panelSeries.className = 'ddl-rt-panel';
    panelSeries.setAttribute('data-panel', 'series');

    var panelLatest = document.createElement('div');
    panelLatest.className = 'ddl-rt-panel';
    panelLatest.setAttribute('data-panel', 'latest');

    container.appendChild(panelBasic);
    container.appendChild(panelSeries);
    container.appendChild(panelLatest);

    // 삽입 위치: 댓글 섹션 앞에 (있으면), 없으면 main 뒤에
    var comments = document.querySelector('.gh-comments');
    var main = document.querySelector('main');
    if (comments && comments.parentNode){
      comments.parentNode.insertBefore(container, comments);
    } else if (main && main.parentNode){
      main.parentNode.insertBefore(container, main.nextSibling);
    } else {
      document.body.appendChild(container);
    }

    // 초기 로드: 탭1
    loadTabBasic(panelBasic, currentSlug);
    var seriesLoaded = false, latestLoaded = false;

    // 탭 스위치
    function switchTab(which){
      [tab1, tab2, tab3].forEach(function(t){ t.classList.remove('is-active'); });
      [panelBasic, panelSeries, panelLatest].forEach(function(p){ p.classList.remove('is-active'); });
      if (which === 'basic'){ tab1.classList.add('is-active'); panelBasic.classList.add('is-active'); }
      else if (which === 'series'){
        tab2.classList.add('is-active'); panelSeries.classList.add('is-active');
        if (!seriesLoaded){ loadTabSeries(panelSeries, seriesTag, currentSlug); seriesLoaded = true; }
      } else if (which === 'latest'){
        tab3.classList.add('is-active'); panelLatest.classList.add('is-active');
        if (!latestLoaded){ loadTabLatest(panelLatest, currentSlug); latestLoaded = true; }
      }
    }
    tab1.addEventListener('click', function(){ switchTab('basic'); });
    tab2.addEventListener('click', function(){ switchTab('series'); });
    tab3.addEventListener('click', function(){ switchTab('latest'); });
  }

  function boot(){
    if (!isPostPage()) return;
    injectCSS();
    var attempts = 0, max = 20;
    function tryRender(){
      try {
        render();
        return;
      } catch(e){
        if (window.console) console.warn('[related-tabs] render error:', e);
      }
      attempts++;
      if (attempts < max) setTimeout(tryRender, 400);
    }
    tryRender();
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
