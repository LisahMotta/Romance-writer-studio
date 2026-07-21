export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Chave da API não configurada no servidor." });
  }

  const { system, messages } = req.body;

  const contents = messages.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const body = {
    system_instruction: system ? { parts: [{ text: system }] } : undefined,
    contents,
    generationConfig: { maxOutputTokens: 1000 },
  };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const msg = data.error?.message || "Erro na API Gemini";
      // Extrai tempo de retry se disponível
      const retryMatch = msg.match(/retry in ([\d.]+)s/);
      const retryMsg = retryMatch
        ? `Muitas perguntas em pouco tempo. Aguarde ${Math.ceil(parseFloat(retryMatch[1]))} segundos e tente de novo.`
        : msg;
      return res.status(response.status).json({ error: retryMsg });
    }

    const text = data.candidates?.[0]?.content?.parts?.map(p => p.text).join("\n") || "Desculpe, não consegui responder.";
    return res.status(200).json({ text });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao conectar com a IA." });
  }
}
