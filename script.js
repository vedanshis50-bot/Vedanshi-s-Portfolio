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

  /* ---------- custom cursor: a colourless glass lens locked to the pointer, plus a paper plane that eases behind it and banks into its heading ---------- */
  (function () {
    var plane = q("#cursorPlane"), trail = q("#cursorTrail"), glass = q("#cursorGlass"); if (!plane || !fine) return;
    doc.classList.add("has-plane-cursor");
    var mx = -100, my = -100, px = -100, py = -100, angle = -40, on = false, raf;
    var trailPts = [], MAXT = 6;
    addEventListener("pointermove", function (e) {
      mx = e.clientX; my = e.clientY;
      if (glass) { glass.style.setProperty("--lx", mx + "px"); glass.style.setProperty("--ly", my + "px"); }
      if (!on) { on = true; plane.classList.add("on"); trail.classList.add("on"); if (glass) glass.classList.add("on"); px = mx; py = my; }
    }, { passive: true });
    document.addEventListener("pointerleave", function () { on = false; plane.classList.remove("on"); trail.classList.remove("on"); if (glass) glass.classList.remove("on"); });
    function loop() {
      var dx = mx - px, dy = my - py;
      px += dx * 0.18; py += dy * 0.18;
      if (dx * dx + dy * dy > 4) angle = Math.atan2(dy, dx) * (180 / Math.PI) + 45;
      plane.style.setProperty("--cx", px + "px"); plane.style.setProperty("--cy", py + "px"); plane.style.setProperty("--cr", angle + "deg");
      trailPts.unshift({ x: px, y: py }); if (trailPts.length > MAXT) trailPts.pop();
      var tp = trailPts[Math.min(3, trailPts.length - 1)];
      if (tp) { trail.style.setProperty("--tx", tp.x + "px"); trail.style.setProperty("--ty", tp.y + "px"); }
      raf = requestAnimationFrame(loop);
    }
    if (!reduced) raf = requestAnimationFrame(loop);
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
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i], s = p.free ? 2.4 : 3.6, a = p.free ? 0.3 : 0.6, c = rgb;
        if (p.amber) { c = acc; a = 0.95; }
        if (lit) { var dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.sqrt(dx * dx + dy * dy); if (d < TORCH) { var k = 1 - d / TORCH; c = rgb; a = Math.max(a, 0.55 + 0.45 * k); s += k * 1.6; } }
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

    var photo = q("#photo"), then = photo && q(".p-then", photo), btn = photo && q(".p-flip", photo);
    if (then && btn) {
      var probe = new Image();
      probe.onload = function () {
        then.src = probe.src; then.hidden = false; btn.hidden = false;
        var setThen = function (on) { photo.classList.toggle("is-then", on); btn.setAttribute("aria-pressed", on ? "true" : "false"); btn.setAttribute("aria-label", on ? "Show the now photo" : "Show the childhood photo"); q("span", btn).textContent = on ? "Back to now" : "Little me"; };
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

    /* the process steps arrive one after another */
    var steps = qa("#startSteps li");
    if (!canAnimate) steps.forEach(function (li) { li.classList.add("is-in"); });
    else onceVisible(q("#startSteps"), function () { steps.forEach(function (li, i) { setTimeout(function () { li.classList.add("is-in"); }, 300 + i * 900); }); }, 0.4);

    /* nav underline: About covers the intro and the shift, Work and Perspective cover theirs, anything else clears it */
    var links = qa("[data-spy]"), alias = { arch: "intro" };
    var watch = ["hero", "intro", "arch"].concat(links.map(function (a) { return a.getAttribute("data-spy"); }));
    var targets = watch.filter(function (id, i) { return watch.indexOf(id) === i; }).map(function (id) { return q("#" + id); });
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (!en.isIntersecting) return; var id = alias[en.target.id] || en.target.id; links.forEach(function (a) { a.setAttribute("aria-current", a.getAttribute("data-spy") === id ? "true" : "false"); }); });
      }, { rootMargin: "-45% 0px -50% 0px" });
      targets.forEach(function (t) { if (t) io.observe(t); });
    }
  })();

  /* =====================================================================
     2b. THE SHIFT: a floor plan morphs into a product interface, on an idle loop;
         a step button jumps straight to a stage and pauses there a while.
     ===================================================================== */
  (function morph() {
    var section = q(".arch"), svg = q("#archMorph"); if (!section || !svg) return;
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
      var i = Math.min(Math.floor(p), 2), t = smooth(clamp(p - i, 0, 1)), g2 = ramp(p, 2, 3);
      rooms.forEach(function (el, r) {
        var a = GEO[i][r], b = GEO[i + 1][r];
        el.setAttribute("x", lerp(a[0], b[0], t).toFixed(2)); el.setAttribute("y", lerp(a[1], b[1], t).toFixed(2));
        el.setAttribute("width", lerp(a[2], b[2], t).toFixed(2)); el.setAttribute("height", lerp(a[3], b[3], t).toFixed(2));
        el.setAttribute("rx", stageVal(RX, p).toFixed(2)); el.style.strokeWidth = stageVal(SW, p); el.style.fillOpacity = (stageVal(FILL, p) * lerp(0.16, 0.2, g2)).toFixed(3); el.style.strokeOpacity = stageVal(STROKE_OP, p);
        el.style.fill = "rgb(" + Math.round(lerp(255, 168, g2)) + "," + Math.round(lerp(184, 168, g2)) + "," + Math.round(lerp(184, 168, g2)) + ")";
      });
      parts.fine.style.opacity = 1 - ramp(p, 0.2, 2.6); parts.plan.style.opacity = 1 - ramp(p, 0.05, 0.6);
      parts.cols.style.opacity = ramp(p, 0.3, 1) * (1 - ramp(p, 1.4, 2.4)); parts.tokens.style.opacity = ramp(p, 0.5, 1) * (1 - ramp(p, 1.3, 1.8));
      parts.flow.style.opacity = ramp(p, 1.5, 2) * (1 - ramp(p, 2.2, 2.6)); parts.shell.style.opacity = ramp(p, 2.1, 2.8);
      parts.shell.setAttribute("rx", (ramp(p, 2.1, 3) * 16).toFixed(1)); parts.bar.style.opacity = ramp(p, 2.3, 2.8); parts.bar.setAttribute("height", (ramp(p, 2.3, 3) * 36).toFixed(1));
      parts.ui.style.opacity = ramp(p, 2.55, 3); parts.ui.style.transform = "translateY(" + ((1 - ramp(p, 2.55, 3)) * 6).toFixed(2) + "px)";
      var active = Math.round(p);
      buttons.forEach(function (btn, b) { btn.setAttribute("aria-pressed", b === active ? "true" : "false"); btn.style.setProperty("--p", (b < 3 ? clamp(p - b, 0, 1) : (p >= 2.98 ? 1 : 0)).toFixed(3)); });
      if (caption && caption.getAttribute("data-idx") !== String(active)) {
        caption.style.opacity = 0;
        setTimeout(function () { caption.textContent = NAMES[active]; caption.style.opacity = 1; }, 160);
        caption.setAttribute("data-idx", String(active));
      }
    }
    render(0);
    var loop = null, resumeTimer = null, state = { p: 0 };
    if (canAnimate) {
      loop = gsap.to(state, { p: 3, duration: 9, ease: "sine.inOut", repeat: -1, yoyo: true, paused: true, onUpdate: function () { render(state.p); } });
      onceVisible(q(".arch-stage", section), function () {
        if ("IntersectionObserver" in window) {
          new IntersectionObserver(function (e) { if (e[0].isIntersecting) loop.play(); else loop.pause(); }).observe(section);
        } else loop.play();
      }, 0.3);
    }
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var target = parseInt(btn.getAttribute("data-step"), 10);
        clearTimeout(resumeTimer);
        if (loop) {
          loop.pause();
          var o = { p: current };
          gsap.to(o, { p: target, duration: 0.6, ease: "power3.out", onUpdate: function () { render(o.p); }, onComplete: function () {
            resumeTimer = setTimeout(function () {
              loop.kill();
              var edge = target <= 1.5 ? 0 : 3; state.p = edge; render(edge);
              loop = gsap.to(state, { p: edge ? 0 : 3, duration: 9, ease: "sine.inOut", repeat: -1, yoyo: true, onUpdate: function () { render(state.p); } });
            }, 3500);
          } });
        } else render(target);
      });
    });
    if (reduced) render(0);
  })();

  /* =====================================================================
     3. WORK: sticky stack. Each card stacks over the last; the demo is the point of the card.
        Also drives the "world" backdrop crossfade between each project's accent as it centers.
     ===================================================================== */
  (function worldBackdrop() {
    var root = q("#worldBackdrop"); if (!root) return;
    var layers = qa(".world-layer", root);
    function setWorld(name) { layers.forEach(function (l) { l.classList.toggle("is-on", l.getAttribute("data-layer") === name); }); }
    var cards = qa("[data-world]");
    if (!canAnimate) { if (cards[0]) setWorld(cards[0].getAttribute("data-world")); return; }
    cards.forEach(function (card) {
      ScrollTrigger.create({ trigger: card, start: "top 60%", end: "bottom 40%", onEnter: function () { setWorld(card.getAttribute("data-world")); }, onEnterBack: function () { setWorld(card.getAttribute("data-world")); } });
    });
  })();

  if (canAnimate && window.matchMedia("(min-width: 961px)").matches) {
    var cards = gsap.utils.toArray(".stack-card");
    cards.forEach(function (card, i) { card.style.zIndex = i + 1; if (i === cards.length - 1) card.style.position = "relative"; });
    cards.forEach(function (card, i) {
      if (i === cards.length - 1) return;
      ScrollTrigger.create({ trigger: card, start: "top top", endTrigger: cards[cards.length - 1], end: "top top", pin: true, pinSpacing: false });
      /* a card that is fading out underneath must never catch clicks meant for the one on top */
      var fade = gsap.to(card, { scale: 0.92, opacity: 0, ease: "none", scrollTrigger: { trigger: cards[i + 1], start: "top bottom", end: "top top", scrub: true } });
      fade.eventCallback("onUpdate", function () { card.style.pointerEvents = fade.progress() > 0.15 ? "none" : ""; });
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
        else { simOut.textContent = "Final split: 5 / 3 / 2, exactly 50 / 30 / 20."; if (done) at(instant ? 0 : 800, done); }
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
      out.textContent = "Everyone talks. The bar shows who is loudest.";
      items.forEach(function (li, i) { setTimeout(function () { q(".voice", li).style.setProperty("--v", LOUD[li.getAttribute("data-idea")]); }, 300 + i * 250); });
      setTimeout(function () { out.textContent = "Time's up. The room decides."; }, 1700); setTimeout(finish, 2600);
    }
    btn.addEventListener("click", function () { run(reduced); });
    if (reduced) run(true); else onceVisible(root, function () { run(false); }, 0.6);
  })();

  /* Demo C: Last Mile. The problem (three unanswered questions), the fix (destination, compare, directions), then the real screen. */
  (function () {
    var root = q("#demoLastmile"); if (!root) return;
    var ORDER = ["problem", "fix", "screen"];
    var DUR = { problem: 5200, fix: 9000, screen: 4200 };
    var btn = q("[data-run]", root), tabs = qa(".demo-tabs button", root), panes = qa(".pane", root), segs = qa(".demo-progress span", root);
    var rules = qa("#lmRules li", root), prob = q("#lmProb", root);
    var frames = qa("#lmFix .fix-frame", root), keys = qa("[data-key]", root);
    var current = "problem", autoplay = true, hovered = false, waiting = null, timers = [];
    function at(ms, fn) { var id = setTimeout(fn, ms); timers.push(id); return id; }
    function clearTimers() { timers.forEach(clearTimeout); timers = []; }
    function setSeg(name, state) {
      segs.forEach(function (s) {
        if (s.getAttribute("data-seg") !== name) return;
        s.classList.remove("is-active", "is-done", "is-paused");
        var i = q("i", s); i.style.animation = "none"; i.offsetHeight;
        if (state === "done") s.classList.add("is-done");
        else if (state === "active") { s.classList.add("is-active"); i.style.animation = "segFill " + DUR[name] + "ms linear forwards"; }
        else { i.style.animation = "none"; i.style.width = "0%"; }
      });
    }
    function markSegsFor(name) { var idx = ORDER.indexOf(name); ORDER.forEach(function (n, i) { setSeg(n, i < idx ? "done" : (i === idx ? "active" : "idle")); }); }
    function whenFree(fn) { if (!hovered) fn(); else waiting = fn; }
    root.addEventListener("pointerenter", function () { hovered = true; segs.forEach(function (s) { s.classList.add("is-paused"); }); });
    root.addEventListener("pointerleave", function () { hovered = false; segs.forEach(function (s) { s.classList.remove("is-paused"); }); if (waiting) { var fn = waiting; waiting = null; fn(); } });

    function showPane(name, forAutoplay) {
      current = name; if (!forAutoplay) autoplay = false;
      tabs.forEach(function (t) { t.setAttribute("aria-selected", t.getAttribute("data-pane") === name ? "true" : "false"); });
      panes.forEach(function (p) { p.hidden = p.getAttribute("data-pane") !== name; });
    }
    function runProblem(instant) {
      rules.forEach(function (r) { r.classList.remove("is-on"); }); prob.classList.remove("is-clash");
      if (instant || reduced) { rules.forEach(function (r) { r.classList.add("is-on"); }); prob.classList.add("is-clash"); if (autoplay) advance("fix"); return; }
      markSegsFor("problem");
      rules.forEach(function (r, i) { at(600 + i * 900, function () { r.classList.add("is-on"); }); });
      at(3600, function () { prob.classList.add("is-clash"); });
      at(DUR.problem, function () { whenFree(function () { if (autoplay) advance("fix"); }); });
    }
    function runFix(instant) {
      frames.forEach(function (f) { f.hidden = true; }); keys.forEach(function (k) { k.classList.remove("is-hit"); });
      if (instant || reduced) { frames.forEach(function (f) { f.hidden = false; }); keys.forEach(function (k) { k.classList.add("is-hit"); }); if (autoplay) advance("screen"); return; }
      markSegsFor("fix");
      frames[0].hidden = false;
      at(900, function () { keys[0].classList.add("is-hit"); });
      at(3000, function () { frames[0].hidden = true; frames[1].hidden = false; });
      at(3900, function () { keys[1].classList.add("is-hit"); });
      at(6000, function () { frames[1].hidden = true; frames[2].hidden = false; });
      at(6900, function () { keys[2].classList.add("is-hit"); });
      at(DUR.fix, function () { whenFree(function () { if (autoplay) advance("screen"); }); });
    }
    function runScreen() { if (reduced) return; markSegsFor("screen"); }
    function advance(name) { clearTimers(); showPane(name, true); play(false); }
    function play(instant) {
      clearTimers();
      if (current === "problem") runProblem(instant); else if (current === "fix") runFix(instant); else runScreen();
    }
    function replay() { autoplay = true; showPane("problem", true); play(reduced); }
    tabs.forEach(function (t) { t.addEventListener("click", function () { clearTimers(); showPane(t.getAttribute("data-pane"), false); play(reduced); }); });
    btn.addEventListener("click", replay);
    if (reduced) { showPane("problem", true); runProblem(true); } else onceVisible(root, function () { replay(); }, 0.6);
  })();
  /* Demo D: Fixed Deposit. The problem (three unanswered questions), the fix (outcome, tenure, review), then the real screen. */
  (function () {
    var root = q("#demoFd"); if (!root) return;
    var ORDER = ["problem", "fix", "screen"];
    var DUR = { problem: 5200, fix: 9000, screen: 4200 };
    var btn = q("[data-run]", root), tabs = qa(".demo-tabs button", root), panes = qa(".pane", root), segs = qa(".demo-progress span", root);
    var rules = qa("#fdRules li", root), prob = q("#fdProb", root);
    var frames = qa("#fdFix .fix-frame", root), keys = qa("[data-key]", root);
    var current = "problem", autoplay = true, hovered = false, waiting = null, timers = [];
    function at(ms, fn) { var id = setTimeout(fn, ms); timers.push(id); return id; }
    function clearTimers() { timers.forEach(clearTimeout); timers = []; }
    function setSeg(name, state) {
      segs.forEach(function (s) {
        if (s.getAttribute("data-seg") !== name) return;
        s.classList.remove("is-active", "is-done", "is-paused");
        var i = q("i", s); i.style.animation = "none"; i.offsetHeight;
        if (state === "done") s.classList.add("is-done");
        else if (state === "active") { s.classList.add("is-active"); i.style.animation = "segFill " + DUR[name] + "ms linear forwards"; }
        else { i.style.animation = "none"; i.style.width = "0%"; }
      });
    }
    function markSegsFor(name) { var idx = ORDER.indexOf(name); ORDER.forEach(function (n, i) { setSeg(n, i < idx ? "done" : (i === idx ? "active" : "idle")); }); }
    function whenFree(fn) { if (!hovered) fn(); else waiting = fn; }
    root.addEventListener("pointerenter", function () { hovered = true; segs.forEach(function (s) { s.classList.add("is-paused"); }); });
    root.addEventListener("pointerleave", function () { hovered = false; segs.forEach(function (s) { s.classList.remove("is-paused"); }); if (waiting) { var fn = waiting; waiting = null; fn(); } });

    function showPane(name, forAutoplay) {
      current = name; if (!forAutoplay) autoplay = false;
      tabs.forEach(function (t) { t.setAttribute("aria-selected", t.getAttribute("data-pane") === name ? "true" : "false"); });
      panes.forEach(function (p) { p.hidden = p.getAttribute("data-pane") !== name; });
    }
    function runProblem(instant) {
      rules.forEach(function (r) { r.classList.remove("is-on"); }); prob.classList.remove("is-clash");
      if (instant || reduced) { rules.forEach(function (r) { r.classList.add("is-on"); }); prob.classList.add("is-clash"); if (autoplay) advance("fix"); return; }
      markSegsFor("problem");
      rules.forEach(function (r, i) { at(600 + i * 900, function () { r.classList.add("is-on"); }); });
      at(3600, function () { prob.classList.add("is-clash"); });
      at(DUR.problem, function () { whenFree(function () { if (autoplay) advance("fix"); }); });
    }
    function runFix(instant) {
      frames.forEach(function (f) { f.hidden = true; }); keys.forEach(function (k) { k.classList.remove("is-hit"); });
      if (instant || reduced) { frames.forEach(function (f) { f.hidden = false; }); keys.forEach(function (k) { k.classList.add("is-hit"); }); if (autoplay) advance("screen"); return; }
      markSegsFor("fix");
      frames[0].hidden = false;
      at(900, function () { keys[0].classList.add("is-hit"); });
      at(3000, function () { frames[0].hidden = true; frames[1].hidden = false; });
      at(3900, function () { keys[1].classList.add("is-hit"); });
      at(6000, function () { frames[1].hidden = true; frames[2].hidden = false; });
      at(6900, function () { keys[2].classList.add("is-hit"); });
      at(DUR.fix, function () { whenFree(function () { if (autoplay) advance("screen"); }); });
    }
    function runScreen() { if (reduced) return; markSegsFor("screen"); }
    function advance(name) { clearTimers(); showPane(name, true); play(false); }
    function play(instant) {
      clearTimers();
      if (current === "problem") runProblem(instant); else if (current === "fix") runFix(instant); else runScreen();
    }
    function replay() { autoplay = true; showPane("problem", true); play(reduced); }
    tabs.forEach(function (t) { t.addEventListener("click", function () { clearTimers(); showPane(t.getAttribute("data-pane"), false); play(reduced); }); });
    btn.addEventListener("click", replay);
    if (reduced) { showPane("problem", true); runProblem(true); } else onceVisible(root, function () { replay(); }, 0.6);
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
  /* ---------- quote cards: a light glass tilt that follows the pointer ---------- */
  (function () {
    if (!fine || reduced) return;
    qa(".quote-card").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty("--rx", (px * 8).toFixed(2) + "deg");
        card.style.setProperty("--ry", (py * -8).toFixed(2) + "deg");
      });
      card.addEventListener("pointerleave", function () { card.style.setProperty("--rx", "0deg"); card.style.setProperty("--ry", "0deg"); });
    });
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