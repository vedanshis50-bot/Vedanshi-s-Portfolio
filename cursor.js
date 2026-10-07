/* Paper plane cursor, shared by every page.
   Builds its own markup, so a page only needs cursor.css and this file.
   The plane eases behind the pointer and turns into its heading; the trail is a set of
   dashes dropped along the path that each fade out, with a gap kept behind the plane. */
(function () {
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches || /[?&]static/.test(location.search);
  if (!fine) return;

  var NS = "http://www.w3.org/2000/svg";
  var plane = document.createElement("div");
  plane.className = "cursor-plane"; plane.setAttribute("aria-hidden", "true");
  var img = document.createElement("img");
  img.src = "assets/img/cursor-plane.png"; img.alt = ""; img.width = 32; img.height = 32;
  plane.appendChild(img);
  var trail = document.createElementNS(NS, "svg");
  trail.setAttribute("class", "cursor-trail"); trail.setAttribute("aria-hidden", "true");
  document.body.appendChild(trail); document.body.appendChild(plane);
  document.documentElement.classList.add("has-plane-cursor");


  var mx = -100, my = -100, px = -100, py = -100, angle = -40, on = false, RAD = Math.PI / 180;
  var marks = [], MAXM = 44, LIFE = 68, STEP = 13, GAP = 23, lastEx = -999, lastEy = -999, markEls = [];
  for (var i = 0; i < MAXM; i++) { var ln = document.createElementNS(NS, "line"); trail.appendChild(ln); markEls.push(ln); }

  addEventListener("pointermove", function (e) {
    mx = e.clientX; my = e.clientY;
    if (!on) { on = true; plane.classList.add("on"); trail.classList.add("on"); px = mx; py = my; }
  }, { passive: true });
  document.addEventListener("pointerleave", function () { on = false; plane.classList.remove("on"); trail.classList.remove("on"); });

  function loop() {
    var dx = mx - px, dy = my - py;
    px += dx * 0.18; py += dy * 0.18;
    if (dx * dx + dy * dy > 4) angle = Math.atan2(dy, dx) * (180 / Math.PI);
    /* the artwork's nose points up-left (-138deg), so it needs +138deg to sit on the heading */
    plane.style.setProperty("--cx", px + "px"); plane.style.setProperty("--cy", py + "px"); plane.style.setProperty("--cr", (angle + 138) + "deg");
    if ((px - lastEx) * (px - lastEx) + (py - lastEy) * (py - lastEy) > STEP * STEP) {
      marks.unshift({ x: px, y: py, a: angle, life: LIFE });
      if (marks.length > MAXM) marks.pop();
      lastEx = px; lastEy = py;
    }
    for (var i = 0; i < MAXM; i++) {
      var m = marks[i], el = markEls[i];
      if (!m || m.life <= 0) { el.setAttribute("stroke-opacity", 0); continue; }
      m.life--;
      var gx = m.x - px, gy = m.y - py;
      if (gx * gx + gy * gy < GAP * GAP) { el.setAttribute("stroke-opacity", 0); continue; }
      var hx = Math.cos(m.a * RAD) * 5, hy = Math.sin(m.a * RAD) * 5;
      el.setAttribute("x1", (m.x - hx).toFixed(1)); el.setAttribute("y1", (m.y - hy).toFixed(1));
      el.setAttribute("x2", (m.x + hx).toFixed(1)); el.setAttribute("y2", (m.y + hy).toFixed(1));
      el.setAttribute("stroke-opacity", (m.life / LIFE * 0.6).toFixed(2));
    }
    requestAnimationFrame(loop);
  }
  if (!reduced) requestAnimationFrame(loop);
})();
