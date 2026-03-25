export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).send("Method not allowed");
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).send("Missing GROQ_API_KEY in environment");
  }

  const { prompt, framework = "react", styling = "tailwind" } = req.body || {};

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).send("Prompt is required");
  }

  const stylingLine =
    styling === "bootstrap"
      ? "Use Bootstrap 5 classes only. Do not use Tailwind."
      : styling === "custom"
      ? "Use concise, clean styling without relying on Tailwind or Bootstrap. Keep styles lightweight and readable."
      : "Use Tailwind CSS classes only. Do not use Bootstrap.";

  const frameworkLine =
    framework === "next"
      ? "Return a client-ready React component that works in a Next.js page."
      : framework === "vanilla"
      ? "Return a single React component; avoid Next.js-specific APIs."
      : "Return a single React component. Avoid framework-specific APIs.";

  const systemPrompt = `You are a senior frontend engineer. Generate a single React functional component named GeneratedComponent. ${frameworkLine} ${stylingLine} Requirements:\n- Use only client-side React; no server-only APIs.\n- No imports for React 19. Assume React is available globally (UMD).\n- Avoid external assets unless via CDN.\n- Do not include markdown backticks or explanations.\n- Return only the component code.\n- Export default GeneratedComponent at the end.`;

  const userPrompt = `${prompt}\nFocus on clean, minimal, production-ready UI copy.`;

  try {
    const model = process.env.GROQ_MODEL;
    if (!model) {
      return res
        .status(400)
        .json({
          error:
            "Set GROQ_MODEL in your environment (.env.local). See https://console.groq.com/docs/deprecations for currently supported models.",
        });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.25,
        max_tokens: 1200,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res
        .status(response.status)
        .send(errorText || "Groq generation failed");
    }

    const data = await response.json();
    const raw = data?.choices?.[0]?.message?.content?.trim() || "";
    const code = raw.replace(/^```[a-z]*\n?/i, "").replace(/```$/, "");

    return res.status(200).json({ code });
  } catch (error) {
    console.error("Groq API error", error);
    return res.status(500).send("Unexpected error generating code");
  }
}
