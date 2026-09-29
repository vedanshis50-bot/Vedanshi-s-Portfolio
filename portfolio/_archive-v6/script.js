/* Vedanshi Singh portfolio v6 - scroll storytelling.
   GSAP + ScrollTrigger for scrubbed scenes, Lenis for smooth scroll.
   Every motion here has a job (noted in comments). Without JS libraries or with reduced motion,
   the page renders complete and static (html.static). */
(function () {
  "use strict";
  var doc = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches || /[?&]static/.test(location.search);
  var canAnimate = !reduce && window.gsap && window.ScrollTrigger;
  var q = function (s, c) { return (c || document).querySelector(s); };
  var qa = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var lenis = null;

  if (!canAnimate) doc.classList.add("static"); else { doc.classList.add("js-motion"); gsap.registerPlugin(ScrollTrigger); }

  /* ---------- theme (both modes are designed, not inverted) ---------- */
  var themeBtn = q("[data-theme-toggle]");
  function isDark() { var t = doc.getAttribute("data-theme"); return t ? t === "dark" : matchMedia("(prefers-color-scheme: dark)").matches; }
  if (themeBtn) themeBtn.addEventListener("click", function () {
    var next = isDark() ? "light" : "dark";
    doc.setAttribute("data-theme", next);
    try { localStorage.setItem("vsTheme", next); } catch (e) {}
    document.dispatchEvent(new CustomEvent("vs-theme"));
  });

  /* ---------- smooth scroll + anchors ---------- */
  if (canAnimate && window.Lenis && !/[?&]nolenis/.test(location.search)) {
    lenis = new Lenis({ duration: 1.05, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  qa('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href"); if (id.length < 2) return;
      var t = q(id); if (!t) return; e.preventDefault();
      if (lenis) lenis.scrollTo(id === "#home" ? 0 : t, { offset: id === "#home" ? 0 : -60, duration: 1.5 });
      else t.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    });
  });

  /* ---------- nav: active section + sliding underline + progress ---------- */
  var links = qa(".nav-links a"), ind = q(".nav-ind"), linkFor = {};
  links.forEach(function (a) { linkFor[a.getAttribute("href").slice(1)] = a; });
  var groups = { home: "home", about: "about", work: "work", trust: "work", wrong: "work", contact: "contact" };
  function setActive(id) {
    var a = linkFor[groups[id] || id]; if (!a || !ind) return;
    links.forEach(function (l) { l.setAttribute("aria-current", l === a ? "true" : "false"); });
    if (a.offsetParent === null) { ind.style.opacity = 0; return; }
    ind.style.opacity = 1;
    ind.style.transform = "translateX(" + (a.offsetLeft + 12) + "px) scaleX(" + Math.max(1, a.offsetWidth - 24) + ")";
  }
  if ("IntersectionObserver" in window) {
    var sio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) setActive(e.target.id); }); }, { rootMargin: "-45% 0px -50% 0px" });
    qa("main > section[id]").forEach(function (s) { sio.observe(s); });
  }
  setActive("home");
  addEventListener("resize", function () { var cur = q('.nav-links a[aria-current="true"]'); if (cur) setActive(cur.getAttribute("href").slice(1)); });

  /* ---------- copy email + toast + the visitor's own plan (works without motion) ---------- */
  var toast = q(".toast");
  function say(msg) { if (!toast) return; toast.textContent = msg; toast.classList.add("show"); clearTimeout(say.t); say.t = setTimeout(function () { toast.classList.remove("show"); }, 1900); }
  qa("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function () {
      var mailed = q("[data-mailed]");
      function ok() { b.textContent = "Copied"; if (mailed) mailed.checked = true; say("Email copied. Talk soon."); setTimeout(function () { b.textContent = "Copy email"; }, 1800); }
      function fallback() {
        var el = q("[data-copy-target]");
        if (el) { var r = document.createRange(); r.selectNodeContents(el); var s = getSelection(); s.removeAllRanges(); s.addRange(r); }
        if (mailed) mailed.checked = true; say("Selected. Press Ctrl+C or Cmd+C");
      }
      try { navigator.clipboard.writeText(b.getAttribute("data-copy")).then(ok, fallback); } catch (e) { fallback(); }
    });
  });
  /* "Ask me about it" notes on the unpublished case studies (honest state, not a dead link) */
  qa("[data-later]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var scene = btn.closest(".scene"); var on = !scene.classList.contains("showing-later");
      scene.classList.toggle("showing-later", on);
      var target = on ? q(".later .btn", scene) : q(".now-body .btn", scene); if (target) target.focus({ preventScroll: true });
    });
  });
  qa("[data-plan]").forEach(function (plan) {
    var boxes = qa("input", plan);
    boxes.forEach(function (b) { b.addEventListener("change", function () { b.dataset.touched = "1"; }); });
    function tick() { boxes.forEach(function (b, i) { setTimeout(function () { if (!b.dataset.touched) b.checked = true; }, reduce ? 0 : 450 + i * 420); }); }
    if ("IntersectionObserver" in window) { var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); tick(); } }, { threshold: 0.6 }); io.observe(plan); } else tick();
  });
  var cplan = q("[data-plan-contact]");
  if (cplan && "IntersectionObserver" in window) { var cio = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { cio.disconnect(); setTimeout(function () { q("[data-auto]", cplan).checked = true; }, reduce ? 0 : 500); } }, { threshold: 0.6 }); cio.observe(cplan); }

  /* ---------- falling leaves around the portrait (2D canvas, pauses off-screen) ---------- */
  var cv = q("[data-leaves]");
  if (cv && !reduce && cv.getContext) (function () {
    var ctx = cv.getContext("2d"), W = 0, H = 0, running = false, raf = 0, t = 0, last = 0, cols;
    function rnd(a, b, s) { var x = Math.sin(s * 9301 + 49297) * 233280; x = x - Math.floor(x); return a + (b - a) * x; }
    var leaves = []; for (var i = 0; i < 10; i++) leaves.push({ x: rnd(0.05, 0.95, i + 1), y0: rnd(0, 1, i + 11), vy: rnd(16, 32, i + 21), om: rnd(0.9, 1.9, i + 31) * (i % 2 ? 1 : -1), ph: rnd(0, 6.28, i + 41), slip: rnd(14, 30, i + 51), size: rnd(7, 12, i + 61), roll: rnd(0.3, 0.8, i + 71), hue: i % 3 });
    function readCols() { var cs = getComputedStyle(doc); cols = [cs.getPropertyValue("--olive").trim() || "#56673a", "#C9A24A", "#9AA86A"]; }
    readCols(); document.addEventListener("vs-theme", readCols);
    function size() { var r = cv.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1); W = r.width; H = r.height; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function frame(ts) {
      var dt = last ? Math.min(0.05, (ts - last) / 1000) : 0.016; last = ts; t += dt; ctx.clearRect(0, 0, W, H);
      var span = H + 60;
      leaves.forEach(function (L) {
        var ang = L.ph + L.om * t, y = ((L.y0 * span + L.vy * t) % span) - 30, x = L.x * W - (L.slip / L.om) * Math.cos(ang) + 10 * Math.sin(t * 0.35 + L.ph), face = Math.cos(ang), fade = Math.min(1, (y + 30) / 60, (span - 30 - y) / 60);
        ctx.save(); ctx.translate(x, y); ctx.rotate(0.5 * Math.sin(t * L.roll + L.ph) + 0.6); ctx.scale(Math.max(0.08, Math.abs(face)), 1); ctx.globalAlpha = Math.max(0, fade) * (face < 0 ? 0.55 : 0.9);
        var s = L.size; ctx.beginPath(); ctx.moveTo(0, -s); ctx.quadraticCurveTo(s * 0.75, 0, 0, s); ctx.quadraticCurveTo(-s * 0.75, 0, 0, -s); ctx.fillStyle = cols[L.hue]; ctx.fill();
        ctx.beginPath(); ctx.moveTo(0, -s * 0.9); ctx.lineTo(0, s * 1.25); ctx.strokeStyle = "rgba(0,0,0,.2)"; ctx.lineWidth = 0.8; ctx.stroke(); ctx.restore();
      });
      raf = requestAnimationFrame(frame);
    }
    size(); if ("ResizeObserver" in window) new ResizeObserver(size).observe(cv);
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) {
      if (es[0].isIntersecting && !running) { running = true; last = 0; raf = requestAnimationFrame(frame); }
      else if (!es[0].isIntersecting && running) { running = false; cancelAnimationFrame(raf); }
    }).observe(cv);
    document.addEventListener("visibilitychange", function () { if (document.hidden) { running = false; cancelAnimationFrame(raf); } });
  })();

  /* ---------- chat answer streams in, then the highlights land ---------- */
  var chat = q("[data-chat]"), stream = q("[data-stream]");
  if (chat && stream && !reduce) {
    var words = [];
    (function split(node) {
      [].slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var f = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { f.appendChild(document.createTextNode(part)); return; }
            var s = document.createElement("span"); s.className = "w"; s.textContent = part; s.style.setProperty("--wo", 0); f.appendChild(s); words.push(s);
          });
          n.parentNode.replaceChild(f, n);
        } else if (n.nodeType === 1) split(n);
      });
    })(stream);
    var cio2 = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return; cio2.disconnect();
      var i = 0, iv = setInterval(function () { if (i >= words.length) { clearInterval(iv); chat.classList.add("done"); return; } words[i++].style.setProperty("--wo", 1); }, 50);
    }, { threshold: 0.5 });
    cio2.observe(chat);
  } else if (chat) chat.classList.add("done");

  if (!canAnimate) return; /* everything below needs GSAP */

  /* ---------- pencil trail in the margin: scroll progress made visible ---------- */
  var pen = q(".penline"), penTrigger;
  function buildPen() {
    if (!pen || innerWidth <= 1000) return;
    if (penTrigger) penTrigger.kill();
    var ns = "http://www.w3.org/2000/svg", h = innerHeight, d = "M23 0", y = 0, dir = 1;
    while (y < h + 70) { d += " Q " + (23 + dir * 15) + " " + (y + 35) + " 23 " + (y + 70); y += 70; dir *= -1; }
    pen.innerHTML = ""; pen.setAttribute("viewBox", "0 0 46 " + h);
    var p = document.createElementNS(ns, "path"); p.setAttribute("d", d); pen.appendChild(p);
    var g = document.createElementNS(ns, "g");
    g.innerHTML = '<path class="tip" d="M0 0 L-4.5 -13 L4.5 -13 Z"/><rect class="tip" x="-4.5" y="-34" width="9" height="21" rx="1.5"/>';
    pen.appendChild(g);
    var len = p.getTotalLength(); p.style.strokeDasharray = len; p.style.strokeDashoffset = len;
    function at(l) { var pt = p.getPointAtLength(Math.min(l, h * 1.02)); g.setAttribute("transform", "translate(" + pt.x + " " + Math.min(pt.y, h - 6) + ") rotate(14)"); }
    at(0);
    penTrigger = ScrollTrigger.create({ start: 0, end: "max", onUpdate: function (self) { var l = len * Math.min(1, self.progress * 1.02) * (h / (h + 70)); p.style.strokeDashoffset = len - l; at(l); } });
  }
  buildPen(); var rz; addEventListener("resize", function () { clearTimeout(rz); rz = setTimeout(buildPen, 250); });
  gsap.to(".progress", { scaleX: 1, ease: "none", scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 0 } });

  /* ---------- generic reveal: content enters in reading order ---------- */
  ScrollTrigger.batch(qa("[data-rise]"), { start: "top 90%", once: true, onEnter: function (els) { els.forEach(function (el, i) { el.style.setProperty("--rd", (i * 0.09) + "s"); el.classList.add("vis"); }); } });

  /* ---------- 1. THE PORTFOLIO I DELETED
       Story job: show the old generic intro, select it, delete it, then type the truth. Scroll drives every beat. ---------- */
  var mock = q(".mock");
  if (mock) {
    var ink = function () { mock.classList.add("inked"); };
    (document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise(function (r) { setTimeout(r, 1200); })]) : Promise.resolve()).then(function () { setTimeout(ink, 250); });

    var h1 = q("[data-type]"), chars = [];
    (function split(node) {
      [].slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var f = document.createDocumentFragment();
          for (var i = 0; i < n.textContent.length; i++) { var s = document.createElement("span"); s.className = "c"; s.textContent = n.textContent[i]; s.setAttribute("aria-hidden", "true"); f.appendChild(s); chars.push(s); }
          n.parentNode.replaceChild(f, n);
        } else if (n.nodeType === 1) split(n);
      });
    })(h1);
    h1.setAttribute("aria-label", "So I deleted everything that was showing my work, instead of how I work.");

    var strike = q(".strike", h1), hlw = q(".hlw", h1);
    gsap.set(chars, { opacity: 0 });
    gsap.set(strike, { "--strike": 0 });
    gsap.set(hlw, { "--hp": "0%" });
    gsap.set(".see", { y: 16 });
    var tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: ".opening", start: "top top", end: "bottom bottom", scrub: 0.7 } });
    tl.to(".sel", { opacity: 1, duration: 1 }, 0.4)                                            /* select it, like in a design tool */
      .fromTo(".keycap", { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }, 1.5)
      .to(".keycap", { y: 5, scale: 0.94, duration: 0.25 }, 2.3)                                /* press Delete */
      .to(mock, { rotation: -10, scale: 0.78, y: "72vh", opacity: 0, duration: 1.5, ease: "power2.in" }, 2.6)
      .to(".keycap", { opacity: 0, duration: 0.3 }, 2.7)
      .to(".bgname", { x: "-7vw", duration: 10 }, 0)                                            /* depth: background name drifts */
      .to(".stage .blob-l", { x: "-6vw", y: "8vh", duration: 8 }, 1)
      .to(".stage .blob-o", { x: "-5vw", y: "-6vh", duration: 8 }, 1)
      .to(".stage .star", { x: "-4vw", y: "10vh", duration: 8 }, 1)
      .to(".stage .squig", { x: "5vw", y: "-4vh", duration: 8 }, 1)
      .to(".who", { opacity: 1, duration: 0.5 }, 3.9)
      .to(chars, { opacity: 1, duration: 0.02, stagger: 0.043 }, 4.2)                           /* type the new statement */
      .fromTo(".note.why", { scale: 0.2, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2)" }, 6.2)
      .to(strike, { "--strike": 1, duration: 0.7 }, 7.5)                                        /* strike "work" like the red pen did */
      .to(hlw, { "--hp": "100%", duration: 0.8 }, 8.1)                                          /* highlight "how I work" */
      .fromTo(".note.plan-n", { scale: 0.2, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2)" }, 8.6)
      .to(".see", { opacity: 1, y: 0, duration: 0.5 }, 9)
      .to(".handnote", { opacity: 1, duration: 0.5 }, 9.3)
      .to({}, { duration: 0.4 }, 9.7);
  }

  /* ---------- 2. ABOUT ---------- */
  var why = q(".why b");
  if (why) { gsap.set(why, { "--hp": "0%" }); gsap.to(why, { "--hp": "100%", duration: 0.9, ease: "power2.inOut", scrollTrigger: { trigger: why, start: "top 78%", once: true } }); }
  var doodlePaths = qa(".d-rays path, .d-branch > path, .d-arc path");
  gsap.set(doodlePaths, { strokeDasharray: 1, strokeDashoffset: 1 });
  gsap.set(".d-branch .leaf", { opacity: 0 });
  if (q(".portrait")) {
    var dtl = gsap.timeline({ scrollTrigger: { trigger: ".portrait", start: "top 65%", once: true } });
    dtl.to(".d-rays path", { strokeDashoffset: 0, duration: 0.6, stagger: 0.15, ease: "power2.out" })
       .to(".d-branch > path", { strokeDashoffset: 0, duration: 1, ease: "power2.inOut" }, 0.2)
       .to(".d-branch .leaf", { opacity: 0.92, duration: 0.4, stagger: 0.12 }, 0.7)
       .to(".d-arc path", { strokeDashoffset: 0, duration: 1.2, ease: "power2.inOut" }, 0.4);
    gsap.to(".frame", { yPercent: -5, ease: "none", scrollTrigger: { trigger: ".portrait", start: "top bottom", end: "bottom top", scrub: true } });
  }
  var steps = q("[data-steps]");
  if (steps) {
    var items = qa(".step", steps);
    ScrollTrigger.create({ trigger: steps, start: "top 82%", end: "bottom 58%", scrub: true, onUpdate: function (self) {
      steps.style.setProperty("--sp", self.progress.toFixed(3));
      items.forEach(function (it, i) { it.classList.toggle("on", self.progress >= i / (items.length - 1) - 0.02); });
    } });
  }
  /* floating shapes: different speeds so chapters have depth */
  qa(".ch .fl").forEach(function (el) {
    if (el.closest(".stage")) return;
    var sp = el.classList.contains("blob") || /blob/.test((el.getAttribute("style") || "")) ? 90 : 50;
    gsap.to(el, { y: -sp, ease: "none", scrollTrigger: { trigger: el.closest(".ch"), start: "top bottom", end: "bottom top", scrub: 0.8 } });
  });

  /* ---------- 3. THE PROBLEMS: sticky stack. Story job: each wrong assumption gets its own board, the previous one recedes ---------- */
  var und = q("[data-underline] path");
  if (und) { gsap.set(und, { strokeDasharray: 1, strokeDashoffset: 1 }); gsap.to(und, { strokeDashoffset: 0, duration: 0.9, ease: "power2.inOut", scrollTrigger: { trigger: und, start: "top 88%", once: true } }); }
  qa(".scene").forEach(function (scene) { ScrollTrigger.create({ trigger: scene, start: "top 55%", once: true, onEnter: function () { scene.classList.add("in"); } }); });
  gsap.matchMedia().add("(min-width: 901px)", function () {
    var scenes = qa(".scene");
    scenes.forEach(function (sc, i) {
      if (i === scenes.length - 1) return;
      gsap.to(sc, { scale: 0.93, opacity: 0.55, ease: "none", scrollTrigger: { trigger: scenes[i + 1], start: "top bottom", end: "top top", scrub: true } });
    });
  });

  /* ---------- 5. THINGS I WAS WRONG ABOUT: each belief is struck as you reach it, then the truth lands ---------- */
  qa(".wrow").forEach(function (row) {
    gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: row, start: "top 78%", end: "top 30%", scrub: 0.6 } })
      .to(row, { "--sk": "100%", duration: 1 })
      .to(row, { "--so": 1, duration: 1 }, 0.6)
      .to(row, { "--no": 1, "--ny": "0px", duration: 1 }, 1.3)
      .to(row, { "--hp": "100%", duration: 1 }, 2);
  });

  /* ---------- 6. CONTACT: the big question mark turns slowly, like a question that stays open ---------- */
  gsap.to(".ch-contact .fl.q", { rotation: 14, ease: "none", scrollTrigger: { trigger: ".ch-contact", start: "top bottom", end: "bottom bottom", scrub: 1 } });

  /* late assets shift layout: recalc every trigger once everything has loaded */
  addEventListener("load", function () { ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
})();
