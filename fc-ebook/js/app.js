/* 쿠팡 FC 인력 운영과 SLA 하락 위험 조건 분석 — 웹 eBook
   외부 라이브러리 없이 동작하는 순수 JavaScript 구현 */
(function () {
  'use strict';

  var TOTAL = 26;
  var ASPECT = 841.89 / 595.3;           // A4 세로 비율
  var PAGE_W = 595.3, PAGE_H = 841.89;   // 원본 PDF 포인트 크기
  var FLIP_MS = 950, FAST_MS = 500;

  /* 목차 — 원본 보고서 2쪽 목차와 동일 (y, h: 원본 PDF 2쪽 좌표) */
  var TOC = [
    { t: '1. 분석 배경', p: 3, l: 0, y: 132.19, h: 15.93 },
    { t: '1.1 분석 목적', p: 3, l: 1, y: 153.30, h: 14.48 },
    { t: '1.2 분석 범위와 핵심 질문', p: 3, l: 1, y: 172.70, h: 14.48 },
    { t: '1.3 핵심 결과 요약', p: 3, l: 1, y: 192.10, h: 14.48 },
    { t: '2. 데이터 개요', p: 4, l: 0, y: 216.49, h: 15.93 },
    { t: '2.1 분석 데이터셋', p: 4, l: 1, y: 237.60, h: 14.48 },
    { t: '2.2 데이터 무결성 점검', p: 4, l: 1, y: 257.00, h: 14.48 },
    { t: '2.3 주요 변수의 기술통계', p: 5, l: 1, y: 276.40, h: 14.48 },
    { t: '3. 분석 방법', p: 6, l: 0, y: 300.79, h: 15.93 },
    { t: '3.1 파생변수', p: 6, l: 1, y: 321.90, h: 14.48 },
    { t: '3.2 집계와 통계 기법', p: 6, l: 1, y: 341.30, h: 14.48 },
    { t: '3.3 지표 정의', p: 6, l: 1, y: 360.70, h: 14.48 },
    { t: '4. 결과 분석', p: 7, l: 0, y: 385.09, h: 15.93 },
    { t: '4.1 요일별 분석', p: 7, l: 1, y: 406.20, h: 14.48 },
    { t: '4.2 프로모션·명절 성수기별 분석', p: 9, l: 1, y: 425.60, h: 14.48 },
    { t: '4.3 날씨별 분석', p: 11, l: 1, y: 445.00, h: 14.48 },
    { t: '4.4 전국 5 개 FC 비교', p: 13, l: 1, y: 464.40, h: 14.48 },
    { t: '4.5 주요 변수와 SLA 의 상관관계', p: 15, l: 1, y: 483.80, h: 14.48 },
    { t: '4.6 SLA 관리 등급별 분석', p: 17, l: 1, y: 503.20, h: 14.48 },
    { t: '4.7 복합 위험 조건 분석', p: 19, l: 1, y: 522.60, h: 14.48 },
    { t: '4.8 SLA 위험 발생 비율 TOP 5 조건', p: 20, l: 1, y: 542.00, h: 14.48 },
    { t: '5. 운영 개선 방안', p: 22, l: 0, y: 566.39, h: 15.93 },
    { t: '6. 결론 및 한계', p: 24, l: 0, y: 592.49, h: 15.93 },
    { t: '6.1 핵심 결론', p: 24, l: 1, y: 613.60, h: 14.48 },
    { t: '6.2 한계와 주의사항', p: 24, l: 1, y: 633.00, h: 14.48 },
    { t: '6.3 다루지 않은 주제', p: 25, l: 1, y: 652.40, h: 14.48 },
    { t: '부록. 자료 및 파일 목록', p: 26, l: 0, y: 676.79, h: 15.93 }
  ];
  var TOC_X0 = 58, TOC_X1 = 537;

  /* ───── DOM ───── */
  var $ = function (id) { return document.getElementById(id); };
  var stage = $('stage'), book = $('book'), splash = $('splash');
  var drawer = $('drawer'), scrim = $('scrim');
  var slider = $('slider'), pageNow = $('pageNow');
  var bgm = $('bgm'), sfx = $('sfx');

  /* ───── 상태 ───── */
  var mode = 'spread';        // 'spread' | 'single'
  var leaves = [];
  var n = 0;                  // 장(leaf) 수
  var flipped = 0;            // 넘어간 장 수
  var maxFlip = 0;
  var zoom = 1;
  var busyUntil = 0;
  var musicOn = false;

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {} return null; }

  /* ───── 페이지/상태 변환 ───── */
  function targetFor(p) {
    p = Math.max(1, Math.min(TOTAL, p));
    return mode === 'spread' ? Math.floor(p / 2) : p - 1;
  }
  function visible() {
    if (mode === 'single') return [flipped + 1];
    if (flipped === 0) return [1];
    var l = flipped * 2, r = l + 1;
    return r <= TOTAL ? [l, r] : [l];
  }
  function currentPage() { return visible()[0]; }

  /* ───── 책 생성 ───── */
  function face(p, cls) {
    var d = document.createElement('div');
    d.className = 'face ' + cls + (p === 1 ? ' cover' : '');
    if (!p) { d.className += ' blank'; return d; }
    var img = new Image();
    img.src = 'assets/pages/p-' + (p < 10 ? '0' + p : p) + '.jpg';
    img.alt = '보고서 ' + p + '쪽';
    img.decoding = 'async';
    img.draggable = false;
    d.appendChild(img);
    if (p === 2) addHotspots(d);
    return d;
  }
  function addHotspots(host) {
    TOC.forEach(function (it) {
      var a = document.createElement('a');
      a.className = 'hot';
      a.href = '#p=' + it.p;
      a.setAttribute('aria-label', it.t + ' — ' + it.p + '쪽으로 이동');
      a.title = it.t + '  (' + it.p + '쪽)';
      a.style.left = (TOC_X0 / PAGE_W * 100) + '%';
      a.style.width = ((TOC_X1 - TOC_X0) / PAGE_W * 100) + '%';
      a.style.top = ((it.y - 1) / PAGE_H * 100) + '%';
      a.style.height = ((it.h + 2) / PAGE_H * 100) + '%';
      a.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); goTo(it.p); });
      host.appendChild(a);
    });
  }
  function build() {
    book.innerHTML = '';
    leaves = [];
    book.className = 'book' + (mode === 'single' ? ' single' : '');
    if (mode === 'spread') {
      n = 13; maxFlip = 13;
      for (var i = 0; i < n; i++) {
        var lf = document.createElement('div');
        lf.className = 'leaf';
        lf.appendChild(face(2 * i + 1, 'front'));
        lf.appendChild(face(2 * i + 2, 'back'));
        book.appendChild(lf); leaves.push(lf);
      }
    } else {
      n = TOTAL; maxFlip = TOTAL - 1;
      for (var j = 0; j < n; j++) {
        var lf2 = document.createElement('div');
        lf2.className = 'leaf';
        lf2.appendChild(face(j + 1, 'front'));
        lf2.appendChild(face(0, 'back'));
        book.appendChild(lf2); leaves.push(lf2);
      }
    }
  }
  function applyState() {
    leaves.forEach(function (lf, i) {
      var f = i < flipped;
      lf.classList.toggle('flipped', f);
      lf.style.zIndex = f ? (i + 1) : (n - i);
    });
    book.classList.toggle('at-start', mode === 'spread' && flipped === 0);
    book.classList.toggle('at-end', mode === 'spread' && flipped === maxFlip);
  }

  /* ───── 넘김 ───── */
  function playSfx() {
    if (!musicOn || !sfx) return;
    try { sfx.currentTime = 0; sfx.volume = Math.min(1, (+$('vol').value / 100) * 1.4); sfx.play().catch(function () {}); } catch (e) {}
  }
  function step(dir, fast) {
    if (dir > 0 && flipped >= maxFlip) return false;
    if (dir < 0 && flipped <= 0) return false;
    var idx = dir > 0 ? flipped : flipped - 1;
    var lf = leaves[idx];
    lf.style.zIndex = 2000 + idx;
    lf.classList.add('turning');
    flipped += dir;
    lf.classList.toggle('flipped', dir > 0);
    book.classList.toggle('at-start', mode === 'spread' && flipped === 0);
    book.classList.toggle('at-end', mode === 'spread' && flipped === maxFlip);
    playSfx();
    setTimeout(function () {
      lf.classList.remove('turning');
      lf.style.zIndex = (idx < flipped) ? (idx + 1) : (n - idx);
    }, fast ? FAST_MS + 60 : FLIP_MS + 60);
    updateUI();
    return true;
  }
  function next() { if (Date.now() < busyUntil) return; busyUntil = Date.now() + 260; step(1, false); }
  function prev() { if (Date.now() < busyUntil) return; busyUntil = Date.now() + 260; step(-1, false); }

  var chain = null;
  function goTo(p) {
    var target = targetFor(p);
    if (chain) { clearInterval(chain); chain = null; book.classList.remove('fast'); }
    closeDrawer();
    if (target === flipped) { updateUI(); return; }
    var dir = target > flipped ? 1 : -1;
    var dist = Math.abs(target - flipped);
    if (dist === 1) { step(dir, false); return; }
    book.classList.add('fast');
    step(dir, true);
    var gap = Math.max(90, Math.min(170, 1300 / dist));
    chain = setInterval(function () {
      if (flipped === target || !step(dir, true)) {
        clearInterval(chain); chain = null;
        setTimeout(function () { book.classList.remove('fast'); }, FAST_MS);
      }
      if (flipped === target) { clearInterval(chain); chain = null; setTimeout(function () { book.classList.remove('fast'); }, FAST_MS); }
    }, gap);
  }

  /* ───── UI 갱신 ───── */
  function updateUI() {
    var v = visible();
    pageNow.textContent = v.length === 2 ? (v[0] + '–' + v[1]) : String(v[0]);
    slider.value = v[0];
    var atStart = flipped === 0, atEnd = flipped >= maxFlip;
    $('btnPrev').disabled = atStart; $('arrowPrev').disabled = atStart;
    $('btnNext').disabled = atEnd;   $('arrowNext').disabled = atEnd;
    document.title = '쿠팡 FC SLA 분석 보고서 eBook · ' + (v.length === 2 ? v[0] + '–' + v[1] : v[0]) + '/' + TOTAL + '쪽';
    try { history.replaceState(null, '', '#p=' + v[0]); } catch (e) {}
    highlight(v);
  }
  function highlight(v) {
    v = v || visible();
    var best = null;
    TOC.forEach(function (it) { if (it.p <= v[v.length - 1]) best = it; });
    Array.prototype.forEach.call($('tocList').children, function (a, i) {
      a.classList.toggle('active', TOC[i] === best);
    });
    Array.prototype.forEach.call($('thumbList').children, function (b) {
      b.classList.toggle('active', v.indexOf(+b.dataset.p) > -1);
    });
  }

  /* ───── 크기 / 확대·축소 ───── */
  function layout() {
    var cs = getComputedStyle(stage);
    var wrapPadX = window.innerWidth <= 560 ? 20 : 60, wrapPadY = window.innerWidth <= 560 ? 20 : 68;
    var availW = stage.clientWidth - wrapPadX;
    var availH = stage.clientHeight - wrapPadY;
    var newMode = (stage.clientWidth / stage.clientHeight < 1.1 || stage.clientWidth < 700) ? 'single' : 'spread';
    var pw;
    if (newMode === 'spread') pw = Math.min(availH / ASPECT, availW / 2);
    else pw = Math.min(availH / ASPECT, availW);
    pw = Math.max(160, pw) * zoom;
    document.documentElement.style.setProperty('--pw', pw.toFixed(1) + 'px');
    document.documentElement.style.setProperty('--ph', (pw * ASPECT).toFixed(1) + 'px');
    $('zoomLabel').textContent = Math.round(zoom * 100) + '%';
    if (newMode !== mode) {
      var keep = currentPage();
      mode = newMode;
      build();
      flipped = targetFor(keep);
      applyState();
      updateUI();
    }
  }
  function setZoom(z) {
    zoom = Math.max(0.5, Math.min(3, Math.round(z * 100) / 100));
    layout();
    if (zoom <= 1) { stage.scrollLeft = 0; stage.scrollTop = 0; }
  }

  /* ───── 서랍 ───── */
  function buildDrawer() {
    var toc = $('tocList');
    TOC.forEach(function (it) {
      var a = document.createElement('a');
      a.className = 'l' + it.l;
      a.href = '#p=' + it.p;
      a.innerHTML = '<span class="t"></span><span class="dots"></span><span class="n">' + it.p + '</span>';
      a.firstChild.textContent = it.t;
      a.addEventListener('click', function (e) { e.preventDefault(); goTo(it.p); });
      toc.appendChild(a);
    });
    var th = $('thumbList');
    for (var p = 1; p <= TOTAL; p++) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'thumb'; b.dataset.p = p;
      b.innerHTML = '<img loading="lazy" alt="" src="assets/pages/p-' + (p < 10 ? '0' + p : p) + '.jpg"><span>' + p + '</span>';
      (function (pp) { b.addEventListener('click', function () { goTo(pp); }); })(p);
      th.appendChild(b);
    }
  }
  function openDrawer() { drawer.classList.add('open'); scrim.classList.add('show'); drawer.setAttribute('aria-hidden', 'false'); }
  function closeDrawer() { drawer.classList.remove('open'); scrim.classList.remove('show'); drawer.setAttribute('aria-hidden', 'true'); }
  function tab(which) {
    var toc = which === 'toc';
    $('tabToc').classList.toggle('active', toc); $('tabThumb').classList.toggle('active', !toc);
    $('tocList').hidden = !toc; $('thumbList').hidden = toc;
  }

  /* ───── 음악 ───── */
  function setMusic(on) {
    if (on) {
      bgm.volume = +$('vol').value / 100;
      var pr = bgm.play();
      if (pr && pr.then) pr.then(function () { musicOn = true; reflectMusic(); }).catch(function () { musicOn = false; reflectMusic(); });
      else { musicOn = true; reflectMusic(); }
    } else {
      bgm.pause(); musicOn = false; reflectMusic();
    }
  }
  function reflectMusic() {
    var b = $('btnMusic');
    b.setAttribute('aria-pressed', musicOn ? 'true' : 'false');
    b.setAttribute('aria-label', musicOn ? '배경음악 정지' : '배경음악 재생');
    b.title = musicOn ? '배경음악 정지 (M)' : '배경음악 재생 (M)';
  }

  /* ───── 전체 화면 ───── */
  function fsElement() { return document.fullscreenElement || document.webkitFullscreenElement; }
  function toggleFull() {
    var el = document.documentElement;
    var req = el.requestFullscreen || el.webkitRequestFullscreen;
    if (req) {
      if (fsElement()) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); }
      else {
        var pr = req.call(el);
        if (pr && pr.catch) pr.catch(function () { document.body.classList.toggle('immersive'); setTimeout(layout, 350); });
      }
    } else { // iOS Safari 등 — 상·하단 바를 숨기는 몰입 모드로 대체
      document.body.classList.toggle('immersive');
      setTimeout(layout, 350);
    }
  }
  function onFsChange() {
    var on = !!fsElement();
    $('btnFull').querySelector('use').setAttribute('href', on ? '#i-exit' : '#i-full');
    $('btnFull').setAttribute('aria-label', on ? '전체 화면 종료' : '전체 화면');
    setTimeout(layout, 150);
  }

  /* ───── 입력 처리 ───── */
  function bind() {
    $('btnNext').onclick = $('arrowNext').onclick = next;
    $('btnPrev').onclick = $('arrowPrev').onclick = prev;
    $('btnToc').onclick = openDrawer;
    $('drawerClose').onclick = closeDrawer;
    scrim.onclick = closeDrawer;
    $('tabToc').onclick = function () { tab('toc'); };
    $('tabThumb').onclick = function () { tab('thumb'); highlight(); };
    $('zoomIn').onclick = function () { setZoom(zoom + 0.25); };
    $('zoomOut').onclick = function () { setZoom(zoom - 0.25); };
    $('zoomLabel').onclick = function () { setZoom(1); };
    $('btnFull').onclick = toggleFull;
    $('btnMusic').onclick = function () { setMusic(!musicOn); };
    $('vol').oninput = function () { bgm.volume = this.value / 100; store('fc-vol', this.value); };
    slider.oninput = function () { pageNow.textContent = this.value; };
    slider.onchange = function () { goTo(+this.value); };

    $('openWithMusic').onclick = function () { openBook(true); };
    $('openQuiet').onclick = function () { openBook(false); };

    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);

    document.addEventListener('keydown', function (e) {
      if (!splash.classList.contains('hide')) { if (e.key === 'Enter') openBook(false); return; }
      if (e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName) && e.target.type !== 'range') return;
      switch (e.key) {
        case 'ArrowRight': case 'PageDown': if (e.target.type !== 'range') { e.preventDefault(); next(); } break;
        case 'ArrowLeft': case 'PageUp': if (e.target.type !== 'range') { e.preventDefault(); prev(); } break;
        case 'Home': goTo(1); break;
        case 'End': goTo(TOTAL); break;
        case '+': case '=': setZoom(zoom + 0.25); break;
        case '-': case '_': setZoom(zoom - 0.25); break;
        case '0': setZoom(1); break;
        case 'f': case 'F': toggleFull(); break;
        case 'm': case 'M': setMusic(!musicOn); break;
        case 't': case 'T': drawer.classList.contains('open') ? closeDrawer() : openDrawer(); break;
        case 'Escape': closeDrawer(); if (document.body.classList.contains('immersive')) { document.body.classList.remove('immersive'); setTimeout(layout, 350); } break;
      }
    });

    /* 클릭(좌/우) · 드래그 이동 · 스와이프 */
    var down = null, moved = 0, startScroll = null;
    stage.addEventListener('pointerdown', function (e) {
      if (e.target.closest && e.target.closest('a.hot')) return;
      down = { x: e.clientX, y: e.clientY, t: Date.now(), type: e.pointerType };
      moved = 0; startScroll = { x: stage.scrollLeft, y: stage.scrollTop };
    });
    stage.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - down.x, dy = e.clientY - down.y;
      moved = Math.max(moved, Math.abs(dx) + Math.abs(dy));
      if (zoom > 1.05 && down.type === 'mouse') { stage.scrollLeft = startScroll.x - dx; stage.scrollTop = startScroll.y - dy; }
    });
    function end(e) {
      if (!down) return;
      var dx = e.clientX - down.x, dy = e.clientY - down.y, d = down; down = null;
      if (zoom <= 1.05 && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4 && Date.now() - d.t < 800) {
        dx < 0 ? next() : prev(); return;
      }
      if (moved < 8 && e.target.closest && e.target.closest('.book')) {
        var r = book.getBoundingClientRect();
        var rel = (e.clientX - r.left) / r.width;
        if (mode === 'spread') rel < 0.5 ? (flipped > 0 && prev()) : next();
        else rel < 0.33 ? prev() : next();
      }
    }
    stage.addEventListener('pointerup', end);
    stage.addEventListener('pointercancel', function () { down = null; });
    stage.addEventListener('wheel', function (e) {
      if (e.ctrlKey) { e.preventDefault(); setZoom(zoom + (e.deltaY < 0 ? 0.15 : -0.15)); }
    }, { passive: false });
    stage.addEventListener('dblclick', function (e) { e.preventDefault(); setZoom(zoom > 1.05 ? 1 : 2); });

    window.addEventListener('resize', layout);
    window.addEventListener('orientationchange', function () { setTimeout(layout, 250); });
    window.addEventListener('hashchange', function () {
      var m = /p=(\d+)/.exec(location.hash);
      if (m && +m[1] !== currentPage() && visible().indexOf(+m[1]) < 0) goTo(+m[1]);
    });
    document.addEventListener('visibilitychange', function () { if (document.hidden && musicOn) bgm.pause(); else if (!document.hidden && musicOn) bgm.play().catch(function () {}); });
  }

  function openBook(withMusic) {
    splash.classList.add('hide');
    if (withMusic) setMusic(true);
    var hasHash = /p=(\d+)/.test(location.hash);
    if (!hasHash) { /* 책 표지 → 펼침 연출 */ }
  }

  /* ───── 시작 ───── */
  function init() {
    $('pageTotal').textContent = TOTAL;
    slider.max = TOTAL;
    var v = store('fc-vol'); if (v !== null) $('vol').value = v;
    buildDrawer();
    mode = 'none';           // layout()에서 최초 빌드
    layout();
    var m = /p=(\d+)/.exec(location.hash);
    if (m) { flipped = targetFor(+m[1]); applyState(); }
    updateUI();
    bind();
    reflectMusic();
    if (m && +m[1] > 1) splash.classList.add('hide');   // 딥링크는 도입 화면 건너뜀
  }
  init();
})();
