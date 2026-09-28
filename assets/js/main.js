/* Animesh Mishra — portfolio behaviour.
   Progressive enhancement: every piece of content is in the HTML and readable
   without this file. The only animation loop is the decorative hero field,
   which runs only with motion allowed and pauses when off screen or hidden. */
(function () {
  'use strict';

  var doc = document.documentElement;
  var motionOK = doc.classList.contains('motion');
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } }
  };

  /* ---------- Theme ---------- */
  var themeBtn = $('#themeToggle');
  function syncThemeButton() {
    var dark = doc.getAttribute('data-theme') === 'dark';
    if (!themeBtn) return;
    themeBtn.setAttribute('aria-pressed', String(dark));
    themeBtn.setAttribute('aria-label', dark ? 'Light theme' : 'Dark theme');
  }
  syncThemeButton();
  if (themeBtn) themeBtn.addEventListener('click', function () {
    var next = doc.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    doc.setAttribute('data-theme', next);
    store.set('theme', next);
    syncThemeButton();
  });

  /* ---------- Mobile navigation ---------- */
  var nav = $('#primaryNav');
  var menuBtn = $('#menuToggle');
  function setMenu(open, returnFocus) {
    if (!nav || !menuBtn) return;
    nav.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) { var first = $('a', nav); if (first) first.focus(); }
    else if (returnFocus) menuBtn.focus();
  }
  if (menuBtn) menuBtn.addEventListener('click', function () {
    setMenu(menuBtn.getAttribute('aria-expanded') !== 'true', false);
  });
  if (nav) {
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false, false); });
    nav.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false, true); });
  }
  document.addEventListener('click', function (e) {
    if (!nav || !nav.classList.contains('is-open')) return;
    if (!e.target.closest('#primaryNav') && !e.target.closest('#menuToggle')) setMenu(false, false);
  });
  window.matchMedia('(min-width: 961px)').addEventListener('change', function (m) { if (m.matches) setMenu(false, false); });

  /* ---------- Header state + active section (IntersectionObserver, no scroll handlers) ---------- */
  var header = $('.site-header');
  if ('IntersectionObserver' in window) {
    var sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:8px;pointer-events:none';
    document.body.prepend(sentinel);
    new IntersectionObserver(function (entries) {
      if (header) header.classList.toggle('is-stuck', !entries[0].isIntersecting);
    }).observe(sentinel);

    var links = $$('.primary-nav a');
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var sectionIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = en.target.id === 'approach' ? 'credentials' : en.target.id;
        links.forEach(function (a) { a.removeAttribute('aria-current'); });
        if (byId[id]) byId[id].setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach(function (s) { sectionIO.observe(s); });
  }

  /* ---------- Reveal on scroll ---------- */
  $$('.tl-item[data-reveal]').forEach(function (el, i) { el.style.setProperty('--n', i); });
  $$('.cap-stage[data-reveal]').forEach(function (el, i) { el.style.setProperty('--n', i); });
  if (motionOK && 'IntersectionObserver' in window) {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); revealIO.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    $$('[data-reveal], [data-timeline]').forEach(function (el) { revealIO.observe(el); });
  } else {
    $$('[data-reveal], [data-timeline]').forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Proof numbers: count up once (values already correct in HTML) ---------- */
  var counters = $$('[data-count]');
  if (motionOK && counters.length && 'IntersectionObserver' in window) {
    var proof = $('.proof');
    var countIO = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      countIO.disconnect();
      var start = performance.now(), dur = 650;
      counters.forEach(function (el) { el.textContent = '0'; });
      (function tick(now) {
        var t = Math.min(1, (now - start) / dur), e = 1 - Math.pow(1 - t, 3);
        counters.forEach(function (el) { el.textContent = String(Math.round(+el.getAttribute('data-count') * e)); });
        if (t < 1) requestAnimationFrame(tick);
      })(start);
    }, { threshold: 0.6 });
    if (proof) countIO.observe(proof);
  }

  /* ---------- Dialogs ---------- */
  var supportsDialog = typeof HTMLDialogElement === 'function';
  var lastOpener = null;

  function openDialog(dlg, opener) {
    if (!dlg) return;
    lastOpener = opener || document.activeElement;
    if (supportsDialog && dlg.showModal) { if (!dlg.open) dlg.showModal(); }
    else dlg.setAttribute('open', '');
    doc.style.overflow = 'hidden';
    var closeBtn = $('[data-close]', dlg);
    if (closeBtn) closeBtn.focus();
  }
  function finishClose(dlg) {
    if (dlg.open && dlg.close) dlg.close(); else dlg.removeAttribute('open');
  }
  function closeDialog(dlg) {
    if (!dlg || !dlg.open) return;
    if (motionOK && dlg.animate) {
      var anim = dlg.animate(
        [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(8px) scale(.985)' }],
        { duration: 160, easing: 'cubic-bezier(.4,0,1,1)' }
      );
      anim.onfinish = function () { finishClose(dlg); };
      anim.oncancel = function () { finishClose(dlg); };
    } else finishClose(dlg);
  }
  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea, select, [tabindex]:not([tabindex="-1"])';
  $$('dialog.dlg').forEach(function (dlg) {
    dlg.addEventListener('cancel', function (e) { e.preventDefault(); closeDialog(dlg); });
    /* Keep Tab inside the open dialog (wraps first ↔ last). */
    dlg.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = $$(FOCUSABLE, dlg).filter(function (el) { return el.offsetParent !== null || el === document.activeElement; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    dlg.addEventListener('close', function () {
      doc.style.overflow = '';
      if (lastOpener && typeof lastOpener.focus === 'function' && document.contains(lastOpener)) lastOpener.focus();
      lastOpener = null;
    });
    dlg.addEventListener('click', function (e) {
      if (e.target.closest('[data-close]')) { closeDialog(dlg); return; }
      if (e.target === dlg) {                        /* click on the backdrop area */
        var r = dlg.getBoundingClientRect();
        var inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
        if (!inside) closeDialog(dlg);
      }
    });
  });
  $$('[data-dialog]').forEach(function (btn) {
    btn.addEventListener('click', function () { openDialog(document.getElementById(btn.getAttribute('data-dialog')), btn); });
  });

  /* ---------- CV dialog with two versions ---------- */
  var CV = {
    ats: {
      label: 'ATS Résumé', file: 'Animesh_CV.pdf', download: 'Animesh_Mishra_ATS_Resume.pdf',
      desc: 'One page, single column, text-based. Use this for job portals and applicant-tracking systems.',
      alt: 'Preview of page 1 of the ATS résumé'
    },
    iihmr: {
      label: 'IIHMR Placement CV', file: 'Animesh_CV_IIHMR.pdf', download: 'Animesh_Mishra_IIHMR_CV.pdf',
      desc: 'The IIHMR University School of Pharmaceutical Management placement template, with photograph.',
      alt: 'Preview of page 1 of the IIHMR placement CV'
    }
  };
  var cvDlg = $('#dlg-cv');
  var cvTabs = $$('.cv-tab');
  var cvImg = $('#cvPreview');
  function selectCV(key, announce) {
    var c = CV[key]; if (!c || !cvDlg) return;
    cvTabs.forEach(function (t) {
      var on = t.getAttribute('data-cv') === key;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    $('#panel-cv').setAttribute('aria-labelledby', 'tab-' + key);
    $('#cvDesc').textContent = c.desc;
    var dl = $('#cvDownload'), op = $('#cvOpen');
    dl.href = c.file; dl.setAttribute('download', c.download);
    op.href = c.file;
    var src = cvImg.getAttribute('data-src-' + key);
    if (cvImg.getAttribute('src') !== src) {
      if (motionOK && cvImg.getAttribute('src')) {
        cvImg.classList.add('is-swapping');
        var swap = function () { cvImg.classList.remove('is-swapping'); cvImg.removeEventListener('load', swap); };
        cvImg.addEventListener('load', swap);
        setTimeout(function () { cvImg.src = src; }, 120);
        setTimeout(swap, 900);                      /* never leave the preview hidden */
      } else cvImg.src = src;
      cvImg.alt = c.alt;
    }
    if (announce) $('#cvLive').textContent = 'Showing ' + c.label + '.';
  }
  cvTabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectCV(t.getAttribute('data-cv'), true); });
    t.addEventListener('keydown', function (e) {
      var k = e.key, n = null;
      if (k === 'ArrowRight' || k === 'ArrowDown') n = cvTabs[(i + 1) % cvTabs.length];
      else if (k === 'ArrowLeft' || k === 'ArrowUp') n = cvTabs[(i - 1 + cvTabs.length) % cvTabs.length];
      else if (k === 'Home') n = cvTabs[0];
      else if (k === 'End') n = cvTabs[cvTabs.length - 1];
      if (n) { e.preventDefault(); n.focus(); selectCV(n.getAttribute('data-cv'), true); }
    });
  });
  $$('[data-cv-open]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (!cvDlg) return;                           /* no dialog: the link opens the PDF */
      e.preventDefault();
      selectCV(a.getAttribute('data-cv-open'), false);
      openDialog(cvDlg, a);
      var active = $('.cv-tab[aria-selected="true"]');
      if (active) active.focus();
    });
  });

  /* ---------- Credential filter ---------- */
  var credInput = $('#credSearch');
  if (credInput) {
    var items = $$('#credList li');
    var empty = $('#credEmpty'), status = $('#credStatus');
    credInput.addEventListener('input', function () {
      var q = credInput.value.trim().toLowerCase(), shown = 0;
      items.forEach(function (li) {
        var hit = !q || li.textContent.toLowerCase().indexOf(q) !== -1;
        li.hidden = !hit; if (hit) shown++;
      });
      empty.hidden = shown !== 0;
      status.textContent = shown + ' of ' + items.length + ' credentials shown.';
    });
  }

  /* ---------- Contact form: Formspree with a mailto fallback ---------- */
  var form = $('#cForm');
  if (form) {
    var btn = $('#cfSubmit'), out = $('#cfStatus');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var endpoint = form.getAttribute('data-formspree-action') || '';
      var mailto = function () {
        var body = 'Name: ' + (data.get('name') || '') + '\nEmail: ' + (data.get('email') || '') + '\n\n' + (data.get('message') || '');
        window.location.href = 'mailto:animesh.pm17@iihmr.in?subject=' + encodeURIComponent('Portfolio enquiry') + '&body=' + encodeURIComponent(body);
        out.innerHTML = 'Your email app should have opened with the message. If not, write to <a href="mailto:animesh.pm17@iihmr.in">animesh.pm17@iihmr.in</a>.';
      };
      if (!/^https:\/\/formspree\.io\/f\/[\w-]+$/.test(endpoint) || !window.fetch) { mailto(); return; }
      btn.disabled = true; out.textContent = 'Sending…';
      fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
        .then(function (res) {
          if (!res.ok) throw new Error('rejected');
          form.reset();
          out.textContent = 'Thank you. Your message has been sent.';
        })
        .catch(function () { mailto(); })
        .then(function () { btn.disabled = false; });
    });
  }

  /* ---------- Hero molecule field (decorative canvas) ---------- */
  var field = $('.hero-field');
  var saveData = navigator.connection && navigator.connection.saveData;
  if (field && motionOK && !saveData && field.getContext) (function () {
    var ctx = field.getContext('2d');
    var hero = field.parentNode;
    var W = 0, H = 0, dpr = 1, nodes = [], pulses = [], raf = 0, last = 0, visible = true;
    var px = 0, py = 0, tx = 0, ty = 0;
    var LINK = 150, STEP = 1000 / 30;
    var colors = {};

    function readColors() {
      var cs = getComputedStyle(doc);
      colors.gold = cs.getPropertyValue('--gold-ui').trim() || '#B8962E';
      colors.teal = cs.getPropertyValue('--teal').trim() || '#16665F';
      colors.line = cs.getPropertyValue('--rule-strong').trim() || '#BDB6A4';
      colors.dark = doc.getAttribute('data-theme') === 'dark';
    }
    function build() {
      var r = hero.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      field.width = Math.round(W * dpr); field.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.max(18, Math.min(64, Math.round(W * H / 12000)));
      nodes = [];
      for (var i = 0; i < count; i++) {
        var kind = Math.random();
        nodes.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - .5) * .22, vy: (Math.random() - .5) * .22,
          z: .4 + Math.random() * .9,
          r: kind > .86 ? 3.6 : kind > .6 ? 2.6 : 1.8,
          c: kind > .86 ? 'gold' : kind > .6 ? 'teal' : 'line'
        });
      }
      pulses = [];
    }
    function spawnPulse() {
      var a = nodes[(Math.random() * nodes.length) | 0], best = null, bd = LINK;
      nodes.forEach(function (b) {
        if (b === a) return;
        var d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < bd && d > 40) { bd = d; best = b; }
      });
      if (best) pulses.push({ a: a, b: best, t: 0 });
    }
    function draw(now) {
      raf = requestAnimationFrame(draw);
      if (now - last < STEP) return;
      last = now;
      px += (tx - px) * .05; py += (ty - py) * .05;
      ctx.clearRect(0, 0, W, H);
      var i, j, n, m, d, o;
      for (i = 0; i < nodes.length; i++) {
        n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        if (n.x < -20) n.x = W + 20; else if (n.x > W + 20) n.x = -20;
        if (n.y < -20) n.y = H + 20; else if (n.y > H + 20) n.y = -20;
        n.sx = n.x + px * 18 * n.z; n.sy = n.y + py * 12 * n.z;
      }
      ctx.lineWidth = 1;
      ctx.strokeStyle = colors.line;
      for (i = 0; i < nodes.length; i++) {
        n = nodes[i];
        for (j = i + 1; j < nodes.length; j++) {
          m = nodes[j];
          d = Math.hypot(n.sx - m.sx, n.sy - m.sy);
          if (d < LINK) {
            o = (1 - d / LINK) * (colors.dark ? .7 : .85);
            ctx.globalAlpha = o;
            ctx.beginPath(); ctx.moveTo(n.sx, n.sy); ctx.lineTo(m.sx, m.sy); ctx.stroke();
          }
        }
      }
      for (i = 0; i < nodes.length; i++) {
        n = nodes[i];
        ctx.globalAlpha = n.c === 'line' ? .8 : .9;
        ctx.fillStyle = colors[n.c];
        ctx.beginPath(); ctx.arc(n.sx, n.sy, n.r, 0, 6.2832); ctx.fill();
        if (n.c === 'gold') {
          ctx.globalAlpha = .18; ctx.beginPath(); ctx.arc(n.sx, n.sy, n.r * 3.2, 0, 6.2832); ctx.fill();
        }
      }
      if (pulses.length < 3 && Math.random() < .03) spawnPulse();
      ctx.fillStyle = colors.gold;
      pulses = pulses.filter(function (p) {
        p.t += .018;
        var x = p.a.sx + (p.b.sx - p.a.sx) * p.t, y = p.a.sy + (p.b.sy - p.a.sy) * p.t;
        ctx.globalAlpha = Math.sin(Math.PI * p.t);
        ctx.beginPath(); ctx.arc(x, y, 2, 0, 6.2832); ctx.fill();
        return p.t < 1;
      });
      ctx.globalAlpha = 1;
    }
    function run() {
      cancelAnimationFrame(raf);
      if (visible && !document.hidden) raf = requestAnimationFrame(draw);
    }

    readColors(); build();
    field.classList.add('is-live');
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; run(); }).observe(hero);
    document.addEventListener('visibilitychange', run);
    new MutationObserver(readColors).observe(doc, { attributes: true, attributeFilter: ['data-theme'] });
    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(build, 200); });
    if (window.matchMedia('(pointer: fine)').matches) {
      hero.addEventListener('pointermove', function (e) {
        var r = hero.getBoundingClientRect();
        tx = (e.clientX - r.left) / r.width - .5; ty = (e.clientY - r.top) / r.height - .5;
      });
      hero.addEventListener('pointerleave', function () { tx = 0; ty = 0; });
    }
  })();

  /* ---------- Privacy-friendly visit counts (GoatCounter, no cookies) ----------
     Off until <meta name="goatcounter" content="CODE"> is filled in. Also counts
     CV downloads, case openings and clicks through to the live app as events. */
  var gcCode = ($('meta[name="goatcounter"]') || {}).content;
  if (gcCode && /^[a-z0-9-]+$/.test(gcCode)) {
    var gc = document.createElement('script');
    gc.async = true; gc.src = 'https://gc.zgo.at/count.js';
    gc.setAttribute('data-goatcounter', 'https://' + gcCode + '.goatcounter.com/count');
    document.head.appendChild(gc);
    var track = function (name) {
      if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: name, title: name, event: true });
    };
    document.addEventListener('click', function (e) {
      var el = e.target.closest('a, button');
      if (!el) return;
      var href = el.getAttribute('href') || '';
      if (/Animesh_CV(_IIHMR)?\.pdf$/.test(href)) track('cv-' + (href.indexOf('IIHMR') > -1 ? 'iihmr' : 'ats'));
      else if (el.hasAttribute('data-dialog')) track('open-' + el.getAttribute('data-dialog'));
      else if (href.indexOf('moleculetomarket.app') > -1) track('out-m2m-app');
      else if (/case-studies\/.+\.pdf$/.test(href)) track('pdf-' + href.split('/').pop().replace('.pdf', ''));
    });
  }

  /* ---------- Case cover sheen follows the pointer ---------- */
  if (motionOK && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('.case-media').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }
})();
