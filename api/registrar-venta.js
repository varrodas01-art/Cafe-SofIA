export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Método no permitido" });
    return;
  }

  const scriptUrl = process.env.URLscript;
  if (!scriptUrl) {
    res.status(500).json({ ok: false, error: "Falta configurar la variable de entorno URLscript en Vercel." });
    return;
  }

  const { orderId, items } = req.body || {};

  try {
    const backendResponse = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "registrar_venta",
        orderId,
        items: items || [],
      }),
    });

    const text = await backendResponse.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    res.status(200).json({ ok: true, backend: data });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
}
