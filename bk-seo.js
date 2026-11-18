/* BK DENTAL — 진료별 페이지 주소(SEO용) 연결
 * - 각 아임웹 페이지가 자기 진료 화면을 기본으로 띄우게 함 (BK_CONFIG.route)
 * - 디자인 안의 링크(#t-implant, /info#t-implant 등)를 진료별 주소(/implant 등)로 바꿈
 */
(function () {
  var SLUG = {
    implant: 'implant', wisdom: 'wisdom-tooth', ortho: 'front-ortho', clear: 'clear-aligner',
    laminate: 'laminate', white: 'whitening', cavity: 'cavity-root-canal', gum: 'gum-scaling',
    tmj: 'tmj-bruxism', snore: 'snoring'
  };
  var GROUP = { implant: 'implant', aesthetic: 'laminate', wisdom: 'wisdom', save: 'cavity', special: 'tmj' };
  var PAGE = { about: '/about', doctors: '/doctor', facility: '/facility', visit: '/location' };
  var VISIT = { hours: 1, prep: 1, cost: 1 };

  function url(key) {
    if (!key) return null;
    if (key.indexOf('t-') === 0) return SLUG[key.slice(2)] ? '/' + SLUG[key.slice(2)] : null;
    if (GROUP[key]) return '/' + SLUG[GROUP[key]];
    if (PAGE[key]) return PAGE[key];
    if (VISIT[key]) return '/location#' + key;
    var p = key.split('-')[0];
    if (PAGE[p]) return PAGE[p] + '#' + key;
    return null;
  }
  function cfg() { return window.BK_CONFIG || {}; }
  window.BK_ROUTE = cfg().route || null;
  window.BK_URL = function (h) { return url(h) || ((cfg().pagesUrl || '/info') + '#' + h); };

  // 링크 주소 바꾸기 (검색엔진이 진료별 페이지를 따라갈 수 있게)
  function fix(a) {
    var href = a.getAttribute('href');
    if (!href || a.__bkFixed === href) return;
    var pages = cfg().pagesUrl || '/info', key = null;
    if (href.charAt(0) === '#') key = href.slice(1);
    else if (href.indexOf(pages + '#') === 0) key = href.slice(pages.length + 1);
    var target = key && url(key);
    if (target) {
      var path = target.split('#')[0], hash = target.split('#')[1];
      if (path === location.pathname) target = hash ? '#' + hash : path;
      if (target !== href) a.setAttribute('href', target);
      href = target;
    }
    a.__bkFixed = href;
  }
  function scan(root) {
    if (!root || root.nodeType !== 1) return;
    if (root.tagName === 'A') fix(root);
    var list = root.querySelectorAll ? root.querySelectorAll('a[href]') : [];
    for (var i = 0; i < list.length; i++) fix(list[i]);
  }
  function watch() {
    var host = document.getElementById('dc-root');
    if (!host) return setTimeout(watch, 100);
    scan(host);
    new MutationObserver(function (ms) {
      for (var i = 0; i < ms.length; i++) {
        var m = ms[i];
        if (m.type === 'attributes') { if (m.target.tagName === 'A') fix(m.target); }
        else for (var j = 0; j < m.addedNodes.length; j++) scan(m.addedNodes[j]);
      }
    }).observe(host, { subtree: true, childList: true, attributes: true, attributeFilter: ['href'] });
  }

  // 아임웹 기본 요소(숨김 처리됨) 안의 javascript: 링크 정리 — 검색엔진이 '따라갈 수 없는 링크'로 보지 않게
  function tidy() {
    var app = document.getElementById('bk-app');
    var list = document.querySelectorAll('a[href^="javascript:"], a[href=""]');
    for (var i = 0; i < list.length; i++) {
      var a = list[i];
      if (app && app.contains(a)) continue;
      a.removeAttribute('href');
      if (!a.getAttribute('role')) a.setAttribute('role', 'button');
    }
  }
  if (window.top === window.self && !/\/admin/.test(location.pathname)) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tidy); else tidy();
    window.addEventListener('load', function () { tidy(); setTimeout(tidy, 1500); });
  }

  // 디자인 데이터에 진료별 기본 화면 / 페이지 이동 연결
  if (window.BK && window.BK.start && !window.BK.__seo) {
    var start = window.BK.start;
    window.BK.start = function (d) {
      d.js = d.js.split("(location.hash || '#about')").join("(location.hash || '#' + (window.BK_ROUTE || 'about'))");
      d.js = d.js.split("window.location.href = PAGES + '#' + h;").join("window.location.href = window.BK_URL(h);");
      start(d);
      watch();
    };
    window.BK.__seo = true;
  }
})();
