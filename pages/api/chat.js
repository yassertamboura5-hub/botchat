export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { messages } = req.body
  const apiKey = process.env.OPENAI_API_KEY
  const model = process.env.OPENAI_MODEL || 'gpt-4'

  // Si la clé manque : en dev on renvoie un mock pour tester l'UI, sinon erreur 500 en prod
  if (!apiKey) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('OPENAI_API_KEY not set — returning mock reply for development/testing.')
      const lastUser = (messages && messages.length) ? messages[messages.length - 1].content : 'Bonjour'
      const mockReply = `Réponse factice (mock) : j'ai bien reçu ton message "${String(lastUser).slice(0,200)}". Configure OPENAI_API_KEY pour utiliser l'API réelle.`
      return res.status(200).json({ reply: mockReply })
    }

    return res.status(500).json({ error: 'OPENAI_API_KEY not set on server' })
  }

  try {
    const payload = {
      model,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      max_tokens: 512,
      temperature: 0.7
    }

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    })

    if (!r.ok) {
      const errText = await r.text()
      console.error('OpenAI error', r.status, errText)
      return res.status(502).json({ error: 'Erreur de l\'API de modèle', details: errText })
    }

    const data = await r.json()
    // selon la réponse, prendre le contenu
    const reply = data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text ?? ''
    return res.status(200).json({ reply })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Erreur serveur', details: err.message })
  }
}
