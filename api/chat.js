export default async function handler(req, res) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN;

  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
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
    // ✅ Asegurarse de leer el body correctamente
    const body = await req.json();

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY.trim()}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // si no responde, prueba con "gpt-4o"
        messages: [
          {
            role: "system",
            content: "Eres un experto en marketing y redacción para tiendas Shopify. Responde solo con el texto solicitado, sin saludos ni explicaciones."
          },
          {
            role: "user",
            content: body.prompt || "Genera una descripción creativa para un producto de tienda online."
          }
        ],
        max_tokens: 200
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Error desde OpenAI:", errText);
      return res.status(500).json({ error: "Error en la API de OpenAI", detail: errText });
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message?.content || "Sin respuesta generada.";

    return res.status(200).json({ reply: message });
  } catch (error) {
    console.error("Error interno:", error);
    return res.status(500).json({ error: "Error interno del servidor", detail: error.message });
  }
}
