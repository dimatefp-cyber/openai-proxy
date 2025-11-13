export default async function handler(req, res) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";

  // Validar el valor del origen antes de asignarlo al header
  const originHeader =
    allowedOrigin.startsWith("http") || allowedOrigin === "*"
      ? allowedOrigin
      : "*";

  res.setHeader("Access-Control-Allow-Origin", originHeader);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Si es preflight (OPTIONS), respondemos sin ejecutar la lógica
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Eres un experto en marketing, redacción creativa y diseño visual para tiendas Shopify.",
          },
          {
            role: "user",
            content: req.body.prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Error de OpenAI:", error);
      return res.status(500).json({ error: "Error en la conexión con OpenAI" });
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message?.content || "Sin respuesta.";

    res.status(200).json({ message });
  } catch (error) {
    console.error("Error en la función:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}
