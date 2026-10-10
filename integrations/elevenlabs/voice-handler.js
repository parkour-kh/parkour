/**
 * ElevenLabs text-to-speech handler for the existing Parkour Render backend.
 * Node 18+ / Express. Keep ELEVENLABS_API_KEY only in Render environment variables.
 *
 * In the backend entrypoint:
 * const { voiceHandler } = require("./voice-handler");
 * app.post("/api/voice", express.json({ limit: "16kb" }), voiceHandler);
 */
const DEFAULT_VOICE_ID = "JBFqnCBsd6RMkjVDRZzb";

async function voiceHandler(req, res) {
  const text = req.body?.text;
  if (typeof text !== "string" || !text.trim() || text.length > 1500) {
    return res.status(400).json({ error: "Text must be between 1 and 1500 characters." });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: "Voice service is not configured." });
  }

  try {
    const voiceId = process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE_ID;
    const upstream = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({ text: text.trim(), model_id: "eleven_multilingual_v2" }),
        signal: AbortSignal.timeout(20000),
      }
    );

    if (!upstream.ok) {
      console.error("ElevenLabs request failed with status", upstream.status);
      return res.status(502).json({ error: "Voice generation is unavailable." });
    }

    const audio = Buffer.from(await upstream.arrayBuffer());
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).send(audio);
  } catch (error) {
    console.error("Voice generation failed:", error);
    return res.status(502).json({ error: "Voice generation is unavailable." });
  }
}

module.exports = { voiceHandler };
