export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { messages } = req.body
  const apiKey = process.env.HCNSEC_API_KEY || process.env.OPENAI_API_KEY
  const useHcnsec = !!process.env.HCNSEC_API_KEY
  const model = (useHcnsec ? process.env.HCNSEC_MODEL : process.env.OPENAI_MODEL) || (useHcnsec ? 'deepseek-v4' : 'gpt-4o-mini')

  if (!apiKey) {
    return res.status(500).json({
      error: 'API key not set on server'
    })
  }

  const endpoint = useHcnsec ? 'https://api.hcnsec.cn/v1/chat/completions' : 'https://api.openai.com/v1/chat/completions'

  try {
    const response = await fetch(
      endpoint,
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
        error: useHcnsec ? 'Erreur API HCNSEC' : 'Erreur API OpenAI',
        details: errorText
      })
    }

    const data = await response.json()

    return res.status(200).json({
      reply: data.choices?.[0]?.message?.content ?? null
    })

  } catch (err) {
    console.error(err)

    return res.status(500).json({
      error: 'Erreur serveur',
      details: err.message
    })
  }
}
