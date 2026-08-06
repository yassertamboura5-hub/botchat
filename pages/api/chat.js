export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { messages } = req.body
  const apiKey = process.env.OPENAI_API_KEY
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'

  if (!apiKey) {
    return res.status(500).json({
      error: 'OPENAI_API_KEY not set on server'
    })
  }

  try {
    const response = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: 512,
          temperature: 0.7
        })
      }
    )

    if (!response.ok) {
      const errorText = await response.text()

      return res.status(502).json({
        error: 'Erreur API OpenAI',
        details: errorText
      })
    }

    const data = await response.json()

    return res.status(200).json({
      reply: data.choices[0].message.content
    })

  } catch (err) {
    console.error(err)

    return res.status(500).json({
      error: 'Erreur serveur',
      details: err.message
    })
  }
          }
