/*!
 * SERIES-SYSTEM v5 (external hosted)
 * 원본: Ghost site footer 내부 code injection (2026-08-20)
 * 외부 이관: 2026-08-21 (footer 용량 확보 목적)
 * 로더 위치: Ghost Site Footer (single <script src=...> tag)
 * 
 * 이 파일은 다음 두 가지를 한 번에 수행합니다:
 *   1. CSS(약 22KB) 를 <head>에 <style data-ddl-skin="1">로 삽입
 *   2. 시리즈 갤러리 JS(IIFE) 실행 (Content API 호출 + 렌더)
 * 
 * 안전장치:
 *   - 관리자 페이지(/ghost/*)에서는 실행 안 함 (EDITOR-SAFE 원칙)
 *   - 중복 실행 방지 (window.__DDL_SERIES_V5_LOADED 플래그)
 *   - 데이터 없어도 사이트 나머지 부분에는 영향 없음
 */
(function(){
  'use strict';
  
  // ============================================================
  // 0. 관리자 페이지에서는 절대 실행 안 함 (EDITOR-SAFE)
  // ============================================================
  var path = (typeof window !== 'undefined' && window.location) ? window.location.pathname : '';
  if (path.indexOf('/ghost') === 0 || path === '/ghost') {
    return;
  }
  
  // ============================================================
  // 1. 중복 로드 방지
  // ============================================================
  if (window.__DDL_SERIES_V5_LOADED) return;
  window.__DDL_SERIES_V5_LOADED = true;
  
  // ============================================================
  // 2. CSS 를 <head>에 삽입
  //    - data-ddl-skin="1" 속성 부여 → header EDITOR-SAFE 스크립트와 호환
  // ============================================================
  var CSS_TEXT = `/* ================================================================
     시리즈 갤러리 v5 - 사이트 톤 완전 통일
     - 사이트 홈 카드와 동일한 빗금 (선형 굵은 4px)
     - 필터버튼 타원형 복귀
     - 이모지 제거 (책 이모지 완전 삭제)
     - 모든 선/테두리 투명도 낮춤
     - 가로형 스크롤바: 호버시에만, 그리드는 숨김
     - 리스트형: 사용자 첨부 이미지에 충실하게 재디자인
     ================================================================ */
  
  /* 사이트 홈 카드와 동일한 빗금 배경 */
  :root {
    --sg-stripe-bg: linear-gradient(-45deg,
      transparent 49%, var(--color) 49%, var(--color) 51%, transparent 51%);
    --sg-line: rgba(15, 58, 58, 0.35);   /* 옅은 선 */
    --sg-line-strong: rgba(15, 58, 58, 0.55);
    --sg-point-soft: rgba(255, 154, 118, 0.5);   /* 옅은 포인트색 */
  }
  
  #series-gallery { padding: 0; }
  
  /* 헤더 */
  .sg-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5em 0 1em 0;
    border-bottom: 1px solid var(--sg-line);
    margin-bottom: 1.5em;
    flex-wrap: wrap;
    gap: 0.8em;
  }
  .sg-title {
    font-family: "Cafe24Danjunghae", "Georgia", serif;
    font-size: 1.7em;
    color: var(--color);
    margin: 0;
    letter-spacing: 0.02em;
    display: flex;
    align-items: center;
    gap: 0.3em;
  }
  .sg-title .sg-help {
    font-family: -apple-system, "Pretendard", sans-serif;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--color);
    color: #fff;
    font-size: 0.5em;
    cursor: help;
    opacity: 0.5;
    font-weight: 700;
    letter-spacing: 0;
    transition: opacity 0.15s;
  }
  .sg-title .sg-help:hover { opacity: 1; }
  
  /* 필터 버튼 - 타원형 복귀 */
  .sg-filter { display: flex; gap: 0.4em; }
  .sg-filter-btn {
    background: #fff;
    border: 1px solid var(--color);
    color: var(--color);
    padding: 0.4em 1em;
    border-radius: 24px;
    cursor: pointer;
    font-size: 0.8em;
    font-weight: 600;
    transition: all 0.15s;
    line-height: 1.2;
    font-family: inherit;
  }
  .sg-filter-btn:hover:not(.active) {
    background: rgba(245, 168, 138, 0.15);
  }
  .sg-filter-btn.active {
    background: var(--point);
    border-color: var(--point);
    color: #fff;
  }
  .sg-filter-btn .ic {
    margin-right: 0.25em;
    font-size: 1em;
  }
  
  /* 편집 안내 팝업 */
  .sg-help-popup {
    display: none;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #fff;
    border: 1px solid var(--color);
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    padding: 1.5em 2em;
    z-index: 100000;
    max-width: 520px;
    width: calc(100vw - 40px);
    max-height: calc(100vh - 40px);
    overflow-y: auto;
    font-family: "Pretendard", -apple-system, sans-serif;
    font-size: 13px;
    line-height: 1.6;
    color: var(--color);
  }
  .sg-help-popup.open { display: block; }
  .sg-help-popup h3 {
    margin: 0 0 0.8em 0; font-size: 1.3em; color: var(--color);
    padding-bottom: 0.4em; border-bottom: 1px dashed var(--sg-line);
    font-family: "Cafe24Danjunghae", serif;
  }
  .sg-help-popup .sg-help-close {
    position: absolute; top: 12px; right: 14px;
    background: none; border: none; font-size: 1.4em;
    cursor: pointer; color: var(--color); opacity: 0.6;
  }
  .sg-help-popup .sg-help-close:hover { opacity: 1; }
  .sg-help-popup code {
    background: rgba(15, 58, 58, 0.08); padding: 0.15em 0.4em; border-radius: 3px;
    font-family: "Menlo", monospace; font-size: 0.9em; color: var(--point);
  }
  .sg-help-popup pre {
    background: rgba(15, 58, 58, 0.06); border-left: 3px solid var(--point);
    padding: 0.8em 1em; overflow-x: auto; font-family: "Menlo", monospace;
    font-size: 0.85em; margin: 0.8em 0;
  }
  .sg-help-popup .sg-help-table {
    width: 100%; border-collapse: collapse; margin: 0.8em 0; font-size: 0.9em;
  }
  .sg-help-popup .sg-help-table td {
    padding: 0.4em 0.6em; border-bottom: 1px dashed rgba(15, 58, 58, 0.2); vertical-align: top;
  }
  .sg-help-popup .sg-help-table td:first-child {
    font-weight: 700; color: var(--point); white-space: nowrap; width: 30%;
  }
  .sg-help-backdrop {
    position: fixed; inset: 0; background: rgba(15, 58, 58, 0.4);
    z-index: 99999; display: none;
  }
  .sg-help-backdrop.open { display: block; }

  /* ================================================================
     [가로형] 1행 무한 가로 스크롤 - 스크롤바 호버시에만
     ================================================================ */
  #series-gallery.mode-horizontal .sg-list {
    display: flex;
    gap: 1.4em;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 0.5em 0.5em 1.5em 0;
    scroll-snap-type: x mandatory;
    /* 스크롤바 완전 투명 (Firefox) */
    scrollbar-width: none;
    /* 스크롤바 없이 스크롤 (Chrome/Safari) */
  }
  #series-gallery.mode-horizontal .sg-list::-webkit-scrollbar {
    height: 0;    /* 평소엔 완전 숨김 */
    background: transparent;
  }
  /* 호버 시에만 얇게 표시 */
  #series-gallery.mode-horizontal .sg-list:hover {
    scrollbar-width: thin;
  }
  #series-gallery.mode-horizontal .sg-list:hover::-webkit-scrollbar {
    height: 6px;
  }
  #series-gallery.mode-horizontal .sg-list:hover::-webkit-scrollbar-thumb {
    background: var(--sg-line);
    border-radius: 3px;
  }
  /* 가로형 카드는 크게 (그리드형처럼) */
  #series-gallery.mode-horizontal .sg-card {
    flex: 0 0 calc(25% - 1.05em);
    min-width: 240px;
    max-width: 400px;
    scroll-snap-align: start;
  }
  @media (max-width: 1400px) {
    #series-gallery.mode-horizontal .sg-card {
      flex: 0 0 calc(33.333% - 0.94em);
    }
  }
  @media (max-width: 900px) {
    #series-gallery.mode-horizontal .sg-card {
      flex: 0 0 calc(50% - 0.7em);
    }
  }

  /* ================================================================
     [그리드] 4열 - 스크롤 없음
     ================================================================ */
  #series-gallery.mode-grid .sg-list {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1.4em;
    overflow: hidden;   /* 스크롤 절대 안 뜨게 */
  }
  @media (max-width: 1400px) {
    #series-gallery.mode-grid .sg-list { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  }
  @media (max-width: 900px) {
    #series-gallery.mode-grid .sg-list { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  @media (max-width: 520px) {
    #series-gallery.mode-grid .sg-list { grid-template-columns: 1fr; }
  }

  /* ================================================================
     [세로 카드 공통] 가로형 + 그리드형
     ================================================================ */
  #series-gallery.mode-horizontal .sg-card,
  #series-gallery.mode-grid .sg-card {
    background: #fff;
    /* border 대신 outline 사용 - transform과 겹쳐도 자름 없음 */
    outline: 1px solid var(--sg-line);
    outline-offset: -1px;
    border: none;
    display: flex;
    flex-direction: column;
    text-decoration: none !important;
    color: inherit !important;
    transition: transform 0.2s, box-shadow 0.2s, outline-color 0.15s;
    /* GPU 렌더링 최적화 (서브픽셀 이슈 방지) */
    will-change: transform;
    transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }
  #series-gallery.mode-horizontal .sg-card:hover,
  #series-gallery.mode-grid .sg-card:hover {
    transform: translateY(-4px) translateZ(0);
    box-shadow: 0 8px 24px rgba(15, 58, 58, 0.12);
    outline-color: var(--sg-line-strong);
  }
  
  /* 번호 (01. 02. …) */
  #series-gallery.mode-horizontal .sg-num,
  #series-gallery.mode-grid .sg-num {
    font-family: "Cafe24Danjunghae", "Georgia", serif;
    font-size: 1.5em;
    color: var(--color);
    padding: 0.6em 0.9em 0.3em 0.9em;
    letter-spacing: 0.05em;
    font-weight: 700;
  }
  
  /* ✦ Series 01 ✦ 다이아 라인 - 옅은 포인트색 */
  #series-gallery.mode-horizontal .sg-date-line,
  #series-gallery.mode-grid .sg-date-line {
    text-align: center;
    font-size: 0.72em;
    color: var(--sg-point-soft);
    padding: 0.2em 1em 0.5em 1em;
    letter-spacing: 0.1em;
    font-family: "NanumURiDdarSonGeurSsi", "Georgia", serif;
    font-weight: 700;
  }
  #series-gallery.mode-horizontal .sg-date-line::before,
  #series-gallery.mode-horizontal .sg-date-line::after,
  #series-gallery.mode-grid .sg-date-line::before,
  #series-gallery.mode-grid .sg-date-line::after {
    content: "✦";
    margin: 0 0.5em;
    color: var(--sg-point-soft);
    font-size: 0.9em;
  }
  
  /* 정사각형 이미지 - 사이트 홈 빗금 스타일 */
  #series-gallery.mode-horizontal .sg-thumb,
  #series-gallery.mode-grid .sg-thumb {
    width: 100%;
    aspect-ratio: 1 / 1;
    background-color: var(--base);
    background-image: var(--sg-stripe-bg);
    background-size: 4px 4px;
    background-repeat: repeat;
    border-top: 1px solid var(--sg-line);
    border-bottom: 1px solid var(--sg-line);
  }
  /* 이미지가 있을 때는 빗금 대신 이미지 */
  #series-gallery.mode-horizontal .sg-thumb.has-img,
  #series-gallery.mode-grid .sg-thumb.has-img {
    background-color: transparent;
    background-image: var(--user-img);
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }
  
  /* 본문 */
  #series-gallery.mode-horizontal .sg-body,
  #series-gallery.mode-grid .sg-body {
    padding: 0.9em 1em 1em 1em;
    display: flex;
    flex-direction: column;
    gap: 0.5em;
    flex: 1;
  }
  #series-gallery.mode-horizontal .sg-catch,
  #series-gallery.mode-grid .sg-catch {
    text-align: center;
    font-size: 0.75em;
    opacity: 0.7;
    letter-spacing: 0.08em;
    color: var(--color);
    font-family: "NanumURiDdarSonGeurSsi", serif;
  }
  #series-gallery.mode-horizontal .sg-name,
  #series-gallery.mode-grid .sg-name {
    font-family: "Cafe24Danjunghae", "Georgia", serif;
    font-size: 1.35em;
    text-align: center;
    color: var(--color);
    margin: 0;
    padding: 0.4em 0;
    border-top: 1px solid var(--sg-line);
    border-bottom: 1px solid var(--sg-line);
    line-height: 1.25;
    letter-spacing: 0.02em;
  }
  /* 녹색 키워드 블록 (그리드/가로형) */
  #series-gallery.mode-horizontal .sg-keywords,
  #series-gallery.mode-grid .sg-keywords {
    background: var(--color);
    color: #fff;
    padding: 0.5em 0.7em;
    font-size: 0.72em;
    text-align: center;
    letter-spacing: 0.05em;
    display: block;
    overflow: hidden;
    font-family: -apple-system, "Pretendard", sans-serif;
  }
  #series-gallery.mode-horizontal .sg-keywords span,
  #series-gallery.mode-grid .sg-keywords span { display: none; }
  #series-gallery.mode-horizontal .sg-keywords span:first-child,
  #series-gallery.mode-grid .sg-keywords span:first-child {
    display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;
  }
  #series-gallery.mode-horizontal .sg-chars,
  #series-gallery.mode-grid .sg-chars {
    text-align: center;
    font-size: 0.78em;
    color: var(--color);
    opacity: 0.85;
    padding: 0.2em 0;
    line-height: 1.4;
    font-family: "NanumURiDdarSonGeurSsi", serif;
  }
  #series-gallery.mode-horizontal .sg-count,
  #series-gallery.mode-grid .sg-count {
    text-align: center;
    color: var(--point);
    font-weight: 700;
    font-size: 0.85em;
    margin-top: auto;
    padding-top: 0.5em;
    border-top: 1px dashed var(--sg-line);
    font-family: "Cafe24Danjunghae", serif;
  }

  /* ================================================================
     [리스트형] 가로 배너 - 사용자 첨부 이미지에 충실
     좌측 40% 이미지 + 중앙 정보 + 우측 좁은 세로 배너
     ================================================================ */
  #series-gallery.mode-list .sg-list {
    display: flex;
    flex-direction: column;
    gap: 1.4em;
    overflow: hidden;   /* 스크롤 안 뜨게 */
  }
  #series-gallery.mode-list .sg-card {
    background: #fff;
    outline: 1px solid var(--sg-line);
    outline-offset: -1px;
    border: none;
    display: grid;
    grid-template-columns: minmax(180px, 26%) 1fr 64px;
    text-decoration: none !important;
    color: inherit !important;
    transition: transform 0.2s, box-shadow 0.2s, outline-color 0.15s;
    overflow: hidden;
    min-height: 200px;
  }
  #series-gallery.mode-list .sg-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(15, 58, 58, 0.12);
    border-color: var(--sg-line-strong);
  }
  @media (max-width: 720px) {
    #series-gallery.mode-list .sg-card { grid-template-columns: 1fr; }
    #series-gallery.mode-list .sg-side-banner { display: none; }
  }
  
  /* 좌측 이미지 (3:2 정확 비율 컨테이너 안에 꽉 채움) */
  #series-gallery.mode-list .sg-thumb {
    background-color: var(--base);
    background-image: var(--sg-stripe-bg);
    background-size: 4px 4px;
    background-repeat: repeat;
    aspect-ratio: auto;
    height: 100%;
    min-height: 200px;
    border-right: 1px solid var(--sg-line);
  }
  #series-gallery.mode-list .sg-thumb.has-img {
    background-color: transparent;
    background-image: var(--user-img);
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }
  @media (max-width: 720px) {
    #series-gallery.mode-list .sg-thumb {
      aspect-ratio: 3/2;
      min-height: 0;
      border-right: none;
      border-bottom: 1px solid var(--sg-line);
    }
  }
  
  #series-gallery.mode-list .sg-num { display: none; }
  #series-gallery.mode-list .sg-date-line { display: none; }
  
  /* 중앙 정보 영역 */
  #series-gallery.mode-list .sg-body {
    padding: 1.4em 1.6em;
    display: flex;
    flex-direction: column;
    gap: 0;
    justify-content: center;
    min-width: 0;
  }
  #series-gallery.mode-list .sg-catch {
    font-family: "Georgia", serif;
    font-style: italic;
    font-size: 0.9em;
    opacity: 0.75;
    color: var(--color);
    margin-bottom: 0.1em;
  }
  #series-gallery.mode-list .sg-name {
    font-family: "Cafe24Danjunghae", "Georgia", serif;
    font-size: 1.7em;
    color: var(--color);
    margin: 0;
    line-height: 1.15;
    letter-spacing: 0.01em;
    padding-bottom: 0.5em;
    border-bottom: 1px solid var(--sg-line);
    margin-bottom: 0.7em;
  }
  /* character name 1 / X / character name 2 3열 */
  #series-gallery.mode-list .sg-chars {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 0.5em;
    font-size: 0.85em;
    color: var(--color);
    opacity: 0.85;
    padding: 0.3em 0 0.7em 0;
    font-family: "NanumURiDdarSonGeurSsi", serif;
    text-align: center;
    align-items: center;
  }
  #series-gallery.mode-list .sg-chars .ch-x {
    font-family: "Georgia", serif;
    font-weight: 400;
    opacity: 0.5;
    padding: 0 0.5em;
  }
  /* 녹색 3등분 키워드 블록 */
  #series-gallery.mode-list .sg-keywords {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    background: var(--color);
    color: #fff;
    font-size: 0.78em;
    letter-spacing: 0.03em;
    max-width: 100%;
    font-family: -apple-system, "Pretendard", sans-serif;
  }
  #series-gallery.mode-list .sg-keywords span:first-child { display: none; }
  #series-gallery.mode-list .sg-keywords span {
    padding: 0.5em 0.8em;
    text-align: center;
    display: block;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  #series-gallery.mode-list .sg-keywords span:nth-child(2),
  #series-gallery.mode-list .sg-keywords span:nth-child(3) {
    border-right: 1px solid rgba(255,255,255,0.25);
  }
  #series-gallery.mode-list .sg-keywords span:last-child {
    border-right: none;
  }
  /* 하단 3열 표: ◆ | 대사 혹은 부가서술 | ◆ */
  #series-gallery.mode-list .sg-desc-row {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    margin-top: 0.7em;
    border: 1px solid var(--sg-line);   /* 상하좌우 전체 테두리 (상단 선 복원) */
  }
  #series-gallery.mode-list .sg-desc-row .sg-diamond {
    padding: 0.7em 1em;
    color: var(--color);
    text-align: center;
    font-size: 0.85em;
    border-right: 1px solid var(--sg-line);
    opacity: 0.6;
  }
  #series-gallery.mode-list .sg-desc-row .sg-diamond:last-child {
    border-right: none;
    border-left: 1px solid var(--sg-line);
  }
  #series-gallery.mode-list .sg-desc {
    font-family: "NanumURiDdarSonGeurSsi", serif;
    font-size: 0.9em;
    padding: 0.7em 1em;
    color: var(--color);
    opacity: 0.85;
    line-height: 1.5;
    text-align: center;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  #series-gallery.mode-list .sg-count {
    display: none;   /* 리스트형에서 총N화 대신 sg-side-banner 아래에 표시 */
  }
  
  /* 우측 세로 배너 (폭 확장 + rotate 180deg 제거로 위→아래 순서) */
  #series-gallery.mode-list .sg-side-banner {
    background: var(--color);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    writing-mode: vertical-rl;
    text-orientation: mixed;
    /* transform: rotate(180deg) 제거 - 위→아래 정상 방향 */
    font-family: "Cafe24Danjunghae", "Georgia", serif;
    font-size: 1.2em;
    letter-spacing: 0.15em;
    padding: 1.2em 0.6em;
    text-align: center;
    line-height: 1.2;
  }
  #series-gallery.mode-list .sg-side-banner .sb-count {
    font-family: "NanumURiDdarSonGeurSsi", serif;
    font-size: 0.65em;
    opacity: 0.75;
    margin-top: 1em;
  }
  
  /* 그리드/가로형에서만 표시되는 요소 (리스트에서 숨김) */
  #series-gallery.mode-horizontal .sg-desc-row,
  #series-gallery.mode-grid .sg-desc-row,
  #series-gallery.mode-horizontal .sg-side-banner,
  #series-gallery.mode-grid .sg-side-banner { display: none; }
  #series-gallery.mode-horizontal .sg-desc,
  #series-gallery.mode-grid .sg-desc { display: none; }

  /* 공통 상태 안내 (중앙 정렬) */
  .sg-empty, .sg-loading, .sg-error {
    grid-column: 1 / -1;
    text-align: center !important;
    padding: 3em 1em !important;
    color: var(--color);
    opacity: 0.7;
    line-height: 1.8;
    font-size: 0.95em;
    font-family: "NanumURiDdarSonGeurSsi", serif;
  }
  .sg-empty b { color: var(--point); font-family: "Cafe24Danjunghae", serif; }

  /* ================================================================
     [웹툰] 개별 시리즈 상세 페이지 - 톤 통일
     ================================================================ */
  #series-detail { padding: 1em 0; }
  .series-detail-header {
    display: flex; gap: 2em; padding: 2em; background: #fff;
    border: 1px solid var(--sg-line);
    margin-bottom: 2em; align-items: center;
  }
  .series-detail-banner {
    width: 180px; height: 180px; flex-shrink: 0;
    background-color: var(--base);
    background-image: var(--sg-stripe-bg);
    background-size: 4px 4px;
    background-repeat: repeat;
  }
  .series-detail-banner.has-img {
    background-color: transparent;
    background-image: var(--user-img);
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }
  .series-detail-info { flex: 1; }
  .series-detail-name {
    font-family: "Cafe24Danjunghae", serif; font-size: 2em;
    color: var(--color); margin: 0 0 0.4em 0;
  }
  .series-detail-desc {
    color: var(--color); opacity: 0.8; line-height: 1.6;
    margin: 0 0 1em 0;
    font-family: "NanumURiDdarSonGeurSsi", serif;
  }
  .series-detail-meta {
    display: flex; gap: 1em; font-size: 0.9em;
    color: var(--point); font-weight: 700;
    font-family: "Cafe24Danjunghae", serif;
  }
  .series-detail-controls {
    display: flex; justify-content: space-between; align-items: center;
    padding: 0.8em 0; border-bottom: 1px dashed var(--sg-line); margin-bottom: 1em;
  }
  .series-total-count { font-size: 0.9em; color: var(--color); font-weight: 700; }
  .series-filter-btns { display: flex; gap: 0.5em; }
  .series-filter-btn {
    background: #fff; border: 1px solid var(--color);
    padding: 0.4em 1em; border-radius: 24px; cursor: pointer;
    font-size: 0.85em; color: var(--color); transition: all 0.15s;
  }
  .series-filter-btn.active { background: var(--point); border-color: var(--point); color: #fff; }
  .series-filter-btn:hover:not(.active) { background: rgba(245, 168, 138, 0.15); }
  .series-episodes { list-style: none; padding: 0; margin: 0; }
  .series-episode {
    display: flex; gap: 1em; padding: 1em;
    border-bottom: 1px dashed var(--sg-line);
    transition: background 0.2s;
    text-decoration: none !important; color: inherit !important;
    align-items: center;
  }
  .series-episode:hover { background: rgba(245, 168, 138, 0.1); }
  .series-episode-thumb {
    width: 100px; height: 70px;
    background-color: var(--base);
    background-image: var(--sg-stripe-bg);
    background-size: 3px 3px;
    background-repeat: repeat;
    border: 1px solid var(--sg-line);
    flex-shrink: 0;
  }
  .series-episode-thumb.has-img {
    background-color: transparent;
    background-image: var(--user-img);
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }
  .series-episode-body { flex: 1; min-width: 0; }
  .series-episode-num {
    color: var(--point); font-weight: 700; font-size: 0.85em; margin-bottom: 0.2em;
    font-family: "Cafe24Danjunghae", serif;
  }
  .series-episode-title {
    color: var(--color); font-weight: 600; margin: 0 0 0.3em 0;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .series-episode-date {
    font-size: 0.8em; opacity: 0.7;
    font-family: "NanumURiDdarSonGeurSsi", serif;
  }
  .series-loading, .series-error {
    text-align: center; padding: 3em 1em;
    color: var(--color); opacity: 0.7;
    font-family: "NanumURiDdar 테SonGeurSsi", serif;
  }

  /* ================================================================
     [편집기 관리자용] 시리즈 관련글 플로팅 패널
     ================================================================ */
  #editor-series-btn {
    position: fixed; top: 80px; right: 20px; z-index: 9998;
    background: #F5A88A; color: #fff; border: none;
    padding: 10px 16px; border-radius: 30px;
    font-size: 13px; font-weight: 600; cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }
  #editor-series-btn:hover { background: #e08b6a; }
  #editor-series-panel {
    position: fixed; top: 130px; right: 20px; width: 320px; max-height: 500px;
    background: #fff; border: 1px solid #ddd; border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.15); padding: 16px;
    z-index: 9997; display: none; overflow-y: auto;
    font-family: sans-serif; font-size: 13px;
  }
  #editor-series-panel.open { display: block; }
  #editor-series-panel h4 { margin: 0 0 10px 0; font-size: 14px; }
  #editor-series-panel .series-group {
    margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid #eee;
  }
  #editor-series-panel .series-group:last-child { border-bottom: none; }
  #editor-series-panel .series-group-title {
    font-weight: 700; color: #F5A88A; margin-bottom: 6px;
  }
  #editor-series-panel ul { list-style: none; padding: 0; margin: 0; }
  #editor-series-panel li { padding: 4px 0; }
  #editor-series-panel a { color: #333; text-decoration: none; }
  #editor-series-panel a:hover { color: #F5A88A; }`;
  
  function injectCSS(){
    // 이미 있으면 스킵
    if (document.getElementById('ddl-series-v5-style')) return;
    var st = document.createElement('style');
    st.id = 'ddl-series-v5-style';
    st.setAttribute('data-ddl-skin', '1');
    st.appendChild(document.createTextNode(CSS_TEXT));
    (document.head || document.documentElement).appendChild(st);
  }
  injectCSS();
  
  // ============================================================
  // 3. 원본 SERIES-SYSTEM v5 스크립트 그대로 실행
  //    아래 코드는 원본 <script> 태그 내용 그대로 (수정 X)
  // ============================================================
(function(){
  'use strict';
  
  var CONTENT_API_KEY = '39b17c3fb020743b7da0116c24';
  var SITE_URL = 'https://2vvena.ghost.io';
  var API = SITE_URL + '/ghost/api/content';
  var GALLERY_MODE_KEY = 'series_gallery_mode';
  
  // ★ 추가된 회원 권한 체크 함수 (위와 동일)
  function buildFilter(base) {
    var isAdmin = !!document.getElementById('ghost-admin-toolbar-root');
    var canSeeAll = (typeof window.IS_MEMBER !== 'undefined' && window.IS_MEMBER) || isAdmin;
    if (canSeeAll) return base ? base : undefined;
    return base ? (base + '+visibility:public') : 'visibility:public';
  }

  function apiGet(endpoint, params) {
    var url = API + endpoint + '?key=' + CONTENT_API_KEY;
    if (params) {
      Object.keys(params).forEach(function(k){
        url += '&' + k + '=' + encodeURIComponent(params[k]);
      });
    }
    return fetch(url).then(function(r){ return r.json(); });
  }
  
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  
  function filterSeriesTags(tags) {
    return (tags || []).filter(function(t){
      return t.slug && t.slug.toLowerCase().indexOf('series-') === 0;
    });
  }
  
  function parseDesc(desc) {
    var parts = (desc || '').split('|').map(function(x){ return x.trim(); });
    return {
      catch_: parts[0] || '',
      nameOverride: parts[1] || '',
      kw1: parts[2] || '',
      kw2: parts[3] || '',
      chars: parts[4] || '',
      extra: parts[5] || ''
    };
  }
  
  // 캐릭터 문자열 파싱: "A x B" → 3열용 { left: A, right: B }
  function parseChars(chars) {
    if (!chars) return { left: '', right: '', hasX: false };
    var m = chars.split(/\s*[xX×]\s*/);
    if (m.length >= 2) {
      return { left: m[0].trim(), right: m.slice(1).join(' x ').trim(), hasX: true };
    }
    return { left: chars.trim(), right: '', hasX: false };
  }
  
  function formatDate(dateStr) {
    if (!dateStr) return '';
    var d = new Date(dateStr);
    return d.getFullYear() + '.' + String(d.getMonth()+1).padStart(2,'0') + '.' + String(d.getDate()).padStart(2,'0');
  }
  
  function helpPopupHTML() {
    return '<div class="sg-help-popup" id="sg-help-popup">' +
      '<button class="sg-help-close" onclick="document.getElementById(\'sg-help-popup\').classList.remove(\'open\'); document.getElementById(\'sg-help-backdrop\').classList.remove(\'open\');">✕</button>' +
      '<h3>📝 시리즈 카드 편집 방법</h3>' +
      '<p><b>1단계.</b> Ghost 관리자 → <b>Tags</b> 메뉴 → <code>series-XXX</code> 태그 클릭</p>' +
      '<p><b>2단계.</b> 아래 필드를 입력하고 <b>Save</b>:</p>' +
      '<table class="sg-help-table">' +
        '<tr><td>Feature image</td><td>카드 이미지 (업로드)</td></tr>' +
        '<tr><td>Description</td><td>파이프(<code>|</code>)로 나눠 입력</td></tr>' +
      '</table>' +
      '<p><b>Description 6칸 순서:</b></p>' +
      '<pre>캐치프레이즈 | 페어명 | 키워드1 | 키워드2 | 캐릭터 | 추가설명</pre>' +
      '<p><b>실제 예시:</b></p>' +
      '<pre>봄날 이야기 | 봄 시리즈 | 봄 | 꽃 | 나 x 너 | 따뜻한 봄날의 짧은 에피소드</pre>' +
      '<table class="sg-help-table">' +
        '<tr><td>1. 캐치프레이즈</td><td>카드 상단 작은 글자</td></tr>' +
        '<tr><td>2. 페어명</td><td>큰 제목 (없으면 태그명 사용)</td></tr>' +
        '<tr><td>3. 키워드1</td><td>녹색 블록 안 "#키워드1"</td></tr>' +
        '<tr><td>4. 키워드2</td><td>녹색 블록 안 "#키워드2"</td></tr>' +
        '<tr><td>5. 캐릭터</td><td>"나 x 너" 형식이면 좌우 나눠서 표시</td></tr>' +
        '<tr><td>6. 추가설명</td><td>리스트뷰 하단에 표시</td></tr>' +
      '</table>' +
      '<p style="opacity:0.7;font-size:0.9em;">💡 <b>비워도 됨</b>: 필요없는 칸은 그냥 비우고 <code>|</code>만 넣어도 됩니다. 예: <code>|봄 시리즈||||</code></p>' +
      '<p style="opacity:0.7;font-size:0.9em;">💡 파이프 <code>|</code>는 <b>Shift + \\</b> (엔터 위 키) 로 입력합니다.</p>' +
    '</div>' +
    '<div class="sg-help-backdrop" id="sg-help-backdrop" onclick="document.getElementById(\'sg-help-popup\').classList.remove(\'open\'); this.classList.remove(\'open\');"></div>';
  }
  
  function renderSeriesGallery() {
    var container = document.getElementById('series-gallery');
    if (!container) return;
    
    var mode = 'grid';
    try { mode = localStorage.getItem(GALLERY_MODE_KEY) || 'grid'; } catch(e){}
    if (['horizontal','grid','list'].indexOf(mode) === -1) mode = 'grid';
    
    container.className = 'mode-' + mode;
    container.innerHTML = 
      '<div class="sg-header">' +
        '<h2 class="sg-title">📚 시리즈' +
          '<span class="sg-help" id="sg-help-btn" title="편집 방법 안내">?</span>' +
        '</h2>' +
        '<div class="sg-filter">' +
          '<button class="sg-filter-btn' + (mode==='horizontal'?' active':'') + '" data-mode="horizontal">가로형</button>' +
          '<button class="sg-filter-btn' + (mode==='grid'?' active':'') + '" data-mode="grid">그리드</button>' +
          '<button class="sg-filter-btn' + (mode==='list'?' active':'') + '" data-mode="list">리스트</button>' +
        '</div>' +
      '</div>' +
      '<div class="sg-list"><div class="sg-loading">시리즈를 불러오는 중...</div></div>' +
      helpPopupHTML();
    
    container.querySelectorAll('.sg-filter-btn').forEach(function(btn){
      btn.addEventListener('click', function(){
        var newMode = btn.dataset.mode;
        container.className = 'mode-' + newMode;
        container.querySelectorAll('.sg-filter-btn').forEach(function(b){ b.classList.remove('active'); });
        btn.classList.add('active');
        try { localStorage.setItem(GALLERY_MODE_KEY, newMode); } catch(e){}
      });
    });
    
    var helpBtn = document.getElementById('sg-help-btn');
    if (helpBtn) helpBtn.addEventListener('click', function(){
      document.getElementById('sg-help-popup').classList.add('open');
      document.getElementById('sg-help-backdrop').classList.add('open');
    });
    
    // 가로형: 마우스 세로 휠을 가로 스크롤로 변환
    var sgList = container.querySelector('.sg-list');
    if (sgList) {
      sgList.addEventListener('wheel', function(e){
        if (!container.classList.contains('mode-horizontal')) return;
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;   // 이미 가로 휠이면 놔둠
        if (e.deltaY === 0) return;
        e.preventDefault();
        sgList.scrollLeft += e.deltaY;
      }, { passive: false });
    }
    
    apiGet('/tags/', { limit: 'all', include: 'count.posts', order: 'name asc' })
      .then(function(data){
        var series = filterSeriesTags(data.tags);
        var listBox = container.querySelector('.sg-list');
        if (series.length === 0) {
          listBox.innerHTML = '<div class="sg-empty">아직 시리즈가 없습니다.<br><br>Ghost 관리자 → <b>Tags</b> 메뉴에서<br><b>series-XXX</b> 형식으로 태그를 만들어보세요.</div>';
          return;
        }
        
        listBox.innerHTML = series.map(function(s, i){
          var d = parseDesc(s.description);
          var hasImg = !!s.feature_image;
          var imgStyle = hasImg ? 'style="--user-img:url(\'' + esc(s.feature_image) + '\');"' : '';
          var name = d.nameOverride || s.name.replace(/^series-/i, '');
          var count = s.count ? s.count.posts : 0;
          var num = String(i+1).padStart(2, '0');
          var catch_ = d.catch_ || 'Catchphrase';
          var kw1 = d.kw1 || '키워드1';
          var kw2 = d.kw2 || '키워드2';
          var gridKw = '#' + kw1 + '  ·  #' + kw2;
          var chars = parseChars(d.chars);
          
          return '<a href="/tag/' + esc(s.slug) + '/" class="sg-card" ' + imgStyle + '>' +
            '<div class="sg-num">' + num + '.</div>' +
            '<div class="sg-date-line">Series ' + num + '</div>' +
            '<div class="sg-thumb' + (hasImg ? ' has-img' : '') + '"></div>' +
            '<div class="sg-body">' +
              '<div class="sg-catch">' + esc(catch_) + '</div>' +
              '<h3 class="sg-name">' + esc(name) + '</h3>' +
              '<div class="sg-chars">' +
                (chars.hasX 
                  ? '<span>' + esc(chars.left) + '</span><span class="ch-x">X</span><span>' + esc(chars.right) + '</span>'
                  : '<span style="grid-column:1/-1;">' + esc(chars.left || '') + '</span>') +
              '</div>' +
              '<div class="sg-keywords">' +
                '<span>' + esc(gridKw) + '</span>' +
                '<span>#' + esc(kw1) + '</span>' +
                '<span>#' + esc(kw2) + '</span>' +
                '<span>#' + esc(d.kw1 || kw1) + '</span>' +
              '</div>' +
              '<div class="sg-desc-row">' +
                '<span class="sg-diamond">✦</span>' +
                '<div class="sg-desc">' + esc(d.extra || '대사 혹은 부가서술') + '</div>' +
                '<span class="sg-diamond">✦</span>' +
              '</div>' +
              '<div class="sg-count">총 ' + count + '화</div>' +
            '</div>' +
            '<div class="sg-side-banner">' +
              esc(name) +
              '<span class="sb-count">' + count + '화</span>' +
            '</div>' +
          '</a>';
        }).join('');
      }).catch(function(e){
        var listBox = container.querySelector('.sg-list');
        if (listBox) listBox.innerHTML = '<div class="sg-error">불러오기 실패</div>';
        console.warn('[시리즈 갤러리] 실패:', e);
      });
  }
  
  function renderSeriesDetail() {
    if (!document.body.classList.contains('tag-template')) return;
    
    var match = window.location.pathname.match(/\/tag\/([^\/]+)/);
    if (!match) return;
    var tagSlug = match[1];
    if (tagSlug.toLowerCase().indexOf('series-') !== 0) return;
    
    var mainContent = document.querySelector('.gh-main .gh-postfeed, .gh-main .gh-feed, .gh-main .gh-container.is-list');
    var tagHeader = document.querySelector('.gh-main > header, .gh-main .gh-header');
    if (mainContent) mainContent.style.display = 'none';
    if (tagHeader) tagHeader.style.display = 'none';
    
    var detail = document.createElement('div');
    detail.id = 'series-detail';
    detail.innerHTML = '<div class="series-loading">시리즈를 불러오는 중...</div>';
    var main = document.querySelector('.gh-main');
    if (main) main.insertBefore(detail, main.firstChild);
    
    // ★ 이 부분이 핵심이야! 시리즈 리스트를 불러올 때 권한을 확인하고 긁어와!
   Promise.all([
      apiGet('/tags/slug/' + tagSlug + '/', { include: 'count.posts' }),
      apiGet('/posts/', {
        filter: 'tag:' + tagSlug,
        limit: 'all',
        order: 'published_at asc',
        fields: 'id,title,slug,published_at,feature_image,excerpt,visibility'
      })
    ]).then(function(results){
      var tag = results[0].tags && results[0].tags[0];
      var posts = results[1].posts || [];
      var isAdmin = !!document.getElementById('ghost-admin-toolbar-root');
      var canSeeAll = (typeof window.IS_MEMBER !== 'undefined' && window.IS_MEMBER) || isAdmin;
      if (!canSeeAll) posts = posts.filter(function(p) { return p.visibility === 'public'; });
      if (!tag) { detail.innerHTML = '<div class="series-error">시리즈를 찾을 수 없습니다.</div>'; return; }
      
      var d = parseDesc(tag.description);
      var displayName = d.nameOverride || tag.name.replace(/^series-/i, '');
      var hasImg = !!tag.feature_image;
      var bannerStyle = hasImg ? 'style="--user-img:url(\'' + esc(tag.feature_image) + '\');"' : '';
      var bannerClass = hasImg ? 'series-detail-banner has-img' : 'series-detail-banner';
      
      function renderEpisodes(order) {
        var sorted = posts.slice();
        if (order === 'desc') sorted.reverse();
        var listHtml = sorted.map(function(p, i){
          var num = order === 'asc' ? (i+1) : (posts.length - i);
          var hasT = !!p.feature_image;
          var thumbStyle = hasT ? 'style="--user-img:url(\'' + esc(p.feature_image) + '\');"' : '';
          var thumbCls = hasT ? 'series-episode-thumb has-img' : 'series-episode-thumb';
          var dateStr = formatDate(p.published_at);
          return '<a href="/' + esc(p.slug) + '/" class="series-episode">' +
            '<div class="' + thumbCls + '" ' + thumbStyle + '></div>' +
            '<div class="series-episode-body">' +
              '<div class="series-episode-num">' + num + '화</div>' +
              '<h4 class="series-episode-title">' + esc(p.title) + '</h4>' +
              '<div class="series-episode-date">' + dateStr + '</div>' +
            '</div>' +
          '</a>';
        }).join('');
        document.querySelector('.series-episodes').innerHTML = listHtml;
      }
      
      detail.innerHTML = 
        '<div class="series-detail-header">' +
          '<div class="' + bannerClass + '" ' + bannerStyle + '></div>' +
          '<div class="series-detail-info">' +
            '<h1 class="series-detail-name">' + esc(displayName) + '</h1>' +
            '<p class="series-detail-desc">' + esc(d.extra || tag.description || '') + '</p>' +
            '<div class="series-detail-meta">' +
              '<span>총 ' + posts.length + '화</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="series-detail-controls">' +
          '<div class="series-total-count">총 ' + posts.length + '화</div>' +
          '<div class="series-filter-btns">' +
            '<button class="series-filter-btn active" data-order="asc">1화부터</button>' +
            '<button class="series-filter-btn" data-order="desc">최신화부터</button>' +
          '</div>' +
        '</div>' +
        '<ul class="series-episodes"></ul>';
      
      renderEpisodes('asc');
      
      detail.querySelectorAll('.series-filter-btn').forEach(function(btn){
        btn.addEventListener('click', function(){
          detail.querySelectorAll('.series-filter-btn').forEach(function(b){ b.classList.remove('active'); });
          btn.classList.add('active');
          renderEpisodes(btn.dataset.order);
        });
      });
    }).catch(function(e){
      detail.innerHTML = '<div class="series-error">불러오기 실패</div>';
      console.warn('[시리즈 상세] 실패:', e);
    });
  }
  
  function renderEditorSeriesPanel() {
    if (!window.location.pathname.includes('/ghost/')) return;
    if (!window.location.hash.includes('/editor/')) {
      window.addEventListener('hashchange', renderEditorSeriesPanel);
      return;
    }
    if (document.getElementById('editor-series-btn')) return;
    
    var btn = document.createElement('button');
    btn.id = 'editor-series-btn';
    btn.textContent = '📚 시리즈 관련글';
    document.body.appendChild(btn);
    
    var panel = document.createElement('div');
    panel.id = 'editor-series-panel';
    panel.innerHTML = '<h4>📚 시리즈 관련글</h4><div class="loading">불러오는 중...</div>';
    document.body.appendChild(panel);
    
    btn.addEventListener('click', function(){
      panel.classList.toggle('open');
      if (panel.classList.contains('open')) loadEditorSeriesData(panel);
    });
  }
  
  function loadEditorSeriesData(panel) {
    apiGet('/tags/', { limit: 'all', include: 'count.posts' }).then(function(data){
      var series = filterSeriesTags(data.tags);
      if (series.length === 0) {
        panel.innerHTML = '<h4>📚 시리즈 관련글</h4><p style="opacity:0.6;">아직 시리즈 태그가 없습니다.<br>Tags 메뉴에서 series-XXX 형식으로 태그를 만들어보세요.</p>';
        return;
      }
      var promises = series.map(function(s){
        return apiGet('/posts/', {
          filter: 'tag:' + s.slug, limit: 'all',
          order: 'published_at asc', fields: 'id,title,slug'
        }).then(function(r){ return { series: s, posts: r.posts || [] }; });
      });
      Promise.all(promises).then(function(results){
        var html = '<h4>📚 시리즈 관련글</h4>';
        results.forEach(function(g){
          var displayName = g.series.name.replace(/^series-/i, '');
          html += '<div class="series-group">' +
            '<div class="series-group-title">📖 ' + esc(displayName) + ' (' + g.posts.length + '화)</div>' +
            '<ul>' +
              g.posts.map(function(p, i){
                return '<li><a href="/' + esc(p.slug) + '/" target="_blank">' + (i+1) + '. ' + esc(p.title) + '</a></li>';
              }).join('') +
            '</ul>' +
          '</div>';
        });
        panel.innerHTML = html;
      });
    }).catch(function(e){
      panel.innerHTML = '<h4>📚 시리즈 관련글</h4><p style="color:red;">불러오기 실패</p>';
    });
  }
  
  function init() {
    renderSeriesGallery();
    renderSeriesDetail();
    renderEditorSeriesPanel();
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
})();
