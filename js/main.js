/* Membersflow landing — interactions */
(function () {
  "use strict";

  var navbar = document.getElementById("navbar");
  var navToggle = document.getElementById("nav-toggle");
  var navMenu = document.getElementById("nav-menu");
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-link"));
  var faqItems = Array.prototype.slice.call(document.querySelectorAll(".faq-item"));
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Navbar background on scroll */
  function onScroll() {
    navbar.classList.toggle("scrolled", window.scrollY > 24);
    if (window.scrollY < 200) {
      navLinks.forEach(function (link) { link.classList.remove("active"); });
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  function closeMenu() {
    document.body.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
  }
  navToggle.addEventListener("click", function () {
    var open = document.body.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  navMenu.addEventListener("click", function (e) {
    if (e.target.closest("a")) closeMenu();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  /* Scroll-reveal */
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  } else {
    var staged = 0;
    var lastBatch = null;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var batch = Math.floor(entry.boundingClientRect.top / 120);
        el.style.setProperty("--reveal-delay", batch === lastBatch ? (staged++ * 0.06) + "s" : "0s");
        lastBatch = batch;
        staged = 0;
        el.classList.add("visible");
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* Active nav link */
  var sections = navLinks
    .map(function (link) {
      var id = link.getAttribute("href");
      return id && id.charAt(0) === "#" ? document.querySelector(id) : null;
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var sectionIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sections.forEach(function (s) { sectionIO.observe(s); });
  }

  /* FAQ accordion — one open at a time */
  faqItems.forEach(function (item) {
    var btn = item.querySelector(".faq-question");
    btn.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      faqItems.forEach(function (other) {
        other.classList.remove("open");
        other.querySelector(".faq-question").setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---------- Demo request modal ---------- */

  var demoOverlay = document.getElementById("demo-overlay");
  var demoForm = document.getElementById("demo-form");
  var demoSuccess = document.getElementById("demo-success");
  var demoAlert = document.getElementById("demo-alert");
  var demoSubmitBtn = demoForm ? demoForm.querySelector(".demo-submit") : null;
  var demoSubmitText = demoForm ? demoForm.querySelector(".demo-submit-text") : null;
  var demoLastFocus = null;

  var STATICFORMS_ENDPOINT = "https://api.staticforms.dev/submit";
  var STATICFORMS_KEY = "sf_3f33e84acd6f8143f073b6b8";

  function demoById(id) { return document.getElementById(id); }

  function demoIsOpen() { return demoOverlay.classList.contains("open"); }

  function demoFocusables() {
    if (!demoIsOpen()) return [];
    return Array.prototype.slice.call(
      demoOverlay.querySelectorAll("a[href], button:not([disabled]), input:not([disabled]):not([tabindex='-1']), select:not([disabled]), textarea:not([disabled]), [tabindex='-1']")
    ).filter(function (el) {
      return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
    });
  }

  function openDemo() {
    demoLastFocus = document.activeElement;
    closeMenu();
    resetDemo();
    document.body.classList.add("demo-open");
    demoOverlay.classList.add("open");
    demoOverlay.setAttribute("aria-hidden", "false");
    var first = demoById("demo-name");
    if (first) first.focus();
  }

  function closeDemo() {
    if (!demoIsOpen()) return;
    demoOverlay.classList.remove("open");
    demoOverlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("demo-open");
    if (demoLastFocus && typeof demoLastFocus.focus === "function") demoLastFocus.focus();
    /* wait out the fade before resetting, so the swap is never visible */
    setTimeout(function () {
      if (!demoIsOpen()) resetDemo();
    }, 400);
  }

  function resetDemo() {
    demoForm.reset();
    demoForm.hidden = false;
    demoSuccess.hidden = true;
    demoAlert.hidden = true;
    demoAlert.textContent = "";
    demoSubmitBtn.disabled = false;
    demoSubmitBtn.classList.remove("loading");
    demoSubmitText.textContent = "Request a demo";
    Array.prototype.forEach.call(demoForm.querySelectorAll(".invalid"), function (el) {
      el.classList.remove("invalid");
    });
  }

  function showDemoSuccess(name, email) {
    demoById("demo-success-name").textContent = (name.split(" ")[0] || name);
    demoById("demo-success-email").textContent = email;
    demoForm.hidden = true;
    demoSuccess.hidden = false;
    demoSuccess.focus();
  }

  function failDemo() {
    demoSubmitBtn.disabled = false;
    demoSubmitBtn.classList.remove("loading");
    demoSubmitText.textContent = "Request a demo";
    demoAlert.textContent = "Sorry — something went wrong sending your request. Please try again, or email hello@membersflow.ng directly.";
    demoAlert.hidden = false;
  }

  if (demoOverlay) {
    Array.prototype.slice.call(document.querySelectorAll("[data-demo-trigger]")).forEach(function (trigger) {
      trigger.addEventListener("click", function (e) {
        e.preventDefault();
        openDemo();
      });
    });

    Array.prototype.slice.call(document.querySelectorAll("[data-demo-close]")).forEach(function (btn) {
      btn.addEventListener("click", closeDemo);
    });

    demoOverlay.addEventListener("click", function (e) {
      if (e.target === demoOverlay) closeDemo();
    });

    document.addEventListener("keydown", function (e) {
      if (!demoIsOpen()) return;
      if (e.key === "Escape") { closeDemo(); return; }
      if (e.key === "Tab") {
        var focusables = demoFocusables();
        if (!focusables.length) return;
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });

    demoForm.addEventListener("input", function (e) {
      if (e.target.classList) e.target.classList.remove("invalid");
      if (!demoAlert.hidden) demoAlert.hidden = true;
    });

    demoForm.addEventListener("submit", function (e) {
      e.preventDefault();

      /* honeypot: bots that fill the hidden field get a silent fake success */
      if (demoById("demo-gotcha").value) {
        showDemoSuccess("there", "");
        return;
      }

      var name = demoById("demo-name").value.trim();
      var email = demoById("demo-email").value.trim();
      var org = demoById("demo-org").value.trim();
      var phone = demoById("demo-phone").value.trim();
      var orgType = demoById("demo-type").value;
      var members = demoById("demo-members").value;
      var message = demoById("demo-message").value.trim();

      var invalid = [];
      if (name.length < 2) invalid.push("demo-name");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) invalid.push("demo-email");
      if (org.length < 2) invalid.push("demo-org");
      if (invalid.length) {
        invalid.forEach(function (id) { demoById(id).classList.add("invalid"); });
        demoAlert.textContent = "Please add your name, a valid work email, and your organization's name.";
        demoAlert.hidden = false;
        demoById(invalid[0]).focus();
        return;
      }

      demoSubmitBtn.disabled = true;
      demoSubmitBtn.classList.add("loading");
      demoSubmitText.textContent = "Sending…";
      demoAlert.hidden = true;

      /* bail out with the fallback message if the API stalls */
      var controller = new AbortController();
      var timeout = setTimeout(function () { controller.abort(); }, 15000);

      function settle() { clearTimeout(timeout); }

      fetch(STATICFORMS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          apiKey: STATICFORMS_KEY,
          subject: "Demo request — Membersflow landing",
          replyTo: email,
          name: name,
          email: email,
          organization: org,
          organizationType: orgType,
          currentMembers: members,
          phone: phone,
          message: message,
          source: "Membersflow landing page"
        }),
        signal: controller.signal
      })
        .then(function (res) {
          return res.json()
            .catch(function () { return {}; })
            .then(function (data) { return { ok: res.ok, data: data }; });
        })
        .then(function (result) {
          settle();
          if (result.ok && result.data && result.data.success) {
            showDemoSuccess(name, email);
          } else {
            failDemo();
          }
        })
        .catch(function () {
          settle();
          failDemo();
        });
    });
  }

  /* Footer year */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
