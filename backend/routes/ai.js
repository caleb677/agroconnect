// ── /api/ai ───────────────────────────────────────────────────────────────────
// Real Claude AI crop advisor with Anthropic API
const router = require("express").Router();
const { protect } = require("../middleware/auth");

const SYSTEM_PROMPT = `You are AgroConnect AI — an expert agricultural advisor for Murang'a County, Kenya.

You have deep knowledge of:
- Kenyan crops: maize, potatoes, tomatoes, avocado (Hass), tea, coffee, beans, cabbages, kale
- Murang'a County climate, soil types, rainfall patterns by sub-county
- Common pests & diseases in Central Kenya and their treatment
- Kenya fertilizer brands available locally (MAVUNO, CAN, DAP, NPK)
- Certified seed varieties available in Kenya (Kenya Seed Company, Pioneer, Monsanto)
- Safaricom M-Pesa, NCBA Loop, KCB Agri-loan and other Kenya farmer finance options
- Kenya market prices and Nairobi Wakulima Market rates
- Kenya Agricultural & Livestock Research Organization (KALRO) guidelines
- Good Agricultural Practices (GAP) certification requirements in Kenya

When answering:
1. Be specific to Murang'a County conditions where possible
2. Give practical, actionable advice a smallholder farmer can implement
3. Mention specific product names available in Kenya (e.g. "Use Bulldock 25EC for aphids")
4. Include rough costs in Kenya Shillings when relevant
5. Always recommend contacting the local Extension Officer for on-site diagnosis

Current date context: You are helping farmers in Murang'a County, Kenya.
The main farming seasons are: Long rains (March–May) and Short rains (Oct–Dec).`;

// POST /api/ai/chat — send message, get AI response
router.post("/chat", protect, async (req, res) => {
  const { messages } = req.body; // array of { role, content }
  if (!messages || !messages.length) return res.status(400).json({ error: "messages array required." });

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: "AI not configured. Add ANTHROPIC_API_KEY to .env" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key":         process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type":      "application/json",
      },
      body: JSON.stringify({
        model:      "claude-sonnet-4-6",
        max_tokens: 1024,
        system:     SYSTEM_PROMPT,
        messages:   messages.slice(-10), // keep last 10 turns for context
      }),
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });

    const text = data.content?.[0]?.text || "Sorry, I could not generate a response.";
    res.json({ text, model: data.model });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
