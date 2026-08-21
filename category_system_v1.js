/*!
 * CATEGORY-SYSTEM v1 (external hosted)
 * 배포: 2026-08-21
 * 로더 위치: Ghost Site Footer (single <script src=...> tag)
 * 
 * 역할:
 *   - 사이드바 A 의 "카테고리" 블록을 새 스타일로 렌더링
 *   - Vv 접두사 태그만 카테고리로 인식 (예: VvAI, VvAI-Study)
 *   - 표시 시 Vv 접두사 자동 제거 (예: VvAI → AI, VvAI-Study → Study)
 *   - 상위 카테고리마다 접기/펼치기 (localStorage 로 상태 유지)
 *   - 저장 파일 categories_meta.json 에서 이미지/색상/기본접힘 로드
 *     · image 있음 → 이미지 배너 스타일
 *     · image 없음 → 색상 배경 + 이름 텍스트 스타일
 *   - 시리즈(series-*) 자동 제외
 * 
 * 안전장치:
 *   - 관리자 페이지(/ghost/*) 실행 안 함
 *   - 중복 로드 방지 (window.__DDL_CATEGORY_LOADED)
 *   - try-catch 로 오류 격리
 *   - 카테고리 블록 요소(#ddl-categories) 없으면 조용히 종료
 */

(function(){
  'use strict';
  
  // ========== 기본 안전장치 ==========
  if (window.__DDL_CATEGORY_LOADED) return;
  window.__DDL_CATEGORY_LOADED = true;
  
  if (location.pathname.indexOf('/ghost/') === 0) return;
  
  var CONTENT_API_KEY = '39b17c3fb020743b7da0116c24';
  var CONTENT_API_BASE = window.location.origin + '/ghost/api/content';
  var META_URL = 'https://cdn.jsdelivr.net/gh/2vvena-source/ghost-blog-scripts@main/categories_meta.json';
  
  // ========== CSS 주입 ==========
  var CSS = ''
    // 카테고리 블록 전체 (사이드바 A의 .ddl-block 안에 들어감)
    + '.ddl-category-tree.ddl-cat-v1 {'
    + '  list-style: none; padding: 0; margin: 0;'
    + '}'
    + '.ddl-category-tree.ddl-cat-v1 > li {'
    + '  padding: 0; margin: 0 0 0.4em 0; position: relative; font-size: 0.95em;'
    + '  list-style: none;'
    + '}'
    + '.ddl-category-tree.ddl-cat-v1 > li::before { content: none; }'
    // 상위 카테고리 = 배너 버튼
    + '.ddl-cat-item {'
    + '  display: flex; align-items: center; justify-content: space-between;'
    + '  padding: 0.55em 0.7em;'
    + '  border-radius: 6px;'
    + '  background: var(--base, #F5F5F5);'
    + '  border: 1px solid rgba(15, 58, 58, 0.12);'
    + '  cursor: pointer;'
    + '  transition: background 0.15s, border-color 0.15s;'
    + '  color: var(--color, #0F3A3A);'
    + '  font-weight: 600;'
    + '}'
    + '.ddl-cat-item.has-image {'
    + '  background-size: cover;'
    + '  background-position: center;'
    + '  color: #fff;'
    + '  text-shadow: 0 1px 3px rgba(0,0,0,0.6);'
    + '  border-color: transparent;'
    + '}'
    + '.ddl-cat-item.has-color {'
    + '  color: #fff;'
    + '  border-color: transparent;'
    + '}'
    + '.ddl-cat-item:hover {'
    + '  border-color: var(--point, #FF9A76);'
    + '}'
    + '.ddl-cat-item-left {'
    + '  display: flex; align-items: center; gap: 0.4em;'
    + '  flex: 1; min-width: 0;'
    + '}'
    + '.ddl-cat-item-name {'
    + '  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;'
    + '  cursor: pointer;'
    + '}'
    + '.ddl-cat-item-name:hover {'
    + '  text-decoration: underline;'
    + '  text-underline-offset: 3px;'
    + '}'
    + '.ddl-cat-count {'
    + '  font-size: 0.75em; opacity: 0.75; margin-left: 0.3em; font-weight: 400;'
    + '}'
    // 접기 아이콘
    + '.ddl-cat-toggle {'
    + '  display: inline-block; width: 1.2em; text-align: center;'
    + '  font-size: 0.85em;'
    + '  transition: transform 0.15s;'
    + '  cursor: pointer;'
    + '  padding: 0 0.3em;'
    + '  user-select: none;'
    + '}'
    + '.ddl-cat-collapsed .ddl-cat-toggle { transform: rotate(-90deg); }'
    // 하위 카테고리 리스트
    + '.ddl-cat-sub {'
    + '  list-style: none;'
    + '  padding: 0.4em 0 0.2em 0.8em;'
    + '  margin: 0.2em 0 0 0.4em;'
    + '  border-left: 2px solid rgba(15, 58, 58, 0.15);'
    + '  font-size: 0.9em;'
    + '  overflow: hidden;'
    + '  max-height: 500px;'
    + '  transition: max-height 0.2s ease-out, padding 0.2s ease-out, margin 0.2s ease-out, opacity 0.15s;'
    + '  opacity: 1;'
    + '}'
    + '.ddl-cat-collapsed .ddl-cat-sub {'
    + '  max-height: 0;'
    + '  padding-top: 0; padding-bottom: 0;'
    + '  margin-top: 0; margin-bottom: 0;'
    + '  opacity: 0;'
    + '  border-left-color: transparent;'
    + '}'
    + '.ddl-cat-sub li {'
    + '  padding: 0.15em 0; margin: 0;'
    + '  list-style: none;'
    + '  position: relative;'
    + '}'
    + '.ddl-cat-sub li::before { content: none; }'
    + '.ddl-cat-sub a {'
    + '  color: var(--color, #0F3A3A);'
    + '  text-decoration: none;'
    + '  display: inline-block;'
    + '  padding: 0.1em 0.3em;'
    + '  border-radius: 3px;'
    + '  transition: background 0.15s, color 0.15s;'
    + '}'
    + '.ddl-cat-sub a:hover {'
    + '  color: var(--point, #FF9A76);'
    + '  background: rgba(255, 154, 118, 0.08);'
    + '}'
    + '.ddl-cat-empty {'
    + '  padding: 0.5em 0; font-size: 0.85em; opacity: 0.6;'
    + '  list-style: none;'
    + '}'
    + '';
  
  try {
    var style = document.createElement('style');
    style.setAttribute('data-ddl-category', 'v1');
    style.textContent = CSS;
    (document.head || document.documentElement).appendChild(style);
  } catch(e){}
  
  // ========== 유틸 ==========
  function stripVv(name){
    // 앞의 Vv (대소문자 상관 없음) 제거
    if (typeof name !== 'string') return name;
    return name.replace(/^Vv/i, '');
  }
  
  function ghostGet(endpoint, params){
    var qs = Object.keys(params || {}).map(function(k){
      return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]);
    }).join('&');
    var url = CONTENT_API_BASE + endpoint + '?key=' + CONTENT_API_KEY + (qs ? '&' + qs : '');
    return fetch(url).then(function(r){ return r.json(); });
  }
  
  function loadMeta(){
    return fetch(META_URL, { cache: 'no-cache' })
      .then(function(r){
        if (!r.ok) throw new Error('meta fetch failed: ' + r.status);
        return r.json();
      })
      .catch(function(e){
        if (window.console && console.warn){
          console.warn('[category] meta load failed, using defaults:', e);
        }
        return { version: 1, categories: {} };
      });
  }
  
  function getCatMeta(meta, slug){
    if (!meta || !meta.categories) return {};
    return meta.categories[slug] || {};
  }
  
  function applyItemStyle(itemEl, catMeta){
    if (catMeta.image) {
      itemEl.classList.add('has-image');
      itemEl.style.backgroundImage = 'url("' + catMeta.image + '")';
    } else if (catMeta.color) {
      itemEl.classList.add('has-color');
      itemEl.style.background = catMeta.color;
    }
  }
  
  function collapseKey(slug){
    return 'ddl-cat-col-' + slug;
  }
  
  function initialCollapsed(slug, catMeta){
    // 저장값 있으면 그것 우선, 없으면 meta 의 defaultCollapsed
    var stored = null;
    try { stored = localStorage.getItem(collapseKey(slug)); } catch(e){}
    if (stored === '1') return true;
    if (stored === '0') return false;
    return !!catMeta.defaultCollapsed;
  }
  
  function saveCollapse(slug, isCol){
    try {
      localStorage.setItem(collapseKey(slug), isCol ? '1' : '0');
    } catch(e){}
  }
  
  // ========== 렌더링 ==========
  function renderCategories(){
    var el = document.getElementById('ddl-categories');
    if (!el) return; // 사이드바 A 없는 페이지
    
    // 로딩 표시
    el.className = 'ddl-category-tree ddl-cat-v1';
    el.innerHTML = '<li class="ddl-cat-empty">불러오는 중...</li>';
    
    Promise.all([
      ghostGet('/tags/', { limit: 'all', order: 'name asc' }),
      loadMeta()
    ]).then(function(results){
      var tagsData = results[0];
      var meta = results[1];
      
      if (!tagsData || !Array.isArray(tagsData.tags)) {
        el.innerHTML = '<li class="ddl-cat-empty">카테고리가 없습니다</li>';
        return;
      }
      
      // Vv 접두사 태그만 필터 (시리즈는 series- 이므로 자동 제외됨)
      var vvTags = tagsData.tags.filter(function(t){
        return t && t.name && /^Vv/i.test(t.name);
      });
      
      // 상위 = Vv 뒤에 - 없음, 하위 = Vv상위-하위
      var parents = [];
      var childrenMap = {};
      
      vvTags.forEach(function(t){
        // Vv 제거한 이름
        var stripped = stripVv(t.name);
        if (stripped.indexOf('-') === -1) {
          // 상위 카테고리
          parents.push(t);
        } else {
          // 하위 카테고리 (첫 - 앞이 부모 이름)
          var parentStripped = stripped.split('-')[0];
          var parentSlugCandidate = 'Vv' + parentStripped; // 예상 부모 태그 이름
          if (!childrenMap[parentSlugCandidate]) childrenMap[parentSlugCandidate] = [];
          childrenMap[parentSlugCandidate].push({
            tag: t,
            displayName: stripped.substring(parentStripped.length + 1) // - 뒤
          });
        }
      });
      
      if (parents.length === 0) {
        el.innerHTML = '<li class="ddl-cat-empty">카테고리가 없습니다</li>';
        return;
      }
      
      // 렌더링
      el.innerHTML = '';
      parents.forEach(function(pt){
        var catMeta = getCatMeta(meta, pt.slug);
        var displayName = catMeta.label || stripVv(pt.name);
        
        var li = document.createElement('li');
        li.className = 'ddl-cat-parent';
        li.setAttribute('data-slug', pt.slug);
        
        // 상위 아이템 (배너)
        var itemEl = document.createElement('div');
        itemEl.className = 'ddl-cat-item';
        applyItemStyle(itemEl, catMeta);
        
        var leftWrap = document.createElement('span');
        leftWrap.className = 'ddl-cat-item-left';
        
        var nameEl = document.createElement('span');
        nameEl.className = 'ddl-cat-item-name';
        nameEl.textContent = displayName;
        // 이름 클릭 = 태그 페이지 이동
        nameEl.addEventListener('click', function(e){
          e.stopPropagation();
          window.location.href = '/tag/' + pt.slug + '/';
        });
        leftWrap.appendChild(nameEl);
        
        if (pt.count && pt.count.posts) {
          var cnt = document.createElement('span');
          cnt.className = 'ddl-cat-count';
          cnt.textContent = '(' + pt.count.posts + ')';
          leftWrap.appendChild(cnt);
        }
        itemEl.appendChild(leftWrap);
        
        // 하위 있을 때만 토글 아이콘
        var children = childrenMap[pt.name] || [];
        var hasChildren = children.length > 0;
        
        if (hasChildren) {
          var toggleEl = document.createElement('span');
          toggleEl.className = 'ddl-cat-toggle';
          toggleEl.textContent = '▾';
          toggleEl.addEventListener('click', function(e){
            e.stopPropagation();
            var isCol = li.classList.toggle('ddl-cat-collapsed');
            saveCollapse(pt.slug, isCol);
          });
          itemEl.appendChild(toggleEl);
        }
        
        li.appendChild(itemEl);
        
        // 하위 리스트
        if (hasChildren) {
          var subUl = document.createElement('ul');
          subUl.className = 'ddl-cat-sub';
          children.forEach(function(c){
            var subLi = document.createElement('li');
            var a = document.createElement('a');
            a.href = '/tag/' + c.tag.slug + '/';
            a.textContent = c.displayName;
            subLi.appendChild(a);
            if (c.tag.count && c.tag.count.posts) {
              var scnt = document.createElement('span');
              scnt.className = 'ddl-cat-count';
              scnt.textContent = '(' + c.tag.count.posts + ')';
              subLi.appendChild(scnt);
            }
            subUl.appendChild(subLi);
          });
          li.appendChild(subUl);
          
          // 초기 접기 상태 적용
          if (initialCollapsed(pt.slug, catMeta)) {
            li.classList.add('ddl-cat-collapsed');
          }
        }
        
        el.appendChild(li);
      });
    }).catch(function(e){
      if (window.console && console.warn){
        console.warn('[category] render failed:', e);
      }
      el.innerHTML = '<li class="ddl-cat-empty">불러오기 실패</li>';
    });
  }
  
  // ========== 실행 ==========
  // 사이드바 A 는 자체 스크립트로 뼈대 만든 뒤 loadCategories 를 부름.
  // 우리는 그 loadCategories 자리에 이 스크립트가 실행되도록,
  // #ddl-categories 요소가 나타나면 즉시 렌더링.
  function tryRender(retries){
    var el = document.getElementById('ddl-categories');
    if (el) {
      renderCategories();
      return;
    }
    if (retries > 0) {
      setTimeout(function(){ tryRender(retries - 1); }, 200);
    }
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ tryRender(20); });
  } else {
    tryRender(20);
  }
})();
