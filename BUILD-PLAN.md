# BUILD PLAN — Vedanshi Singh — Product Designer Portfolio

**Prepared as a creative brief + implementation spec for Claude Code**
**Status:** Awaiting approval before build

---

## 1. WEBSITE OVERVIEW

| | |
|---|---|
| **Name** | Vedanshi Singh |
| **Type** | Product / UX / UI Design Portfolio |
| **Purpose** | Establish Vedanshi as a thoughtful, systems-minded product designer; showcase case studies, interaction/UX craft, and product thinking; drive recruiters and collaborators to contact her |
| **Audience** | Hiring managers, design leads, recruiters, potential collaborators/founders |
| **Primary action** | Get in touch (email / contact form) |
| **Secondary action** | View résumé/CV |
| **Tone** | Minimal, confident, editorial, human — never flashy or generic |

---

## 2. CORE POSITIONING

**One-liner:**
> Vedanshi Singh helps teams turn complex product problems into simple, scalable, user-friendly experiences.

**Positioning statement:**
Vedanshi is a product designer who treats complexity as the starting material, not the obstacle. Trained originally in architecture — where structure, space, and human movement through a system are the whole discipline — she brings that same spatial, structural thinking to digital products. Over 4+ years she has moved from shaping individual screens to owning full product systems, currently designing core CRM workflows (lead management, distribution, forms, automation) at Leadrat. Her differentiator isn't visual polish alone; it's the ability to understand *why* a system is complicated before she attempts to simplify it.

**Positioning pillars:**
1. **Systems thinking over screen thinking** — she designs workflows and architectures, not just interfaces.
2. **Curiosity-led process** — she maps and questions before she redesigns.
3. **Business + user balance** — she designs for adoption and scale, not just usability scores.

---

## 3. BRAND PERSONALITY

- **Minimal** — nothing on the page without a reason.
- **Modern** — contemporary type, restrained motion, no dated skeuomorphism.
- **Thoughtful** — copy and layout that reward slow reading; no filler.
- **Confident** — bold typographic statements, generous whitespace, no hedging language.
- **Approachable / human** — warm textures and tone keep it from feeling cold or corporate.
- **Slightly experimental** — small tactile/editorial surprises (grain, organic shapes, asymmetry) signal design range without breaking the minimal system.

**Voice guidelines:**
- Short, declarative sentences. Active voice.
- First person, but understated — she describes what she does, not how great she is.
- No design-speak clichés ("passionate about pixels," "obsessed with UX").
- Numbers and specifics over adjectives wherever possible.

---

## 4. VISUAL DIRECTION

**Palette**

| Role | Light Mode | Dark Mode |
|---|---|---|
| Background | Warm off-white `#F6F3EC` | Deep black `#0E0E0D` |
| Surface | Soft neutral gray `#EDEAE2` | Charcoal `#1B1A18` |
| Primary text | Charcoal `#2A2925` | Warm off-white `#F6F3EC` |
| Muted text | Gray `#8A8578` | Gray `#9B968A` |
| Accent — Olive | `#6F7D52` | `#8A9A66` (lightened for contrast) |
| Accent — Lavender | `#B9AFD1` | `#C9C0E0` |
| Border/hairline | `rgba(42,41,37,0.12)` | `rgba(246,243,236,0.12)` |

Accents (olive + lavender) are used **only** for: interactive states (links, buttons, cursor accents), section markers/numerals, underlines, small graphic details, and key visual moments (e.g., a single glowing node in the Scene 3 animation). They never fill large backgrounds.

**Texture & surface treatment**
- Fine film-grain noise overlay across the whole site (SVG turbulence or tiled PNG, ~4–6% opacity, `mix-blend-mode: overlay`), fixed to viewport so it doesn't scroll with content.
- Paper-like subtle texture on card/surface backgrounds (very low-contrast noise + a faint radial gradient).
- Soft organic blob shapes (olive/lavender, low opacity, blurred) placed asymmetrically behind key sections for depth — never centered, never symmetrical.
- No flat, dead solid-color blocks. Every large surface gets at least one of: grain, gradient, or texture.

**Shape language**
- Mostly rectilinear/grid-based (nods to architecture background), broken up by occasional soft organic shapes and rounded corners on cards (12–20px radius).
- Hairline borders (1px, low-opacity) instead of heavy drop shadows.

**Imagery**
- No generic stock photography.
- Personal reference photo (`media/Gemini_Generated_Image_qio51cqio51cqio5 (1).png`) is available in the project's `media/` folder and can be used for an "About" portrait treatment (duotone/grain-treated, not a raw photo) — but is **not** required for the three hero motion scenes below, since those are abstract/UI-driven rather than portraits. Flag to Vedanshi that if she wants herself featured in a future scene, this image is the identity reference to feed into Higgsfield for consistency.

---

## 5. HIGGSFIELD SEEDANCE 2.0 ASSET GENERATION

**Spec for all three clips:**
- Model: Higgsfield Seedance 2.0
- Resolution: 1080p (1920×1080, or 1080×1920 if used as a mobile-first vertical hero — default to 16:9 landscape for desktop hero use)
- Duration: 8–12 seconds each, seamlessly loopable (first and last frame should be visually close so looping in a `<video loop>` doesn't jump)
- Format: MP4 (H.264) for broad support, optionally WebM/VP9 as a lighter secondary source
- Frame rate: 24–30fps
- No audio track needed (videos are muted, autoplay, background/ambient use)
- Identity reference: **not required** for these three scenes (no human likeness). If a future scene features Vedanshi, use `media/Gemini_Generated_Image_qio51cqio51cqio5 (1).png` as the Higgsfield identity/character reference to keep her appearance consistent.
- Shared visual language across all three (even though generated separately): same palette (deep black `#0E0E0D`, warm off-white `#F6F3EC`, charcoal, muted olive `#6F7D52`, soft lavender `#B9AFD1`), same grain/paper texture treatment, same restrained camera language (slow, deliberate moves — no whip pans, no lens flares, no neon glow).

**Negative direction for all three (apply to every prompt):** avoid stock-footage aesthetics, avoid glossy sci-fi/futuristic 3D-render clichés, avoid neon or saturated RGB gradients, avoid fast/flashy transitions or glitch effects, avoid literal human figures/faces, avoid on-screen legible logos or real UI chrome (keep interface elements abstracted/generic).

### Scene 1 — "Making Complexity Simple"
**Placement:** Hero section background / opening scroll moment
**Higgsfield prompt:**
> A dense, abstract composition of fragmented cards, thin connecting lines, small nodes, and overlapping translucent panels drifts in a soft dark charcoal void with a warm off-white paper-grain texture. The elements feel cluttered and chaotic at first — overlapping, rotated, disorganized. Over 8–10 seconds, they slowly drift, rotate, and align into a clean, structured grid — orderly rows and columns with generous spacing. One or two elements glow faintly in muted olive (#6F7D52) and soft lavender (#B9AFD1) as they lock into place. Subtle film grain throughout, soft depth-of-field, slow deliberate motion, no camera cuts, single continuous take, minimal and editorial in feeling — like a design system settling into order. No text, no legible UI, no human figures.

### Scene 2 — "From Problem to Product"
**Placement:** Pillars / process section
**Higgsfield prompt:**
> Close-up, tactile overhead-style motion of rough pencil-sketch marks, hand-drawn boxes, and loose wireframe grids on warm off-white paper-textured surfaces. Gradually, the sketchy lines sharpen and resolve into clean geometric wireframe blocks, then into polished flat UI-like rectangles, buttons, and card components in charcoal, off-white, and muted olive tones, with soft lavender highlight accents appearing on key elements as they finalize. Elements smoothly morph and reposition — never cut — from rough to refined. Fine grain and soft paper texture throughout, warm and tactile lighting, slow continuous transformation over 8–12 seconds, restrained and sophisticated, no literal screenshots of real apps, no text, no human hands.

### Scene 3 — "Systems That Scale"
**Placement:** Product thinking / systems section, or final CTA backdrop
**Higgsfield prompt:**
> Begin on a single simple abstract UI component — a rounded rectangle card — centered in a dark charcoal-black void with subtle grain. Slowly, it duplicates and expands outward, connected by thin hairline threads, into a larger structured network of components, patterns, and grouped clusters representing screens and workflows. The network grows symmetrically and calmly, never chaotically, forming an elegant architectural lattice. Muted olive (#6F7D52) and soft lavender (#B9AFD1) glow subtly along a few connecting lines to suggest active relationships. Camera slowly pulls back to reveal the full scaled structure by the end of the clip. Continuous single take, 10–12 seconds, restrained lighting, soft depth of field, architectural and systemic in feeling, no text, no human figures, no futuristic sci-fi rendering.

**File naming convention (store in `/assets/video/`):**
- `scene-1-complexity-to-simple.mp4`
- `scene-2-problem-to-product.mp4`
- `scene-3-systems-that-scale.mp4`
- Provide a static poster frame (`.jpg`) for each, same name, for fast first paint before video loads.

---

## 6. WEBSITE STRUCTURE

**Content source note:** Section content below is adapted from Vedanshi's own draft portfolio PDF (`website.pdf`) — her voice, structure, and self-aware framing are kept and sharpened; only the *visual design* follows Section 4/8's direction (grain/texture/olive/lavender editorial system), not the PDF's original look.

Primary experience is a **single scrolling homepage** (`index.html`) with anchor navigation, plus **three standalone case-study detail pages** for the deep-dive "See why" links:

1. Navigation (fixed, minimal, dark/light toggle)
2. Opening Sequence (the "generic draft, annotated, deleted" reveal — doubles as the site's entry animation)
3. Hero (the real one)
4. Animated Stats / Skills Strip
5. About & Process Section ("Hi there" origin story + "I usually start with" process, pinned-centerpiece interaction)
6. Work Section ("I thought these were the problems. I was wrong." — 3 case-study cards → link out to detail pages)
7. Testimonials Section ("Don't trust my word, trust them" — AI-tool quote cards)
8. Still Learning Section ("Things I was wrong about" — 3 confessions)
9. Systems Section (Scene 3 showcase — product thinking beyond the screen)
10. Final CTA Section
11. Footer

Standalone pages (share `style.css` / `script.js`): `work-leadrat.html`, `work-boardroom-ai.html`, `work-margin.html`.

---

## 7. SECTION-BY-SECTION CONTENT

### Navigation
- Left: `VEDANSHI.` wordmark (matches her own PDF branding)
- Center/right: `About` · `Work` · `Contact` (anchor links on the homepage; case-study pages link back via a `Home` item)
- Right: theme toggle (sun/moon icon, olive accent on active state)
- Behavior: hides on scroll-down, reappears on scroll-up; hairline bottom border; background blurs/gains opacity once scrolled past hero

### Opening Sequence (entry animation, plays once per session)
Instead of a generic percentage loader or an illustrated character gimmick, the entry moment dramatizes Vedanshi's actual editing process — a much more on-brand device than a stock preloader, and one that immediately demonstrates the "question everything" mindset the rest of the site is built on.

**Beat 1 — the generic draft** (fades in, centered, smaller type, looks like a "normal" portfolio hero):
> Product Designer · 4 Years · Bengaluru
> "Passionately creating innovative digital experiences, rooted in user needs."
> "Passionate about clean interfaces, pixel-perfect design, and delightful products."
> `Get in touch` · Skills: Figma · Prototyping · Wireframing · Design Systems · Research

**Beat 2 — the red-pen critique** (hand-drawn-style circles/underlines and marker-style annotations draw on in sequence, GSAP-timed, ~0.4s stagger):
- Circles "rooted in user needs" → **"Evidence?"**
- Underlines the whole opening line → **"Too generic."**
- Circles the skills row → **"So what?"**

**Beat 3 — the strikethrough + reveal:** the entire draft block gets a single animated strikethrough line, fades down/out, and is replaced by:
> "So I deleted everything that was showing my work, instead of how I work."
> `See the difference ↓`

Beat 3's line then scrolls/dissolves directly into the real Hero. A small, purely functional loading counter (0–100%, bottom-left corner, tiny olive numerals) may run during initial asset load, styled to disappear before Beat 1 starts — functional only, never the star of the moment.

Respect `prefers-reduced-motion` and repeat sessions: play the full sequence once per browser session (`sessionStorage` flag), then skip straight to Hero on subsequent page loads within the session.

### Hero Section (the real one)
- Eyebrow (small caps, olive accent): `Product Designer · 4 Years · Bengaluru`
- Kinetic headline (huge type, line-by-line reveal):
  > **Turning complexity**
  > **into clarity.**
- Subhead (grounds the headline in evidence, answering her own "Evidence? So what?" critique): "I help teams turn complex product problems into simple, scalable, user-friendly experiences — right now, that means shaping CRM workflows at Leadrat."
- Skills row (small pill chips, matches her PDF): `Figma` `Prototyping` `Wireframing` `Design Systems` `Research`
- CTAs: `Get in Touch →` (primary, filled/olive) · `View Resume` (secondary, outline)
- Background: Scene 1 video (`scene-1-complexity-to-simple.mp4`), muted/autoplay/loop, dimmed under a dark gradient overlay so text stays legible; grain overlay on top

### Animated Stats / Skills Strip
Numbers count up into view on scroll (GSAP + ScrollTrigger), separated by hairline dividers:
- `4+` — Years in UX & Product Design
- `2` — Domains bridged — Architecture → Product Design
- `10+` — Core CRM workflows shaped at Leadrat (leads, distribution, forms, automation)
- `1` — Practice, end-to-end — from single screens to full product systems

### About & Process Section — "Hi there!"
**Origin story (kinetic reveal):**
> "Hi there! I never really switched careers. I just found a place where asking 'Why?' became part of the job."

**Timeline beats** (compact, four short lines — the through-line from architecture to today):
1. **Architecture** — "My start was architecture — thinking about space, structure, and how people move through the environments we build."
2. **The shift to UX** — "That foundation led me to UX and product design, where I found the same challenge in a different medium: turning complexity into something clear."
3. **Growing into systems** — "Over 4+ years across UX, UI, and product design, I grew from designing individual experiences into thinking about larger systems, workflows, and business problems."
4. **Today, at Leadrat** — "I work as a Product Designer at Leadrat, shaping complex CRM experiences — turning complicated requirements into clearer, more usable systems."

**"How I work" — interactive process node-graph.** This is the signature interactive moment of the page: a live, self-contained diagram (inline SVG, dark card, fine grid backdrop, monospace micro-labels, lavender-glow nodes) that literally animates raw input turning into a clear next action — a direct, working illustration of "turning complexity into clarity," not just an illustration of it.

**Layout:**
- Dark card container (near-black surface, faint repeating grid-line texture, hairline border, soft vignette) — same card treatment in both light and dark site themes (this one widget always renders on its dark variant for contrast, like a piece of embedded tooling)
- Top-left micro-label (monospace, uppercase, muted): `HOW I WORK`
- Top-right control (monospace, lavender accent, clickable button): `REPLAY ↻`
- Node graph, left → right, mapped to her actual process steps:
  1. **Conversation** (input node) — "Real people, real insights."
  2. **Notebook** — "Ideas, scribbles, and chaos."
  3. **Whiteboard** — "Connecting ideas before pixels."
  4. **Find the Pattern** (decision node — visually distinguished with a double ring) — "Spotting the shape in the mess."
  5. Branches into two simultaneous **act nodes**: **Research** — "Learning what doesn't work." and **Design** — "Turning the pattern into something real."
- Caption beneath, revealed after the sequence completes: *"Same mess. Now it knows what to do next."*

**Interaction/animation:**
- On scroll into view, the graph auto-plays once: connector lines draw on in sequence (`stroke-dashoffset` animation), and a small bright pulse travels node-to-node, each node lighting up (scale + soft glow) as the pulse arrives; at the decision node the pulse visibly splits into two pulses that travel both branches at once.
- `REPLAY ↻` re-triggers the full sequence on demand.
- Hovering or tapping any node reveals its one-line label in a small tooltip card (works as a touch-friendly tap-to-reveal on mobile).
- Nodes are real focusable buttons with a visible accent-colored focus ring — fully keyboard accessible.
- `prefers-reduced-motion`: graph renders fully drawn and fully labeled by default, no auto-play pulse, `REPLAY` hidden.

**"I have worked with"** — logo strip: `RSP` · `Disha Kiran` · `Leadrat` (placeholder marks until real logo files are supplied).

**Closing pull-quote** (large serif italic, olive accent underline):
> "I like understanding how things work before I try to redesign them. I care about design that looks thoughtful — but more importantly, works thoughtfully."

### Work Section — "I thought these were the problems. I was wrong."
Section intro:
> "I thought these were the problems. I was wrong."
> "Every project began with a problem everyone thought they understood. The real value came from questioning that assumption before designing a solution."

Three case-study cards (project-card formula adapted from reference research — texture panel, tag pills, title-as-question, one-liner, single CTA; hover lifts card + tints image duotone in olive/lavender):

**Leadrat**
- Tags: `B2B SaaS` `CRM` `Workflow Design`
- Title: "Why do salespeople ignore the CRM they were given?"
- Line: "A deep dive into user behavior, workflows, and the real reasons behind low adoption."
- CTA: `See why →` → `work-leadrat.html`

**Boardroom AI**
- Tags: `AI Product` `Decision Design`
- Title: "Why do bad ideas survive meetings?"
- Line: "Exploring groupthink, decision rituals, and how to build a better filter for ideas."
- CTA: `See why →` → `work-boardroom-ai.html`

**Margin**
- Tags: `Fintech` `Behavioral Design`
- Title: "Why can't people tell if they can afford something?"
- Line: "Understanding the psychology of money decisions, and building confidence — not just calculators."
- CTA: `See why →` → `work-margin.html`

### Case-Study Detail Page Template (`work-leadrat.html` / `work-boardroom-ai.html` / `work-margin.html`)
Anatomy adapted from case-study-page research (umasubbu.com), long-form and narrative-first:
1. Back-to-home nav + tag pills
2. Title (the question, large kinetic type)
3. One-paragraph intro framing the real stakes
4. Meta grid: `Role` / `Tools` / `Timeline` / `Company`
5. **The Assumption** — what everyone thought the problem was
6. **The Real Why** — what she found once she questioned it (the differentiator section — this is where her actual research/insight goes)
7. **Process** — numbered steps, deliberately reusing the site-wide "Conversation → Notebook → Whiteboard → Find the pattern → Research" process language for consistency across case studies
8. **Solution** — key design decisions, with visuals; images captioned in small caps like `FIG. 01 — [caption]` (a tactile, design-tool-adjacent detail borrowed from reference research)
9. **Impact** — outcome stats if available, otherwise an honest qualitative reflection
10. **Reflection** — an honest "what I'd do differently" note. On the **Leadrat** page specifically, this section is the "nicer is not better" confession (see Still-Learning section below), told in full as a real anecdote rather than a generic lesson
11. Footer nav: `← Back to Home` / `Next Project →`
A thin ruler-tick decorative rule sits along the top edge of these pages only — a subtle nod to her working in Figma, not a literal toolbar.
All narrative content beyond the given one-liners is placeholder copy clearly marked for Vedanshi to replace with real research/process detail.

### Testimonials Section — "Don't trust my word, trust them"
> "03 — Don't trust my word, trust them"
> "Here's what the tools I use every day say about working with me."
> "I work alongside these every day. I didn't write these answers — I asked, and screenshotted."

Three styled quote cards (not literal screenshots — designed as minimal "chat bubble" components in the site's own visual system: grain surface, hairline border, small monochrome tool label, olive/lavender accent rule):
- Card labeled `ChatGPT`
- Card labeled `Claude`
- Card labeled `Figma AI`

**Placeholder quotes** (clearly marked — swap for Vedanshi's real screenshots/answers):
> "She doesn't ask me to make decisions for her. She asks me to argue with the one she already made." — *placeholder*

### Still-Learning Section — "I am still learning"
> "04 — I am still learning"
> "Things I was wrong about"
> "Every one of these cost me something."

Numbered stacked list; each item plays the same strike-through → replace motion established in the Opening Sequence, tying the two moments together:

**01 — "A cleaner interface makes a product better."** → **nicer is not better**
"In Leadrat I spent weeks making the screens cleaner. A salesperson looked at it and said he still didn't know what to do first. The design was nicer — but the product wasn't better."

**02 — "Follow the brief. That's the actual job."** → **the brief is a guess**
"I used to treat the brief as a task. Now I treat it as a guess. If I don't check the guess first, I just solve the wrong problem — neatly."

**03 — "AI is a way to produce faster."** → **it's for arguing, not for answers**
"I thought AI was for producing faster. Now I use it to poke holes in my own ideas early, so I don't fall in love with the first one."

### Systems Section — "Systems That Scale"
- Scene 3 video as a large, contained visual (not full-bleed) — framed like a piece of editorial art with a small `FIG.` caption
- Caption/label: `Systems That Scale`
- Short supporting copy: "Good design doesn't stop at the screen. I think in components, patterns, and relationships — building systems that hold up as products grow."

### Final CTA Section
- Large kinetic headline: "Let's build something intuitive together."
- Supporting line: "Open to product design roles and select collaborations."
- Primary CTA: `Get in Touch` → scrolls to / opens contact form, with `mailto:` fallback
- Secondary CTA: `View Resume` → opens résumé PDF (placeholder path `assets/docs/vedanshi-singh-resume.pdf`) in a new tab
- Simple inline contact form (Name, Email, Message, Send) with client-side validation only (no backend — `mailto:` form action or a note where a form service like Formspree can be wired in later)

### Footer
- Left: `Vedanshi Singh` + `© 2026`
- Center/right: email address link, social links (LinkedIn / Behance / Dribbble — placeholders, easy to update), `Back to top` arrow
- Thin hairline top border, minimal, small type

---

## 8. COMPLETE VISUAL STYLE GUIDE

### Typography
- **Display / headline font:** `Fraunces` (Google Fonts) — warm, editorial serif with personality; used for hero headline, section headlines, pull-quotes, numerals. Variable font, use optical size + soft italic for quotes.
- **Body / UI font:** `Inter` (Google Fonts) — clean, neutral, highly legible; used for body copy, nav, buttons, labels, form fields.
- **Technical/monospace accent font:** `IBM Plex Mono` (Google Fonts) — used sparingly for "tooling" moments only: the "How I work" node-graph's labels/`REPLAY` control, `FIG. 0X —` case-study captions, and case-study meta-grid values. Reinforces the design-tool/systems-thinking feel without being used for real body copy.
- **Scale (desktop, fluid via `clamp()`):**
  - Hero headline: `clamp(3rem, 8vw, 7.5rem)`, line-height 0.95, letter-spacing -0.02em
  - Section headline: `clamp(2rem, 4.5vw, 3.5rem)`
  - Body: `1rem–1.125rem`, line-height 1.6
  - Eyebrow/labels: `0.75rem`, uppercase, letter-spacing 0.12em
- Kinetic type: headline words/lines split into spans and animated (staggered fade + slight Y translate + slight blur-to-focus) on scroll/entry via GSAP.

### Animation direction
- Overall easing: soft, confident, never bouncy — `power3.out` / custom cubic-bezier similar to `(0.65, 0, 0.35, 1)`.
- Section entries: fade + 24–40px translateY, staggered for grouped elements (cards, list items).
- Numbers: count-up via GSAP on scroll into view.
- Micro-interactions: buttons scale 1.02 + accent-color underline/fill sweep on hover; links get an animated underline that draws in from left.
- Cursor: optional custom cursor dot that gains a soft olive ring on hoverable elements (nice-to-have, must degrade gracefully).

### Interaction design
- Buttons: pill or slightly rounded rect, generous padding, olive fill (primary) / hairline outline (secondary), text color inverts per theme.
- Cards: hairline border, subtle grain surface, hover = lift + border brightens to accent color at low opacity.
- Theme toggle: smooth cross-fade of CSS variables (transition on `background-color`, `color`, `border-color`, ~400ms), persists choice in `localStorage`.
- Forms: minimal underline-style inputs, focus state = olive underline + label shrinks/moves up (floating label).

### Scroll behavior
- Smooth scrolling via **Lenis** (CDN), tuned to a gentle, weighty feel (not overly slippery).
- **GSAP ScrollTrigger** drives: stats count-up, section fade/stagger reveals, story-section scroll-linked timeline progress line, pinned moment (optional) on the Systems section where Scene 3 plays in sync with scroll position.
- Scroll progress indicator (thin fixed bar at top, olive accent) — subtle, optional.

### Mobile behavior
- Single-column layouts throughout; hero type scales down via `clamp()` but keeps kinetic reveal.
- Videos: swap to lighter/shorter poster-first loading; consider `preload="none"` + intersection-observer-triggered play to protect performance and data usage.
- Custom cursor disabled on touch devices.
- Nav collapses to a simple top bar with a right-aligned menu icon → full-screen minimal overlay menu (large type links, olive accent active state).
- Reduce parallax/pin-heavy ScrollTrigger effects on small viewports (check `matchMedia` and simplify or disable below ~768px) to protect performance.
- Opening Sequence plays as a simplified 2-beat version on mobile (skip fine-grained annotation drawing, keep draft → strikethrough → reveal) to keep it fast and legible on small screens.
- Respect `prefers-reduced-motion`: disable large kinetic animations and autoplay video motion in favor of simple fades / static poster frames.

---

## 8A. DESIGN REFERENCE RESEARCH — PATTERNS ADOPTED

Vedanshi's 11 reference links were reviewed for interaction/layout ideas only (visual style stays per Sections 4/8 — none of these sites' color/type/illustration styles are being copied). Patterns adapted into this plan:

| Reference | Pattern observed | How it's adapted here |
|---|---|---|
| huyml.co | Illustrated character physically "pushes" a panel away to reveal the wordmark as the entry animation | Replaced the illustrated character with Vedanshi's own draft-critique-reveal as the entry moment (Opening Sequence) — more on-brand and more meaningful than a generic wipe or loader |
| umasubbu.com/projects/... | Long-form case-study anatomy: tags → title → intro → meta grid → impact stats → problem → process → solution → role → testimonials → next project | Adopted directly as the Case-Study Detail Page Template |
| umasubbu.com (home) | Project card = hero image + tag pills + title/role + stat row + single CTA | Adopted as the Work-section card formula |
| gionatannese.com/about | A persistent centerpiece object stays put while surrounding content/lists scroll past it; About page structured as short named convictions | Adopted the pinned-centerpiece mechanic for the "I usually start with" process strip (grain-textured abstract shape instead of a chrome blob) |
| pleurat.com | Tactile "process" widget; images captioned like `FIG. 004 —` | Adopted the `FIG. 0X —` caption style for case-study imagery |
| mathis-biabiany.fr | Minimal word-build + numeric 0–100% preloader | Adopted only as a small functional loading counter during initial asset load, subordinate to the Opening Sequence |
| ulvin.xyz/about | Ruler-tick marks along the canvas edge, dashed "selection frame" around content (Figma-canvas motif) | Adopted a thin ruler-tick rule along the top of case-study pages only — a restrained nod to her working in Figma |
| ishikawa.co | Scroll-as-journey walking metaphor between projects | Considered, not adopted directly — too illustrated/whimsical for the palette; noted as a future option if she wants a more playful project index |
| Vedanshi's reference screenshot (node-graph UI: `input → decision → act`, dark card, grid backdrop, monospace labels, "CLEAR" control) | A small interactive systems/flow diagram showing raw input resolving into a clear next action | Adopted directly as the **"How I work" node-graph**, replacing the earlier pinned-centerpiece mechanic — mapped onto her real process steps (Conversation → Notebook → Whiteboard → Find the Pattern → Research/Design), restyled in the site's dark palette with lavender-glow nodes and an `IBM Plex Mono` label accent |
| zainabkabira.com, vanlent.dev, uxmaitreyii.framer.website | Numbered nav, generative canvas centerpiece, "scene within a scene" hero, floating status pills | Reviewed for texture/typography scale reference only; not directly adopted (illustration-heavy or effects-heavy, off-palette) |

---

## 9. TECHNICAL IMPLEMENTATION

**Stack:** Static site — `index.html`, `style.css`, `script.js`, `/assets` — HTML/CSS/vanilla JS only. No frameworks, no build step.

**File structure:**
```
/index.html
/work-leadrat.html
/work-boardroom-ai.html
/work-margin.html
/style.css
/script.js
/assets
  /video
    scene-1-complexity-to-simple.mp4
    scene-1-complexity-to-simple.jpg   (poster)
    scene-2-problem-to-product.mp4
    scene-2-problem-to-product.jpg
    scene-3-systems-that-scale.mp4
    scene-3-systems-that-scale.jpg
  /docs
    vedanshi-singh-resume.pdf          (placeholder until supplied)
  /img
    (case study placeholder covers, logo marks for RSP/Disha Kiran/Leadrat, texture/noise PNG if not using inline SVG)
  /fonts (optional local fallback; primary load via Google Fonts CDN)
/media
  Gemini_Generated_Image_qio51cqio51cqio5 (1).png   (existing — identity reference / optional About portrait)
```
The three case-study pages are separate HTML files (sharing `style.css`/`script.js`) rather than modals or inline expansion, so each can carry its own long-form narrative and be linked/shared independently.

**CDN dependencies (loaded via `<script>`/`<link>` tags, no bundler):**
- GSAP core: `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js`
- GSAP ScrollTrigger: `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js`
- Lenis: `https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js`
- Google Fonts: `Fraunces` (400/500/600 + italic), `Inter` (400/500/600), `IBM Plex Mono` (400/500)

**CSS architecture:**
- CSS custom properties on `:root` for both themes; `[data-theme="dark"]` overrides. Default to `prefers-color-scheme` on first load, then respect user's manual toggle via `localStorage`.
- Grain overlay implemented as a fixed, full-viewport `::before` on `body` using an inline SVG `feTurbulence` data-URI background, `opacity: 0.05`, `mix-blend-mode: overlay`, `pointer-events: none`.
- Layout via CSS Grid/Flexbox, fluid type via `clamp()`, container widths capped (~1280–1400px) with generous side padding.

**JS architecture (`script.js`, vanilla, no modules bundler needed but can use `type="module"` if helpful):**
1. Opening Sequence controller: runs only on `index.html`, only once per browser session (`sessionStorage` flag) — draft fade-in → annotation draw-on (GSAP timeline, staggered) → strikethrough → reveal → hands off into Hero; simplified/skipped per `prefers-reduced-motion` and on narrow viewports.
2. Theme toggle logic (read/write `localStorage`, toggle `data-theme` attribute, sync icon state).
3. Lenis init + GSAP ScrollTrigger `scrollerProxy` integration so both stay in sync.
4. Kinetic text: split headline text into `<span>` per word/line (done at markup or runtime), GSAP stagger reveal on load and on scroll-into-view for section headlines; shared by the Opening Sequence, Hero, and the Still-Learning strike-through/replace moments.
5. Stats count-up: GSAP `ScrollTrigger` + a simple counter tween per stat element.
6. "How I work" node-graph: a dedicated module driving the inline-SVG process diagram — GSAP timeline animates `stroke-dashoffset` on connector paths and scale/box-shadow "glow" on node circles in sequence, splitting into two parallel tweens at the decision node; triggered once via `ScrollTrigger` on first view and re-triggerable via the `REPLAY` button; hover/focus/tap handlers show each node's tooltip label; fully skipped (static, fully-drawn, fully-labeled) under `prefers-reduced-motion`.
7. Section reveal animations: shared utility that fades/translates elements with `[data-reveal]` attribute when they enter viewport.
8. Video handling: lazy-load videos (start `src` load only when section nears viewport via `IntersectionObserver`), respect `prefers-reduced-motion` (fall back to poster image, no autoplay).
9. Mobile nav overlay open/close logic.
10. Contact form: basic client-side validation, `mailto:` fallback submission (with a clear code comment marking where a form backend/service could be wired in later).
11. `matchMedia` checks to simplify/disable heavier ScrollTrigger effects (pinning, large parallax, full Opening Sequence) under ~768px width.

**Performance notes:**
- Compress/optimize video assets for web (target well under a few MB each if possible; H.264 baseline, reasonable bitrate for 1080p short loops).
- `loading="lazy"` on non-critical images; poster images for all videos to avoid layout shift and blank flashes.
- Minimize layout thrash: animate `transform`/`opacity` only, avoid animating layout properties.
- Single `script.js`, single `style.css`, no external icon font — use inline SVGs for icons (menu, sun/moon, arrows).

---

## 10. OPEN ITEMS / PLACEHOLDERS TO FILL LATER

- Real deep-dive content for the three case-study pages (assumption/real-why/process/solution/impact) — site ships with the full anatomy structured and placeholder copy clearly marked.
- Real logo marks for RSP, Disha Kiran, and Leadrat in the "I have worked with" strip (currently text-only placeholders).
- Real AI-tool testimonial quotes/screenshots for the "Don't trust my word, trust them" section (currently placeholder quotes, clearly marked).
- Résumé PDF file (placeholder path referenced; drop real file in `/assets/docs/`).
- Real social links (LinkedIn/Behance/Dribbble — currently placeholders in footer).
- Contact form backend (currently `mailto:` fallback; can be swapped for Formspree/Netlify Forms/etc. later without redesign).
- The three Higgsfield-generated video files themselves (prompts above are ready to submit; site will be built to reference their expected filenames/paths from day one, using solid-color/gradient CSS placeholders as a fallback until the real files are dropped into `/assets/video/`).

---

## SUMMARY FOR APPROVAL

Building a minimal, editorial, dark/light-mode-capable portfolio for Vedanshi Singh, Product Designer, in warm off-white/charcoal/black with muted olive and lavender accents, grain/paper textures, and Fraunces + Inter typography. Structure: an **Opening Sequence** (her own generic-draft-critique-and-delete moment, doubling as a distinctive entry animation) → Hero → Stats → **About/Process** (origin story + the interactive "How I work" node-graph diagram) → **Work** ("I thought these were the problems. I was wrong." — 3 real case studies: Leadrat, Boardroom AI, Margin, each linking to a full case-study page) → **Testimonials** ("Don't trust my word, trust them") → **Still Learning** (3 confessions, reusing the strikethrough/reveal motion from the Opening Sequence) → Systems → Final CTA → Footer. Content and structure are adapted from Vedanshi's own draft PDF; interaction patterns (case-study page anatomy, project-card formula, pinned centerpiece, `FIG.` captions, ruler-tick motif) are adapted from her 11 reference sites per Section 8A — visual style itself stays original to this plan, not copied from any reference. Three abstract Higgsfield Seedance 2.0 video prompts remain as specified (complexity→order, sketch→product, single component→scaled system). Built as pure static HTML/CSS/vanilla JS across `index.html` + 3 case-study pages + shared `style.css`/`script.js`, GSAP/ScrollTrigger/Lenis via CDN, no frameworks.

**Waiting for your approval to begin the build.**
