/* Membersflow landing — nav, vocabulary switcher, renewal timeline,
   payment tabs, card flip, roles picker. No dependencies. */
(function () {
  'use strict';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------- Nav: scrolled state, mobile menu, active link ---------- */

  var nav = $('#nav');
  var toggle = $('#nav-toggle');
  var links = $('#nav-links');

  function onScroll() { nav.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function closeMenu() {
    links.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  }
  toggle.addEventListener('click', function () {
    var open = !links.classList.contains('is-open');
    links.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  $$('a', links).forEach(function (a) { a.addEventListener('click', closeMenu); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  window.addEventListener('resize', function () { if (window.innerWidth > 860) closeMenu(); });

  var sectionLinks = $$('a[href^="#"]', links).filter(function (a) { return !a.classList.contains('btn'); });
  var sections = sectionLinks.map(function (a) { return $(a.getAttribute('href')); }).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    var active = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        sectionLinks.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id);
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(function (s) { active.observe(s); });
  }

  /* ---------- Vocabulary switcher ---------- */

  var VOCAB = {
    institute: {
      initials: 'AM', name: 'Engr. Amaka Mensah', idLabel: 'Membership ID', id: 'MF-2026-000418',
      classLabel: 'Membership grade', classValue: 'Fellow',
      chapterLabel: 'Chapter', chapterValue: 'Lagos Chapter',
      divisionLabel: 'Division', divisionValue: 'Structural engineering',
      specialtyLabel: 'Specialty', specialtyValue: 'Bridges',
      duesLabel: 'Annual subscription', duesValue: '₦48,000', renews: '30 Nov 2026', memberWord: 'member'
    },
    alumni: {
      initials: 'TO', name: 'Tunde Okafor', idLabel: 'Alumni number', id: 'ALM-2009-00231',
      classLabel: 'Class year', classValue: 'Class of 2009',
      chapterLabel: 'Alumni branch', chapterValue: 'Abuja branch',
      divisionLabel: 'Faculty', divisionValue: 'Law',
      specialtyLabel: 'Current field', specialtyValue: 'Corporate counsel',
      duesLabel: 'Annual alumni dues', duesValue: '₦15,000', renews: '1 Jan 2027', memberWord: 'alumnus'
    },
    union: {
      initials: 'ZI', name: 'Zainab Ibrahim', idLabel: 'Union number', id: 'UN-000912',
      classLabel: 'Membership category', classValue: 'Full member',
      chapterLabel: 'Branch', chapterValue: 'Port Harcourt branch',
      divisionLabel: 'Sector', divisionValue: 'Maritime',
      specialtyLabel: 'Trade', specialtyValue: 'Marine engineering',
      duesLabel: 'Monthly dues', duesValue: '₦2,500', renews: '1 Nov 2026', memberWord: 'member'
    },
    faith: {
      initials: 'NE', name: 'Ngozi Eze', idLabel: 'Register number', id: 'PR-2026-01177',
      classLabel: 'Membership status', classValue: 'Communicant',
      chapterLabel: 'Parish', chapterValue: "St. Mark's, Enugu",
      divisionLabel: 'Society', divisionValue: 'Choir',
      specialtyLabel: 'Ministry', specialtyValue: 'Youth',
      duesLabel: 'Annual levy', duesValue: '₦10,000', renews: '31 Dec 2026', memberWord: 'member'
    }
  };

  var vocab = $('#vocab');
  if (vocab) {
    var vocabBtns = $$('[data-vocab]', vocab);
    var vocabFields = $$('[data-v]', vocab);
    var vocabTimer;

    function applyVocab(key) {
      var data = VOCAB[key];
      vocabBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.vocab === key)); });
      vocab.classList.add('is-switching');
      clearTimeout(vocabTimer);
      vocabTimer = setTimeout(function () {
        vocabFields.forEach(function (el) {
          var v = data[el.dataset.v];
          if (v !== undefined) el.textContent = v;
        });
        vocab.classList.remove('is-switching');
      }, 160);
    }
    vocabBtns.forEach(function (b) {
      b.addEventListener('click', function () { applyVocab(b.dataset.vocab); });
    });
  }

  /* ---------- Renewal timeline ---------- */
  /* Stages mirror App\Enums\RenewalReminderStage: -30, -14, -7, -1, 0, +7.
     max_late_days = 3: a stage older than 3 days at sweep time is superseded. */

  var STAGES = [
    { at: -30, n: 1, subject: 'Your membership expires in 30 days', body: 'Your membership expires in 30 days. Renew from your member area to keep your standing and your card valid.' },
    { at: -14, n: 2, subject: 'Your membership expires in two weeks', body: 'Your membership expires in two weeks. Renewing now keeps your directory listing and card uninterrupted.' },
    { at: -7, n: 3, subject: 'Your membership expires in 7 days', body: 'Your membership expires in 7 days. Pay online or by bank transfer from your invoice.' },
    { at: -1, n: 4, subject: 'Your membership expires tomorrow', body: 'Your membership expires tomorrow. After expiry your card will read as lapsed when scanned.' },
    { at: 0, n: 5, subject: 'Your membership expires today', body: 'Your membership expires today. Renew to keep your member benefits.' },
    { at: 7, n: 6, subject: 'Your membership expired — renew to restore your benefits', body: 'Your membership expired a week ago. Renew now to restore your member benefits.' }
  ];
  var MAX_LATE = 3;

  var range = $('#renew-range');
  if (range) {
    var out = $('#renew-out');
    var mail = $('#renew-mail');
    var stageName = $('#renew-stagename');
    var subject = $('#renew-subject');
    var body = $('#renew-body');
    var pill = $('#renew-pill');
    var statusText = $('#renew-statustext');
    var lastStageN = null;

    function dayLabel(d) {
      if (d === 0) return 'Expiry day';
      if (d < 0) return Math.abs(d) + (d === -1 ? ' day before' : ' days before');
      return d + (d === 1 ? ' day after' : ' days after');
    }

    function stageFor(d) {
      // The most recent stage whose due day has passed, if it's still within the late window.
      var current = null;
      for (var i = 0; i < STAGES.length; i++) {
        if (STAGES[i].at <= d) current = STAGES[i];
      }
      if (!current) return null;
      return { stage: current, late: d - current.at, stale: d - current.at > MAX_LATE };
    }

    function renderRenew() {
      var d = parseInt(range.value, 10);
      out.textContent = dayLabel(d);

      var s = stageFor(d);
      mail.classList.remove('is-quiet');
      if (!s) {
        stageName.textContent = 'No reminder yet';
        subject.textContent = 'Nothing sent';
        body.textContent = 'The first reminder goes out 30 days before expiry. Until then the member hears nothing.';
        mail.classList.add('is-quiet');
      } else {
        stageName.textContent = 'Stage ' + s.stage.n + ' of 6' + (s.late ? ' · sent ' + s.late + (s.late === 1 ? ' day' : ' days') + ' ago' : ' · sent today');
        subject.textContent = s.stage.subject;
        body.textContent = s.stage.body;
      }

      pill.className = 'pill';
      if (d > 0) {
        pill.classList.add('pill-bad'); pill.textContent = 'Expired';
        statusText.textContent = d >= 7 ? 'Lapsed · card scans as not in good standing' : 'Expired · benefits paused until renewal';
      } else if (d === 0) {
        pill.classList.add('pill-due'); pill.textContent = 'Expires today';
        statusText.textContent = 'Last day of the current term';
      } else if (d >= -7) {
        pill.classList.add('pill-due'); pill.textContent = 'Due';
        statusText.textContent = 'Current · expires in ' + Math.abs(d) + (d === -1 ? ' day' : ' days');
      } else {
        pill.classList.add('pill-ok'); pill.textContent = 'Active';
        statusText.textContent = d >= -30 ? 'Current, renewal window open' : 'Current, nothing due';
      }

      var n = s ? s.stage.n : 0;
      if (n !== lastStageN && lastStageN !== null) {
        mail.classList.remove('is-pulse');
        void mail.offsetWidth;
        mail.classList.add('is-pulse');
      }
      lastStageN = n;
    }

    range.addEventListener('input', renderRenew);
    renderRenew();
  }

  /* ---------- Payment tabs ---------- */

  var pay = $('#pay');
  if (pay) {
    var tabs = $$('[role="tab"]', pay);
    var panels = $$('[role="tabpanel"]', pay);

    function selectTab(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
      });
      panels.forEach(function (p) { p.hidden = p.id !== tab.getAttribute('aria-controls'); });
      if (focus) tab.focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { selectTab(t, false); });
      t.addEventListener('keydown', function (e) {
        var next;
        if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
        else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === 'Home') next = tabs[0];
        else if (e.key === 'End') next = tabs[tabs.length - 1];
        if (next) { e.preventDefault(); selectTab(next, true); }
      });
    });
  }

  /* ---------- Membership card ---------- */

  var card = $('#mcard');
  var flipBtn = $('#card-flip-btn');
  if (card && flipBtn) {
    function setFlipped(on) {
      card.classList.toggle('is-flipped', on);
      flipBtn.setAttribute('aria-pressed', String(on));
      flipBtn.textContent = on ? 'Show the front' : 'Flip the card';
    }
    flipBtn.addEventListener('click', function () { setFlipped(!card.classList.contains('is-flipped')); });
    card.addEventListener('click', function () { setFlipped(!card.classList.contains('is-flipped')); });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFlipped(!card.classList.contains('is-flipped')); }
    });

    // Decorative QR-like pattern: finder squares plus a seeded module field.
    var qr = $('#mcard-qr');
    if (qr) {
      var N = 25, seed = 418, out = [];
      function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
      function finder(x, y) {
        for (var i = 0; i < 7; i++) for (var j = 0; j < 7; j++) {
          var edge = i === 0 || j === 0 || i === 6 || j === 6;
          var core = i >= 2 && i <= 4 && j >= 2 && j <= 4;
          if (edge || core) out.push('<rect x="' + (x + j) + '" y="' + (y + i) + '" width="1" height="1"/>');
        }
      }
      finder(0, 0); finder(N - 7, 0); finder(0, N - 7);
      for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
        var inFinder = (x < 8 && y < 8) || (x >= N - 8 && y < 8) || (x < 8 && y >= N - 8);
        if (!inFinder && rnd() < 0.42) out.push('<rect x="' + x + '" y="' + y + '" width="1" height="1"/>');
      }
      qr.innerHTML = out.join('');
    }
  }

  /* ---------- Roles picker ---------- */

  var roles = $('#roles');
  if (roles) {
    var roleBtns = $$('[data-role]', roles);
    var perms = $$('#perm-list li', roles);
    var count = $('#roles-count');
    var ROLE_NAMES = { registrar: 'A registrar', finance: 'A finance officer', editor: 'A content editor', admin: 'An administrator' };

    function applyRole(key) {
      roleBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.role === key)); });
      var on = 0;
      perms.forEach(function (li) {
        var has = li.dataset.roles.split(' ').indexOf(key) !== -1;
        li.classList.toggle('is-on', has);
        if (has) on++;
      });
      count.textContent = ROLE_NAMES[key] + ' holds ' + on + ' of these ' + perms.length + ' permissions. Roles are yours to define; these four are examples.';
    }
    roleBtns.forEach(function (b) {
      b.addEventListener('click', function () { applyRole(b.dataset.role); });
    });
    applyRole('registrar');
  }

  /* ---------- Reveal on scroll ---------- */

  var revealTargets = $$('.section-head, .coverage-list li, .steps li, .access-notes > div, .pay-facts li');
  revealTargets.forEach(function (el) { el.classList.add('reveal'); });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('is-in'); });
  }
})();
