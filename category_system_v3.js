/*!
 * CATEGORY-SYSTEM v3 (external hosted)
 * 배포: 2026-08-21
 * 로더 위치: Ghost Site Footer
 * 
 * v3 변경 (v2 대비):
 *   [!] 이미지 있는 카테고리 = 사이드바 폭 전체를 덮는 큰 이미지 배너 버튼
 *       (v2의 "좌측 원형 썸네일" 방식 폐기)
 *       - 접기 아이콘은 이미지 위 우측에 흰색 그림자로 얹음
 *   [!] 하위 카테고리 세로선 = 각 항목마다 개별 짧은 세로선 (해석 A)
 *       - 하위 항목 사이 여백에는 선 없음
 *       - 하위 항목이 늘어나도 선이 이어지지 않음
 *   [!] 하위 카테고리 ▫ 마커 제거
 *   [!] 하위 카테고리 클릭 영역 확장 (상위처럼 flex:1 로 넓게)
 * 
 * 역할:
 *   - Vv 접두사 태그만 카테고리로 인식 (예: VvAI, VvAI-Study)
 *   - 표시 시 Vv 접두사 자동 제거
 *   - 상위 카테고리마다 접기/펼치기 (localStorage)
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
  
  // ========== CSS 주입 ==========
  var CSS = ''
    // 리스트 컨테이너
    + '.ddl-category-tree.ddl-cat-v3 {'
    + '  list-style: none; padding: 0; margin: 0;'
    + '}'
    + '.ddl-category-tree.ddl-cat-v3 > li {'
    + '  padding: 0; margin: 0 0 0.35em 0;'
    + '  list-style: none; position: relative;'
    + '}'
    + '.ddl-category-tree.ddl-cat-v3 > li:last-child { margin-bottom: 0; }'
    + '.ddl-category-tree.ddl-cat-v3 > li::before { content: none; }'
    
    // ─── 상위 카테고리: 텍스트 스타일 (이미지 없음) ───
    + '.ddl-cat-item {'
    + '  display: flex; align-items: center;'
    + '  padding: 0.35em 0 0.35em 1em;'
    + '  position: relative;'
    + '  cursor: pointer;'
    + '  color: var(--color, #0F3A3A);'
    + '  transition: color 0.15s;'
    + '  line-height: 1.4;'
    + '}'
    // 좌측 불릿 (원형 border-only)
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
    // 색상 있는 카테고리: 불릿에 색 채움
    + '.ddl-cat-item.has-color::before {'
    + '  background: var(--cat-color, var(--color, #0F3A3A));'
    + '  border-color: var(--cat-color, var(--color, #0F3A3A));'
    + '}'
    + '.ddl-cat-item.has-color:hover::before {'
    + '  background: var(--point, #FF9A76);'
    + '  border-color: var(--point, #FF9A76);'
    + '}'
    // 이름
    + '.ddl-cat-item-name {'
    + '  flex: 1; min-width: 0;'
    + '  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;'
    + '  font-size: 0.95em;'
    + '  padding: 0.15em 0;'
    + '}'
    + '.ddl-cat-item:hover .ddl-cat-item-name {'
    + '  color: var(--point, #FF9A76);'
    + '  text-decoration: underline double var(--point, #FF9A76);'
    + '  text-underline-offset: 3px;'
    + '}'
    + '.ddl-cat-count {'
    + '  font-size: 0.75em; opacity: 0.6; margin-left: 0.3em; font-weight: 400;'
    + '}'
    // 접기 아이콘 (텍스트 스타일용)
    + '.ddl-cat-toggle {'
    + '  display: inline-block; width: 1.5em; text-align: center;'
    + '  font-size: 0.8em; opacity: 0.55;'
    + '  transition: transform 0.15s, opacity 0.15s;'
    + '  cursor: pointer; padding: 0.3em 0;'
    + '  user-select: none; flex-shrink: 0;'
    + '}'
    + '.ddl-cat-toggle:hover { opacity: 1; color: var(--point, #FF9A76); }'
    + '.ddl-cat-collapsed .ddl-cat-toggle { transform: rotate(-90deg); }'
    
    // ─── 상위 카테고리: 이미지 배너 스타일 (has-image) ───
    + '.ddl-cat-item.has-image {'
    + '  display: block;'      // flex 해제, 배너 전체가 하나의 블록
    + '  padding: 0;'
    + '  margin: 0;'
    + '  border-radius: 4px;'
    + '  overflow: hidden;'
    + '  position: relative;'
    + '  height: 3.2em;'       // 배너 높이 (텍스트 카테고리 높이와 유사하게)
    + '  background-color: var(--color, #0F3A3A);'
    + '  background-size: cover;'
    + '  background-position: center;'
    + '  cursor: pointer;'
    + '  transition: filter 0.15s;'
    + '}'
    + '.ddl-cat-item.has-image::before { content: none; }' // 좌측 불릿 없앰
    + '.ddl-cat-item.has-image::after {'
    + '  content: "";'
    + '  position: absolute; inset: 0;'
    + '  background: linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 100%);'
    + '  pointer-events: none;'
    + '  transition: background 0.15s;'
    + '}'
    + '.ddl-cat-item.has-image:hover::after {'
    + '  background: linear-gradient(180deg, rgba(255,154,118,0.25) 0%, rgba(255,154,118,0.65) 100%);'
    + '}'
    // 이름 (배너 위)
    + '.ddl-cat-item.has-image .ddl-cat-item-name {'
    + '  position: absolute;'
    + '  left: 0.7em; bottom: 0.4em;'
    + '  color: #fff;'
    + '  text-shadow: 0 1px 3px rgba(0,0,0,0.7);'
    + '  font-weight: 600;'
    + '  font-size: 1em;'
    + '  padding: 0;'
    + '  z-index: 2;'
    + '  max-width: calc(100% - 3em);'  // 접기 아이콘 자리 확보
    + '}'
    + '.ddl-cat-item.has-image:hover .ddl-cat-item-name {'
    + '  color: #fff;'
    + '  text-decoration: none;'
    + '}'
    + '.ddl-cat-item.has-image .ddl-cat-count {'
    + '  color: rgba(255,255,255,0.8);'
    + '  text-shadow: 0 1px 2px rgba(0,0,0,0.5);'
    + '}'
    // 접기 아이콘 (배너용)
    + '.ddl-cat-item.has-image .ddl-cat-toggle {'
    + '  position: absolute;'
    + '  right: 0.3em; top: 50%;'
    + '  transform: translateY(-50%);'
    + '  color: #fff;'
    + '  opacity: 0.85;'
    + '  text-shadow: 0 1px 3px rgba(0,0,0,0.7);'
    + '  z-index: 2;'
    + '  font-size: 1em;'
    + '  padding: 0.2em 0.4em;'
    + '}'
    + '.ddl-cat-item.has-image .ddl-cat-toggle:hover {'
    + '  color: #fff; opacity: 1;'
    + '}'
    + '.ddl-cat-collapsed .ddl-cat-item.has-image .ddl-cat-toggle {'
    + '  transform: translateY(-50%) rotate(-90deg);'
    + '}'
    
    // ─── 하위 카테고리 컨테이너 (세로선 없음) ───
    + '.ddl-cat-sub {'
    + '  list-style: none;'
    + '  padding: 0.2em 0 0.15em 0.9em;'  // 좌측 들여쓰기만
    + '  margin: 0.2em 0 0.35em 0.4em;'
    + '  overflow: hidden;'
    + '  max-height: 500px;'
    + '  transition: max-height 0.22s ease-out, padding 0.22s ease-out, margin 0.22s ease-out, opacity 0.15s;'
    + '  opacity: 1;'
    + '}'
    + '.ddl-cat-collapsed .ddl-cat-sub {'
    + '  max-height: 0;'
    + '  padding-top: 0; padding-bottom: 0;'
    + '  margin-top: 0; margin-bottom: 0;'
    + '  opacity: 0;'
    + '}'
    
    // ─── 하위 카테고리 개별 항목: 좌측에 짧은 세로선 (각자 개별) ───
    + '.ddl-cat-sub li {'
    + '  padding: 0;'
    + '  margin: 0.15em 0;'
    + '  list-style: none;'
    + '  position: relative;'
    + '}'
    + '.ddl-cat-sub li::before { content: none; }'
    // 하위 아이템의 클릭 가능 영역 (상위처럼 flex 로 확장)
    + '.ddl-cat-sub-item {'
    + '  display: flex; align-items: center;'
    + '  padding: 0.2em 0 0.2em 0.7em;'
    + '  position: relative;'
    + '  cursor: pointer;'
    + '  color: var(--color, #0F3A3A);'
    + '  text-decoration: none;'
    + '  font-size: 0.9em;'
    + '  line-height: 1.35;'
    + '  transition: color 0.15s;'
    + '}'
    // 개별 짧은 세로선 (항목 왼쪽에만, 항목 높이보다 살짝 짧게)
    + '.ddl-cat-sub-item::before {'
    + '  content: "";'
    + '  position: absolute;'
    + '  left: 0; top: 0.35em; bottom: 0.35em;'  // 위아래 여백을 두어 짧게
    + '  width: 1px;'
    + '  background: var(--color, #0F3A3A);'
    + '  opacity: 0.5;'
    + '  transition: background 0.15s, opacity 0.15s;'
    + '}'
    + '.ddl-cat-sub-item:hover::before {'
    + '  background: var(--point, #FF9A76);'
    + '  opacity: 1;'
    + '}'
    // 하위 이름 = flex:1 로 클릭 영역 넓게
    + '.ddl-cat-sub-name {'
    + '  flex: 1; min-width: 0;'
    + '  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;'
    + '  padding: 0.05em 0;'
    + '}'
    + '.ddl-cat-sub-item:hover .ddl-cat-sub-name {'
    + '  color: var(--point, #FF9A76);'
    + '  text-decoration: underline double var(--point, #FF9A76);'
    + '  text-underline-offset: 3px;'
    + '}'
    + '.ddl-cat-sub-item .ddl-cat-count {'
    + '  font-size: 0.8em;'
    + '}'
    
    // ─── 로딩·빈 상태 ───
    + '.ddl-cat-empty {'
    + '  padding: 0.5em 0; font-size: 0.85em; opacity: 0.6;'
    + '  list-style: none;'
    + '}'
    + '';
  
  try {
    var style = document.createElement('style');
    style.setAttribute('data-ddl-category', 'v3');
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
    
    el.className = 'ddl-category-tree ddl-cat-v3';
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
        
        // 스타일 적용: image > color > 기본
        if (catMeta.image) {
          itemEl.classList.add('has-image');
          // ::after gradient 는 CSS 로 처리, background-image 만 인라인
          itemEl.style.backgroundImage = 'url("' + String(catMeta.image).replace(/"/g, '\\"') + '")';
        } else if (catMeta.color) {
          itemEl.classList.add('has-color');
          itemEl.style.setProperty('--cat-color', catMeta.color);
        }
        
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
        
        // 클릭 처리
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
            
            // <a> 대신 flex 컨테이너로 클릭 영역 확대
            var subItem = document.createElement('a');
            subItem.className = 'ddl-cat-sub-item';
            subItem.href = '/tag/' + c.tag.slug + '/';
            
            var subName = document.createElement('span');
            subName.className = 'ddl-cat-sub-name';
            subName.textContent = c.displayName;
            if (c.tag.count && c.tag.count.posts) {
              var scnt = document.createElement('span');
              scnt.className = 'ddl-cat-count';
              scnt.textContent = '(' + c.tag.count.posts + ')';
              subName.appendChild(scnt);
            }
            subItem.appendChild(subName);
            
            subLi.appendChild(subItem);
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
