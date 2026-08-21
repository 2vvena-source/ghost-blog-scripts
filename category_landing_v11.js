/*!
 * CATEGORY-LANDING v11 (external hosted)
 *
 * v11 변경 (v10 대비) — 사용자 지적 정확함:
 *   [!] no-image 카드에는 Ghost 가 애초에 <div class="gh-card-image"> 를
 *       렌더링하지 않음 → v6~v10 의 CSS(.gh-card.no-image .gh-card-image)
 *       는 붙을 대상 자체가 없어 적용 안 되었음.
 *   [!] 수정: markNoImageCards() 안에서 no-image 카드에
 *       .gh-card-image 빈 div 를 JS 로 직접 삽입 (카드링크 맨 앞에)
 *       → with-image 와 동일한 3행 레이아웃 + 좌측 빗금 자리 확보
 *
 *
 * v10 변경 (v9 대비) — 리스트뷰 no-image 카드 수정:
 *   [!] no-image 카드 = with-image 카드와 완전 동일한 레이아웃 유지.
 *       오직 좌측 썸네일 자리의 배경만 사선 빗금으로 교체.
 *       ⇒ 세로 텍스트 오버레이 삭제, no-image 전용 flex/padding 규칙 삭제.
 *       ⇒ 3행 라벨 구조(제목/요약/작성일) 그대로 유지.
 *
 *
 * v9 변경 (v8 대비):
 *   [!] 리스트뷰 알약 태그 배지 완전 제거 (JS 삽입 안 함, CSS display:none)
 *   [!] 넘버링(01. 02.) JS 삽입 삭제 — 카드뷰/리스트뷰 모두 안 뜼
 *   [!] 요약행 오버플로우 수정 (min-width:0, overflow:hidden 보강)
 *
 *
 * v8 변경 (v6 대비) — 리스트뷰만 수정:
 *   [!] 카드 상하 굵은 테두리 제거 (v6 는 굵은 테두리 두륨) — 사용자 지시
 *   [!] no-image 카드 구조 수정:
 *       · with-image 와 100% 동일한 3행 라벨 구조 유지 (제목/요약/작성일)
 *       · 다른 점 단 하나: 좌측 썸네일 자리가 사선 빗금 + 그 안에 글 제목이 세로로 거의
 *         보이지 않는 연한 손글씨체로 배경치럼 들어감 (티스토리 스크린샷 감성)
 *   [!] with-image 호버 전 노출되는 배경색 → 사이트 --base(#F5F5F5) 로
 *
 * 배포: 2026-08-21
 * 로더 위치: Ghost Site Footer
 *
 * v6 변경 (v5 대비):
 *   [!] 리스트뷰 완전 재설계 — 티스토리 스크린샷 정확 재현:
 *       · 카드 상하 굵은 테두리, 좌우 테두리 없음, 옥은 회색 배경
 *       · 3줄 구조: 제목 / 요약 / 작성일 (하나씩 없는 경우 반드시 자리만 유지)
 *       · 각 줄 좌측에 «제목 / 요약 / 작성일» 세로 라벨 (::before)
 *       · 라벨과 값 사이 세로 구분선, 줄 사이 가로 구분선
 *       · 알약 태그 = 상단 제목란 안쪽 왼쪽, 제목과 수평 정렬
 *       · 카드 높이 = 3줄 기준 자동 증가 (고정X, min-height)
 *   [!] no-image 카드: 좌측 썸네일 박스 자체를 사선 스트라이프로 채움
 *       (틀은 동일 — 3줄 구조 그대로 유지)
 *   [!] 카드뷰 재수정 — v5 가 카테고리 그리드에 가까워졌던 문제 해소:
 *       · 시리즈 sg-card 의 넘버링(01.) 감성 추가 (제목 링크에 카드 순서 부여)
 *       · 명조 큰 제목 유지, 하단 젤경 뒤 날짜
 *       · [한계] 시리즈는 sg-catch/sg-keywords/sg-desc 같은 전용 필드가 있지만
 *         일반 글 카드에는 이 필드 없음 — 직접 재현 불가.
 *         제목/요약/날짜만 있는 범위에서 시리즈 톤 반영.
 *
 * v5 배경 (남겨둠):
 *   [!] 카드뷰 재설계 (상단 썸네일 + 하단 정보)
 *   [!] 리스트뷰 1차 재설계 (하지만 구조 미완 → v6 재작)
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
    
    // ─── 뷰 2: card — 시리즈 sg-card 감성 강화 (v6) ───
    // 시리즈 전용 필드(sg-catch/sg-keywords/sg-desc/sg-count)는 일반 글에 없으므로 재현 불가.
    // 단, 시리즈 톤을 모방해: 넘버링(sg-num) + 큰 명조 제목 + 젤경 뒤 날짜
    + '.cl-feed.cl-view-card {'
    + '  display: grid !important;'
    + '  grid-template-columns: repeat(4, minmax(0, 1fr)) !important;'
    + '  gap: 2em 1.5em !important;'
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
    // 넘버링 (JS 가 sg-num 모방해 삽입)
    + '.cl-feed.cl-view-card .cl-card-num {'
    + '  font-size: 0.85em;'
    + '  color: var(--point, #FF9A76);'
    + '  font-family: "Pretendard Variable","Pretendard",sans-serif;'
    + '  letter-spacing: 0.05em;'
    + '  margin: 0 0 0.3em;'
    + '  opacity: 0.85;'
    + '  font-weight: 500;'
    + '}'
    + '.cl-feed.cl-view-card .gh-card-tag {'
    + '  font-size: 0.68em !important;'
    + '  margin: 0 0 0.5em !important;'
    + '  color: var(--color, #0F3A3A) !important;'
    + '  opacity: 0.55;'
    + '  letter-spacing: 0.1em;'
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
    
    // ─── 뷰 3: list — 티스토리 스크린샷 정확 재현 (v6) ───
    // 구조:
    //   카드 = 옥은 회색 배경, 상하 굵은 테두리, 좌우 테두리 없음
    //   좌측: 세로 직사각 썸네일 (고정 110px)
    //   우측: 3행 (제목 / 요약 / 작성일), 각 행 좌측에 라벨, 행 사이 구분선
    + '.cl-feed.cl-view-list {'
    + '  display: block !important;'
    + '  column-count: unset !important;'
    + '  column-gap: unset !important;'
    + '  max-width: 900px;'
    + '  margin: 0 auto !important;'
    + '}'
    + '.cl-feed.cl-view-list .gh-card {'
    + '  break-inside: unset !important;'
    + '  margin: 0 0 1.2em 0 !important;'
    + '  padding: 0 !important;'
    + '  border: none !important;'
    + '  background: rgba(15, 58, 58, 0.03) !important;'
    + '  border-radius: 0 !important;'
    + '  position: relative;'
    + '  overflow: hidden;'
    + '  min-height: 160px;'
    + '}'
    + '.cl-feed.cl-view-list .gh-card-link {'
    + '  display: flex !important;'
    + '  flex-direction: row !important;'
    + '  align-items: stretch !important;'
    + '  min-height: 160px !important;'
    + '  text-decoration: none !important;'
    + '  color: inherit !important;'
    + '  position: relative;'
    + '}'
    // ▷ 좌측 세로 직사각 썸네일 박스
    // 배경색은 사이트 배경(--base) 으로 — 호버 슬라이드 전 간극이 사이트와 색상 동일
    + '.cl-feed.cl-view-list .gh-card-image {'
    + '  margin: 0 !important;'
    + '  width: 110px !important;'
    + '  min-width: 110px;'
    + '  min-height: 160px;'
    + '  align-self: stretch;'
    + '  position: relative;'
    + '  overflow: hidden;'
    + '  flex-shrink: 0;'
    + '  background-color: var(--base, #F5F5F5) !important;'
    + '  border-right: 1px solid var(--cl-line);'
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
    // 이미지 없는 카드: 좌측 썸네일 자리 배경을 사선 빗금으로 교체. 그 외 모든 레이아웃은 with-image 와 동일.
    + '.cl-feed.cl-view-list .gh-card.no-image .gh-card-image {'
    + '  background-image: linear-gradient(-45deg, transparent 46%, rgba(15,58,58,0.35) 46%, rgba(15,58,58,0.35) 54%, transparent 54%);'
    + '  background-size: 6px 6px;'
    + '  background-repeat: repeat;'
    + '  background-color: var(--base, #F5F5F5) !important;'
    + '}'
    + '.cl-feed.cl-view-list .gh-card.no-image .gh-card-image img {'
    + '  display: none !important;'
    + '}'
    // ▷ 우측 정보영역 — 3행 구조
    + '.cl-feed.cl-view-list .gh-card-wrapper {'
    + '  padding: 0 !important;'
    + '  flex: 1;'
    + '  display: flex !important;'
    + '  flex-direction: column !important;'
    + '  min-width: 0;'
    + '  align-self: stretch;'
    + '}'
    // 공통 행 설정 (제목/요약/날짜 공통)
    + '.cl-feed.cl-view-list .gh-card-title,'
    + '.cl-feed.cl-view-list .gh-card-excerpt,'
    + '.cl-feed.cl-view-list .gh-card-meta {'
    + '  display: flex !important;'
    + '  align-items: center;'
    + '  padding: 0.6em 1em 0.6em 0 !important;'
    + '  margin: 0 !important;'
    + '  min-height: 3em;'
    + '  position: relative;'
    + '  color: var(--color, #0F3A3A) !important;'
    + '  flex: 1;'
    + '  line-height: 1.4 !important;'
    + '  min-width: 0;'
    + '  overflow: hidden;'
    + '}'
    // 좌측 라벨 (::before) — 제목/요약/작성일 각각
    + '.cl-feed.cl-view-list .gh-card-title::before,'
    + '.cl-feed.cl-view-list .gh-card-excerpt::before,'
    + '.cl-feed.cl-view-list .gh-card-meta::before {'
    + '  display: inline-block;'
    + '  width: 60px;'
    + '  min-width: 60px;'
    + '  padding: 0 0.8em 0 1em;'
    + '  color: var(--color, #0F3A3A);'
    + '  opacity: 0.5;'
    + '  font-size: 0.75em;'
    + '  font-family: "Pretendard Variable","Pretendard",sans-serif;'
    + '  letter-spacing: 0.04em;'
    + '  font-weight: 400;'
    + '  border-right: 1px solid var(--cl-line);'
    + '  margin-right: 1em;'
    + '  align-self: stretch;'
    + '  display: flex;'
    + '  align-items: center;'
    + '  flex-shrink: 0;'
    + '}'
    + '.cl-feed.cl-view-list .gh-card-title::before { content: "제목"; }'
    + '.cl-feed.cl-view-list .gh-card-excerpt::before { content: "요약"; }'
    + '.cl-feed.cl-view-list .gh-card-meta::before { content: "작성일"; }'
    // 행 사이 가로 구분선
    + '.cl-feed.cl-view-list .gh-card-title,'
    + '.cl-feed.cl-view-list .gh-card-excerpt {'
    + '  border-bottom: 1px solid var(--cl-line);'
    + '}'
    // 개별 행 스타일
    // 제목행 스타일
    + '.cl-feed.cl-view-list .gh-card-title,'
    + '.cl-feed.cl-view-list .gh-card-title > a {'
    + '  font-family: "Cafe24Danjunghae","Gowun Batang","Nanum Myeongjo",serif !important;'
    + '  color: var(--color, #0F3A3A) !important;'
    + '  font-size: 1.15em !important;'
    + '  font-weight: 500;'
    + '  letter-spacing: 0.01em;'
    + '}'
    // 태그/알약태그 완전 숨김 (v9: 사용자 지시)
    + '.cl-feed.cl-view-list .gh-card-tag,'
    + '.cl-feed.cl-view-list .cl-list-tag {'
    + '  display: none !important;'
    + '}'
    // 카드뷰 넘버링 리스트뷰에서도 숨김 (v9: JS 삽입 제거된지만 안전망)
    + '.cl-feed.cl-view-list .cl-card-num {'
    + '  display: none !important;'
    + '}'
    // 요약 행 (오버플로우 방지: min-width:0 + white-space:nowrap 안됨대신 line-clamp)
    + '.cl-feed.cl-view-list .gh-card-excerpt {'
    + '  font-size: 0.85em !important;'
    + '  opacity: 0.65;'
    + '  display: flex !important;'
    + '  overflow: hidden !important;'
    + '  min-width: 0;'
    + '  white-space: nowrap;'
    + '  text-overflow: ellipsis;'
    + '  font-family: "Pretendard Variable","Pretendard",sans-serif !important;'
    + '}'
    // 요약 행 내부: ::before 후 이어지는 실제 텍스트를 오버플로우 막기
    + '.cl-feed.cl-view-list .gh-card-excerpt {'
    + '  align-items: center;'
    + '}'
    // 요약 실제 텍스트는 ::before 후 남은 영역 통째
    // 작성일 행
    + '.cl-feed.cl-view-list .gh-card-meta {'
    + '  font-size: 0.85em !important;'
    + '  opacity: 0.7;'
    + '  font-family: "NanumURiDdarSonGeurSsi","Gowun Batang",serif !important;'
    + '  letter-spacing: 0.02em;'
    + '}'
    // 요약이 없을 때도 라벨 행 자리를 유지하기 위해 no-excerpt 클래스가 있다면 자리만 보이게
    + '.cl-feed.cl-view-list .gh-card.no-excerpt .gh-card-excerpt {'
    + '  display: flex !important;'
    + '  min-height: 3em;'
    + '  visibility: visible;'
    + '}'
    + '.cl-feed.cl-view-list .gh-card.no-excerpt .gh-card-excerpt::after {'
    + '  content: "";'
    + '  flex: 1;'
    + '}'
    + '';
  
  function injectCSS(){
    try {
      var style = document.createElement('style');
      style.setAttribute('data-ddl-cat-landing', 'v11');
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
      var imgBox = card.querySelector('.gh-card-image');
      if (!img || !img.getAttribute('src')) {
        card.classList.add('no-image');
        // v11: no-image 카드에는 Ghost 가 .gh-card-image div 를
        //      렌더링하지 않음 → JS 로 직접 빈 박스 삽입
        //      (with-image 와 동일한 3행 레이아웃 + 좌측 빗금 자리 확보)
        if (!imgBox) {
          var link = card.querySelector('.gh-card-link') || card.querySelector('a');
          if (link) {
            var box = document.createElement('div');
            box.className = 'gh-card-image';
            link.insertBefore(box, link.firstChild);
          }
        }
      }
    });
  }
  
  function markFeed(){
    var feed = document.querySelector('.gh-feed');
    if (feed) feed.classList.add('cl-feed');
  }

  // v9: 넘버링/알약태그 삽입 삭제. 단, no-image 세로 제목 오버레이는 유지.
  function enrichCards(){
    try {
      var cards = document.querySelectorAll('.cl-feed > .gh-card, .cl-feed > article.gh-card');
      cards.forEach(function(card, idx){
        // no-excerpt 클래스 부여 (라벨 행 유지용)
        var exc = card.querySelector('.gh-card-excerpt');
        if (!exc || !(exc.textContent || '').trim()) {
          card.classList.add('no-excerpt');
        }
        // v10: no-image 세로제목 삽입 제거 (with-image 와 동일한 레이아웃 유지)
      });
    } catch(e){}
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
    enrichCards();
    insertCustomHeader(slug);
    applyView(getSavedView());
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
  } else {
    main();
  }
})();
