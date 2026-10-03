/* Boardroom — UI controller.
   Four steps: your idea → meet the board → the debate → the verdict.
   Reads data from BR.board / BR.demo, asks BR.engine for live output, and only renders normalised data. */
(function () {
  const BR = window.BR;
  const B = BR.board, E = BR.engine, D = BR.demo;

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, reduced() ? 0 : ms));
  const words = (s) => String(s).split(/\s+/).length;

  const ORDER = ["idea", "board", "discussion", "verdict"];

  const S = {
    stage: "idea", reached: 0, idea: "", token: 0,
    mode: "demo", live: { available: false, reason: "checking", model: "" },
    session: null
  };

  /* ================= shell ================= */

  function go(stage, { focus = true } = {}) {
    const idx = ORDER.indexOf(stage);
    if (idx > S.reached) return;
    if (S.stage === "discussion" && stage !== "discussion") player.suspend();
    S.stage = stage;
    $$(".screen").forEach((el) => {
      const on = el.dataset.screen === stage;
      el.hidden = !on;
      if (on) { el.classList.remove("enter"); void el.offsetWidth; el.classList.add("enter"); }
    });
    $$(".step").forEach((b) => {
      const i = ORDER.indexOf(b.dataset.go);
      b.disabled = i > S.reached;
      b.classList.toggle("done", i !== idx && i <= S.reached);
      if (i === idx) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current");
    });
    window.scrollTo({ top: 0, behavior: "auto" });
    if (focus) {
      const h = $(`[data-screen="${stage}"] h1, [data-screen="${stage}"] h2`);
      if (h) { if (!h.hasAttribute("tabindex")) h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
    }
    if (stage === "discussion") player.resume();
  }

  function announce(text) { const a = $("#announcer"); a.textContent = ""; setTimeout(() => { a.textContent = text; }, 30); }

  function renderRail() {
    $("#railIdea").hidden = !S.idea;
    $("#railIdeaText").textContent = S.idea;
  }

  const monoHtml = (m, cls = "") => `<span class="mono ${cls}" style="--c:${m.color}" aria-hidden="true">${m.initials}</span>`;

  /* ================= mode ================= */

  async function checkLive() {
    const st = await E.status();
    S.live = { available: !!st.live, reason: st.reason || "", model: st.model || "" };
    $('input[name="mode"][value="live"]').disabled = !S.live.available;
    renderModeHint();
  }

  function renderModeHint() {
    const hint = $("#modeHint");
    if (S.mode === "live") hint.textContent = "Your idea is debated live by AI. Takes about a minute.";
    else if (S.live.available) hint.textContent = "Demo plays a recorded debate on the example idea. Switch to Live AI for your own.";
    else hint.innerHTML = "Demo plays a recorded debate on the example idea. Live AI runs locally with <code>npm start</code>.";
  }

  function setMode(mode) {
    S.mode = mode;
    const r = $(`input[name="mode"][value="${mode}"]`); if (r) r.checked = true;
    renderModeHint();
  }

  /* ================= 1 · idea ================= */

  function initIdea() {
    $("#ideaRoster").innerHTML = B.MEMBERS.map((m) => monoHtml(m)).join("");
    const input = $("#ideaInput");
    input.addEventListener("input", hideNotice);
    input.addEventListener("keydown", (e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); submitIdea(); } });
    $("#tryExample").addEventListener("click", () => {
      input.value = D.IDEA; hideNotice();
      input.focus(); input.setSelectionRange(input.value.length, input.value.length);
    });
    $("#ideaForm").addEventListener("submit", (e) => { e.preventDefault(); submitIdea(); });
  }

  function hideNotice() { $("#ideaNotice").hidden = true; }
  function notice(html) { const n = $("#ideaNotice"); n.innerHTML = html; n.hidden = false; }
  const ideaText = () => $("#ideaInput").value.replace(/\s+/g, " ").trim();

  function submitIdea() {
    const idea = ideaText();
    if (idea.length < 12) {
      notice("<p>Tell the board a little more: who it is for, and what it does.</p>");
      $("#ideaInput").focus();
      return;
    }
    if (S.mode === "demo" && !D.isExample(idea)) {
      notice(S.live.available
        ? `<p>The demo is a recording of the example idea, so it cannot debate yours. Live AI can.</p>
           <div class="notice-actions"><button type="button" class="btn btn-primary" data-act="go-live">Debate it live →</button>
           <button type="button" class="btn btn-ghost" data-act="use-example">Use the example instead</button></div>`
        : `<p>This demo can only replay a recorded debate on the example idea. It will not pretend to discuss yours.</p>
           <p>To debate your own ideas, run Boardroom locally with an Anthropic API key (<code>npm start</code>).</p>
           <div class="notice-actions"><button type="button" class="btn btn-primary" data-act="use-example">Use the example idea →</button></div>`);
      return;
    }
    begin(idea);
  }

  /* ================= run lifecycle ================= */

  function begin(idea) {
    S.token++;
    S.idea = idea;
    S.session = { mode: S.mode, positions: {}, turns: null, verdict: null, verdictPromise: null };
    S.reached = 1;
    player.reset();
    resetVerdict();
    renderRail();
    hideNotice();
    $("#tableIdea").textContent = idea;
    go("board");
    startBoard();
  }

  /* ================= 2 · meet the board ================= */

  function renderCards() {
    $("#cards").innerHTML = B.MEMBERS.map((m) => `<div class="card reading" data-id="${m.id}" style="--c:${m.color}"></div>`).join("");
    B.MEMBERS.forEach((m) => updateCard(m.id));
  }

  function updateCard(id) {
    const el = $(`.card[data-id="${id}"]`);
    if (!el) return;
    const m = B.get(id), p = S.session.positions[id];
    el.classList.toggle("reading", !p);
    el.classList.toggle("failed", !!(p && p.failed));
    let body;
    if (!p) body = `<p class="card-state">Reading your idea<span class="dots" aria-hidden="true"><i></i><i></i><i></i></span></p>`;
    else if (p.failed) body = `<p class="card-state">Could not respond this time.</p><button class="btn btn-ghost retry" data-retry="${id}">Try again</button>`;
    else body = `<div><span class="chip" data-lean="${p.lean}">${esc(p.position)}</span></div><p class="card-take">“${esc(p.headline)}”</p>`;
    el.innerHTML = `
      <div class="card-who">${monoHtml(m)}
        <div><button class="card-name" data-open="${id}" aria-label="${esc(m.name)}, ${esc(m.role)}. More about this person">${esc(m.name)}</button>
        <span class="card-role">${esc(m.role)}</span></div></div>
      ${body}`;
  }

  async function startBoard() {
    const tok = S.token;
    renderCards();
    const start = $("#startBtn"), status = $("#boardStatus");
    start.disabled = true;

    if (S.session.mode === "demo") {
      const demo = D.session();
      S.session.demoTurns = demo.turns; S.session.demoVerdict = demo.verdict;
      status.textContent = "Everyone is reading your idea…";
      for (let i = 0; i < B.MEMBERS.length; i++) {
        await wait(i === 0 ? 500 : 280);
        if (tok !== S.token) return;
        const id = B.MEMBERS[i].id;
        S.session.positions[id] = demo.positions[id];
        updateCard(id);
      }
      boardReady();
      return;
    }

    // Live: six separate calls, shown as each one arrives.
    let landed = 0;
    status.textContent = "Everyone is reading your idea… 0 of 6";
    const slow = setTimeout(() => { if (tok === S.token && landed < 6) status.textContent = `Everyone is reading your idea… ${landed} of 6. This can take up to 30 seconds.`; }, 12000);
    await E.positions(S.idea, (id, p) => {
      if (tok !== S.token) return;
      S.session.positions[id] = p; landed++;
      updateCard(id);
      status.textContent = `Everyone is reading your idea… ${landed} of 6`;
    });
    clearTimeout(slow);
    if (tok === S.token) boardReady();
  }

  function boardReady() {
    const ok = B.ids.filter((id) => S.session.positions[id] && !S.session.positions[id].failed).length;
    const status = $("#boardStatus");
    if (ok === 6) status.textContent = "Notice they already disagree. Now let us hear them argue.";
    else if (ok >= 3) status.textContent = `${6 - ok} ${ok === 5 ? "person" : "people"} could not respond. Try again, or start without them.`;
    else status.textContent = "Too few people responded to hold a debate. Try the empty seats again.";
    $("#startBtn").disabled = ok < 3;
  }

  async function retrySeat(id) {
    const tok = S.token;
    delete S.session.positions[id];
    updateCard(id);
    $("#startBtn").disabled = true;
    const p = await E.seat(B.get(id), S.idea);
    if (tok !== S.token) return;
    S.session.positions[id] = p;
    updateCard(id);
    boardReady();
  }

  /* ================= person detail ================= */

  let drawerReturn = null;

  function openMember(id) {
    const m = B.get(id), dlg = $("#drawer");
    drawerReturn = document.activeElement;
    dlg.style.setProperty("--c", m.color);
    $("#drawerMono").textContent = m.initials;
    $("#drawerMono").style.setProperty("--c", m.color);
    $("#drawerName").textContent = m.name;
    $("#drawerRole").textContent = `${m.role} · ${m.lens}`;
    $("#drawerQ").textContent = `“${m.question}”`;
    $("#drawerThinks").innerHTML = m.thinks.map((t) => `<li>${esc(t)}</li>`).join("");

    const p = S.session && S.session.positions[id];
    const now = currentView(id);
    let html = "";
    if (p && !p.failed) {
      html = `<span class="label">First reaction</span>
        <div><span class="chip" data-lean="${p.lean}">${esc(p.position)}</span></div>
        <p class="take">“${esc(p.headline)}”</p>
        ${p.reasoning ? `<p class="more">${esc(p.reasoning)}</p>` : ""}
        ${now && now.position !== p.position ? `<span class="label">After hearing the others</span><div><span class="chip" data-lean="${now.lean}">${esc(now.position)}</span></div>` : ""}`;
    }
    $("#drawerPos").innerHTML = html;
    $("#drawerPos").hidden = !html;

    if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
    $("#drawerClose").focus();
  }

  /* The latest view this person has expressed in the part of the debate shown so far. */
  function currentView(id) {
    let v = null;
    player.revealed.forEach((t) => { if (t.speaker === id && t.shift) v = t.shift; });
    return v;
  }

  function closeDrawer() { const dlg = $("#drawer"); if (dlg.open) dlg.close(); }

  /* ================= 3 · the debate ================= */

  function renderSpeakers() {
    $("#room").innerHTML = B.MEMBERS.map((m) =>
      `<button class="spk" data-open="${m.id}" data-spk="${m.id}" style="--c:${m.color}" aria-label="${esc(m.name)}, ${esc(m.role)}">
        ${monoHtml(m)}<span class="spk-name">${esc(m.short)}</span></button>`).join("");
    $("#room").classList.remove("settled");
  }

  function setSpeaker(id, thinking) {
    $$(".spk").forEach((s) => {
      const me = s.dataset.spk === id;
      s.classList.toggle("on", me && !thinking);
      s.classList.toggle("thinking", me && !!thinking);
    });
  }

  function relText(t) {
    const st = B.STANCES[t.stance] || B.STANCES.builds_on;
    const to = B.get(t.to);
    return st.says.replace("{to}", to ? to.short : "the room");
  }

  function msgHtml(t) {
    const m = B.get(t.speaker);
    const direct = t.stance === "cross_q" || t.stance === "cross_a";
    let changed = "";
    if (t.shift) {
      const before = viewBefore(t);
      changed = `<div class="changed"><span>Changed view:</span>${before ? `<span class="chip" data-lean="${before.lean}">${esc(before.position)}</span><span class="arrow" aria-hidden="true">→</span>` : ""}<span class="chip" data-lean="${t.shift.lean}">${esc(t.shift.position)}</span></div>`;
    }
    return `<div class="msg${direct ? " direct" : ""}" style="--c:${m.color}">
      ${monoHtml(m)}
      <div class="bubble">
        <div class="msg-top"><span class="msg-name">${esc(m.name)}</span><span class="msg-role">${esc(m.role)}</span><span class="msg-rel">${esc(relText(t))}</span></div>
        <p class="says">${esc(t.says)}</p>
        ${changed}
      </div></div>`;
  }

  /* The view a person held just before this message changed it. */
  function viewBefore(turn) {
    const turns = S.session.turns || [];
    const p = S.session.positions[turn.speaker];
    let before = p && !p.failed ? { position: p.position, lean: p.lean } : null;
    for (const t of turns) { if (t === turn) break; if (t.speaker === turn.speaker && t.shift) before = t.shift; }
    return before;
  }

  function renderItem(item, instant) {
    const li = document.createElement("li");
    if (instant) li.style.animation = "none";
    if (item.type === "part") {
      const st = B.stage(item.stage);
      li.innerHTML = `<div class="part">Part ${st.n} of ${B.STAGES.length} · ${esc(st.label)}</div>`;
    } else {
      li.innerHTML = msgHtml(item.turn);
      setSpeaker(item.turn.speaker, false);
      player.revealed.push(item.turn);
      if (!instant) announce(`${B.get(item.turn.speaker).short} ${relText(item.turn)}: ${item.turn.says}`);
    }
    $("#transcript").appendChild(li);
  }

  function toItems(turns) {
    const items = [];
    let stage = null;
    turns.forEach((t) => {
      if (t.stage !== stage) { stage = t.stage; items.push({ type: "part", stage }); }
      items.push({ type: "msg", turn: t });
    });
    return items;
  }

  const player = {
    queue: [], i: 0, playing: true, timer: null, typingEl: null, done: false, awaiting: false, suspended: false, revealed: [],

    reset() {
      clearTimeout(this.timer);
      Object.assign(this, { queue: [], i: 0, playing: true, timer: null, typingEl: null, done: false, awaiting: false, suspended: false, revealed: [] });
      $("#transcript").innerHTML = "";
      $("#converge").hidden = true;
      $("#player").hidden = false;
      this.sync();
    },

    load(items) {
      this.queue.push(...items);
      if (this.awaiting) { this.awaiting = false; this.clearWait(); if (this.playing && !this.suspended) this.schedule(300); }
      this.sync();
    },

    schedule(ms) { clearTimeout(this.timer); this.timer = setTimeout(() => this.tick(), reduced() ? Math.min(ms, 400) : ms); },

    tick() {
      if (!this.playing || this.suspended || this.done) return;
      const item = this.queue[this.i];
      if (!item) return this.endOfQueue();
      if (item.type === "msg" && !this.typingEl) { this.showTyping(item.turn); return this.schedule(1100); }
      this.advance(false);
      this.schedule(this.delayAfter(item));
    },

    advance(instant) {
      const item = this.queue[this.i];
      if (!item) return;
      this.clearTyping();
      renderItem(item, instant);
      this.i++;
      if (!instant) this.keepInView();
      this.sync();
    },

    /* Long enough to actually read a paragraph, short enough not to drag. */
    delayAfter(item) {
      if (item.type === "part") return 700;
      return Math.max(3500, Math.min(8000, words(item.turn.says) * 75));
    },

    showTyping(t) {
      const m = B.get(t.speaker), to = B.get(t.to);
      const li = document.createElement("li");
      li.innerHTML = `<div class="typing" style="--c:${m.color}">${monoHtml(m)}<span>${esc(m.short)} ${to ? `is replying to ${esc(to.short)}` : "is about to speak"}<span class="dots" aria-hidden="true"><i></i><i></i><i></i></span></span></div>`;
      $("#transcript").appendChild(li);
      this.typingEl = li;
      setSpeaker(t.speaker, true);
      this.keepInView();
    },
    clearTyping() { if (this.typingEl) { this.typingEl.remove(); this.typingEl = null; } },

    showWait() {
      if ($("#waitItem")) return;
      const li = document.createElement("li");
      li.id = "waitItem";
      li.innerHTML = `<div class="wait"><strong>The board is getting ready to debate<span class="dots" aria-hidden="true"><i></i><i></i><i></i></span></strong><span>A live debate takes 30–60 seconds to prepare.</span></div>`;
      $("#transcript").appendChild(li);
    },
    clearWait() { const w = $("#waitItem"); if (w) w.remove(); },

    endOfQueue() {
      if (S.session.turns) return this.finish();
      if (S.session.discError) return;   // an error message is already showing
      this.awaiting = true;
      this.showWait();
      this.sync();
    },

    finish() {
      if (this.done) return;
      this.done = true;
      clearTimeout(this.timer);
      this.clearTyping();
      setSpeaker(null);
      $("#room").classList.add("settled");
      $("#player").hidden = true;
      showConverge();
    },

    toggle() {
      this.playing = !this.playing;
      if (this.playing) this.schedule(250); else clearTimeout(this.timer);
      this.sync();
    },
    next() {
      if (this.done) return;
      clearTimeout(this.timer);
      if (!this.queue[this.i]) return this.endOfQueue();
      // Skip past a part heading so "Next" always shows the next person speaking.
      if (this.queue[this.i].type === "part") this.advance(false);
      const item = this.queue[this.i];
      if (!item) return this.endOfQueue();
      this.advance(false);
      if (!this.queue[this.i] && S.session.turns) return this.finish();
      if (this.playing) this.schedule(this.delayAfter(item));
    },
    revealAll() {
      clearTimeout(this.timer);
      while (this.queue[this.i]) this.advance(true);
      if (S.session.turns) this.finish(); else this.endOfQueue();
      const conv = $("#converge");
      if (!conv.hidden) conv.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "center" });
    },
    suspend() { this.suspended = true; clearTimeout(this.timer); },
    resume() {
      if (!this.suspended) return;
      this.suspended = false;
      if (this.playing && !this.done && !this.awaiting) this.schedule(500);
    },

    keepInView() {
      const last = $("#transcript").lastElementChild;
      if (!last) return;
      const r = last.getBoundingClientRect();
      const limit = window.innerHeight - 100; // stay clear of the controls
      if (r.bottom > limit) window.scrollBy({ top: r.bottom - limit + 16, behavior: reduced() ? "auto" : "smooth" });
    },

    sync() {
      $("#pauseBtn").textContent = this.playing ? "Pause" : "Play";
      $("#pauseBtn").setAttribute("aria-pressed", String(!this.playing));
      const total = this.queue.filter((x) => x.type === "msg").length;
      const seen = this.queue.slice(0, this.i).filter((x) => x.type === "msg").length;
      $("#playerState").textContent = this.awaiting ? "Waiting for the board…"
        : total ? `${seen} of ${total} said${this.playing ? "" : " · paused"}` : "Starting…";
      $("#nextBtn").disabled = this.done || (this.awaiting && !this.queue[this.i]);
    }
  };

  function startDiscussion() {
    if (S.reached >= 2 && player.queue.length) { go("discussion"); return; } // coming back
    S.reached = Math.max(S.reached, 2);
    renderSpeakers();
    player.reset();
    go("discussion");

    if (S.session.mode === "demo") {
      S.session.turns = S.session.demoTurns;
      player.load(toItems(S.session.turns));
      player.schedule(400);
      return;
    }
    player.endOfQueue();
    fetchDiscussion();
  }

  async function fetchDiscussion() {
    const tok = S.token;
    try {
      const turns = await E.discussion(S.idea, S.session.positions);
      if (tok !== S.token) return;
      S.session.turns = turns;
      player.load(toItems(turns));
      // Start the verdict while the person reads. It is usually ready by the end.
      S.session.verdictPromise = E.verdict(S.idea, S.session.positions, turns).then((v) => { if (tok === S.token) S.session.verdict = v; return v; });
    } catch (e) {
      if (tok !== S.token) return;
      S.session.discError = true;
      player.awaiting = false;
      player.clearWait();
      const li = document.createElement("li");
      li.innerHTML = `<div class="notice notice-warn"><p>${esc(errorCopy(e))}</p><div class="notice-actions"><button class="btn btn-primary" data-act="disc-retry">Try again</button><button class="btn btn-ghost" data-act="disc-back">Back to the board</button></div></div>`;
      $("#transcript").appendChild(li);
      $('[data-act="disc-retry"]', li).addEventListener("click", () => { li.remove(); S.session.discError = false; player.endOfQueue(); fetchDiscussion(); });
      $('[data-act="disc-back"]', li).addEventListener("click", () => go("board"));
    }
  }

  function errorCopy(e) {
    switch (e && e.kind) {
      case "timeout": return "The board took too long to respond. Please try again.";
      case "network": return "Could not reach the local server. Is it still running?";
      case "invalid": case "empty": case "thin": return "The debate did not come back properly, so it was not shown. Please try again.";
      case "refusal": return "The AI declined to debate this idea.";
      default: return (e && e.message) || "Something went wrong.";
    }
  }

  function showConverge() {
    const final = E.finalPositions(S.session.positions, S.session.turns);
    const changed = new Set((S.session.turns || []).filter((t) => t.shift).map((t) => t.speaker)).size;
    const leans = Object.values(final).map((f) => f.lean);
    const pro = leans.filter((l) => l > 0).length, con = leans.filter((l) => l < 0).length, mid = leans.length - pro - con;
    const split = [pro && `${pro} ${pro === 1 ? "wants" : "want"} to explore it`, mid && `${mid} ${mid === 1 ? "is" : "are"} on the fence`, con && `${con} ${con === 1 ? "is" : "are"} unconvinced`].filter(Boolean).join(", ");
    $("#convergeSub").textContent = `${changed} ${changed === 1 ? "person" : "people"} changed their mind along the way. They do not all agree: ${split}.`;
    $("#converge").hidden = false;

    const btn = $("#toVerdict");
    const label = `See the verdict <span aria-hidden="true">→</span>`;
    if (S.session.mode === "live" && !S.session.verdict) {
      btn.disabled = true;
      btn.innerHTML = `Writing the verdict<span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>`;
      const tok = S.token;
      (S.session.verdictPromise || Promise.resolve()).then(() => { if (tok === S.token) { btn.disabled = false; btn.innerHTML = label; } });
    } else { btn.disabled = false; btn.innerHTML = label; }
    announce("The board has made up its mind.");
  }

  /* ================= 4 · the verdict ================= */

  let verdictShown = false;

  function resetVerdict() {
    verdictShown = false;
    $$(".v-reveal").forEach((el) => el.classList.remove("in"));
    $("#followups").innerHTML = "";
    $("#angles").innerHTML = "";
    $("#angleOwn").hidden = true;
  }

  function showVerdict() {
    if (S.session.mode === "demo" && !S.session.verdict) S.session.verdict = S.session.demoVerdict;
    if (!S.session.verdict) return;
    S.reached = 3;
    go("verdict");
    if (verdictShown) return;
    verdictShown = true;
    renderVerdict(S.session.verdict);
    revealVerdict();
  }

  function renderVerdict(v) {
    $("#verdict-h").textContent = v.headline;
    $("#vSignal").textContent = v.signal;
    $("#vPartial").hidden = !v.partial;
    $("#vFlaw").textContent = v.fatal_flaw;
    $("#vOpp").textContent = v.hidden_opportunity;
    $("#vBuild").textContent = v.build_first;
    $("#vScore").textContent = v.score == null ? "–" : "0";
    $("#vMeter").innerHTML = Array.from({ length: 10 }, () => "<span></span>").join("");

    $("#vVotes").innerHTML = v.votes.map((vote) => {
      const m = B.get(vote.speaker), p = S.session.positions[vote.speaker];
      const from = p && !p.failed && p.position !== vote.vote ? `<span class="vote-from">Started at “${esc(p.position)}”</span>` : "";
      return `<li class="vote">
        <div class="vote-who">${monoHtml(m)}<span><b>${esc(m.short)}</b><small>${esc(m.role)}</small></span></div>
        <div><span class="chip" data-lean="${vote.missing ? "" : vote.lean}">${esc(vote.vote)}</span>${from}</div>
        <p class="vote-why">${esc(vote.why)}</p></li>`;
    }).join("");

    renderAngles();
  }

  async function revealVerdict() {
    const tok = S.token;
    const blocks = $$(".v-reveal");
    blocks[0].classList.add("in");
    countScore(S.session.verdict.score);
    const gaps = [1200, 500, 500, 700, 500, 400];
    for (let i = 1; i < blocks.length; i++) {
      await wait(gaps[i - 1] || 400);
      if (tok !== S.token || !verdictShown) return;
      blocks[i].classList.add("in");
    }
  }

  function countScore(score) {
    if (score == null) return;
    const el = $("#vScore"), cells = $$("#vMeter span");
    const fill = (val) => cells.forEach((c, i) => { c.classList.toggle("on", i + 1 <= val); c.classList.toggle("half", i + 0.5 === val); });
    if (reduced()) { el.textContent = fmt(score); fill(score); return; }
    const t0 = performance.now(), dur = 1000;
    const step = (now) => {
      const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      const val = Math.round(score * e * 2) / 2;
      el.textContent = fmt(val); fill(val);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    // rAF pauses in background tabs; make sure the real number always lands.
    setTimeout(() => { el.textContent = fmt(score); fill(score); }, dur + 80);
  }
  const fmt = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

  /* ---- follow-ups ---- */

  const LIVE_ANGLES = {
    flaw: { label: "Tackle the biggest risk", question: "What would have to be true for the biggest risk not to matter?" },
    opportunity: { label: "Stress-test the opportunity", question: "Is the hidden opportunity real, or just a good story?" },
    customer: { label: "Ask Jordan directly", question: "Jordan, what would actually make you switch?" }
  };
  const anglesFor = () => (S.session.mode === "demo" ? D.angles : LIVE_ANGLES);

  function renderAngles() {
    const a = anglesFor();
    $("#angles").innerHTML = Object.keys(a).map((id) =>
      `<button class="angle" data-angle="${id}"><b>${esc(a[id].label)}</b><span>${esc(a[id].question)}</span></button>`).join("");
    $("#angleOwn").hidden = S.session.mode !== "live";
  }

  async function runAngle(id, ownQuestion) {
    const tok = S.token;
    const def = ownQuestion ? { question: ownQuestion } : anglesFor()[id];
    const btn = id && $(`[data-angle="${id}"]`);
    if (btn) btn.disabled = true;

    const box = document.createElement("section");
    box.className = "followup";
    box.setAttribute("aria-label", `Follow-up: ${def.question}`);
    box.innerHTML = `<p class="followup-q"><small>Follow-up</small>${esc(def.question)}</p><ol class="fu-list"></ol>`;
    $("#followups").prepend(box);
    box.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
    const list = $(".fu-list", box);

    let result;
    if (S.session.mode === "demo") result = D.angles[id];
    else {
      const w = document.createElement("li");
      w.innerHTML = `<div class="wait"><strong>The board is thinking about this<span class="dots" aria-hidden="true"><i></i><i></i><i></i></span></strong></div>`;
      list.appendChild(w);
      try { result = await E.angle(S.idea, S.session.turns, S.session.verdict, def.question); }
      catch (e) {
        if (tok !== S.token) return;
        w.innerHTML = `<div class="notice notice-warn"><p>${esc(errorCopy(e))}</p><div class="notice-actions"><button class="btn btn-ghost">Try again</button></div></div>`;
        $("button", w).addEventListener("click", () => { box.remove(); runAngle(id, ownQuestion); });
        if (btn) btn.disabled = false;
        return;
      }
      if (tok !== S.token) return;
      w.remove();
    }

    for (const t of result.turns) {
      const m = B.get(t.speaker), to = B.get(t.to);
      const li = document.createElement("li");
      li.innerHTML = `<div class="typing" style="--c:${m.color}">${monoHtml(m)}<span>${esc(m.short)} ${to ? `is replying to ${esc(to.short)}` : "is about to speak"}<span class="dots" aria-hidden="true"><i></i><i></i><i></i></span></span></div>`;
      list.appendChild(li);
      await wait(900);
      if (tok !== S.token) return;
      li.innerHTML = msgHtml(t);
      announce(`${m.short}: ${t.says}`);
      await wait(Math.max(2500, Math.min(6000, words(t.says) * 60)));
      if (tok !== S.token) return;
    }
    if (result.takeaway) {
      const take = document.createElement("p");
      take.className = "takeaway";
      take.innerHTML = `<b>Takeaway</b>${esc(result.takeaway)}`;
      box.appendChild(take);
    }
    if (btn) btn.classList.add("done");
  }

  /* ================= events ================= */

  function bind() {
    $$(".step").forEach((b) => b.addEventListener("click", () => go(b.dataset.go)));
    $$('input[name="mode"]').forEach((r) => r.addEventListener("change", () => { setMode(r.value); hideNotice(); }));

    document.addEventListener("click", (e) => {
      const act = e.target.closest("[data-act]");
      if (act && act.dataset.act === "use-example") {
        setMode("demo"); $("#ideaInput").value = D.IDEA; return begin(D.IDEA);
      }
      if (act && act.dataset.act === "go-live") { setMode("live"); return begin(ideaText()); }
      const open = e.target.closest("[data-open]");
      if (open) return openMember(open.dataset.open);
      const retry = e.target.closest("[data-retry]");
      if (retry) return retrySeat(retry.dataset.retry);
      const angle = e.target.closest("[data-angle]");
      if (angle && !angle.disabled) return runAngle(angle.dataset.angle);
    });

    $("#startBtn").addEventListener("click", startDiscussion);
    $("#pauseBtn").addEventListener("click", () => player.toggle());
    $("#nextBtn").addEventListener("click", () => player.next());
    $("#allBtn").addEventListener("click", () => player.revealAll());
    $("#toVerdict").addEventListener("click", showVerdict);

    $("#revisitBtn").addEventListener("click", () => go("discussion"));
    $("#editBtn").addEventListener("click", () => {
      go("idea");
      const input = $("#ideaInput");
      input.value = S.idea;
      notice("<p>Change what you like, then enter the boardroom again. The board will start fresh.</p>");
      input.focus(); input.setSelectionRange(input.value.length, input.value.length);
    });
    $("#rerunBtn").addEventListener("click", () => {
      setMode(S.session.mode === "live" && S.live.available ? "live" : "demo");
      begin(S.idea);
    });
    $("#angleOwn").addEventListener("submit", (e) => {
      e.preventDefault();
      const q = $("#angleInput").value.trim();
      if (q.length < 6) return;
      $("#angleInput").value = "";
      runAngle(null, q);
    });

    $("#drawerClose").addEventListener("click", closeDrawer);
    $("#drawer").addEventListener("click", (e) => { if (e.target === $("#drawer")) closeDrawer(); });
    $("#drawer").addEventListener("close", () => { if (drawerReturn && document.contains(drawerReturn)) drawerReturn.focus(); });

    document.addEventListener("keydown", (e) => {
      if (S.stage !== "discussion" || player.done || $("#drawer").open) return;
      const tag = (e.target.tagName || "").toLowerCase();
      if (["input", "textarea", "button", "select", "a"].includes(tag)) return;
      if (e.key === " ") { e.preventDefault(); player.toggle(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); player.next(); }
    });
  }

  /* ================= boot ================= */

  initIdea();
  bind();
  renderModeHint();
  checkLive();
  go("idea", { focus: false });

  // Test hook (no behaviour depends on it).
  window.__boardroom = { S, player, go };
})();
