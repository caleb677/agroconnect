// Anthropic API helper for Claude artifact proxy
// ─── ANTHROPIC API HEADERS ───────────────────────────────────────────────────
// When running inside Claude.ai artifacts the proxy injects auth automatically
// when these headers are present. No API key needed in code.
const IS_ARTIFACT = (
  window.location.hostname === "claude.ai" ||
  window.location.hostname.endsWith(".claude.ai") ||
  window.location.protocol === "blob:" ||
  window.location.hostname.includes("anthropic")
);

// All non-artifact environments (dev + any hosting) use the same /api/anthropic path.
// Vite proxy handles dev; serverless functions handle production.
const AI_ENDPOINT = IS_ARTIFACT
  ? "https://api.anthropic.com/v1/messages"
  : "/api/anthropic";

const AI_HEADERS = IS_ARTIFACT
  ? {
      "Content-Type":      "application/json",
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-ipc": "true",
    }
  : {
      "Content-Type": "application/json",
      // Key is injected server-side (Vite proxy or serverless function)
    };

async function callAI(userPrompt, systemPrompt = "", useWebSearch = false) {
  const body = {
    model: "claude-sonnet-4-20250514",
    max_tokens: 1200,
    system: systemPrompt || "Return ONLY valid JSON. No markdown, no explanation, no backticks.",
    messages: [{ role: "user", content: userPrompt }],
  };
  if (useWebSearch) {
    body.tools = [{ type: "web_search_20250305", name: "web_search" }];
  }

  let resp;
  try {
    resp = await fetch(AI_ENDPOINT, {
      method:  "POST",
      headers: AI_HEADERS,
      body:    JSON.stringify(body),
    });
  } catch(networkErr) {
    throw new Error("Network error — check internet connection or API proxy setup.");
  }

  if (!resp.ok) {
    let detail = "";
    try { const j = await resp.json(); detail = j?.error?.message || ""; } catch{}
    throw new Error(`API ${resp.status}${detail ? ": " + detail : ""}`);
  }

  const data = await resp.json();

  // Extract text blocks (may come mixed with tool_use when web search runs)
  const text1 = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n").trim();
  if (text1) return text1;

  // Follow-up turn when model returned only tool_use
  const toolUses = (data.content || []).filter(b => b.type === "tool_use");
  if (!toolUses.length) return "(no response)";

  const toolResults = toolUses.map(tu => ({
    type: "tool_result",
    tool_use_id: tu.id,
    content: typeof tu.input === "object" ? JSON.stringify(tu.input) : String(tu.input || "{}"),
  }));

  const resp2 = await fetch(AI_ENDPOINT, {
    method:  "POST",
    headers: AI_HEADERS,
    body:    JSON.stringify({
      ...body,
      messages: [
        { role: "user",      content: userPrompt },
        { role: "assistant", content: data.content },
        { role: "user",      content: toolResults },
      ],
    }),
  });
  if (!resp2.ok) throw new Error(`API follow-up ${resp2.status}`);
  const data2 = await resp2.json();
  return (data2.content || []).filter(b => b.type === "text").map(b => b.text).join("\n").trim() || "(no response)";
}

// Parse JSON safely from AI text (strips markdown fences)
function parseAIJson(text) {
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}



export { IS_ARTIFACT, AI_ENDPOINT, AI_HEADERS, callAI, parseAIJson };