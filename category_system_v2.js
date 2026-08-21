/*!
 * CATEGORY-SYSTEM v2 (external hosted)
 * 배포: 2026-08-21
 * 로더 위치: Ghost Site Footer
 * 
 * v2 변경 (v1 대비):
 *   [!] 사이트 디자인 톤에 맞춤 (박스형 배너 제거, 밑줄·좌측 불릿·세로선 위주)
 *   [!] 상위 카테고리 클릭 영역 확대 (이름 + 우측 여백까지, 접기 아이콘 앞까지)
 *   [+] 이미지 있는 카테고리는 좌측 불릿 자리에 작은 원형 썸네일
 * 
 * 역할:
 *   - Vv 접두사 태그만 카테고리로 인식 (예: VvAI, VvAI-Study)
 *   - 표시 시 Vv 접두사 자동 제거 (예: VvAI → AI, VvAI-Study → Study)
 *   - 상위 카테고리마다 접기/펼치기 (localStorage 로 상태 유지)
 *   - categories_meta.json 에서 label/image/color/defaultCollapsed 로드
 *   - 시리즈(series-*) 자동 제외
 */

(function(){
  'use strict';
  
  if (window.__DDL_CATEGORY_LOADED) return;
  window.__DDL_CATEGORY_LOADED = true;
  
  if (location.pathname.indexOf('/ghost/') === 0) return;
  
  var CONTENT_API_KEY = '39b17c3fb020743b7da0116c24';
  var CONTENT_API_BASE = window.location.origin + '/ghost/api/content';
  var META_URL = 'https://cdn.jsdelivr.net/gh/2vvena-source/ghost-blog-scripts@main/categories_meta.json';
  
  // ========== CSS 주입 (사이트 톤에 맞춤: 선·여백·불릿 중심) ==========
  var CSS = ''
    // 카테고리 리스트 컨테이너
    + '.ddl-category-tree.ddl-cat-v2 {'
    + '  list-style: none; padding: 0; margin: 0;'
    + '}'
    + '.ddl-category-tree.ddl-cat-v2 > li {'
    + '  padding: 0; margin: 0;'
    + '  list-style: none; position: relative;'
    + '}'
    + '.ddl-category-tree.ddl-cat-v2 > li::before { content: none; }'
    // 상위 카테고리 = 좌측 불릿 + 이름 + 우측 접기 아이콘
    + '.ddl-cat-item {'
    + '  display: flex; align-items: center;'
    + '  padding: 0.35em 0 0.35em 1em;'
    + '  position: relative;'
    + '  cursor: pointer;'
    + '  color: var(--color, #0F3A3A);'
    + '  transition: color 0.15s;'
    + '  line-height: 1.4;'
    + '}'
    // 기본 불릿: 원형 border-only (사이트 메뉴 리스트 스타일 그대로)
    + '.ddl-cat-item::before {'
    + '  content: "";'
    + '  width: 5px; height: 5px;'
    + '  border: 1px solid var(--color, #0F3A3A);'
    + '  border-radius: 50%;'
    + '  position: absolute;'
    + '  left: 0; top: 0.85em;'
    + '  background: transparent;'
    + '  transition: background 0.15s, border-color 0.15s;'
    + '}'
    + '.ddl-cat-item:hover::before {'
    + '  background: var(--point, #FF9A76);'
    + '  border-color: var(--point, #FF9A76);'
    + '}'
    // 이미지 있는 카테고리: 좌측 불릿 자리에 원형 썸네일 (더 큼)
    + '.ddl-cat-item.has-image {'
    + '  padding-left: 1.6em;'
    + '}'
    + '.ddl-cat-item.has-image::before {'
    + '  width: 14px; height: 14px;'
    + '  border: 1px solid var(--color, #0F3A3A);'
    + '  background-size: cover;'
    + '  background-position: center;'
    + '  top: 0.65em;'
    + '}'
    + '.ddl-cat-item.has-image:hover::before {'
    + '  background-color: transparent;'
    + '  border-color: var(--point, #FF9A76);'
    + '}'
    // 색상 있는 카테고리: 불릿 색상만 그 색으로 채움
    + '.ddl-cat-item.has-color::before {'
    + '  background: var(--cat-color, var(--color, #0F3A3A));'
    + '  border-color: var(--cat-color, var(--color, #0F3A3A));'
    + '}'
    + '.ddl-cat-item.has-color:hover::before {'
    + '  background: var(--point, #FF9A76);'
    + '  border-color: var(--point, #FF9A76);'
    + '}'
    // 이름 부분 = 클릭 영역 확장 (flex:1 로 우측 아이콘 앞까지 밀어냄)
    + '.ddl-cat-item-name {'
    + '  flex: 1;'
    + '  min-width: 0;'
    + '  overflow: hidden;'
    + '  text-overflow: ellipsis;'
    + '  white-space: nowrap;'
    + '  font-size: 0.95em;'
    + '  padding: 0.15em 0;'
    + '}'
    + '.ddl-cat-item:hover .ddl-cat-item-name {'
    + '  color: var(--point, #FF9A76);'
    + '  text-decoration: underline double var(--point, #FF9A76);'
    + '  text-underline-offset: 3px;'
    + '}'
    + '.ddl-cat-count {'
    + '  font-size: 0.75em;'
    + '  opacity: 0.6;'
    + '  margin-left: 0.3em;'
    + '  font-weight: 400;'
    + '}'
    // 접기 화살표: 우측
    + '.ddl-cat-toggle {'
    + '  display: inline-block;'
    + '  width: 1.5em;'
    + '  text-align: center;'
    + '  font-size: 0.8em;'
    + '  opacity: 0.55;'
    + '  transition: transform 0.15s, opacity 0.15s;'
    + '  cursor: pointer;'
    + '  padding: 0.3em 0;'
    + '  user-select: none;'
    + '  flex-shrink: 0;'
    + '}'
    + '.ddl-cat-toggle:hover { opacity: 1; color: var(--point, #FF9A76); }'
    + '.ddl-cat-collapsed .ddl-cat-toggle { transform: rotate(-90deg); }'
    // 하위 카테고리 리스트 = 좌측 세로선 1px, 사이트 기존 톤
    + '.ddl-cat-sub {'
    + '  list-style: none;'
    + '  padding: 0.1em 0 0.3em 0.8em;'
    + '  margin: 0 0 0.2em 0.5em;'
    + '  border-left: 1px solid var(--color, #0F3A3A);'
    + '  overflow: hidden;'
    + '  max-height: 500px;'
    + '  transition: max-height 0.22s ease-out, padding 0.22s ease-out, margin 0.22s ease-out, opacity 0.15s, border-left-color 0.15s;'
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
    + '  padding: 0.2em 0;'
    + '  margin: 0;'
    + '  list-style: none;'
    + '  position: relative;'
    + '  font-size: 0.9em;'
    + '}'
    + '.ddl-cat-sub li::before {'
    + '  content: "▫";'
    + '  position: absolute;'
    + '  left: -0.9em; top: 0.15em;'
    + '  color: var(--color, #0F3A3A);'
    + '  opacity: 0.6;'
    + '  font-size: 0.85em;'
    + '}'
    + '.ddl-cat-sub a {'
    + '  color: var(--color, #0F3A3A);'
    + '  text-decoration: none;'
    + '  display: inline;'
    + '  transition: color 0.15s;'
    + '}'
    + '.ddl-cat-sub a:hover {'
    + '  color: var(--point, #FF9A76);'
    + '  text-decoration: underline double var(--point, #FF9A76);'
    + '  text-underline-offset: 3px;'
    + '}'
    + '.ddl-cat-empty {'
    + '  padding: 0.5em 0;'
    + '  font-size: 0.85em;'
    + '  opacity: 0.6;'
    + '  list-style: none;'
    + '}'
    + '';
  
  try {
    var style = document.createElement('style');
    style.setAttribute('data-ddl-category', 'v2');
    style.textContent = CSS;
    (document.head || document.documentElement).appendChild(style);
  } catch(e){}
  
  // ========== 유틸 ==========
  function stripVv(name){
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
      itemEl.style.setProperty('--cat-bg-image', 'url("' + catMeta.image + '")');
      // ::before 에 background-image 는 CSS 로 직접 못 넣으니 인라인 스타일 트릭
      itemEl.style.setProperty('background-image', 'none'); // 안전 초기화
      // ::before 에 이미지 넣기: data-image 속성 활용해 CSS attr()... 은 지원 미비 → 인라인 style 직접
      // 아래처럼 element 에 직접 style 로 --cat-bg 넣고, CSS 에서 ::before background 를 var(--cat-bg) 로 사용
      itemEl.setAttribute('data-cat-image', catMeta.image);
      // 실제로는 ::before background-image 를 인라인으로 못 넣으니 별도 스타일 태그 삽입 방식 사용
    } else if (catMeta.color) {
      itemEl.classList.add('has-color');
      itemEl.style.setProperty('--cat-color', catMeta.color);
    }
  }
  
  function ensureImageStyleTag(){
    // ::before background-image 는 인라인 스타일로 못 넣으므로,
    // 이미지 있는 카테고리마다 개별 CSS rule 을 동적 삽입.
    // 여기서는 하나의 style 태그를 재사용.
    var s = document.getElementById('ddl-cat-image-rules');
    if (!s) {
      s = document.createElement('style');
      s.id = 'ddl-cat-image-rules';
      (document.head || document.documentElement).appendChild(s);
    }
    return s;
  }
  
  function addImageRule(slug, imageUrl){
    // slug 별 ::before 규칙 삽입
    var s = ensureImageStyleTag();
    var safeSlug = slug.replace(/[^a-zA-Z0-9_-]/g, '-');
    // 이미 있는 규칙 중복 방지
    if (s.textContent.indexOf('data-slug="' + safeSlug + '"') !== -1) return;
    s.textContent += '\n.ddl-cat-item[data-slug="' + safeSlug + '"]::before {' +
      ' background-image: url("' + imageUrl.replace(/"/g, '\\"') + '") !important;' +
      ' background-size: cover !important;' +
      ' background-position: center !important;' +
      '}';
  }
  
  function collapseKey(slug){
    return 'ddl-cat-col-' + slug;
  }
  
  function initialCollapsed(slug, catMeta){
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
    if (!el) return;
    
    el.className = 'ddl-category-tree ddl-cat-v2';
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
      
      var vvTags = tagsData.tags.filter(function(t){
        return t && t.name && /^Vv/i.test(t.name);
      });
      
      var parents = [];
      var childrenMap = {};
      vvTags.forEach(function(t){
        var stripped = stripVv(t.name);
        if (stripped.indexOf('-') === -1) {
          parents.push(t);
        } else {
          var parentStripped = stripped.split('-')[0];
          var parentTagName = 'Vv' + parentStripped;
          if (!childrenMap[parentTagName]) childrenMap[parentTagName] = [];
          childrenMap[parentTagName].push({
            tag: t,
            displayName: stripped.substring(parentStripped.length + 1)
          });
        }
      });
      
      if (parents.length === 0) {
        el.innerHTML = '<li class="ddl-cat-empty">카테고리가 없습니다</li>';
        return;
      }
      
      el.innerHTML = '';
      parents.forEach(function(pt){
        var catMeta = getCatMeta(meta, pt.slug);
        var displayName = catMeta.label || stripVv(pt.name);
        
        var li = document.createElement('li');
        li.className = 'ddl-cat-parent';
        li.setAttribute('data-slug', pt.slug);
        
        var itemEl = document.createElement('div');
        itemEl.className = 'ddl-cat-item';
        itemEl.setAttribute('data-slug', pt.slug);
        applyItemStyle(itemEl, catMeta);
        if (catMeta.image) addImageRule(pt.slug, catMeta.image);
        
        var nameEl = document.createElement('span');
        nameEl.className = 'ddl-cat-item-name';
        nameEl.textContent = displayName;
        if (pt.count && pt.count.posts) {
          var cnt = document.createElement('span');
          cnt.className = 'ddl-cat-count';
          cnt.textContent = '(' + pt.count.posts + ')';
          nameEl.appendChild(cnt);
        }
        itemEl.appendChild(nameEl);
        
        var children = childrenMap[pt.name] || [];
        var hasChildren = children.length > 0;
        
        var toggleEl = null;
        if (hasChildren) {
          toggleEl = document.createElement('span');
          toggleEl.className = 'ddl-cat-toggle';
          toggleEl.textContent = '▾';
          toggleEl.setAttribute('role', 'button');
          toggleEl.setAttribute('aria-label', '접기 토글');
          itemEl.appendChild(toggleEl);
        }
        
        // 클릭 영역:
        //  - itemEl 전체 클릭 = 카테고리 페이지 이동
        //  - toggleEl 만 클릭 = 접기 토글 (stopPropagation)
        itemEl.addEventListener('click', function(){
          window.location.href = '/tag/' + pt.slug + '/';
        });
        if (toggleEl) {
          toggleEl.addEventListener('click', function(e){
            e.stopPropagation();
            var isCol = li.classList.toggle('ddl-cat-collapsed');
            saveCollapse(pt.slug, isCol);
          });
        }
        
        li.appendChild(itemEl);
        
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
  
  function tryRender(retries){
    var el = document.getElementById('ddl-categories');
    if (el) { renderCategories(); return; }
    if (retries > 0) setTimeout(function(){ tryRender(retries - 1); }, 200);
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ tryRender(20); });
  } else {
    tryRender(20);
  }
})();
