export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { messages } = req.body
  const apiKey = process.env.HUGGINGFACE_API_KEY

  if (!apiKey) {
    return res.status(500).json({
      error: 'HUGGINGFACE_API_KEY not set on server'
    })
  }

  try {
    const lastMessage =
      messages?.[messages.length - 1]?.content || "Bonjour"

    const r = await fetch(
      'https://api-inference.huggingface.co/models/Qwen/Qwen2.5-7B-Instruct',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: lastMessage,
          parameters: {
            max_new_tokens: 512,
            temperature: 0.7
          }
        })
      }
    )

    if (!r.ok) {
      const errText = await r.text()
      console.error('Hugging Face error:', errText)

      return res.status(502).json({
        error: 'Erreur de l API modèle',
        details: errText
      })
    }

    const data = await r.json()

    const reply =
      data?.[0]?.generated_text ||
      "Je n'ai pas réussi à répondre."

    return res.status(200).json({ reply })

  } catch (err) {
    console.error('Server error:', err)

    return res.status(500).json({
      error: 'Erreur serveur',
      details: err.message
    })
  }
}
