/* Boardroom — local server for Live AI mode.
   Serves the prototype and proxies model calls so the API key never reaches the browser.

     npm install
     ANTHROPIC_API_KEY=sk-ant-... npm start      → http://localhost:8787

   Without a key the page still works in demo mode. Binds to 127.0.0.1 only. */
import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";

const here = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 8787;
const MODEL = process.env.BOARDROOM_MODEL || "claude-opus-5-5";
const EFFORT = process.env.BOARDROOM_EFFORT || "medium";
const MAX_TOKENS_CAP = 16000;

const hasKey = Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN || process.env.ANTHROPIC_PROFILE);
const client = hasKey ? new Anthropic() : null;
let useFallbacks = true; // server-side refusal fallback; switched off if the account rejects it

const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".json": "application/json" };

function send(res, status, body, type = "application/json") {
  res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store" });
  res.end(type === "application/json" ? JSON.stringify(body) : body);
}

async function readBody(req, limit = 200_000) {
  let size = 0; const chunks = [];
  for await (const c of req) { size += c.length; if (size > limit) throw new Error("too-large"); chunks.push(c); }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

async function generate({ system, prompt, schema, max_tokens }) {
  const params = {
    model: MODEL,
    max_tokens: Math.min(Number(max_tokens) || 8000, MAX_TOKENS_CAP),
    system: String(system || ""),
    messages: [{ role: "user", content: String(prompt || "") }],
    output_config: { effort: EFFORT, ...(schema ? { format: { type: "json_schema", schema } } : {}) }
  };
  let msg;
  try {
    msg = useFallbacks
      ? await client.beta.messages.create({ ...params, betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" })
      : await client.messages.create(params);
  } catch (e) {
    if (useFallbacks && e instanceof Anthropic.BadRequestError && /fallback/i.test(String(e.message))) {
      useFallbacks = false;
      console.warn("[boardroom] refusal fallbacks unavailable on this account; continuing without them");
      msg = await client.messages.create(params);
    } else throw e;
  }
  if (msg.stop_reason === "refusal") return { refusal: true };
  const text = msg.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  return { text, stop_reason: msg.stop_reason };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === "/api/status") {
    return send(res, 200, hasKey ? { live: true, model: MODEL } : { live: false, reason: "no-key" });
  }

  if (url.pathname === "/api/generate") {
    if (req.method !== "POST") return send(res, 405, { error: "method" });
    if (!client) return send(res, 503, { error: "no-key", message: "No ANTHROPIC_API_KEY set on the server." });
    let body;
    try { body = await readBody(req); } catch { return send(res, 400, { error: "bad-request", message: "Unreadable request." }); }
    const t0 = Date.now();
    try {
      const out = await generate(body);
      console.log(`[boardroom] ${((Date.now() - t0) / 1000).toFixed(1)}s ${out.refusal ? "refusal" : out.stop_reason}`);
      if (out.refusal) return send(res, 422, { error: "refusal", message: "The model declined this request." });
      return send(res, 200, out);
    } catch (e) {
      console.error("[boardroom] generate failed:", e.status || "", e.message);
      const status = e instanceof Anthropic.RateLimitError ? 429
        : e instanceof Anthropic.AuthenticationError ? 401
        : e instanceof Anthropic.APIConnectionError ? 502
        : e instanceof Anthropic.APIError ? 502 : 500;
      const kind = status === 429 ? "rate-limit" : status === 401 ? "auth" : "api";
      const message = status === 429 ? "Rate limited. Wait a moment and try again."
        : status === 401 ? "The server's API key was rejected." : "The model call failed. See the server log.";
      return send(res, status, { error: kind, message });
    }
  }

  // Static files, confined to this folder.
  let file = decodeURIComponent(url.pathname);
  if (file.endsWith("/")) file += "index.html";
  const full = path.join(here, path.normalize(file).replace(/^(\.\.[/\\])+/, ""));
  if (!full.startsWith(here) || /node_modules|server\.mjs|package/.test(full)) return send(res, 404, "Not found", "text/plain");
  try {
    const data = await readFile(full);
    res.writeHead(200, { "Content-Type": TYPES[path.extname(full)] || "application/octet-stream" });
    res.end(data);
  } catch {
    send(res, 404, "Not found", "text/plain");
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Boardroom → http://localhost:${PORT}  (${hasKey ? `live AI: ${MODEL}, effort ${EFFORT}` : "demo only: set ANTHROPIC_API_KEY for live AI"})`);
});
