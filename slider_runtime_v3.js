/*!
 * 2vvena Editor - 이미지 슬라이드 사이트 런타임 v4 (p26y)
 * Ghost 관리자 → Settings → Code injection → Site Footer 에 <script>...</script> 로 삽입.
 * 또는 GitHub jsDelivr: <script defer src="...slider_runtime_v3.js"></script>
 *
 * v4 변경 (p26y):
 *   - data-ddl-anim 병행 지원 (Ghost sanitizer 가 data-anim 을 쟬러도 동작)
 *   - zoom 모드에서 img transform 을 JS 가 직접 조작 (CSS 셀렉터 머치지 안해도 동작)
 *   - 진입 시 slider.getAttribute('data-anim') ⇒ 'data-ddl-anim' 폴백
 *
 * v3 변경 (p26w):
 *   - CSS 인라인 강제
 *   - 도트/버튼 자동 생성
 *   - 이벤트 위임
 */
(function(){
  if (window.__DDL_SLIDER_RUNTIME_V4__) return;
  window.__DDL_SLIDER_RUNTIME_V4__ = true;
  window.__DDL_SLIDER_RUNTIME_V3__ = true;
  window.__DDL_SLIDER_RUNTIME_V2__ = true;

  // ─── 1. CSS 주입 (기본 안전망) ───
  function injectSliderCSS(){
    if (document.getElementById('ddl-slider-runtime-css')) return;
    var css = ''
      + '.ep-slider-block { position: relative; overflow: hidden; display: block; }'
      + '.ep-slider-block .ddl-slider-viewport { position: relative; width: 100%; overflow: hidden; }'
      + '.ep-slider-block[data-anim="slide"] .ddl-slider-track, .ep-slider-block[data-ddl-anim="slide"] .ddl-slider-track { display: flex; transition: transform var(--ddl-slider-duration, 400ms) ease; }'
      + '.ep-slider-block[data-anim="slide"] .ddl-slider-item, .ep-slider-block[data-ddl-anim="slide"] .ddl-slider-item { flex: 0 0 100%; width: 100%; height: 100%; position: relative; }'
      + '.ep-slider-block[data-anim="fade"] .ddl-slider-track, .ep-slider-block[data-anim="zoom"] .ddl-slider-track,'
      + '.ep-slider-block[data-ddl-anim="fade"] .ddl-slider-track, .ep-slider-block[data-ddl-anim="zoom"] .ddl-slider-track { display: block !important; transition: none !important; transform: none !important; }'
      + '.ep-slider-block[data-anim="fade"] .ddl-slider-item, .ep-slider-block[data-anim="zoom"] .ddl-slider-item,'
      + '.ep-slider-block[data-ddl-anim="fade"] .ddl-slider-item, .ep-slider-block[data-ddl-anim="zoom"] .ddl-slider-item {'
      + '  position: absolute !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important;'
      + '  width: 100% !important; height: 100% !important;'
      + '  opacity: 0 !important; transition: opacity var(--ddl-slider-duration, 500ms) ease !important;'
      + '  pointer-events: none !important; z-index: 0 !important;'
      + '}'
      + '.ep-slider-block[data-anim="fade"] .ddl-slider-item.is-current, .ep-slider-block[data-anim="zoom"] .ddl-slider-item.is-current,'
      + '.ep-slider-block[data-ddl-anim="fade"] .ddl-slider-item.is-current, .ep-slider-block[data-ddl-anim="zoom"] .ddl-slider-item.is-current { opacity: 1 !important; pointer-events: auto !important; z-index: 1 !important; }'
      + '.ep-slider-block[data-anim="zoom"] .ddl-slider-item img, .ep-slider-block[data-ddl-anim="zoom"] .ddl-slider-item img { transition: transform var(--ddl-slider-duration, 700ms) ease !important; transform: scale(1.06); }'
      + '.ep-slider-block[data-anim="zoom"] .ddl-slider-item.is-current img, .ep-slider-block[data-ddl-anim="zoom"] .ddl-slider-item.is-current img { transform: scale(1.0); }'
      + '.ep-slider-block .ddl-slider-item img { width: 100%; height: 100%; object-fit: cover; display: block; }'
      + '.ep-slider-block .ddl-slider-btn {'
      + '  position: absolute !important; top: 50% !important; transform: translateY(-50%) !important;'
      + '  width: 36px !important; height: 36px !important; border: none !important; border-radius: 50% !important;'
      + '  background: rgba(15,58,58,0.6) !important; color: #F5F5F5 !important; font-size: 20px !important;'
      + '  line-height: 1 !important; display: flex !important; align-items: center !important; justify-content: center !important;'
      + '  cursor: pointer !important; pointer-events: auto !important; z-index: 5 !important; padding: 0 !important;'
      + '}'
      + '.ep-slider-block .ddl-slider-prev { left: 10px !important; }'
      + '.ep-slider-block .ddl-slider-next { right: 10px !important; }'
      + '.ep-slider-block .ddl-slider-btn:hover { background: rgba(15,58,58,0.85) !important; }'
      + '.ep-slider-block .ddl-slider-dots {'
      + '  position: absolute !important; bottom: 12px !important; left: 50% !important; transform: translateX(-50%) !important;'
      + '  display: flex !important; gap: 7px !important; z-index: 5 !important; pointer-events: auto !important;'
      + '}'
      + '.ep-slider-block .ddl-slider-dot {'
      + '  width: 9px !important; height: 9px !important; border-radius: 50% !important; border: none !important;'
      + '  background: rgba(245,245,245,0.45) !important; cursor: pointer !important; padding: 0 !important;'
      + '  box-shadow: 0 1px 3px rgba(0,0,0,0.35) !important; transition: background 200ms ease !important;'
      + '}'
      + '.ep-slider-block .ddl-slider-dot.is-current { background: #F5F5F5 !important; transform: scale(1.2); }';
    var style = document.createElement('style');
    style.id = 'ddl-slider-runtime-css';
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    (document.head || document.documentElement).appendChild(style);
  }

  // ─── 2. 저장 시 버튼/도트가 누락된 슬라이더 자동 복구 ───
  function ensureControls(slider){
    var vp = slider.querySelector('.ddl-slider-viewport');
    if (!vp) return;
    var track = vp.querySelector('.ddl-slider-track');
    if (!track) return;
    var items = track.querySelectorAll('.ddl-slider-item');
    if (items.length < 2) return; // 이미지 1개면 컨트롤 불필요

    // 좌우 버튼
    if (!vp.querySelector('.ddl-slider-prev')){
      var pb = document.createElement('button');
      pb.type = 'button';
      pb.className = 'ddl-slider-btn ddl-slider-prev';
      pb.setAttribute('aria-label', 'Previous');
      pb.textContent = '‹';
      vp.appendChild(pb);
    }
    if (!vp.querySelector('.ddl-slider-next')){
      var nb = document.createElement('button');
      nb.type = 'button';
      nb.className = 'ddl-slider-btn ddl-slider-next';
      nb.setAttribute('aria-label', 'Next');
      nb.textContent = '›';
      vp.appendChild(nb);
    }
    // 도트박스
    var dotsBox = vp.querySelector('.ddl-slider-dots');
    if (!dotsBox){
      dotsBox = document.createElement('div');
      dotsBox.className = 'ddl-slider-dots';
      vp.appendChild(dotsBox);
    }
    // 도트 개수 재조정
    var existDots = dotsBox.querySelectorAll('.ddl-slider-dot');
    if (existDots.length !== items.length){
      dotsBox.innerHTML = '';
      for (var i = 0; i < items.length; i++){
        var d = document.createElement('button');
        d.type = 'button';
        d.className = 'ddl-slider-dot' + (i === 0 ? ' is-current' : '');
        d.setAttribute('aria-label', 'Slide ' + (i + 1));
        d.setAttribute('data-ddl-slide-idx', String(i));
        dotsBox.appendChild(d);
      }
    }
  }

  // ─── 3. 개별 슬라이더 초기화 ───
  function initSlider(slider){
    if (!slider || slider._ddlSliderInited) return;
    slider._ddlSliderInited = true;

    ensureControls(slider);

    var vp = slider.querySelector('.ddl-slider-viewport');
    if (!vp) return;
    var track = vp.querySelector('.ddl-slider-track');

    // duration
    var dur = parseInt(slider.getAttribute('data-ddl-duration') || '400', 10);
    if (isNaN(dur) || dur < 100) dur = 400;
    slider.style.setProperty('--ddl-slider-duration', dur + 'ms');

    var state = { current: 0, timer: null, hover: false };

    function getItems(){
      if (!track) return [];
      return Array.prototype.filter.call(track.children, function(c){
        return c.classList && c.classList.contains('ddl-slider-item');
      });
    }

    function update(){
      var items = getItems();
      var n = items.length;
      if (n === 0) return;
      if (state.current < 0) state.current = 0;
      if (state.current >= n) state.current = n - 1;
      // p26y: data-anim 이 sanitizer 에 잘렸을 가능성 → data-ddl-anim 폴백
      var anim = slider.getAttribute('data-anim') || slider.getAttribute('data-ddl-anim') || 'slide';
      // p26y: 둘 다 세팅 (CSS 셀렉터 모두 매칭하도록)
      slider.setAttribute('data-anim', anim);
      slider.setAttribute('data-ddl-anim', anim);
      if (anim === 'slide' && track){
        track.style.transform = 'translateX(' + (-100 * state.current) + '%)';
      }
      items.forEach(function(it, i){
        var im = it.querySelector('img');
        if (i === state.current){
          it.classList.add('is-current');
          if (anim === 'fade' || anim === 'zoom'){
            it.style.setProperty('opacity', '1', 'important');
            it.style.setProperty('z-index', '1', 'important');
            it.style.setProperty('pointer-events', 'auto', 'important');
          }
          // p26y: zoom 상태에서 현재 이미지를 scale(1.0) 으로 직접 설정
          if (anim === 'zoom' && im){
            im.style.setProperty('transition', 'transform var(--ddl-slider-duration, 700ms) ease', 'important');
            im.style.setProperty('transform', 'scale(1.0)', 'important');
          }
        } else {
          it.classList.remove('is-current');
          if (anim === 'fade' || anim === 'zoom'){
            it.style.setProperty('opacity', '0', 'important');
            it.style.setProperty('z-index', '0', 'important');
            it.style.setProperty('pointer-events', 'none', 'important');
          }
          // p26y: zoom 상태에서 비활성 이미지는 scale(1.06)
          if (anim === 'zoom' && im){
            im.style.setProperty('transition', 'transform var(--ddl-slider-duration, 700ms) ease', 'important');
            im.style.setProperty('transform', 'scale(1.06)', 'important');
          }
        }
      });
      var dots = vp.querySelectorAll('.ddl-slider-dot');
      for (var i = 0; i < dots.length; i++){
        if (i === state.current){
          dots[i].classList.add('is-current');
          dots[i].style.setProperty('background', '#F5F5F5', 'important');
        } else {
          dots[i].classList.remove('is-current');
          dots[i].style.setProperty('background', 'rgba(245,245,245,0.45)', 'important');
        }
      }
    }
    function go(dir){
      var items = getItems();
      var n = items.length;
      if (n <= 1) return;
      state.current = (state.current + dir + n) % n;
      update();
    }
    function goTo(idx){
      var items = getItems();
      var n = items.length;
      if (n <= 1 || idx < 0 || idx >= n) return;
      state.current = idx;
      update();
    }
    function stopAP(){ if (state.timer){ clearInterval(state.timer); state.timer = null; } }
    function startAP(){
      stopAP();
      if (slider.getAttribute('data-ddl-autoplay') !== '1') return;
      if (getItems().length <= 1) return;
      var interval = parseInt(slider.getAttribute('data-ddl-interval') || '3500', 10);
      if (isNaN(interval) || interval < 800) interval = 3500;
      state.timer = setInterval(function(){ if (!state.hover) go(1); }, interval);
    }

    slider._ddlGo = go;
    slider._ddlGoTo = goTo;
    slider._ddlStartAP = startAP;
    slider._ddlStopAP = stopAP;

    slider.addEventListener('mouseenter', function(){ state.hover = true; });
    slider.addEventListener('mouseleave', function(){ state.hover = false; });

    // 터치 스와이프
    var tStart = null;
    vp.addEventListener('touchstart', function(e){
      if (!e.touches || !e.touches[0]) return;
      tStart = { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() };
    }, { passive: true });
    vp.addEventListener('touchend', function(e){
      if (!tStart) return;
      var t = e.changedTouches && e.changedTouches[0];
      if (!t){ tStart = null; return; }
      var dx = t.clientX - tStart.x;
      var dy = t.clientY - tStart.y;
      var dt = Date.now() - tStart.t;
      tStart = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) && dt < 600){
        if (dx > 0) go(-1); else go(1);
        startAP();
      }
    });

    update();
    startAP();
  }

  // ─── 4. 이벤트 위임 ───
  function installDelegation(){
    if (document._ddlSliderDelegated) return;
    document._ddlSliderDelegated = true;
    document.addEventListener('click', function(e){
      var t = e.target;
      if (!t || !t.closest) return;
      var btn = t.closest('.ddl-slider-btn');
      if (btn){
        var slider = btn.closest('.ep-slider-block');
        if (!slider) return;
        if (!slider._ddlSliderInited) initSlider(slider);
        if (slider._ddlGo){
          e.preventDefault();
          e.stopPropagation();
          if (btn.classList.contains('ddl-slider-prev')) slider._ddlGo(-1);
          else if (btn.classList.contains('ddl-slider-next')) slider._ddlGo(1);
          if (slider._ddlStartAP) slider._ddlStartAP();
        }
        return;
      }
      var dot = t.closest('.ddl-slider-dot');
      if (dot){
        var slider2 = dot.closest('.ep-slider-block');
        if (!slider2) return;
        if (!slider2._ddlSliderInited) initSlider(slider2);
        var idx = parseInt(dot.getAttribute('data-ddl-slide-idx') || '0', 10);
        if (slider2._ddlGoTo){
          e.preventDefault();
          e.stopPropagation();
          slider2._ddlGoTo(idx);
          if (slider2._ddlStartAP) slider2._ddlStartAP();
        }
        return;
      }
    }, true);
  }

  function initAll(){
    var list = document.querySelectorAll('.ep-slider-block[data-ddl-slider="1"]');
    for (var i = 0; i < list.length; i++) initSlider(list[i]);
  }

  function boot(){
    injectSliderCSS();
    installDelegation();
    initAll();
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
  window.addEventListener('load', boot);

  try {
    var obs = new MutationObserver(function(muts){
      for (var i = 0; i < muts.length; i++){
        var m = muts[i];
        if (!m.addedNodes) continue;
        for (var j = 0; j < m.addedNodes.length; j++){
          var node = m.addedNodes[j];
          if (node.nodeType !== 1) continue;
          if (node.matches && node.matches('.ep-slider-block[data-ddl-slider="1"]')){
            initSlider(node);
          } else if (node.querySelectorAll){
            var inner = node.querySelectorAll('.ep-slider-block[data-ddl-slider="1"]');
            for (var k = 0; k < inner.length; k++) initSlider(inner[k]);
          }
        }
      }
    });
    obs.observe(document.documentElement || document.body, { childList: true, subtree: true });
  } catch(_){}
})();
