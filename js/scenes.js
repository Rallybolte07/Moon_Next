/* MOONNEXT – motion-graphic scenes. Every image slot gets its own looping story (7 s loop, all elements in sync).
   Built lazily, paused off-screen (.sc:not(.on)), static final frame under prefers-reduced-motion. Styles: css/site.css "Motion scenes". */
(function () {
  var d = document, L = 7, KN = {}, KC = [];
  var pc = function (t) { return +(t / L * 100).toFixed(2); };
  /* keyframe factory: a = [kind, start(s), length(s), ...params]. Identical specs share one @keyframes. */
  function kf(a) {
    var key = JSON.stringify(a); if (KN[key]) return KN[key];
    var n = 'mk' + KC.length, k = a[0], A = pc(a[1]), B = pc(a[1] + (a[2] == null ? .6 : a[2])), o, s;
    if (k === 'pth') {                       // waypoints [[t,x,y,scale?]...] (cursor / pen)
      s = a[2].map(function (p, i) { return (i ? pc(p[0]) : 0) + '%{transform:translate(' + p[1] + 'px,' + p[2] + 'px) scale(' + (p[3] || 1) + ')}'; }).join('');
      s += '100%{transform:translate(' + a[2][0][1] + 'px,' + a[2][0][2] + 'px)}';
    } else if (k === 'say') s = '0%,' + A + '%{opacity:0;transform:scale(.5)}' + B + '%,' + pc(a[1] + a[2]) + '%{opacity:1;transform:none}' + (pc(a[1] + a[2]) + 3) + '%,100%{opacity:0;transform:scale(.5)}';
    else if (k === 'fl') {                   // fly + fade: a[3],a[4] = travel, a[5] = optional arc lift
      var E = pc(a[1] + a[2]), tr = function (x, y, sc) { return 'transform:translate(' + x + 'px,' + y + 'px) scale(' + sc + ')'; };
      s = '0%,' + A + '%{opacity:0;' + tr(0, 0, 1) + '}' + (A + 3) + '%{opacity:1}' + (a[5] ? ((A + E) / 2) + '%{opacity:1;' + tr(a[3] / 2, a[4] / 2 - a[5], .8) + '}' : '') +
        E + '%{opacity:0;' + tr(a[3], a[4], a[5] ? .4 : 1) + '}100%{opacity:0;' + tr(a[3], a[4], 1) + '}';
    } else if (k === 'rp') s = '0%,' + A + '%{opacity:0;transform:scale(.2)}' + (A + 1) + '%{opacity:.8}' + B + '%,100%{opacity:0;transform:scale(1.9)}';
    else if (k === 'pr') s = '0%,' + A + '%{transform:scale(1)}' + pc(a[1] + .15) + '%{transform:scale(.9)}' + pc(a[1] + .4) + '%,100%{transform:scale(1)}';
    else {                                   // state kinds: hidden -> shown at A..B, hold, hide at the loop end
      o = { 'in': ['opacity:0;transform:translateY(10px)', 'opacity:1;transform:none'], po: ['transform:scale(0)', 'transform:scale(1)'],
        ty: ['transform:scaleX(' + (a[3] || 0) + ')', 'transform:scaleX(' + (a[4] == null ? 1 : a[4]) + ')'], bar: ['transform:scaleY(0)', 'transform:scaleY(1)'],
        dr: ['stroke-dashoffset:1', 'stroke-dashoffset:0'], rg: ['stroke-dashoffset:1', 'stroke-dashoffset:' + a[3]],
        sl: ['opacity:0;transform:translate(' + a[3] + 'px,' + a[4] + 'px)', 'opacity:1;transform:none'],
        mvr: ['transform:translate(' + a[3] + 'px,' + a[4] + 'px)', 'transform:none'], tf: ['transform:' + a[3], 'transform:' + a[4]] }[k];
      s = '0%,' + A + '%{' + o[0] + '}' + B + '%,92%{' + o[1] + '}98%,100%{' + o[0] + '}';
    }
    KC.push('@keyframes ' + n + '{' + s + '}'); return (KN[key] = n);
  }
  var EASE = { po: 'cubic-bezier(.34,1.56,.64,1)', sl: 'cubic-bezier(.34,1.3,.64,1)', say: 'cubic-bezier(.34,1.56,.64,1)', pth: 'ease-in-out', fl: 'ease-in-out', rp: 'ease-out' };
  /* a = animation spec array, or a raw style string. Base style = the final frame (what reduced-motion users see). */
  var S = function (a) {
    if (!a) return ''; if (typeof a === 'string') return ' style="' + a + '"';
    var k = a[0], base = k === 'ty' ? 'transform-origin:0 50%;' : k === 'bar' ? 'transform-origin:50% 100%;' : k === 'dr' ? 'stroke-dasharray:1;stroke-dashoffset:0;' :
      k === 'rg' ? 'stroke-dasharray:1;stroke-dashoffset:' + a[3] + ';' : k === 'pth' ? 'transform:translate(' + a[2][1][1] + 'px,' + a[2][1][2] + 'px);' : k === 'tf' ? 'transform:' + a[4] + ';transform-origin:50% 0;' : '';
    return ' style="' + base + 'animation:' + kf(a) + ' ' + L + 's ' + (EASE[k] || 'cubic-bezier(.22,.8,.3,1)') + ' infinite both"';
  };
  var R = function (x, y, w, h, c, a, r) { return '<rect class="' + c + '"' + S(a) + ' x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (r == null ? 4 : r) + '"/>'; };
  var C = function (x, y, r, c, a) { return '<circle class="' + c + '"' + S(a) + (/rgx/.test(c) ? ' pathLength="1"' : '') + ' cx="' + x + '" cy="' + y + '" r="' + r + '"/>'; };
  var P = function (p, c, a) { return '<path class="' + c + '"' + S(a) + (a && a[0] === 'dr' ? ' pathLength="1"' : '') + ' d="' + p + '"/>'; };
  var T = function (x, y, s, c, a) { return '<text class="' + c + '"' + S(a) + ' x="' + x + '" y="' + y + '">' + s + '</text>'; };
  var G = function (c, inner, a, tf) { var g = '<g' + (c ? ' class="' + c + '"' : '') + S(a) + '>' + inner + '</g>'; return tf ? '<g transform="' + tf + '">' + g + '</g>' : g; };
  var N = function (n, f) { var s = ''; for (var i = 0; i < n; i++) s += f(i); return s; };
  var CUR = '<path class="cu" d="M0 0L0 20L6 15L11 25L15 23L10 13L18 13Z"/>';
  var HEART = 'M0 8S-8 3-8-2a4.2 4.2 0 0 1 8-2.4A4.2 4.2 0 0 1 8-2C8 3 0 8 0 8Z';
  var GL = { search: '<circle cx="-2" cy="-2" r="6"/><path d="M3 3L8 8"/>', chat: '<path d="M-8-7H8V4H-1L-6 8V4H-8Z"/>', mail: '<rect x="-8" y="-6" width="16" height="12" rx="2"/><path d="M-8-5L0 2L8-5"/>',
    target: '<circle r="8"/><circle r="3"/>', doc: '<path d="M-6-8H3L7-4V8H-6Z"/><path d="M-3 0H4M-3 4H4"/>', bolt: '<path d="M2-8L-5 1H0L-2 8L5-1H0Z"/>', clock: '<circle r="8"/><path d="M0-4V0L4 2"/>' };
  var gk = function (k, x, y) { return '<g class="gk" transform="translate(' + x + ' ' + y + ')">' + GL[k] + '</g>'; };
  var heart = function (x, y, sc, c, a) { return G('', '<path class="' + c + '" d="' + HEART + '"/>', a, 'translate(' + x + ' ' + y + ') scale(' + sc + ')'); };
  var person = function (x, y, c, a) { return G('bo', C(x, y - 10, 10, c) + P('M' + (x - 17) + ' ' + (y + 18) + 'Q' + x + ' ' + (y - 8) + ' ' + (x + 17) + ' ' + (y + 18) + 'Z', c), a); };

  var SC = {
    /* SEO: a search is typed, our result climbs from #3 to #1, rank chart rises */
    seo: function () {
      var row = function (y, hot, a) {
        return G('', R(28, y, 252, 38, hot ? 'w hl' : 'w', null, 9) + C(45, y + 13, 6, hot ? 'a' : 'gd') + R(58, y + 9, hot ? 130 : 104, 7, hot ? 'v' : 'gd', null, 3) + R(58, y + 23, 90, 5, 'g', null, 2.5) +
          (hot ? G('', C(258, y + 19, 13, 'a') + T(258, y + 24, '#1', 'tx wt c'), ['po', 3.4]) : ''), a);
      };
      var h = [30, 46, 62, 82, 104];
      return R(28, 56, 252, 28, 'w', null, 14) + C(46, 69, 5, 'sg') + P('M50 73L55 78', 'sg') + R(62, 66, 120, 8, 'gd', ['ty', .5, 1.2], 4) + R(186, 64, 2, 12, 'bl') +
        row(96, 1, ['mvr', 1.8, .9, 0, 88]) + row(140, 0, ['mvr', 1.8, .9, 0, -44]) + row(184, 0, ['mvr', 1.8, .9, 0, -44]) +
        N(5, function (i) { return R(300 + i * 15, 262 - h[i], 10, h[i], i === 4 ? 'a' : 'v', ['bar', 2.2 + i * .25, .7], 3); }) +
        P('M298 206L322 182L338 192L374 130', 'sa', ['dr', 3.2, 1.2]) + C(374, 130, 5, 'a pu');
    },
    /* Digital marketing: five channels orbit one hub, data packets flow into revenue */
    dm: function () {
      var cx = 200, cy = 164, ks = ['search', 'chat', 'mail', 'target', 'doc'], cl = ['nv', 'nt', 'na', 'nv', 'nt'], sp = '', nd = '', pk = '';
      ks.forEach(function (k, i) {
        var g = (-90 + i * 72) * Math.PI / 180, x = Math.round(cx + 76 * Math.cos(g)), y = Math.round(cy + 76 * Math.sin(g));
        sp += '<path class="fw" d="M' + cx + ' ' + cy + 'L' + x + ' ' + y + '"/>';
        pk += G('', C(x, y, 4, 'a'), ['fl', .4 + i * 1.1, 1.3, cx - x, cy - y]);
        nd += '<g transform="translate(' + x + ' ' + y + ')">' + G('sp rv', C(0, 0, 19, cl[i]) + '<g class="gk">' + GL[k] + '</g>') + '</g>';
      });
      return '<g class="sp" style="transform-box:view-box;transform-origin:200px 164px">' + sp + nd + pk + '</g>' +
        C(cx, cy, 28, 'a', ['po', .3]) + C(cx, cy, 28, 'sa pn') + C(cx, cy, 28, 'sa pn', 'animation-delay:1.2s') + T(cx, cy + 10, '₹', 'hk c wt', 'font-size:30px') +
        N(3, function (i) { return R(34 + i * 14, 250 - [20, 34, 48][i], 9, [20, 34, 48][i], 't', ['bar', 1 + i * .3, .6], 3) + R(342 + i * 14, 250 - [26, 40, 56][i], 9, [26, 40, 56][i], 'v', ['bar', 1.4 + i * .3, .6], 3); });
    },
    /* Website development: code types itself, build runs, site goes LIVE */
    dev: function () {
      var ln = [[0, [34, 'v'], [46, 't']], [1, [58, 'a'], [30, 'gd']], [1, [26, 't'], [64, 'gd']], [2, [48, 'v'], [38, 'gd']], [2, [70, 'gd']], [1, [22, 'a'], [52, 'v']], [1, [60, 'gd']], [0, [18, 'v']]];
      var code = ln.map(function (l, i) {
        var x = 52 + l[0] * 14, s = '', j;
        for (j = 1; j < l.length; j++) { s += R(x, 74 + i * 21, l[j][0], 7, l[j][1], null, 3); x += l[j][0] + 6; }
        return R(36, 75 + i * 21, 8, 5, 'g', null, 2) + G('', s, ['ty', .4 + i * .42, .5]);
      }).join('');
      return R(28, 58, 232, 200, 'w', null, 10) + code + R(76, 220, 2, 11, 'bl') + R(272, 58, 100, 128, 'dk', null, 10) + T(282, 80, '$ npm run build', 'tk lg') +
        R(282, 96, 80, 6, 'tl2', null, 3) + R(282, 96, 80, 6, 'ok', ['ty', 2.6, 2.2], 3) + R(282, 112, 56, 4, 'tl2', null, 2) + R(282, 122, 68, 4, 'tl2', null, 2) +
        C(293, 146, 8, 'ok', ['po', 5]) + P('M289 146L292 149L297 143', 'sw', ['dr', 5.1, .4]) + T(306, 149, 'build passed', 'tk lg', ['in', 5]) +
        R(282, 160, 48, 18, 'ok', ['po', 5.6], 9) + T(306, 172, 'LIVE', 'tk wt c', ['po', 5.6]) +
        C(322, 226, 20, 'sv') + C(322, 226, 9, 'sv') + P('M302 226H342M322 206V246', 'sv') + C(322, 226, 20, 'sv pn');
    },
    /* Website design: wireframe assembles, cursor clicks CTA, mobile version + palette appear */
    web: function () {
      return R(34, 58, 232, 16, 'g', null, 5) + C(44, 66, 4, 'a') + R(196, 63, 18, 5, 'gd', null, 2.5) + R(220, 63, 18, 5, 'gd', null, 2.5) + R(244, 63, 14, 5, 'v', null, 2.5) +
        R(34, 84, 152, 74, 'v', ['po', .4], 8) + R(46, 98, 92, 8, 'wt2', ['ty', 1, .6], 4) + R(46, 112, 64, 8, 'wt2', ['ty', 1.3, .6], 4) + R(46, 132, 44, 15, 'a', ['po', 2], 7) +
        R(194, 84, 72, 74, 'tl', ['po', .7], 8) + C(230, 108, 9, 'a', ['po', 1.1]) + P('M194 158L220 128L238 144L252 130L266 148V158Z', 't', ['po', 1.3]) +
        N(3, function (i) { return R(34 + i * 80, 168, 72, 54, 'g', ['in', 2.4 + i * .3], 8) + R(42 + i * 80, 176, 56, 22, 'vl', ['in', 2.6 + i * .3], 5) + R(42 + i * 80, 206, 40, 5, 'gd', ['in', 2.7 + i * .3], 2.5); }) +
        R(292, 70, 62, 118, 'w', ['po', 3.6], 12) + R(300, 84, 46, 26, 'v', ['in', 3.9], 5) + R(300, 116, 46, 5, 'gd', ['in', 4.1], 2.5) + R(300, 126, 32, 5, 'gd', ['in', 4.2], 2.5) + R(300, 142, 46, 12, 'a', ['in', 4.3], 6) + R(300, 162, 46, 16, 'tl', ['in', 4.4], 4) +
        C(300, 224, 9, 'v', ['po', 4.6]) + C(322, 224, 9, 't', ['po', 4.8]) + C(344, 224, 9, 'a', ['po', 5]) + C(366, 224, 9, 'ink', ['po', 5.2]) +
        C(56, 140, 12, 'sa rz', ['rp', 2.2, .7]) + G('', CUR, ['pth', 0, [[0, 214, 244], [1.8, 56, 140], [2.2, 56, 140, .85], [2.35, 56, 140], [3.4, 200, 178], [7, 214, 244]]]);
    },
    /* Graphic design & branding: the MOONNEXT mark is constructed, palette + type appear */
    brand: function () {
      var hd = function (x, y, t) { return R(x - 4, y - 4, 8, 8, 'hd', ['in', t], 1.5); }, col = ['v', 't', 'a', 'ink'];
      return R(34, 60, 168, 190, 'w', null, 8) + P('M34 160H202M118 60V250', 'sg') + C(118, 160, 64, 'dsh sp') + C(118, 160, 52, 'sv', ['dr', .4, 1.4]) +
        P('M118 108A52 52 0 1 0 170 160A52 52 0 0 1 118 108Z', 'a', ['po', 1.8]) + P('M136 142L160 118M139 118H160V139', 'sk', ['dr', 2.6, .6]) +
        hd(118, 108, .6) + hd(170, 160, .8) + hd(118, 212, 1) + hd(66, 160, 1.2) +
        N(4, function (i) { return R(226 + (i % 2) * 48, 66 + Math.floor(i / 2) * 48, 40, 40, col[i], ['po', 2 + i * .3], 10); }) +
        T(226, 190, 'Aa', 'hk', ['in', 3.2]) + R(226, 204, 120, 6, 'gd', ['ty', 3.5, .5], 3) + R(226, 216, 90, 6, 'g', ['ty', 3.7, .5], 3) + R(226, 232, 64, 16, 'v', ['po', 4], 8);
    },
    /* Content marketing: headline + article written by a pen, tags float, readership ring fills */
    content: function () {
      var w = [150, 152, 140, 152, 96], pts = [[0, 46, 178]], i, t;
      for (i = 0; i < 5; i++) { t = 2.6 + i * .6; pts.push([t, 46, 183 + i * 12], [t + .5, 46 + w[i], 183 + i * 12]); }
      pts.push([6.4, 150, 240]);
      return R(34, 58, 176, 200, 'w', null, 8) + R(46, 72, 112, 10, 'a', ['ty', .4, .6], 5) + R(46, 90, 140, 5, 'gd', ['ty', .9, .5], 2.5) + R(46, 100, 100, 5, 'gd', ['ty', 1.2, .5], 2.5) +
        R(46, 112, 152, 52, 'vl', ['po', 1.6], 6) + C(70, 130, 7, 'a', ['po', 2]) + P('M46 164L84 136L108 152L136 128L198 164Z', 't', ['po', 2.2]) +
        N(5, function (i) { return R(46, 178 + i * 12, w[i], 5, 'gd', ['ty', 2.6 + i * .6, .5], 2.5); }) +
        G('', '<path class="a" d="M0 0L-3 -8L5 -16L10 -11L2 -3Z"/><path class="ink" d="M0 0L-3 -8L1 -6Z"/>', ['pth', 0, pts]) +
        G('bo', G('', R(226, 64, 60, 20, 'vl', null, 10) + T(256, 78, 'SEO', 'tk ik c'), ['in', .8])) + G('bo', G('', R(226, 92, 52, 20, 'tl', null, 10) + T(252, 106, 'Blog', 'tk ik c'), ['in', 1.2]), 'animation-delay:.5s') +
        G('bo', G('', R(226, 120, 72, 20, 'al', null, 10) + T(262, 134, 'Guide', 'tk ik c'), ['in', 1.6]), 'animation-delay:1s') +
        C(300, 214, 30, 'trr') + C(300, 214, 30, 'sv rgx', ['rg', 3, 1.6, .28]) + P('M290 222L310 204M298 204H310V216', 'sk', ['dr', 4.4, .5]);
    },
    /* Google Ads: cursor clicks the ad, cost per click falls while clicks + leads rise, dart hits target */
    ads: function () {
      var row = function (y, lb, c, a, up) { return T(28, y + 7, lb, 'tk ik') + R(70, y - 1, 170, 9, 'trk', null, 4.5) + R(70, y - 1, 170, 9, c, a, 4.5) + P(up ? 'M252 ' + (y + 8) + 'L257 ' + (y - 1) + 'L262 ' + (y + 8) + 'Z' : 'M252 ' + (y - 1) + 'L257 ' + (y + 8) + 'L262 ' + (y - 1) + 'Z', 'ok', ['po', 3.8]); };
      return R(28, 58, 240, 92, 'w', null, 10) + R(40, 68, 24, 13, 'a', null, 4) + T(52, 78, 'Ad', 'tk wt c') + R(70, 71, 86, 6, 'gd', null, 3) + R(40, 90, 176, 10, 'v', ['ty', .5, .7], 4) +
        R(40, 108, 200, 5, 'gd', null, 2.5) + R(40, 118, 150, 5, 'g', null, 2.5) + R(40, 131, 44, 12, 'tl', null, 6) + R(90, 131, 44, 12, 'tl', null, 6) + R(140, 131, 44, 12, 'tl', null, 6) +
        row(170, 'Clicks', 'v', ['ty', 2.4, 1.4, .1, .82], 1) + row(194, 'CPC', 'a', ['ty', 2.4, 1.4, .9, .38], 0) + row(218, 'Leads', 't', ['ty', 2.6, 1.4, .1, .7], 1) +
        C(326, 158, 44, 'sv pu') + C(326, 158, 30, 'sv', 'opacity:.6') + C(326, 158, 16, 'sv', 'opacity:.4') + C(326, 158, 7, 'a') +
        P('M376 226L330 162', 'sk', ['dr', 3.6, .5]) + C(326, 158, 12, 'sa rz', ['rp', 4.1, .8]) +
        C(130, 96, 14, 'sa rz', ['rp', 1.8, .8]) + G('', CUR, ['pth', 0, [[0, 290, 200], [1.4, 130, 96], [1.8, 130, 96, .82], [1.95, 130, 96], [3.4, 230, 240], [7, 290, 200]]]);
    },
    /* Meta ads: ad plays in a phone feed, hearts float out, audience flows in, ROAS ring fills */
    meta: function () {
      var ppl = [[50, 96], [84, 146], [50, 196], [84, 240]];
      return R(146, 54, 108, 214, 'w', null, 16) + R(182, 60, 36, 5, 'gd', null, 2.5) + C(168, 86, 12, 'sa dsh sp') + C(168, 86, 8, 'v') + C(200, 86, 8, 't') + C(232, 86, 8, 'a') +
        R(156, 106, 88, 72, 'vl', ['po', .5], 8) + G('bo', C(178, 132, 9, 'a')) + G('bo', P('M196 166L214 140L234 166Z', 't'), 'animation-delay:.8s') + R(160, 110, 26, 11, 'a', null, 4) + T(173, 119, 'Ad', 'tk wt c') +
        heart(170, 188, 1.1, 'rd hb') + C(196, 190, 5, 'sg') + P('M212 186L222 190L212 194Z', 'sg') + R(160, 206, 60, 5, 'gd', null, 2.5) + R(160, 216, 80, 5, 'g', null, 2.5) +
        R(160, 232, 80, 20, 'v', ['po', 2.4], 10) + T(200, 245, 'Shop now', 'tk wt c', ['po', 2.4]) +
        N(4, function (i) { return heart(262 + (i % 2) * 8, 176, 1, 'rd', ['fl', 1 + i * 1.2, 1.5, 14 - i * 6, -80]); }) +
        ppl.map(function (p, i) { return '<path class="fw" d="M' + (p[0] + 14) + ' ' + p[1] + 'L142 160"/>' + G('', C(p[0], p[1] - 6, 6, 'vl') + P('M' + (p[0] - 11) + ' ' + (p[1] + 12) + 'Q' + p[0] + ' ' + (p[1] - 6) + ' ' + (p[0] + 11) + ' ' + (p[1] + 12) + 'Z', 'vl'), ['po', .2 + i * .3]); }).join('') +
        C(322, 140, 32, 'trr') + C(322, 140, 32, 'sv rgx', ['rg', 2.6, 1.6, .25]) + T(322, 144, 'ROAS', 'tk ik c') +
        N(3, function (i) { return R(296 + i * 18, 250 - [20, 34, 48][i], 12, [20, 34, 48][i], ['a', 'v', 't'][i], ['bar', 3 + i * .3, .6], 3); });
    },
    /* Social media: content calendar fills up, post earns hearts, followers grow */
    social: function () {
      var pt = '1020301030120201030210100302', cs = ['g', 'v', 't', 'a'];
      return N(7, function (i) { return C(42 + i * 32, 66, 2.5, 'gd'); }) +
        N(28, function (i) { var c = i % 7, r = Math.floor(i / 7); return R(28 + c * 32, 76 + r * 30, 28, 24, cs[+pt[i]], ['po', .3 + (c + r) * .14], 6); }) +
        R(262, 58, 110, 128, 'w', null, 10) + C(278, 76, 8, 'v') + R(292, 71, 50, 5, 'gd', null, 2.5) + R(292, 80, 34, 4, 'g', null, 2) + R(270, 92, 94, 52, 'vl', null, 6) +
        heart(317, 116, 2.4, 'rd hb') + heart(280, 158, .9, 'rd') + C(302, 158, 5, 'sg') + P('M318 154L328 158L318 162Z', 'sg') + R(270, 172, 60, 4, 'gd', null, 2) +
        N(3, function (i) { return heart(300 + i * 24, 150, .9, 'rd', ['fl', 1.4 + i * 1.3, 1.5, 6 - i * 8, -52]); }) +
        T(28, 240, 'Followers', 'tk ik') + R(84, 233, 168, 8, 'trk', null, 4) + R(84, 233, 168, 8, 'v', ['ty', 1.6, 3, .12, 1], 4) +
        C(282, 238, 9, 'v', ['po', 3]) + C(298, 238, 9, 't', ['po', 3.3]) + C(314, 238, 9, 'a', ['po', 3.6]) + G('', R(330, 230, 30, 16, 'a', null, 8) + T(345, 242, '+', 'tk ik c'), ['po', 4]);
    },
    /* Email marketing: automation flow triggers, envelope opens, emails fly out, open-rate ring fills */
    email: function () {
      var nd = [['bolt', 60], ['clock', 140], ['mail', 220]];
      return P('M73 72H127M153 72H207', 'fw') + nd.map(function (n, i) { return G('', C(n[1], 72, 13, 'na') + gk(n[0], n[1], 72), ['po', .2 + i * .4]); }).join('') + G('', C(60, 72, 4, 'a'), ['fl', .9, 2.4, 160, 0]) +
        R(70, 140, 140, 92, 'w', null, 8) + P('M70 140L140 192L210 140Z', 'ev', ['tf', 1.2, .6, 'scaleY(1)', 'scaleY(-1)']) + R(84, 126, 112, 76, 'paper', ['mvr', 1.8, .8, 0, 34], 6) +
        R(94, 138, 60, 6, 'a', ['mvr', 1.8, .8, 0, 34], 3) + R(94, 152, 90, 5, 'gd', ['mvr', 1.8, .8, 0, 34], 2.5) + R(94, 163, 76, 5, 'gd', ['mvr', 1.8, .8, 0, 34], 2.5) +
        P('M70 140L70 232L210 232L210 140L140 192Z', 'ev2') +
        N(3, function (i) { return G('hid', R(0, 0, 18, 12, 'w', null, 2) + P('M0 1L9 8L18 1', 'sg'), ['fl', 3 + i * .55, 1.3, 96, [-26, 0, 26][i], 8], 'translate(210 ' + (162 + i * 4) + ')'); }) +
        C(322, 180, 30, 'trr') + C(322, 180, 30, 'sv rgx', ['rg', 2.8, 1.6, .3]) + T(322, 184, 'OPEN', 'tk ik c') + R(292, 226, 60, 5, 'gd', ['ty', 3.2, .6], 2.5);
    },
    /* About / team: four people collaborate around a board, chat bubbles pop in turn */
    team: function () {
      var ps = [[66, 100, 'v'], [334, 100, 't'], [66, 216, 'a'], [334, 216, 'ink']], ls = ['M84 108L142 132', 'M316 108L258 132', 'M84 208L142 164', 'M316 208L258 164'];
      return ls.map(function (l) { return '<path class="fw" d="' + l + '"/>'; }).join('') + R(142, 100, 116, 84, 'w', null, 10) +
        R(152, 110, 26, 24, 'a', ['po', .6], 4) + R(184, 110, 26, 24, 't', ['po', .9], 4) + R(216, 110, 26, 24, 'v', ['po', 1.2], 4) +
        N(3, function (i) { var y = 150 + i * 11; return P('M152 ' + y + 'L156 ' + (y + 4) + 'L163 ' + (y - 4), 'sok', ['dr', 2 + i * .5, .4]) + R(170, y - 4, 64 - i * 14, 5, 'gd', ['ty', 2.1 + i * .5, .4], 2.5); }) +
        ps.map(function (p, i) {
          var bx = p[0] < 200 ? p[0] + 16 : p[0] - 52;
          return person(p[0], p[1], p[2], 'animation-delay:' + i * .5 + 's') + G('', R(bx, p[1] - 38, 36, 18, 'w', null, 9) + C(bx + 10, p[1] - 29, 2.2, 'gd dy') + C(bx + 18, p[1] - 29, 2.2, 'gd dy', 'animation-delay:.2s') + C(bx + 26, p[1] - 29, 2.2, 'gd dy', 'animation-delay:.4s'), ['say', .6 + i * 1.5, 1.2]);
        }).join('') + C(200, 214, 5, 'a pu') + C(200, 76, 5, 't pu');
    },
    /* Ecommerce: cursor hits "Add to cart", product flies to the cart, checkout steps complete, payment succeeds */
    ecom: function () {
      var cf = [['v', -40, -34], ['a', 44, -30], ['t', -46, 20], ['rd', 48, 26], ['ok', 4, -50], ['a', 10, 44]];
      return R(28, 58, 128, 176, 'w', null, 10) + R(38, 68, 108, 72, 'vl', null, 8) + G('bo', P('M78 104H114L118 136H74Z', 'v') + P('M86 104V98a10 10 0 0 1 20 0V104', 'sv')) +
        R(38, 150, 76, 7, 'gd', null, 3.5) + R(38, 162, 50, 5, 'g', null, 2.5) + T(38, 186, '₹2,800', 'tx') + G('', R(38, 196, 108, 26, 'a', null, 8) + T(92, 213, 'Add to cart', 'tk ik c'), ['pr', 1.8]) +
        P('M318 68H323L327 88H343L347 74H325', 'sk') + C(330, 95, 3, 'ink') + C(341, 95, 3, 'ink') + C(348, 66, 8, 'a', ['po', 3.4]) + T(348, 69.5, '1', 'tk ik c', ['po', 3.4]) +
        G('hid', R(-10, -10, 20, 20, 'v', null, 5), ['fl', 2.1, 1.3, 238, -24, 70], 'translate(92 104)') +
        R(176, 124, 196, 124, 'w', null, 10) + P('M214 148H266M282 148H334', 'gd') + R(214, 147, 52, 2.5, 'v', ['ty', 3.9, .5]) + R(282, 147, 52, 2.5, 'v', ['ty', 4.4, .5]) +
        C(206, 148, 8, 'v', ['po', 3.6]) + C(274, 148, 8, 'v', ['po', 4.1]) + C(342, 148, 8, 'ok', ['po', 4.6]) +
        C(274, 200, 22, 'ok', ['po', 4.9]) + P('M264 200L271 207L285 192', 'sw', ['dr', 5.2, .5]) + T(274, 238, 'PAID', 'tk ik c', ['in', 5.4]) +
        cf.map(function (c, i) { return G('hid', R(-3, -3, 6, 6, c[0], null, 1.5), ['fl', 5, 1.1, c[1], c[2]], 'translate(274 200)'); }).join('') +
        G('', CUR, ['pth', 0, [[0, 170, 262], [1.5, 92, 206], [1.8, 92, 206, .85], [1.95, 92, 206], [3.2, 170, 262], [7, 170, 262]]]);
    },
    /* Local SEO: route draws to the business, pin drops, map-pack cards slide in and rank #1 */
    local: function () { return localMap('Your business', 1); },
    delhi: function () { return localMap('MOONNEXT · Delhi', 0); }
  };
  function localMap(lbl, cards) {
    var W = cards ? 232 : 344, px = cards ? 120 : 190, w = Math.round(lbl.length * 5.6 + 16), E = 28 + W;
    var pin = 'M' + px + ' 152C' + (px - 18) + ' 128 ' + (px - 16) + ' 104 ' + px + ' 104C' + (px + 16) + ' 104 ' + (px + 18) + ' 128 ' + px + ' 152Z';
    var map = R(28, 56, W, 200, 'mp', null, 10) + P('M28 124L' + E + ' 98M28 192L' + E + ' 170M90 56L112 256M' + (E - 70) + ' 56L' + (E - 88) + ' 256' + (cards ? '' : 'M' + (E - 150) + ' 56L' + (E - 130) + ' 256'), 'rd2') +
      R(40, 202, 58, 40, 'park', null, 8) + P('M28 240C90 214 150 252 ' + E + ' 218', 'riv') + P('M56 244L' + (px - 24) + ' 214L' + (px - 24) + ' 152L' + px + ' 152', 'sa fw2') +
      P('M' + (E - 56) + ' 224c-6-8-6-14 0-14s6 6 0 14z', 'gd') + P('M' + (E - 50) + ' 128c-6-8-6-14 0-14s6 6 0 14z', 'gd') +
      C(px, 152, 18, 'sa pn') + G('', P(pin, 'a') + C(px, 122, 6, 'wt'), ['sl', 1.2, .6, 0, -60]) + G('', R(px + 14, 106, w, 16, 'w', null, 8) + T(px + 22, 117, lbl, 'tk ik'), ['po', 1.8]);
    if (!cards) return map;
    return map + N(3, function (i) {
      var y = 60 + i * 62;
      return G('', R(268, y, 104, 56, i ? 'w' : 'w hl', null, 9) + C(284, y + 18, 9, i ? 'vl' : 'a') + R(298, y + 12, 58, 6, 'gd', null, 3) + R(298, y + 24, 42, 4, 'g', null, 2) + T(274, y + 46, '★★★★★', 'tk st') +
        (i ? '' : C(358, y + 40, 9, 'a') + T(358, y + 44, '1', 'tk ik c')), ['sl', 1.6 + i * .45, .6, 50, 0]);
    });
  }

  function build(el) {
    if (el.firstChild && el.firstChild.nodeName === 'svg') return;
    var k = el.getAttribute('data-scene'), f = SC[k] || SC.dm;
    el.innerHTML = '<svg viewBox="0 0 400 280" role="img" aria-label="' + (el.getAttribute('data-label') || 'Animated illustration') + '"><rect class="fr" x="8" y="8" width="384" height="264" rx="14"/><path class="fh" d="M8 40H392"/><circle cx="26" cy="24" r="4"/><circle cx="40" cy="24" r="4"/><circle cx="54" cy="24" r="4"/><g>' + f() + '</g></svg>';
    var st = d.getElementById('mn-kf'); if (!st) { st = d.createElement('style'); st.id = 'mn-kf'; d.head.appendChild(st); }
    st.textContent = KC.join('');
    el.classList.add('built');
  }
  function init() {
    var els = [].slice.call(d.querySelectorAll('[data-scene]'));
    if (!('IntersectionObserver' in window)) { els.forEach(build); els.forEach(function (e) { e.classList.add('on'); }); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) build(x.target); x.target.classList.toggle('on', x.isIntersecting); }); }, { rootMargin: '200px' });
    els.forEach(function (e) { io.observe(e); });
  }
  window.MN_SCENES = SC;
  d.readyState === 'loading' ? d.addEventListener('DOMContentLoaded', init) : init();
})();
