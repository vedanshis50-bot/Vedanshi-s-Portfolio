/* Vedanshi Singh portfolio v7 - "Questions, not answers".
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
      if (lenis) lenis.scrollTo(id === "#main" || id === "#hero" ? 0 : t, { offset: id === "#work" || id === "#intro" ? -30 : 0, duration: 1.4 });
      else t.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    });
  });

  /* ---------- torch: a soft light that follows the pointer inside marked sections ---------- */
  qa("[data-torch]").forEach(function (sec) {
    var torch = q(".torch", sec); if (!torch || !fine) return;
    sec.addEventListener("pointerenter", function () { sec.classList.add("is-lit"); });
    sec.addEventListener("pointerleave", function () { sec.classList.remove("is-lit"); });
    sec.addEventListener("pointermove", function (e) {
      var r = sec.getBoundingClientRect();
      torch.style.setProperty("--tx", (e.clientX - r.left) + "px");
      torch.style.setProperty("--ty", (e.clientY - r.top) + "px");
    });
  });

  /* ---------- copy email + toast ---------- */
  var toast = q(".toast");
  function say(msg) { if (!toast) return; toast.textContent = msg; toast.classList.add("show"); clearTimeout(say.t); say.t = setTimeout(function () { toast.classList.remove("show"); }, 1900); }
  qa("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function () {
      function ok() { b.textContent = "Copied"; say("Email copied. Talk soon."); setTimeout(function () { b.textContent = "Copy email"; }, 1800); }
      function fallback() { var el = q("[data-copy-target]"); if (el) { var r = document.createRange(); r.selectNodeContents(el); var s = getSelection(); s.removeAllRanges(); s.addRange(r); } say("Selected. Press Ctrl+C or Cmd+C"); }
      try { navigator.clipboard.writeText(b.getAttribute("data-copy")).then(ok, fallback); } catch (e) { fallback(); }
    });
  });

  /* =====================================================================
     1. HERO: particles that keep re-forming into questions.
        Pointer job: it is a torch (dots near it light up amber) and it scatters them, so the
        field feels responsive to the person looking at it.
     ===================================================================== */
  (function questionField() {
    var canvas = q("#qField"), hero = q("#hero");
    if (!canvas || !hero || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var WORDS = ["Why?", "What if?", "So what?", "For whom?"];
    var W, H, dpr, targets = [], parts = [], wordIdx = 0, running = false, raf, lastSwap = 0, rgb = "236,232,221", acc = "242,184,75";
    var mouse = { x: -9999, y: -9999 }, TORCH = 190;

    function hexToRgb(h) { h = h.trim().replace("#", ""); if (h.length === 3) h = h.replace(/(.)/g, "$1$1"); var n = parseInt(h, 16); return isNaN(n) ? "242,184,75" : ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255); }
    function readColors() { var cs = getComputedStyle(doc); rgb = cs.getPropertyValue("--p-rgb").trim() || rgb; acc = hexToRgb(cs.getPropertyValue("--accent")); }
    function sample(word) {
      var narrow = W < 760, off = document.createElement("canvas"); off.width = W; off.height = H;
      var o = off.getContext("2d"), areaW = narrow ? W * 0.92 : W * 0.56, size = Math.min(narrow ? H * 0.2 : H * 0.34, 400);
      var font = function (s) { return "700 " + s + "px 'Familjen Grotesk', 'Hanken Grotesk', system-ui, sans-serif"; };
      o.font = font(size);
      while (o.measureText(word).width > areaW && size > 30) { size -= 4; o.font = font(size); }
      o.fillStyle = "#fff"; o.textBaseline = "middle"; o.textAlign = "center";
      o.fillText(word, narrow ? W / 2 : W * 0.66, narrow ? H * 0.2 : H * 0.36);
      var data = o.getImageData(0, 0, W, H).data, pts = [], gap = narrow ? 5 : 6;
      for (var y = 0; y < H; y += gap) for (var x = 0; x < W; x += gap) if (data[(y * W + x) * 4 + 3] > 128) pts.push([x, y]);
      for (var i = pts.length - 1; i > 0; i--) { var j = (Math.random() * (i + 1)) | 0, t = pts[i]; pts[i] = pts[j]; pts[j] = t; }
      return pts;
    }
    function build() {
      var r = hero.getBoundingClientRect(); dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.round(r.width); H = Math.round(r.height);
      if (W < 40 || H < 40) return false;
      canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      targets = WORDS.map(sample);
      var n = Math.min(Math.max.apply(null, targets.map(function (t) { return t.length; })), W < 760 ? 1400 : 2600), old = parts; parts = [];
      for (var i = 0; i < n; i++) { var p = old[i] || { x: Math.random() * W, y: Math.random() * H, vx: 0, vy: 0 }; p.amber = Math.random() < 0.14; parts.push(p); }
      assign(wordIdx);
      return true;
    }
    function assign(k) { var t = targets[k]; parts.forEach(function (p, i) { if (i < t.length) { p.tx = t[i][0]; p.ty = t[i][1]; p.free = false; } else { p.tx = Math.random() * W; p.ty = Math.random() * H; p.free = true; } }); }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var lit = mouse.x > -999;
      if (lit) { var g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, TORCH * 1.5); g.addColorStop(0, "rgba(" + acc + ",0.16)"); g.addColorStop(1, "rgba(" + acc + ",0)"); ctx.fillStyle = g; ctx.fillRect(mouse.x - TORCH * 1.5, mouse.y - TORCH * 1.5, TORCH * 3, TORCH * 3); }
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i], s = p.free ? 1.2 : 1.8, a = p.free ? 0.12 : 0.5, c = rgb;
        if (p.amber) { c = acc; a = 0.9; }
        if (lit) { var dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.sqrt(dx * dx + dy * dy); if (d < TORCH) { var k = 1 - d / TORCH; c = acc; a = Math.max(a, 0.2 + 0.8 * k); s += k * 1.4; } }
        ctx.fillStyle = "rgba(" + c + "," + a.toFixed(2) + ")"; ctx.fillRect(p.x, p.y, s, s);
      }
    }
    function step(now) {
      if (now - lastSwap > 3800) { lastSwap = now; wordIdx = (wordIdx + 1) % WORDS.length; assign(wordIdx); }
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i], ax = (p.tx - p.x) * (p.free ? 0.002 : 0.022), ay = (p.ty - p.y) * (p.free ? 0.002 : 0.022);
        var dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < 11000) { var f = (11000 - d2) / 11000 * 3.2, d = Math.sqrt(d2) || 1; ax += dx / d * f; ay += dy / d * f; }
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
    if ("ResizeObserver" in window) new ResizeObserver(onSize).observe(hero);
    document.addEventListener("vs-theme", function () { readColors(); if (!running) draw(); });
    if (fine) {
      hero.addEventListener("pointermove", function (e) { var r = hero.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
      hero.addEventListener("pointerleave", function () { mouse.x = mouse.y = -9999; });
    }
  })();

  /* ---------- reveal on scroll ---------- */
  if (canAnimate) ScrollTrigger.batch(qa(".reveal"), { start: "top 90%", once: true, onEnter: function (els) { els.forEach(function (el, i) { el.style.setProperty("--d", (i * 0.09) + "s"); el.classList.add("vis"); }); } });
  if (canAnimate) gsap.to("#progressBar", { scaleX: 1, ease: "none", scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 0 } });

  /* =====================================================================
     2. INTRO: the photo opens like a lens; the path draws as you scroll (progress = where I am in a project)
     ===================================================================== */
  var lens = q("#lens");
  if (lens && canAnimate) { gsap.set(lens, { "--r": "14%" }); gsap.to(lens, { "--r": "60%", ease: "none", scrollTrigger: { trigger: lens, start: "top 92%", end: "top 30%", scrub: true } }); }
  else if (lens) lens.style.setProperty("--r", "60%");
  var path = q("#path"), ink = q("#pathInk");
  if (path && ink) {
    var nodes = qa("li", path), len = ink.getTotalLength();
    ink.style.strokeDasharray = len;
    var setP = function (p) { ink.style.strokeDashoffset = len * (1 - p); nodes.forEach(function (n, i) { n.classList.toggle("is-on", p >= i / (nodes.length - 1) - 0.02); }); };
    if (canAnimate) { setP(0); ScrollTrigger.create({ trigger: path, start: "top 80%", end: "bottom 50%", scrub: 0.6, onUpdate: function (s) { setP(s.progress); } }); } else setP(1);
  }

  /* =====================================================================
     3. PLAN TO PRODUCT: five rects are a floor plan, then a grid, then components, then an interface.
        One value p (0..3) drives every attribute, scrubbed by scroll (pinned) or jumped by the step buttons.
     ===================================================================== */
  (function morph() {
    var section = q("#arch"), svg = q("#archMorph"); if (!section || !svg) return;
    var rooms = ["mA", "mB", "mC", "mD", "mE"].map(function (id) { return document.getElementById(id); });
    var g = function (s) { return svg.querySelector(s); };
    var parts = { fine: g(".m-grid-fine"), plan: g(".m-plan"), cols: g(".m-cols"), tokens: g(".m-tokens"), flow: g(".m-flow"), shell: g(".m-shell"), bar: g(".m-bar"), ui: g(".m-ui") };
    var buttons = qa("[data-step]", section), caption = q("#archCaption");
    var NAMES = ["01 · Blueprint", "02 · Layout grid", "03 · Components", "04 · Interface"];
    var GEO = [
      [[60, 50, 200, 130], [260, 50, 280, 70], [260, 120, 140, 60], [400, 120, 140, 60], [60, 180, 480, 170]],
      [[80, 60, 170, 110], [260, 60, 270, 50], [260, 120, 130, 50], [400, 120, 130, 50], [80, 190, 450, 150]],
      [[80, 75, 180, 105], [280, 75, 240, 50], [280, 135, 115, 45], [405, 135, 115, 45], [80, 200, 440, 105]],
      [[80, 104, 190, 60], [280, 98, 240, 30], [280, 146, 110, 34], [404, 146, 116, 34], [80, 206, 440, 128]]
    ];
    var RX = [0, 2, 10, 10], SW = [3, 1.6, 1.5, 1.2], FILL = [0, 0, 1, 1], STROKE_OP = [1, 0.9, 1, 0.45];
    var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; }, lerp = function (a, b, t) { return a + (b - a) * t; }, smooth = function (t) { return t * t * (3 - 2 * t); }, ramp = function (p, a, b) { return clamp((p - a) / (b - a), 0, 1); };
    var stageVal = function (arr, p) { var i = Math.min(Math.floor(p), arr.length - 2), t = smooth(clamp(p - i, 0, 1)); return lerp(arr[i], arr[i + 1], t); };
    var current = 0;
    function render(p) {
      p = clamp(p, 0, 3); current = p;
      var i = Math.min(Math.floor(p), 2), t = smooth(clamp(p - i, 0, 1));
      rooms.forEach(function (el, r) {
        var a = GEO[i][r], b = GEO[i + 1][r];
        el.setAttribute("x", lerp(a[0], b[0], t).toFixed(2)); el.setAttribute("y", lerp(a[1], b[1], t).toFixed(2));
        el.setAttribute("width", lerp(a[2], b[2], t).toFixed(2)); el.setAttribute("height", lerp(a[3], b[3], t).toFixed(2));
        el.setAttribute("rx", stageVal(RX, p).toFixed(2)); el.style.strokeWidth = stageVal(SW, p); el.style.fillOpacity = stageVal(FILL, p); el.style.strokeOpacity = stageVal(STROKE_OP, p);
      });
      parts.fine.style.opacity = 1 - ramp(p, 0.2, 2.6); parts.plan.style.opacity = 1 - ramp(p, 0.05, 0.6);
      parts.cols.style.opacity = ramp(p, 0.3, 1) * (1 - ramp(p, 1.4, 2.4)); parts.tokens.style.opacity = ramp(p, 0.5, 1) * (1 - ramp(p, 1.3, 1.8));
      parts.flow.style.opacity = ramp(p, 1.5, 2) * (1 - ramp(p, 2.2, 2.6)); parts.shell.style.opacity = ramp(p, 2.1, 2.8);
      parts.shell.setAttribute("rx", (ramp(p, 2.1, 3) * 16).toFixed(1)); parts.bar.style.opacity = ramp(p, 2.3, 2.8); parts.bar.setAttribute("height", (ramp(p, 2.3, 3) * 36).toFixed(1));
      parts.ui.style.opacity = ramp(p, 2.55, 3); parts.ui.style.transform = "translateY(" + ((1 - ramp(p, 2.55, 3)) * 6).toFixed(2) + "px)";
      var active = Math.round(p);
      buttons.forEach(function (btn, b) { btn.setAttribute("aria-pressed", b === active ? "true" : "false"); btn.style.setProperty("--p", (b < 3 ? clamp(p - b, 0, 1) : (p >= 2.98 ? 1 : 0)).toFixed(3)); });
      if (caption && caption.getAttribute("data-idx") !== String(active)) { caption.textContent = NAMES[active]; caption.setAttribute("data-idx", String(active)); }
    }
    render(0);
    if (!reduced) {
      rooms.forEach(function (el) { el.setAttribute("pathLength", "1"); el.style.strokeDasharray = "1"; el.style.strokeDashoffset = "1"; });
      onceVisible(svg, function () {
        rooms.forEach(function (el, i) {
          el.style.transition = "stroke-dashoffset 1.1s cubic-bezier(0.77,0,0.175,1) " + (i * 0.12) + "s";
          requestAnimationFrame(function () { el.style.strokeDashoffset = "0"; });
          setTimeout(function () { el.style.strokeDasharray = ""; el.style.strokeDashoffset = ""; el.removeAttribute("pathLength"); el.style.transition = ""; }, 1100 + i * 120 + 100);
        });
      }, 0.35);
    }
    var st = null;
    if (canAnimate && window.innerHeight >= 560 && window.innerWidth > 860) {
      var state = { p: 0 };
      st = ScrollTrigger.create({ trigger: q(".arch-pin", section), start: "top top", end: "+=260%", pin: true, scrub: 0.7, animation: gsap.to(state, { p: 3, ease: "none", onUpdate: function () { render(state.p); } }) });
    }
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var target = parseInt(btn.getAttribute("data-step"), 10);
        if (st) { var y = st.start + (st.end - st.start) * (target / 3) + 2; if (lenis) lenis.scrollTo(y, { duration: 1.2 }); else window.scrollTo({ top: y, behavior: "smooth" }); }
        else if (canAnimate) { var o = { p: current }; gsap.to(o, { p: target, duration: 0.9, ease: "power2.inOut", onUpdate: function () { render(o.p); } }); }
        else render(target);
      });
    });
    if (reduced) render(0);
  })();

  /* =====================================================================
     4. WORK: sticky stack. Each card stacks over the last; the demo is the point of the card.
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

  /* Demo A: who gets the next lead? (deficit rule: the next lead goes to whoever is furthest behind their share) */
  (function () {
    var root = q("#demoLeads"); if (!root) return;
    var btn = q("[data-run]", root), out = q('.pane[data-pane="sim"] .demo-out', root), lanes = qa(".lane", root), pct = [0.5, 0.3, 0.2], timer;
    /* tabs: simulation / real screen */
    var tabs = qa(".demo-tabs button", root), panes = qa(".pane", root);
    tabs.forEach(function (t) {
      t.addEventListener("click", function () {
        tabs.forEach(function (x) { x.setAttribute("aria-selected", x === t ? "true" : "false"); });
        panes.forEach(function (p) { p.hidden = p.getAttribute("data-pane") !== t.getAttribute("data-pane"); });
        btn.hidden = t.getAttribute("data-pane") !== "sim";
      });
    });
    function run(instant) {
      clearTimeout(timer);
      var actual = [0, 0, 0], total = 0;
      lanes.forEach(function (l) { q(".lane-slots", l).innerHTML = ""; q(".lane-count", l).textContent = "0"; });
      btn.disabled = true;
      (function next() {
        total++;
        var best = 0, bestD = -Infinity;
        for (var i = 0; i < 3; i++) { var d = pct[i] * total - actual[i]; if (d > bestD + 1e-9 || (Math.abs(d - bestD) <= 1e-9 && actual[i] < actual[best])) { bestD = d; best = i; } }
        actual[best]++;
        var chip = document.createElement("span"); chip.className = "lead-chip"; chip.textContent = total;
        q(".lane-slots", lanes[best]).appendChild(chip); q(".lane-count", lanes[best]).textContent = actual[best];
        out.textContent = "Lead " + total + " goes to Agent " + "ABC"[best] + ", who was furthest behind their share.";
        if (total < 10) timer = setTimeout(next, instant ? 0 : 380);
        else { out.textContent = "10 leads: 5, 3 and 2. Exactly 50 / 30 / 20, with no rounding drift."; btn.disabled = false; btn.textContent = "Run it again"; }
      })();
    }
    btn.addEventListener("click", function () { run(reduced); });
    if (reduced) run(true); else onceVisible(root, function () { run(false); }, 0.6);
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
     5. WHERE THE VALUE MOVED: the checklist ticks itself, one decision at a time
     ===================================================================== */
  (function () {
    var list = q("#checks"); if (!list) return;
    var items = qa("li", list);
    if (!canAnimate) { items.forEach(function (li) { li.classList.add("is-checked"); }); return; }
    onceVisible(list, function () { items.forEach(function (li, i) { setTimeout(function () { li.classList.add("is-checked"); }, 160 + i * 150); }); }, 0.35);
  })();

  /* =====================================================================
     6. ASK THE TOOLS: chips are questions, the console types the answer
     ===================================================================== */
  (function () {
    var panel = q("#askPanel"); if (!panel) return;
    var shots = qa(".shot", panel), chips = qa(".chips .chip"), n = shots.length;
    function show(k) {
      chips.forEach(function (c, i) { c.setAttribute("aria-selected", i === k ? "true" : "false"); c.tabIndex = i === k ? 0 : -1; });
      panel.setAttribute("aria-labelledby", chips[k].id);
      shots.forEach(function (s, i) { var pos = (i - k + n) % n; s.classList.toggle("is-active", pos === 0); s.setAttribute("data-pos", pos); s.setAttribute("aria-hidden", pos === 0 ? "false" : "true"); });
    }
    chips.forEach(function (c, i) {
      c.tabIndex = i === 0 ? 0 : -1;
      c.addEventListener("click", function () { show(i); });
      c.addEventListener("keydown", function (e) { var k = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0; if (!k) return; e.preventDefault(); var m = (i + k + chips.length) % chips.length; chips[m].focus(); show(m); });
    });
    show(0);
  })();

  /* =====================================================================
     7. BELIEFS: a diff. The old line is struck, the new one is typed.
     ===================================================================== */
  qa(".hunk").forEach(function (h) {
    var t = q(".type", h);
    if (!canAnimate) { h.classList.add("is-done"); return; }
    var full = t.getAttribute("data-text"); t.textContent = "";
    onceVisible(h, function () {
      h.classList.add("is-done"); var i = 0;
      setTimeout(function tick() { i++; t.textContent = full.slice(0, i); if (i < full.length) setTimeout(tick, 32); }, 750);
    }, 0.7);
  });

  /* ---------- footer statement: letters lift under the pointer ---------- */
  (function () {
    var fs = q("#footStatement"); if (!fs || !fine || reduced) return;
    var text = fs.textContent; fs.textContent = "";
    var sr = document.createElement("span"); sr.className = "vh"; sr.textContent = text; fs.appendChild(sr);
    text.split("").forEach(function (ch) { var s = document.createElement("span"); s.setAttribute("aria-hidden", "true"); s.textContent = ch === " " ? " " : ch; s.addEventListener("pointerenter", function () { s.style.transform = "translateY(-0.12em)"; s.style.color = "var(--accent)"; setTimeout(function () { s.style.transform = ""; s.style.color = ""; }, 380); }); fs.appendChild(s); });
  })();

  if (canAnimate) { addEventListener("load", function () { ScrollTrigger.refresh(); }); if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); }); }
})();