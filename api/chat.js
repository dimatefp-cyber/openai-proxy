export default async function handler(req, res) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN?.trim();
  const apiKey = process.env.OPENAI_API_KEY;

  // Validar variables obligatorias
  if (!apiKey) {
    return res.status(500).json({ error: "Falta la clave API de OpenAI" });
  }

  // Configuración CORS
  if (allowedOrigin) {
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const body = await req.json().catch(() => req.body);

    if (!body || !body.prompt) {
      return res.status(400).json({ error: "Falta el parámetro 'prompt'" });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Eres un experto en marketing y redacción creativa para tiendas Shopify. Responde de forma breve, clara y atractiva.",
          },
          {
            role: "user",
            content: body.prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Error de OpenAI:", errText);
      return res.status(500).json({ error: "Error al contactar OpenAI" });
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message?.content || "Sin respuesta";

    return res.status(200).json({ reply: message });
  } catch (error) {
    console.error("Error interno:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
