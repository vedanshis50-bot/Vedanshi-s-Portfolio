/* Vedanshi Singh — Interactive Product Design Workspace
   Sections are marked with comments matching index.html's [INTERACTIVE] tags. */

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isNarrowViewport = () => window.innerWidth < 768;

gsap.registerPlugin(ScrollTrigger);

/* ---------------- Custom cursor ---------------- */
(function customCursor() {
  const dot = document.getElementById("cursorDot");
  if (!dot || window.matchMedia("(hover: none), (pointer: coarse)").matches) return;
  window.addEventListener("mousemove", (e) => {
    gsap.to(dot, { x: e.clientX, y: e.clientY, duration: 0.15, ease: "power1.out" });
  });
  const hoverables = "a, button, input, textarea, .think-node";
  document.addEventListener("mouseover", (e) => {
    if (e.target.closest(hoverables)) dot.classList.add("is-hover");
  });
  document.addEventListener("mouseout", (e) => {
    if (e.target.closest(hoverables)) dot.classList.remove("is-hover");
  });
})();

/* ---------------- Theme toggle ---------------- */
(function themeInit() {
  const stored = localStorage.getItem("theme");
  const preferred = stored || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", preferred);
  const toggle = document.getElementById("themeToggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
    });
  }
})();

/* ---------------- Lenis smooth scroll ---------------- */
let lenis;
if (!prefersReducedMotion) {
  lenis = new Lenis({ duration: 1.0, smoothWheel: true });
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.on("scroll", ScrollTrigger.update);
}

/* ---------------- Nav behavior ---------------- */
(function navBehavior() {
  const nav = document.getElementById("siteNav");
  if (!nav) return;
  let lastScroll = 0;
  const onScroll = (scrollY) => {
    if (scrollY > lastScroll && scrollY > 200) nav.classList.add("is-hidden");
    else nav.classList.remove("is-hidden");
    lastScroll = scrollY;
  };
  if (lenis) lenis.on("scroll", (e) => onScroll(e.scroll));
  else window.addEventListener("scroll", () => onScroll(window.scrollY));
})();

/* ---------------- Mobile nav ---------------- */
(function mobileNav() {
  const menuToggle = document.getElementById("menuToggle");
  const mobileNavEl = document.getElementById("mobileNav");
  const closeBtn = document.getElementById("mobileNavClose");
  if (!menuToggle || !mobileNavEl) return;
  const open = () => mobileNavEl.classList.add("is-open");
  const close = () => mobileNavEl.classList.remove("is-open");
  menuToggle.addEventListener("click", open);
  closeBtn && closeBtn.addEventListener("click", close);
  mobileNavEl.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
})();

/* ---------------- Scroll reveal utility ---------------- */
document.querySelectorAll("[data-reveal]").forEach((el) => {
  ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: () => el.classList.add("is-visible") });
});
if (prefersReducedMotion) document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-visible"));

/* ---------------- Stats count-up ---------------- */
document.querySelectorAll(".stat-num").forEach((el) => {
  const target = parseFloat(el.dataset.count);
  const suffix = el.dataset.suffix || "";
  if (prefersReducedMotion) { el.textContent = target + suffix; return; }
  ScrollTrigger.create({
    trigger: el, start: "top 90%", once: true,
    onEnter: () => {
      const obj = { v: 0 };
      gsap.to(obj, { v: target, duration: 1.2, ease: "power2.out", onUpdate: () => (el.textContent = Math.floor(obj.v) + suffix), onComplete: () => (el.textContent = target + suffix) });
    },
  });
});

/* ---------------- Preloader → Opening (debug sequence) ---------------- */
(function preloaderInit() {
  const pre = document.getElementById("preloader");
  const alreadyPlayed = sessionStorage.getItem("openingPlayed");
  if (!pre) return;
  if (alreadyPlayed || prefersReducedMotion) {
    pre.hidden = true;
    const opening = document.getElementById("opening");
    if (opening) opening.hidden = true;
    return;
  }
  setTimeout(() => {
    gsap.to(pre, { opacity: 0, duration: 0.4, onComplete: () => { pre.hidden = true; runOpeningSequence(); } });
  }, 1000);
})();

function runOpeningSequence() {
  const opening = document.getElementById("opening");
  if (!opening) return;
  sessionStorage.setItem("openingPlayed", "1");
  const simplified = isNarrowViewport();
  const loader = document.getElementById("openingLoader");
  const draft = document.getElementById("openingDraft");
  const reveal = document.getElementById("openingReveal");
  const strike = document.getElementById("openingStrike");
  const line1 = document.getElementById("revealLine1");
  const line2 = document.getElementById("revealLine2");

  const tl = gsap.timeline({ onComplete: () => { opening.hidden = true; } });
  const counter = { v: 0 };
  tl.to(counter, { v: 100, duration: 0.45, onUpdate: () => (loader.textContent = `LOADING · ${Math.floor(counter.v)}%`) });
  tl.to(loader, { opacity: 0, duration: 0.2 });
  tl.from(draft, { opacity: 0, y: 16, duration: 0.5 }, "-=0.1");

  if (!simplified) {
    tl.to("#annEvidence", { opacity: 1, duration: 0.3 }, "+=0.4");
    tl.to("#annSoWhat", { opacity: 1, duration: 0.3 }, "+=0.3");
    tl.to({}, { duration: 0.4 });
  } else {
    tl.to({}, { duration: 0.5 });
  }

  tl.to(strike, { width: "100%", duration: 0.5, ease: "power2.inOut" }, "+=0.1");
  tl.to(draft, { opacity: 0, y: -16, duration: 0.4 }, "+=0.15");
  tl.set(draft, { display: "none" });
  tl.to(line1, { opacity: 1, duration: 0.6 });
  tl.to({}, { duration: 1.0 });
  tl.to(line2, { opacity: 1, duration: 0.6 });
  tl.to({}, { duration: simplified ? 0.9 : 1.2 });
  tl.to(reveal, { opacity: 0, duration: 0.5 });
}

/* ============================================================
   [INTERACTIVE — WOW #1] HERO: CHAOS → STRUCTURE
   ============================================================ */
(function chaosHero() {
  const trigger = document.getElementById("chaosTrigger");
  const board = document.getElementById("chaosBoard");
  if (!trigger || !board) return;
  const pieces = board.querySelectorAll(".chaos-piece");
  const caption = document.getElementById("chaosCaption");
  const structure = document.getElementById("chaosStructure");
  const conclusion = document.getElementById("chaosConclusion");

  function run() {
    trigger.setAttribute("disabled", "true");
    const tl = gsap.timeline();
    tl.to(caption, { opacity: 1, duration: 0.4 });
    tl.to({}, { duration: 1.0 });
    tl.to(caption, { opacity: 0, duration: 0.35 });
    tl.call(() => {
      pieces.forEach((p) => {
        if (p.dataset.role === "irrelevant") p.classList.add("is-fading");
        else p.classList.add("is-gathering");
      });
    });
    tl.to({}, { duration: 0.85 });
    tl.call(() => structure.classList.add("is-visible"));
    tl.to({}, { duration: 0.9 });
    tl.call(() => conclusion.classList.add("is-visible"));
  }

  trigger.addEventListener("click", run);
  // Auto-run once the hero scrolls into view, so the point lands even if no one clicks.
  ScrollTrigger.create({ trigger: board, start: "top 75%", once: true, onEnter: () => setTimeout(run, 500) });
})();

/* ============================================================
   [INTERACTIVE — WOW #2] FINDER WORKSPACE — EXPLORE THE WORK
   Edit PROJECTS below to update project data.
   ============================================================ */
const PROJECTS = {
  leadrat: {
    tags: ["B2B", "CRM", "Systems"],
    question: "How do you make complex lead assignment configurable?",
    role: "Sole Designer",
    collab: "PM + Engineering",
    keywords: ["RULES", "CONFIGURATION", "WORKFLOWS", "EDGE CASES"],
    link: "work-leadrat.html",
    hasWorkspace: true,
  },
  lastmile: {
    tags: ["Physical World", "Routing"],
    question: "[ADD REAL PROBLEM STATEMENT FOR LAST MILE]",
    role: "[Add role]",
    collab: "[Add collaborators]",
    keywords: ["MAPPING", "MOVEMENT", "TRADE-OFFS"],
    link: null,
    placeholder: true,
  },
  boardroom: {
    tags: ["AI Product", "Decision Design"],
    question: "Why do bad ideas survive meetings?",
    role: "Personal project",
    collab: "Self-directed",
    keywords: ["GROUPTHINK", "ANONYMITY", "DECISIONS"],
    link: "work-boardroom-ai.html",
  },
  margin: {
    tags: ["Fintech", "Behavioral"],
    question: "Why can't people tell if they can afford something?",
    role: "Personal project",
    collab: "Self-directed",
    keywords: ["CONFIDENCE", "BEHAVIOR", "DECISIONS"],
    link: "work-margin.html",
  },
};

(function finderWorkspace() {
  const grid = document.getElementById("finderGrid");
  const preview = document.getElementById("finderPreview");
  if (!grid || !preview) return;

  function render(key) {
    const p = PROJECTS[key];
    grid.querySelectorAll(".finder-folder").forEach((f) => f.classList.toggle("is-active", f.dataset.project === key));

    const tagsHtml = p.tags.map((t) => `<span class="chip">${t}</span>`).join("");
    const keywordsHtml = p.keywords.map((k) => `<span>${k}</span>`).join("");
    const actions = [];
    if (p.hasWorkspace) actions.push(`<a href="#leadrat-workspace" class="btn btn-primary btn-sm">Try the interactive system ↓</a>`);
    if (p.link) actions.push(`<a href="${p.link}" class="btn btn-outline btn-sm">Open case study →</a>`);

    preview.innerHTML = `
      <div class="preview-card">
        <div class="work-tags">${tagsHtml}</div>
        <h3>${p.question}</h3>
        <div class="meta-row">
          <div>Role<strong>${p.role}</strong></div>
          <div>Collaboration<strong>${p.collab}</strong></div>
        </div>
        <div class="preview-keywords">${keywordsHtml}</div>
        <div class="preview-actions">${actions.join("")}</div>
        ${p.placeholder ? `<p class="preview-placeholder-note">Case study in progress — add real project details here.</p>` : ""}
      </div>`;
  }

  grid.querySelectorAll(".finder-folder").forEach((folder) => {
    folder.addEventListener("click", () => render(folder.dataset.project));
  });
})();

/* ============================================================
   [INTERACTIVE] LEADRAT WORKSPACE — config, context, sim, validation
   ============================================================ */

/* Decision-moment annotation flip */
(function stickyAnnotation() {
  const note = document.getElementById("stickyAnnotation");
  if (!note) return;
  note.addEventListener("click", () => note.classList.toggle("is-open"));
})();

/* Configuration model — click-through progressive disclosure */
(function configModel() {
  const groups = [...document.querySelectorAll(".config-row[data-row]"), document.getElementById("additionalRules")].filter(Boolean);
  groups.forEach((group) => {
    const options = group.querySelectorAll(".config-option");
    const detail = group.querySelector(".config-detail");
    if (!detail) return;
    options.forEach((opt) => {
      opt.addEventListener("click", () => {
        options.forEach((o) => o.classList.remove("is-selected"));
        opt.classList.add("is-selected");
        detail.textContent = opt.dataset.detail;
        detail.classList.add("is-visible");
        if (opt.dataset.scrollHint) {
          document.getElementById("simCard")?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
    });
  });

  const rulesToggle = document.getElementById("rulesToggle");
  const additionalRules = document.getElementById("additionalRules");
  if (rulesToggle && additionalRules) {
    rulesToggle.addEventListener("click", () => {
      const isOpen = additionalRules.classList.toggle("is-open");
      rulesToggle.setAttribute("aria-expanded", String(isOpen));
      rulesToggle.firstChild.textContent = isOpen ? "Hide additional rules " : "Show additional rules ";
    });
  }
})();

/* Assignment context switch — PLACEHOLDER preview frame; swap in real screenshots when available */
(function contextSwitch() {
  const CONTEXT_PREVIEWS = {
    user: "[ Add real screenshot — User assignment view ]",
    team: "[ Add real screenshot — Team assignment view ]",
    property: "[ Add real screenshot — Property assignment view ]",
    project: "[ Add real screenshot — Project assignment view ]",
  };
  const buttons = document.querySelectorAll(".context-option");
  const previewEl = document.getElementById("contextPreview");
  if (!buttons.length || !previewEl) return;
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("is-selected"));
      btn.classList.add("is-selected");
      previewEl.textContent = CONTEXT_PREVIEWS[btn.dataset.context];
    });
  });
})();

/* [WOW #3] Percentage assignment simulation — deficit-based distribution.
   This is a simplified portfolio demonstration, not a claim about Leadrat's production code. */
(function percentageSimulation() {
  const agentsEl = document.getElementById("simAgents");
  if (!agentsEl) return;
  const state = { A: { pct: 50, count: 0 }, B: { pct: 30, count: 0 }, C: { pct: 20, count: 0 } };
  let totalLeads = 0;
  const log = document.getElementById("simLog");

  agentsEl.querySelectorAll(".sim-agent").forEach((el) => {
    const name = el.dataset.agent;
    el.querySelector(".target").textContent = state[name].pct + "%";
  });

  function assignNext() {
    totalLeads++;
    let best = null, bestDeficit = -Infinity;
    for (const name in state) {
      const a = state[name];
      const target = (a.pct / 100) * totalLeads;
      const deficit = target - a.count;
      if (deficit > bestDeficit) { bestDeficit = deficit; best = name; }
    }
    state[best].count++;
    return best;
  }

  function render(lastAssigned) {
    Object.keys(state).forEach((name) => {
      const pct = totalLeads ? Math.round((state[name].count / totalLeads) * 100) : 0;
      const fill = agentsEl.querySelector(`.sim-bar-fill[data-fill="${name}"]`);
      if (fill) fill.style.width = pct + "%";
      const countEl = agentsEl.querySelector(`[data-count-for="${name}"]`);
      if (countEl) countEl.textContent = `${state[name].count} lead${state[name].count === 1 ? "" : "s"}`;
    });
    if (lastAssigned) {
      log.textContent = `LEAD ${String(totalLeads).padStart(2, "0")} → Agent ${lastAssigned}`;
    }
  }

  document.getElementById("simNext")?.addEventListener("click", () => render(assignNext()));

  document.getElementById("simTen")?.addEventListener("click", () => {
    let i = 0;
    const step = () => {
      if (i >= 10) return;
      render(assignNext());
      i++;
      setTimeout(step, 120);
    };
    step();
  });

  document.getElementById("simReset")?.addEventListener("click", () => {
    Object.keys(state).forEach((name) => (state[name].count = 0));
    totalLeads = 0;
    log.textContent = "Ready — send a lead to begin.";
    render(null);
  });

  render(null);
})();

/* [WOW #4] Live validation — total must equal 100% before Save enables */
(function validationForm() {
  const inputs = { A: document.getElementById("valA"), B: document.getElementById("valB"), C: document.getElementById("valC") };
  const totalEl = document.getElementById("valTotal");
  const msgEl = document.getElementById("valMsg");
  const saveBtn = document.getElementById("valSave");
  if (!inputs.A || !saveBtn) return;

  function recompute() {
    const sum = ["A", "B", "C"].reduce((acc, k) => acc + (parseFloat(inputs[k].value) || 0), 0);
    totalEl.textContent = sum;
    const valid = sum === 100;
    totalEl.classList.toggle("is-valid", valid);
    totalEl.classList.toggle("is-invalid", !valid);
    msgEl.textContent = valid ? "— ready to save" : "— total must equal 100%";
    saveBtn.disabled = !valid;
  }

  Object.values(inputs).forEach((el) => el.addEventListener("input", recompute));
  saveBtn.addEventListener("click", () => {
    const original = saveBtn.textContent;
    saveBtn.textContent = "Saved ✓";
    setTimeout(() => (saveBtn.textContent = original), 1400);
  });

  recompute();
})();

/* ============================================================
   [INTERACTIVE — WOW #5] HOW I THINK — radial steps + project-specific process
   ============================================================ */
const THINK_STEPS = {
  conversation: "Talking to the people who feel the problem first.",
  observation: "Watching what people actually do, not what they say.",
  research: "Learning what's already been tried, and why it failed.",
  mapping: "Drawing the system before drawing a screen.",
  prototype: "Making the idea touchable enough to break.",
  critique: "Inviting the parts that don't work to show themselves.",
  decision: "Choosing, on purpose, and writing down why.",
};

(function thinkRadial() {
  const nodes = document.querySelectorAll(".think-node");
  const detail = document.getElementById("thinkDetail");
  if (!nodes.length || !detail) return;
  nodes.forEach((node) => {
    node.addEventListener("click", () => {
      nodes.forEach((n) => n.classList.remove("is-active"));
      node.classList.add("is-active");
      const key = node.dataset.step;
      detail.innerHTML = `<h3 class="think-detail-title">${node.textContent}</h3><p class="lede">${THINK_STEPS[key]}</p>`;
    });
  });
})();

const PROCESS_PATHS = {
  leadrat: ["Requirements", "System mapping", "Configuration", "Interaction", "Validation"],
  lastmile: ["Observation", "Problem framing", "Competitor analysis", "Concept", "Testing"],
  boardroom: ["Question", "AI exploration", "Interaction model", "Prototype", "Critique"],
};

(function processTabs() {
  const tabs = document.querySelectorAll(".process-tab");
  const pathEl = document.getElementById("processPath");
  if (!tabs.length || !pathEl) return;

  function renderPath(key) {
    pathEl.innerHTML = PROCESS_PATHS[key]
      .map((step, i) => `<span class="process-step">${step}</span>${i < PROCESS_PATHS[key].length - 1 ? '<span class="process-arrow">→</span>' : ""}`)
      .join("");
    requestAnimationFrame(() => {
      pathEl.querySelectorAll(".process-step").forEach((el, i) => {
        setTimeout(() => el.classList.add("is-visible"), i * 90);
      });
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("is-active"));
      tab.classList.add("is-active");
      renderPath(tab.dataset.process);
    });
  });

  renderPath("leadrat");
})();

/* ============================================================
   [INTERACTIVE] ABOUT — journey tabs
   ============================================================ */
(function journeyTabs() {
  const tabs = document.querySelectorAll(".journey-tab");
  const panels = document.querySelectorAll(".journey-panel");
  if (!tabs.length) return;
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("is-active"));
      panels.forEach((p) => p.classList.remove("is-active"));
      tab.classList.add("is-active");
      document.querySelector(`.journey-panel[data-panel="${tab.dataset.journey}"]`)?.classList.add("is-active");
    });
  });
})();

/* ============================================================
   [INTERACTIVE — WOW #6] AI AS A SPARRING PARTNER
   Illustrative example — replace SPARRING_LINES with a real exchange when available.
   ============================================================ */
const SPARRING_LINES = [
  { who: "me", text: "Argue against this design decision." },
  { who: "ai", text: "You may be assuming every agent should be treated equally." },
  { who: "me", text: "But the actual constraint is: some agents already have more open leads than others." },
  { who: "ai", text: "Then the question becomes — should the system balance by percentage, or by current load?" },
  { who: "me", text: "That's what changed." },
];

(function aiSparring() {
  const log = document.getElementById("sparringLog");
  const btn = document.getElementById("sparringNext");
  const changed = document.getElementById("sparringChanged");
  if (!log || !btn) return;
  let i = 0;

  function appendLine(line) {
    const div = document.createElement("div");
    div.className = `sparring-line ${line.who}`;
    div.innerHTML = `<span class="who">${line.who === "me" ? "Me" : "AI"}</span>${line.text}`;
    log.appendChild(div);
    requestAnimationFrame(() => div.classList.add("is-visible"));
  }

  appendLine(SPARRING_LINES[0]);
  i = 1;

  btn.addEventListener("click", () => {
    if (i >= SPARRING_LINES.length) return;
    appendLine(SPARRING_LINES[i]);
    i++;
    if (i >= SPARRING_LINES.length) {
      btn.style.display = "none";
      changed.classList.add("is-visible");
    } else {
      btn.textContent = i % 2 === 0 ? "Continue →" : "Respond →";
    }
  });
})();

/* ============================================================
   [INTERACTIVE] THINGS I WAS WRONG ABOUT — flip cards
   ============================================================ */
(function flipCards() {
  document.querySelectorAll(".flip-card button").forEach((btn) => {
    btn.addEventListener("click", () => btn.closest(".flip-card").classList.toggle("is-flipped"));
  });
})();

/* ============================================================
   [INTERACTIVE] CONTACT — terminal input
   ============================================================ */
(function terminalContact() {
  const input = document.getElementById("terminalInput");
  const response = document.getElementById("terminalResponse");
  const linesWrap = document.querySelector(".terminal-body-lines");
  if (!input || !response) return;
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && input.value.trim()) {
      const echo = document.createElement("div");
      echo.className = "terminal-line-static";
      echo.style.color = "var(--dark-text)";
      echo.textContent = "~ $ " + input.value.trim();
      linesWrap.insertBefore(echo, input.closest(".terminal-input-row"));
      input.value = "";
      response.classList.add("is-visible");
    }
  });
})();
