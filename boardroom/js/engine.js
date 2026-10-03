/* Boardroom — the engine.
   Designs the AI behaviour (prompts + output schemas), calls the local proxy, and turns whatever
   comes back into data the UI can trust. The UI never sees raw model text.

   Pipeline (live mode):
     1. first reactions  six independent calls, one per seat, so nobody anchors on anyone else
     2. debate           one call that sees all six reactions and must make the seats argue with each other
     3. verdict          one call over the transcript: score, biggest risk, opportunity, first step, votes
     4. follow-up        optional extra round on a question the person picks after the verdict

   The proxy (server.mjs) holds the API key. Nothing secret lives in the browser. */
(function () {
  const BR = (window.BR = window.BR || {});
  const B = BR.board;

  const API = "api/";
  const TIMEOUT_MS = 150000;

  /* ---------- schemas (strict JSON schema: every object closed, every field required) ---------- */

  const obj = (properties) => ({ type: "object", properties, required: Object.keys(properties), additionalProperties: false });
  const str = { type: "string" };
  const int = { type: "integer" };
  const speakerEnum = { type: "string", enum: B.ids };
  const targetEnum = { type: "string", enum: B.ids.concat("room") };
  const stanceEnum = { type: "string", enum: Object.keys(B.STANCES) };

  const POSITION_SCHEMA = obj({
    position: str, lean: int, confidence: { type: "string", enum: ["low", "medium", "high"] },
    headline: str, key_concern: str, key_assumption: str, reasoning: str
  });

  const TURN = obj({
    stage: { type: "string", enum: B.STAGES.map((s) => s.id) },
    speaker: speakerEnum, to: targetEnum, stance: stanceEnum, says: str,
    shift_position: str, shift_lean: int, shift_why: str
  });
  const DISCUSSION_SCHEMA = obj({ turns: { type: "array", items: TURN } });

  const VERDICT_SCHEMA = obj({
    score: { type: "number" }, headline: str, signal: str,
    fatal_flaw: str, hidden_opportunity: str, build_first: str,
    votes: { type: "array", items: obj({ speaker: speakerEnum, vote: str, lean: int, why: str }) }
  });

  const ANGLE_TURN = obj({ speaker: speakerEnum, to: targetEnum, stance: stanceEnum, says: str });
  const ANGLE_SCHEMA = obj({ turns: { type: "array", items: ANGLE_TURN }, takeaway: str });

  /* ---------- prompts ---------- */

  const rulesBlock = () =>
    "BOARDROOM RULES\n" + B.RULES.map((r, i) => `${i + 1}. ${r}`).join("\n") + "\n\n" + B.PRINCIPLE;

  const memberBlock = (m) =>
    `${m.name} (${m.role}, id "${m.id}"). Lens: ${m.lens}. Core question: "${m.question}"\n` +
    `Thinks about: ${m.thinks.join("; ")}.\nChallenges: ${m.challenges.join("; ")}.\n` +
    `Voice: ${m.voice}\nGuardrail: ${m.guard}`;

  const leanGuide =
    "an integer from -2 to 2: -2 against, -1 unconvinced or blocked, 0 undecided or conditional, 1 explore, 2 pursue";

  const voice =
    "Write like a real person talking in a meeting: plain everyday words, no jargon, no bullet points. " +
    "Someone with no business background should understand every sentence.";

  function positionPrompt(member, idea) {
    return {
      system:
        `You are one seat on Boardroom, a six-person debate that pressure-tests ideas before anyone builds them.\n\n` +
        `YOUR SEAT\n${memberBlock(member)}\n\n${rulesBlock()}\n\n` +
        `Right now you are giving your FIRST REACTION alone, before hearing anyone else. Stay inside your lens. ${voice}`,
      prompt:
        `The idea:\n"""${idea}"""\n\nGive your first reaction.\n` +
        `- position: 1–4 words, e.g. "Explore", "Cautious", "Blocked", "Needs evidence", "Unconvinced", "Potential".\n` +
        `- lean: ${leanGuide}.\n- headline: one sentence, under 16 words.\n` +
        `- key_concern and key_assumption: one short sentence each.\n- reasoning: 2 sentences, specific to this idea.`,
      schema: POSITION_SCHEMA, max_tokens: 6000
    };
  }

  function discussionPrompt(idea, positions) {
    const seats = B.MEMBERS.map((m) => {
      const p = positions[m.id];
      const first = p && !p.failed ? `First reaction: ${p.position}. "${p.headline}"` : "First reaction: unavailable. Do not give this seat any turns.";
      return memberBlock(m) + "\n" + first;
    }).join("\n\n");

    return {
      system:
        `You write the Boardroom debate: six people with different priorities arguing about one idea, ` +
        `so the person who brought it can think more clearly before deciding.\n\n${rulesBlock()}\n\n` +
        `This must read as ONE real argument, not six separate opinions. Every turn after the first replies to a specific ` +
        `earlier turn (set "to" to that seat's id) and refers to that person by first name.\n\n` +
        `THREE PARTS, in order:\n` +
        `- "debate" (5–7 turns): someone opens; others push back. The key disagreement becomes clear. Include exactly one ` +
        `direct question: a turn with stance "cross_q", followed immediately by the challenged person answering with stance "cross_a" ` +
        `(honestly, conceding if the point lands).\n` +
        `- "dig" (4–6 turns): test the weak assumptions, suggest cheaper ways to learn, and let an opportunity the person did NOT ` +
        `pitch come out of something said in the debate.\n` +
        `- "wrap" (2–3 turns): agree what to test or learn next. Do not force agreement; someone may still disagree.\n\n` +
        `EACH TURN: "says" is what that person says out loud: 4–5 full sentences, 60–90 words. Make a real argument with a ` +
        `concrete example or reason, not a one-liner. ${voice}\n\n` +
        `CHANGING MINDS: when an argument really lands, the speaker's view changes. Set shift_position (1–4 words), ` +
        `shift_lean (${leanGuide}) and shift_why (one short sentence). Otherwise set shift_position "", shift_why "", shift_lean 0. ` +
        `Aim for 3–5 changes in total. Not everyone should end up agreeing.\n\n` +
        `12–16 turns in total. Everyone with a first reaction speaks at least twice.`,
      prompt: `The idea:\n"""${idea}"""\n\nTHE SIX AND THEIR FIRST REACTIONS\n${seats}\n\nWrite the debate.`,
      schema: DISCUSSION_SCHEMA, max_tokens: 16000
    };
  }

  const transcriptOf = (turns) =>
    turns.map((t) => {
      const m = B.get(t.speaker), to = t.to !== "room" && B.get(t.to);
      return `${m.name} (${m.role})${to ? " → " + to.short : ""}: ${t.says}` + (t.shift ? `  {now: ${t.shift.position}}` : "");
    }).join("\n\n");

  function verdictPrompt(idea, positions, turns) {
    const firsts = B.MEMBERS.map((m) => `${m.short}: ${positions[m.id] && !positions[m.id].failed ? positions[m.id].position : "no reaction"}`).join("; ");
    return {
      system:
        `You write the Boardroom verdict after a six-person debate. The person's question now is "OK, what should I do next?", ` +
        `so do NOT summarise the debate. ${B.PRINCIPLE} ${voice}\n\n` +
        `- score: 0–10 in steps of 0.5. How strongly THIS debate supports going ahead with the idea as described. A signal, not a prediction.\n` +
        `- headline: under 8 words, specific to this idea. signal: one sentence on where the board landed.\n` +
        `- fatal_flaw: the single biggest risk, one sentence.\n` +
        `- hidden_opportunity: the most valuable thing that came up that the person did not pitch, 1–2 sentences.\n` +
        `- build_first: the first small, concrete thing to test or build, one sentence.\n` +
        `- votes: one per seat, where they ENDED, not where they started. vote is 1–4 words. lean is ${leanGuide}. why is under 12 words. Don't force agreement.`,
      prompt: `Idea:\n"""${idea}"""\n\nFirst reactions: ${firsts}\n\nDebate:\n${transcriptOf(turns)}\n\nWrite the verdict.`,
      schema: VERDICT_SCHEMA, max_tokens: 8000
    };
  }

  function anglePrompt(idea, turns, v, question) {
    return {
      system:
        `You continue a Boardroom debate with a short extra round on one follow-up question.\n\n${rulesBlock()}\n\n` +
        `3–4 turns from the people most relevant to the question. They reply to each other by first name. ` +
        `Each "says" is 3–4 full sentences, 50–80 words. ${voice} takeaway: one sentence with the new insight.`,
      prompt:
        `Idea:\n"""${idea}"""\n\nVerdict so far: ${v.signal} Biggest risk: ${v.fatal_flaw} Opportunity: ${v.hidden_opportunity} First step: ${v.build_first}\n\n` +
        `Debate so far:\n${transcriptOf(turns)}\n\nFollow-up question: "${question}"`,
      schema: ANGLE_SCHEMA, max_tokens: 8000
    };
  }

  /* ---------- transport ---------- */

  class BoardError extends Error {
    constructor(kind, message) { super(message); this.kind = kind; }
  }

  async function status() {
    try {
      const res = await fetchWithTimeout(API + "status", {}, 4000);
      if (!res.ok) return { live: false, reason: "no-server" };
      const data = await res.json();
      return data && data.live ? { live: true, model: data.model } : { live: false, reason: (data && data.reason) || "no-key" };
    } catch (e) {
      return { live: false, reason: "no-server" };
    }
  }

  async function fetchWithTimeout(url, opts, ms) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), ms);
    try { return await fetch(url, Object.assign({}, opts, { signal: ctrl.signal })); }
    finally { clearTimeout(timer); }
  }

  async function generate(req) {
    let res;
    try {
      res = await fetchWithTimeout(API + "generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system: req.system, prompt: req.prompt, schema: req.schema, max_tokens: req.max_tokens })
      }, TIMEOUT_MS);
    } catch (e) {
      throw new BoardError(e.name === "AbortError" ? "timeout" : "network", "The board didn't respond.");
    }
    let body = null;
    try { body = await res.json(); } catch (e) { /* handled below */ }
    if (!res.ok) throw new BoardError((body && body.error) || "api", (body && body.message) || `Request failed (${res.status}).`);
    if (!body || typeof body.text !== "string" || !body.text.trim()) throw new BoardError("empty", "The board returned nothing.");
    const parsed = parseJSON(body.text);
    if (!parsed) throw new BoardError("invalid", "The board's answer wasn't readable.");
    return parsed;
  }

  /* Tolerant JSON: strips fences and stray prose, takes the outermost object. */
  function parseJSON(text) {
    if (text && typeof text === "object") return text;
    const s = String(text || "").replace(/```(?:json)?/gi, "").trim();
    try { return JSON.parse(s); } catch (e) { /* fall through */ }
    const a = s.indexOf("{"), b = s.lastIndexOf("}");
    if (a !== -1 && b > a) { try { return JSON.parse(s.slice(a, b + 1)); } catch (e) { /* fall through */ } }
    return null;
  }

  /* ---------- normalisation: never let one bad field break the room ---------- */

  const clean = (v, max) => {
    const s = typeof v === "string" ? v.replace(/\s+/g, " ").trim() : "";
    return max && s.length > max ? s.slice(0, max - 1).replace(/\s+\S*$/, "") + "…" : s;
  };

  function normalisePosition(raw) {
    if (!raw || typeof raw !== "object") return null;
    const headline = clean(raw.headline, 200);
    if (!headline) return null;
    return {
      position: clean(raw.position, 40) || B.LEAN_LABELS[String(B.clampLean(raw.lean))],
      lean: B.clampLean(raw.lean),
      confidence: ["low", "medium", "high"].includes(raw.confidence) ? raw.confidence : "medium",
      headline,
      key_concern: clean(raw.key_concern, 200) || "Not stated.",
      key_assumption: clean(raw.key_assumption, 200) || "Not stated.",
      reasoning: clean(raw.reasoning, 600)
    };
  }

  const STAGE_ORDER = B.STAGES.map((s) => s.id);

  function normaliseTurns(rawTurns, { withStage = true } = {}) {
    if (!Array.isArray(rawTurns)) return [];
    const seen = new Set();
    let lastStage = 0;
    const out = [];
    rawTurns.forEach((r, i) => {
      if (!r || typeof r !== "object") return;
      if (!B.get(r.speaker)) return;                         // unknown seat: drop
      const says = clean(r.says, 1100);
      if (!says) return;                                    // empty turn: drop
      const key = says.toLowerCase().replace(/[^a-z]/g, "").slice(0, 80);
      if (seen.has(key)) return;                            // duplicate: drop
      seen.add(key);
      const t = {
        speaker: r.speaker,
        to: B.get(r.to) && r.to !== r.speaker ? r.to : "room",
        stance: B.STANCES[r.stance] ? r.stance : "builds_on",
        says
      };
      if (t.stance === "opens" && out.length) t.stance = t.to === "room" ? "reframes" : "builds_on"; // only the first turn opens
      if (t.to === "room" && B.STANCES[t.stance].target) t.stance = t.stance === "cross_q" || t.stance === "cross_a" ? "questions" : "reframes";
      if (withStage) {
        let idx = STAGE_ORDER.indexOf(r.stage);
        if (idx < 0) idx = Math.min(STAGE_ORDER.length - 1, Math.floor((i / Math.max(1, rawTurns.length)) * STAGE_ORDER.length));
        if (idx < lastStage) idx = lastStage;              // parts never go backwards
        lastStage = idx;
        t.stage = STAGE_ORDER[idx];
      }
      const sp = clean(r.shift_position || (r.shift && r.shift.position), 40);
      if (sp) t.shift = { position: sp, lean: B.clampLean(r.shift_lean != null ? r.shift_lean : r.shift && r.shift.lean), why: clean(r.shift_why || (r.shift && r.shift.why), 200) };
      out.push(t);
    });
    // An answer without its question reads as a non sequitur: make it an ordinary reply.
    out.forEach((t, i) => { if (t.stance === "cross_a" && !(out[i - 1] && out[i - 1].stance === "cross_q")) t.stance = "builds_on"; });
    return out;
  }

  const FALLBACK_TEXT = "This didn't come through clearly in the debate.";

  function normaliseVerdict(raw, positions, turns) {
    const v = raw && typeof raw === "object" ? raw : {};
    let score = Number(v.score);
    score = Number.isFinite(score) ? Math.max(0, Math.min(10, Math.round(score * 2) / 2)) : null;

    const final = finalPositions(positions, turns);
    const votesIn = Array.isArray(v.votes) ? v.votes : [];
    const votes = B.MEMBERS.map((m) => {
      const r = votesIn.find((x) => x && x.speaker === m.id);
      const f = final[m.id];
      if (r && clean(r.vote)) return { speaker: m.id, vote: clean(r.vote, 40), lean: B.clampLean(r.lean), why: clean(r.why, 160) || (f && f.why) || "" };
      if (f) return { speaker: m.id, vote: f.position, lean: f.lean, why: f.why || "" };
      return { speaker: m.id, vote: "No vote", lean: 0, why: "Didn't take part.", missing: true };
    });

    const missingCore = ["fatal_flaw", "hidden_opportunity", "build_first"].filter((k) => !clean(v[k])).length;
    return {
      score,
      partial: missingCore >= 2,
      headline: clean(v.headline, 90) || "The board has a view.",
      signal: clean(v.signal, 240),
      fatal_flaw: clean(v.fatal_flaw, 400) || FALLBACK_TEXT,
      hidden_opportunity: clean(v.hidden_opportunity, 500) || FALLBACK_TEXT,
      build_first: clean(v.build_first, 400) || FALLBACK_TEXT,
      votes
    };
  }

  /* Where each seat ended up: its first reaction, overridden by its last change of mind. */
  function finalPositions(positions, turns) {
    const out = {};
    B.MEMBERS.forEach((m) => {
      const p = positions[m.id];
      if (p && !p.failed) out[m.id] = { position: p.position, lean: p.lean, why: p.key_concern };
    });
    (turns || []).forEach((t) => { if (t.shift) out[t.speaker] = { position: t.shift.position, lean: t.shift.lean, why: t.shift.why }; });
    return out;
  }

  /* ---------- public API ---------- */

  /* Six seats in parallel. onSeat(id, position|{failed}) fires as each one lands. */
  async function positions(idea, onSeat) {
    const result = {};
    await Promise.all(B.MEMBERS.map(async (m) => {
      result[m.id] = await seat(m, idea);
      onSeat && onSeat(m.id, result[m.id]);
    }));
    return result;
  }

  async function seat(member, idea) {
    try {
      const p = normalisePosition(await generate(positionPrompt(member, idea)));
      return p || { failed: true, error: "invalid" };
    } catch (e) {
      return { failed: true, error: e.kind || "api" };
    }
  }

  async function discussion(idea, pos) {
    const raw = await generate(discussionPrompt(idea, pos));
    const present = B.ids.filter((id) => pos[id] && !pos[id].failed);
    const turns = normaliseTurns(raw.turns).filter((t) => present.includes(t.speaker));
    if (turns.length < 5) throw new BoardError("thin", "The debate came back too thin to be useful.");
    return turns;
  }

  async function verdict(idea, pos, turns) {
    try {
      return normaliseVerdict(await generate(verdictPrompt(idea, pos, turns)), pos, turns);
    } catch (e) {
      // Without a verdict call, the debate's own changes of mind still give us the votes. Flag it honestly.
      const v = normaliseVerdict(null, pos, turns);
      v.partial = true;
      return v;
    }
  }

  async function angle(idea, turns, v, question) {
    const raw = await generate(anglePrompt(idea, turns, v, question));
    const t = normaliseTurns(raw.turns, { withStage: false });
    if (t.length < 2) throw new BoardError("thin", "The follow-up came back too thin.");
    return { question, turns: t, takeaway: clean(raw.takeaway, 300) };
  }

  BR.engine = {
    status, positions, seat, discussion, verdict, angle,
    finalPositions, normaliseTurns, normaliseVerdict, normalisePosition, parseJSON, BoardError,
    prompts: { positionPrompt, discussionPrompt, verdictPrompt, anglePrompt }
  };
})();
