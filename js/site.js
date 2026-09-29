/* Vedanshi Singh portfolio v9 - "Questions, not answers".
   Merged from two earlier drafts:
   - "new updated": question particle field, work-card demos, ask console, beliefs diff
   - "New": plan-to-product morph, cursor torch, "where the value moved" checklist
   Every effect renders a finished still state under reduced motion or without GSAP (html.static).
   Review switches: ?static (no animation), ?nolenis (native scroll). */
(function () {
  "use strict";
  var doc = document.documentElement;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches || /[?&]static/.test(location.search);
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  var canAnimate = !reduced && hasGsap;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var q = function (s, c) { return (c || document).querySelector(s); };
  var qa = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var lenis = null;

  if (canAnimate) { doc.classList.add("js-motion"); gsap.registerPlugin(ScrollTrigger); } else doc.classList.add("static");

  function onceVisible(el, cb, t) {
    if (!el) return;
    if (!("IntersectionObserver" in window)) { cb(); return; }
    var io = new IntersectionObserver(function (e) { if (e[0].isIntersecting) { io.disconnect(); cb(); } }, { threshold: t || 0.4 });
    io.observe(el);
  }

  /* ---------- theme ---------- */
  var themeBtn = q("[data-theme-toggle]");
  if (themeBtn) themeBtn.addEventListener("click", function () {
    var next = doc.getAttribute("data-theme") === "light" ? "dark" : "light";
    doc.setAttribute("data-theme", next);
    try { localStorage.setItem("vsTheme8", next); } catch (e) {}
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
      if (lenis) lenis.scrollTo(id === "#main" || id === "#hero" ? 0 : t, { offset: id === "#work" || id === "#intro" ? -30 : 0, duration: 1.4 });
      else t.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    });
  });

  /* ---------- torch: one soft light that follows the pointer over the whole page ---------- */
  (function () {
    var t = q("#torchG"); if (!t || !fine) return;
    var on = false;
    addEventListener("pointermove", function (e) { t.style.setProperty("--gx", e.clientX + "px"); t.style.setProperty("--gy", e.clientY + "px"); if (!on) { on = true; t.classList.add("on"); } }, { passive: true });
    document.addEventListener("pointerleave", function () { on = false; t.classList.remove("on"); });
  })();
  /* ---------- copy email + toast ---------- */
  var toast = q(".toast");
  function say(msg) { if (!toast) return; toast.textContent = msg; toast.classList.add("show"); clearTimeout(say.t); say.t = setTimeout(function () { toast.classList.remove("show"); }, 1900); }
  qa("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function () {
      function ok() { b.classList.add("is-copied"); say("Email copied. Talk soon."); setTimeout(function () { b.classList.remove("is-copied"); }, 1800); }
      function fallback() { say("Copy blocked. The address is vedanshis50@gmail.com"); }
      try { navigator.clipboard.writeText(b.getAttribute("data-copy")).then(ok, fallback); } catch (e) { fallback(); }
    });
  });

  /* =====================================================================
     1. HERO: particles that keep re-forming into questions.
        Pointer job: it is a torch (dots near it light up amber) and it scatters them, so the
        field feels responsive to the person looking at it.
     ===================================================================== */
  (function questionField() {
    var canvas = q("#qField"), hero = q("#hero"), art = hero;
    if (!canvas || !art || !hero || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var WORDS = ["Why?", "What if?", "So what?", "So who?"];
    var W, H, dpr, targets = [], parts = [], wordIdx = 0, running = false, raf, lastSwap = 0, rgb = "46,52,36", acc = "111,125,79";
    var mouse = { x: -9999, y: -9999 }, TORCH = 190, textY = 0;

    function hexToRgb(h) { h = h.trim().replace("#", ""); if (h.length === 3) h = h.replace(/(.)/g, "$1$1"); var n = parseInt(h, 16); return isNaN(n) ? "111,125,79" : ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255); }
    function readColors() { var cs = getComputedStyle(doc); rgb = cs.getPropertyValue("--p-rgb").trim() || rgb; acc = hexToRgb(cs.getPropertyValue("--accent")); }
    function sample(word) {
      var narrow = W < 760, off = document.createElement("canvas"); off.width = W; off.height = H;
      var o = off.getContext("2d"), areaW = narrow ? W * 0.9 : W * 0.42, size = Math.min(narrow ? H * 0.16 : H * 0.34, 380);
      var font = function (s) { return "700 " + s + "px 'Familjen Grotesk', 'Hanken Grotesk', system-ui, sans-serif"; };
      o.font = font(size);
      while (o.measureText(word).width > areaW && size > 30) { size -= 4; o.font = font(size); }
      o.fillStyle = "#fff"; o.textBaseline = "middle"; o.textAlign = "center";
      o.fillText(word, narrow ? W / 2 : W * 0.735, narrow ? H * 0.16 : textY);
      var data = o.getImageData(0, 0, W, H).data, pts = [], gap = narrow ? 6 : 7;
      for (var y = 0; y < H; y += gap) for (var x = 0; x < W; x += gap) if (data[(y * W + x) * 4 + 3] > 128) pts.push([x, y]);
      for (var i = pts.length - 1; i > 0; i--) { var j = (Math.random() * (i + 1)) | 0, t = pts[i]; pts[i] = pts[j]; pts[j] = t; }
      return pts;
    }    function build() {
      var r = art.getBoundingClientRect(); dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.round(r.width); H = Math.round(r.height);
      if (W < 40 || H < 40) return false;
      canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var h1 = q("h1", hero);
      textY = h1 ? (h1.getBoundingClientRect().top - r.top + h1.offsetHeight / 2) : H * 0.3;
      targets = WORDS.map(sample);
      var n = Math.min(Math.max.apply(null, targets.map(function (t) { return t.length; })), 1700) + (W < 760 ? 160 : 340), old = parts; parts = [];
      for (var i = 0; i < n; i++) { var p = old[i] || { x: Math.random() * W, y: Math.random() * H, vx: 0, vy: 0 }; p.amber = Math.random() < 0.14; parts.push(p); }
      assign(wordIdx);
      return true;
    }
    function assign(k) { var t = targets[k]; parts.forEach(function (p, i) { if (i < t.length) { p.tx = t[i][0]; p.ty = t[i][1]; p.free = false; } else { p.tx = Math.random() * W; p.ty = Math.random() * H; p.free = true; } }); }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var lit = mouse.x > -999;
      if (lit) { var g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, TORCH * 1.5); g.addColorStop(0, "rgba(" + acc + ",0.1)"); g.addColorStop(1, "rgba(" + acc + ",0)"); ctx.fillStyle = g; ctx.fillRect(mouse.x - TORCH * 1.5, mouse.y - TORCH * 1.5, TORCH * 3, TORCH * 3); }
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i], s = p.free ? 2.4 : 3.6, a = p.free ? 0.3 : 0.6, c = rgb;
        if (p.amber) { c = acc; a = 0.95; }
        if (lit) { var dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.sqrt(dx * dx + dy * dy); if (d < TORCH) { var k = 1 - d / TORCH; c = acc; a = Math.max(a, 0.25 + 0.75 * k); s += k * 2.2; } }
        ctx.fillStyle = "rgba(" + c + "," + a.toFixed(2) + ")"; ctx.fillRect(p.x, p.y, s, s);
      }
    }
    function step(now) {
      if (now - lastSwap > 3800) { lastSwap = now; wordIdx = (wordIdx + 1) % WORDS.length; assign(wordIdx); }
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i], ax = (p.tx - p.x) * (p.free ? 0.002 : 0.022), ay = (p.ty - p.y) * (p.free ? 0.002 : 0.022);
        var dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < 16000) { var f = (16000 - d2) / 16000 * 3.6, d = Math.sqrt(d2) || 1; ax += dx / d * f; ay += dy / d * f; }
        p.vx = (p.vx + ax) * 0.84; p.vy = (p.vy + ay) * 0.84; p.x += p.vx; p.y += p.vy;
      }
      draw(); if (running) raf = requestAnimationFrame(step);
    }
    function start() { if (running || reduced) return; running = true; raf = requestAnimationFrame(step); }
    function stop() { running = false; cancelAnimationFrame(raf); }
    function still() { parts.forEach(function (p) { p.x = p.tx; p.y = p.ty; }); draw(); }
    function init() { readColors(); if (!build()) return false; if (reduced) { still(); return true; } lastSwap = performance.now(); start(); return true; }
    var done = false, go = function () { if (!done && init()) done = true; };
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(go); setTimeout(go, 900); } else go();
    if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { if (e[0].isIntersecting) start(); else stop(); }).observe(hero);
    var rt, onSize = function () { clearTimeout(rt); rt = setTimeout(function () { if (!done) { go(); return; } build(); if (reduced) still(); }, 150); };
    addEventListener("resize", onSize);
    if ("ResizeObserver" in window) new ResizeObserver(onSize).observe(art);
    document.addEventListener("vs-theme", function () { readColors(); if (!running) draw(); });
    if (fine) {
      hero.addEventListener("pointermove", function (e) { var r = art.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
      hero.addEventListener("pointerleave", function () { mouse.x = mouse.y = -9999; });
    }
  })();

  /* ---------- reveal on scroll ---------- */
  if (canAnimate) ScrollTrigger.batch(qa(".reveal"), { start: "top 90%", once: true, onEnter: function (els) { els.forEach(function (el, i) { el.style.setProperty("--d", (i * 0.09) + "s"); el.classList.add("vis"); }); } });
  if (canAnimate) ScrollTrigger.batch(qa(".more-reveal"), { start: "top 88%", once: true, onEnter: function (els) { els.forEach(function (el, i) { el.style.setProperty("--d", (i * 0.16) + "s"); el.classList.add("vis"); }); } });

  /* =====================================================================
     2. ABOUT: the sticky note ticks itself off, the photo flips to childhood (if that photo exists),
        the nav underlines where you are.
     ===================================================================== */
  (function () {
    var items = qa("#planList li");
    if (!canAnimate) items.forEach(function (li) { li.classList.add("is-done"); });
    else onceVisible(q("#planList"), function () { items.forEach(function (li, i) { setTimeout(function () { li.classList.add("is-done"); }, 350 + i * 260); }); }, 0.5);

    var photo = q("#photo"), then = photo && q(".p-then", photo), btn = photo && q(".p-flip", photo), hint = photo && q(".p-hint", photo);
    if (then && btn) {
      var probe = new Image();
      probe.onload = function () {
        then.src = probe.src; then.hidden = false; btn.hidden = false; if (hint) hint.hidden = false;
        var setThen = function (on) { photo.classList.toggle("is-then", on); btn.setAttribute("aria-pressed", on ? "true" : "false"); q("span", btn).textContent = on ? "Now" : "Then"; };
        btn.addEventListener("click", function () { setThen(!photo.classList.contains("is-then")); });
        if (fine) {
          var fr = q(".p-card", photo);
          fr.addEventListener("pointermove", function (e) {
            var r = fr.getBoundingClientRect();
            fr.style.setProperty("--mx", (e.clientX - r.left) + "px");
            fr.style.setProperty("--my", (e.clientY - r.top) + "px");
          });
          fr.addEventListener("pointerleave", function () { fr.style.setProperty("--mx", "-300px"); fr.style.setProperty("--my", "-300px"); });
        }
      };
      probe.src = "assets/photos/childhood.jpg";
    }

    var links = qa("[data-spy]"), targets = links.map(function (a) { return q("#" + a.getAttribute("data-spy")); });
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (!en.isIntersecting) return; var id = en.target.id; links.forEach(function (a) { a.setAttribute("aria-current", a.getAttribute("data-spy") === id ? "true" : "false"); }); });
      }, { rootMargin: "-45% 0px -50% 0px" });
      targets.forEach(function (t) { if (t) io.observe(t); });
    }
  })();

  /* =====================================================================
     3. WORK: sticky stack. Each card stacks over the last; the demo is the point of the card.
     ===================================================================== */
  if (canAnimate && window.matchMedia("(min-width: 961px)").matches) {
    var cards = gsap.utils.toArray(".stack-card");
    cards.forEach(function (card, i) { card.style.zIndex = i + 1; });
    cards.forEach(function (card, i) {
      if (i === cards.length - 1) return;
      ScrollTrigger.create({ trigger: card, start: "top top", endTrigger: cards[cards.length - 1], end: "top top", pin: true, pinSpacing: false });
      gsap.to(card, { scale: 0.92, opacity: 0, ease: "none", scrollTrigger: { trigger: cards[i + 1], start: "top bottom", end: "top top", scrub: true } });
    });
  }

  /* Demo A: a three-chapter story — the old primary/secondary model, the new configuration,
     then the real screen it became. Autoplays once, in view; a click or a tap takes over. */
  (function () {
    var root = q("#demoLeads"); if (!root) return;
    var ORDER = ["problem", "fix", "screen"];
    var DUR = { problem: 2400, fix: 9200, screen: 4200 };
    var btn = q("[data-run]", root), tabs = qa(".demo-tabs button", root), panes = qa(".pane", root);
    var segs = qa(".demo-progress span", root);
    var prob = q("#prob", root), probRules = qa(".prob-rules li", root);
    var fixFrames = qa(".fix-frame", root), rotToggle = q("#rotToggle", root);
    var lanes = qa(".lane", root), simOut = q(".sim-out", root), pct = [0.5, 0.3, 0.2];
    var current = "problem", autoplay = true, hovered = false, waiting = null;
    var timers = [];
    function at(ms, fn) { var id = setTimeout(fn, ms); timers.push(id); return id; }
    function clearTimers() { timers.forEach(clearTimeout); timers = []; }

    function setSeg(name, state) {
      segs.forEach(function (s) {
        if (s.getAttribute("data-seg") !== name) return;
        s.classList.remove("is-active", "is-done", "is-paused");
        var i = q("i", s); i.style.animation = "none"; i.offsetHeight;
        if (state === "done") { s.classList.add("is-done"); }
        else if (state === "active") { s.classList.add("is-active"); i.style.animation = "segFill " + DUR[name] + "ms linear forwards"; }
        else { i.style.animation = "none"; i.style.width = "0%"; }
      });
    }
    function markSegsFor(name) {
      var idx = ORDER.indexOf(name);
      ORDER.forEach(function (n, i) { setSeg(n, i < idx ? "done" : (i === idx ? "active" : "idle")); });
    }

    function whenFree(fn) {
      if (!hovered) { fn(); return; }
      waiting = fn;
    }
    root.addEventListener("pointerenter", function () { hovered = true; segs.forEach(function (s) { s.classList.add("is-paused"); }); });
    root.addEventListener("pointerleave", function () {
      hovered = false; segs.forEach(function (s) { s.classList.remove("is-paused"); });
      if (waiting) { var fn = waiting; waiting = null; fn(); }
    });

    function showPane(name, forAutoplay) {
      current = name; if (!forAutoplay) autoplay = false;
      tabs.forEach(function (t) { t.setAttribute("aria-selected", t.getAttribute("data-pane") === name ? "true" : "false"); });
      panes.forEach(function (p) { p.hidden = p.getAttribute("data-pane") !== name; });
    }

    function runProblem(instant) {
      probRules.forEach(function (li) { li.classList.remove("is-on"); });
      if (instant || reduced) { probRules.forEach(function (li) { li.classList.add("is-on"); }); if (autoplay) advance("fix"); return; }
      markSegsFor("problem");
      probRules.forEach(function (li, i) { at(400 + i * 550, function () { li.classList.add("is-on"); }); });
      at(DUR.problem, function () { whenFree(function () { if (autoplay) advance("fix"); }); });
    }

    function runFix(instant) {
      fixFrames.forEach(function (f) { f.hidden = true; });
      rotToggle.classList.remove("is-on"); q("b", rotToggle).textContent = "Disabled";
      lanes.forEach(function (l) { q(".lane-slots", l).innerHTML = ""; q(".lane-count", l).textContent = "0"; });
      simOut.innerHTML = "&nbsp;";
      if (instant || reduced) { fixFrames.forEach(function (f) { f.hidden = false; }); rotToggle.classList.add("is-on"); q("b", rotToggle).textContent = "Enabled"; runSim(true, function () { if (autoplay) advance("screen"); }); return; }
      markSegsFor("fix");
      var FRAME_MS = [1500, 1700, 1500, 1500];
      var i = 0;
      function nextFrame() {
        if (i > 0) fixFrames[i - 1].hidden = true;
        if (i >= fixFrames.length) return;
        fixFrames[i].hidden = false;
        if (i === 2) at(140, function () { rotToggle.classList.add("is-on"); q("b", rotToggle).textContent = "Enabled"; });
        if (i === fixFrames.length - 1) { runSim(false, function () { whenFree(function () { if (autoplay) advance("screen"); }); }); return; }
        at(FRAME_MS[i], function () { i++; nextFrame(); });
      }
      nextFrame();
    }

    function runSim(instant, done) {
      var actual = [0, 0, 0], total = 0;
      (function next() {
        total++;
        var best = 0, bestD = -Infinity;
        for (var i = 0; i < 3; i++) { var d = pct[i] * total - actual[i]; if (d > bestD + 1e-9 || (Math.abs(d - bestD) <= 1e-9 && actual[i] < actual[best])) { bestD = d; best = i; } }
        actual[best]++;
        var chip = document.createElement("span"); chip.className = "lead-chip"; chip.textContent = total;
        q(".lane-slots", lanes[best]).appendChild(chip); q(".lane-count", lanes[best]).textContent = actual[best];
        simOut.textContent = "Lead " + total + " → Agent " + "ABC"[best];
        if (total < 10) at(instant ? 0 : 260, next);
        else { simOut.textContent = "Final split: 5 / 3 / 2 — exactly 50 / 30 / 20."; if (done) at(instant ? 0 : 800, done); }
      })();
    }

    function runScreen() {
      if (reduced) return;
      markSegsFor("screen");
      at(DUR.screen, function () { /* last chapter: pause here */ });
    }

    function advance(name) { clearTimers(); showPane(name, true); play(false); }
    function play(instant) {
      clearTimers();
      if (current === "problem") runProblem(instant);
      else if (current === "fix") runFix(instant);
      else runScreen();
    }
    function replay() { autoplay = true; showPane("problem", true); play(reduced); }

    tabs.forEach(function (t) {
      t.addEventListener("click", function () {
        clearTimers();
        showPane(t.getAttribute("data-pane"), false);
        play(reduced);
      });
    });
    btn.addEventListener("click", replay);
    if (reduced) { showPane("problem", true); runProblem(true); } else onceVisible(root, function () { replay(); }, 0.6);
  })();
  /* Demo B: run the meeting (the strongest idea is not the one that wins) */
  (function () {
    var root = q("#demoMeeting"); if (!root) return;
    var btn = q("[data-run]", root), out = q(".demo-out", root), items = qa(".ideas li", root), LOUD = { A: 0.35, B: 1, C: 0.2, D: 0.45 };
    items.forEach(function (li) { var m = +li.getAttribute("data-merit"), box = q(".merit", li); for (var i = 0; i < 5; i++) { var d = document.createElement("i"); if (i < m) d.className = "on"; box.appendChild(d); } });
    function reset() { items.forEach(function (li) { li.classList.remove("is-out", "is-win"); q(".voice", li).style.setProperty("--v", 0); }); }
    function finish() {
      items.forEach(function (li) { var id = li.getAttribute("data-idea"); q(".voice", li).style.setProperty("--v", LOUD[id]); li.classList.toggle("is-win", id === "B"); li.classList.toggle("is-out", id !== "B"); });
      out.textContent = "Idea B survived. It had the weakest case and the loudest backer."; btn.disabled = false; btn.textContent = "Run it again";
    }
    function run(instant) {
      reset(); btn.disabled = true; if (instant) return finish();
      out.textContent = "Everyone talks. The bar shows who's loudest.";
      items.forEach(function (li, i) { setTimeout(function () { q(".voice", li).style.setProperty("--v", LOUD[li.getAttribute("data-idea")]); }, 300 + i * 250); });
      setTimeout(function () { out.textContent = "Time's up. The room decides."; }, 1700); setTimeout(finish, 2600);
    }
    btn.addEventListener("click", function () { run(reduced); });
    if (reduced) run(true); else onceVisible(root, function () { run(false); }, 0.6);
  })();

  /* Demo C: can I afford this? (the maths says yes, the feeling says otherwise) */
  (function () {
    var range = q("#priceRange"); if (!range) return;
    var outP = q("#priceOut"), math = q("#mathSays"), feel = q("#feelSays"), needle = q("#feelNeedle"), SPARE = 60000;
    var fmt = function (n) { return "₹" + n.toLocaleString("en-IN"); };
    function update() {
      var p = +range.value, left = SPARE - p, r = p / SPARE, angle, label;
      outP.textContent = fmt(p); math.textContent = left >= 0 ? "Yes. You'd still have " + fmt(left) + " left this month." : "No.";
      if (r < 0.12) { angle = 55; label = "Feels fine."; } else if (r < 0.5) { angle = -5 + (Math.random() * 16 - 8); label = "Not sure."; } else { angle = -60; label = "Feels risky."; }
      needle.style.setProperty("--a", angle + "deg"); feel.textContent = label;
    }
    range.addEventListener("input", update); update();
  })();

  /* =====================================================================
     6. ASK THE TOOLS: three real screenshots; tap one to read it larger
     ===================================================================== */
  (function () {
    var box = q("#lightbox"); if (!box || !box.showModal) return;
    var im = q("img", box), last = null;
    qa(".phone").forEach(function (b) {
      b.addEventListener("click", function () {
        last = b; im.src = b.getAttribute("data-full"); im.alt = q("img", b).alt;
        box.showModal();
      });
    });
    box.addEventListener("click", function () { box.close(); });
    box.addEventListener("close", function () { if (last) last.focus(); });
  })();
  /* ---------- feedback tabs: people / AI tools. With no recommendations added, only the AI screenshots show. ---------- */
  (function () {
    var sec = q("#ask"), bar = q(".ask-tabs"), people = q("#voices"), ai = q("#aiPanel");
    if (!sec || !bar || !people || !ai) return;
    if (!qa(".quote-card", people).length) return;
    var tabs = qa("button", bar), panels = { people: people, ai: ai };
    bar.hidden = false;
    function pick(name, focus) {
      tabs.forEach(function (t) { var on = t.getAttribute("data-tab") === name; t.setAttribute("aria-selected", on ? "true" : "false"); t.tabIndex = on ? 0 : -1; if (on && focus) t.focus(); });
      Object.keys(panels).forEach(function (k) { panels[k].hidden = k !== name; });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { pick(t.getAttribute("data-tab")); });
      t.addEventListener("keydown", function (e) { var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0; if (!d) return; e.preventDefault(); pick(tabs[(i + d + tabs.length) % tabs.length].getAttribute("data-tab"), true); });
    });
    pick("ai");
  })();
  /* ---------- quote row: clone the cards once so the drift loops without a jump ---------- */
  (function () {
    var t = q(".quote-track"); if (!t) return;
    qa("li", t).forEach(function (li) { var c = li.cloneNode(true); c.setAttribute("aria-hidden", "true"); qa("a", c).forEach(function (a) { a.tabIndex = -1; }); t.appendChild(c); });
  })();

  /* ---------- gallery: clone each track so the drift loops without a jump; draw doodles when they scroll in ---------- */
  (function () {
    qa(".gal-track").forEach(function (t) { qa("li", t).forEach(function (li) { var c = li.cloneNode(true); c.setAttribute("aria-hidden", "true"); qa("img", c).forEach(function (im) { im.alt = ""; }); t.appendChild(c); }); });
    var ds = qa(".doodle");
    if (!("IntersectionObserver" in window) || reduced) { ds.forEach(function (d) { d.classList.add("is-drawn"); }); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-drawn"); io.unobserve(e.target); } }); }, { threshold: 0.6 });
    ds.forEach(function (d) { io.observe(d); });
  })();

  /* ---------- footer statement: letters lift under the pointer ---------- */
  (function () {
    var fs = q("#footStatement"); if (!fs || !fine || reduced) return;
    var text = fs.textContent; fs.textContent = "";
    var sr = document.createElement("span"); sr.className = "vh"; sr.textContent = text; fs.appendChild(sr);
    text.split("").forEach(function (ch) { var s = document.createElement("span"); s.setAttribute("aria-hidden", "true"); s.textContent = ch === " " ? " " : ch; s.addEventListener("pointerenter", function () { s.style.transform = "translateY(-0.12em)"; s.style.color = "var(--accent)"; setTimeout(function () { s.style.transform = ""; s.style.color = ""; }, 380); }); fs.appendChild(s); });
  })();

  if (canAnimate) { addEventListener("load", function () { ScrollTrigger.refresh(); }); if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); }); }
})();