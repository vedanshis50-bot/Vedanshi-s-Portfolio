# Boardroom

A working prototype that puts a product idea in front of six opposing perspectives before anyone builds it.

## Run it

**Demo mode** (no setup). Serve the folder statically and open `index.html`. A recorded session of the example idea plays. If you enter your own idea, the page says it can't discuss it, rather than replaying the recording as if it were about your idea.

**Live AI mode** (your own ideas):

```bash
cd boardroom
npm install
ANTHROPIC_API_KEY=sk-ant-... npm start   # → http://localhost:8787
```

Optional settings:

- `BOARDROOM_MODEL`: defaults to `claude-opus-5-5`.
- `BOARDROOM_EFFORT`: defaults to `medium`.

The key stays on the server. The browser only ever talks to `/api/*`.

## How it's built

| File | Responsibility |
|---|---|
| `js/board.js` | The six seats, the six discussion stages, the stance vocabulary and the room's rules. Data only. |
| `js/engine.js` | AI behaviour: prompts, strict JSON schemas, transport, and normalisation of everything the model returns. |
| `js/demo-session.js` | One curated session in the same shape the engine produces. |
| `js/app.js` | UI: idea → board → discussion → verdict. |
| `server.mjs` | Static server and model proxy. |

Live pipeline:

1. Six independent first reads, so the seats don't anchor on each other.
2. One discussion call that must make the seats respond to each other by name. It includes a cross-examination and position shifts.
3. A verdict over the transcript.
4. Optional follow-up rounds.

Every response is normalised before it reaches the UI:

- Unknown seats, empty turns and duplicate turns are dropped.
- Missing stages are inferred.
- An orphaned cross-examination answer is demoted to an ordinary turn.

If a seat fails, it shows a retry button and the room can continue with three or more seats. If the verdict call fails, the page still shows the board split, built from the positions in the discussion, and labels it as partial.
