import { useEffect, useState, useRef } from 'react'
import ChatBubble from '../components/ChatBubble'

export default function Home() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const listRef = useRef(null)

  // Charger l'historique depuis localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('chat_history')
      if (saved) setMessages(JSON.parse(saved))
    } catch (e) {
      console.error('Impossible de charger l\'historique', e)
    }
  }, [])

  // Sauvegarder à chaque changement
  useEffect(() => {
    localStorage.setItem('chat_history', JSON.stringify(messages))
    // scroll to bottom
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages])

  async function handleSend(e) {
    e && e.preventDefault()
    const text = input.trim()
    if (!text) return
    const userMsg = { role: 'user', content: text, id: Date.now() + '-u' }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      // On envoie l'historique utile au serveur (on peut tronquer)
      const payload = {
        messages: newMessages.map(m => ({ role: m.role, content: m.content })).slice(-12)
      }
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const err = await res.text()
        throw new Error(err || 'Erreur serveur')
      }
      const data = await res.json()
      const botReply = { role: 'assistant', content: data.reply ?? '...' , id: Date.now() + '-b' }
      setMessages(prev => [...prev, botReply])
    } catch (err) {
      console.error(err)
      const errorMsg = { role: 'assistant', content: 'Erreur: ' + (err.message || 'échec de la requête'), id: Date.now() + '-err' }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden flex flex-col" style={{height: '80vh'}}>
        <header className="px-6 py-4 border-b">
          <h1 className="text-xl font-semibold">Chatbot MVP</h1>
          <p className="text-sm text-slate-500">Interface simple — les messages restent en localStorage</p>
        </header>

        <main ref={listRef} className="flex-1 overflow-auto p-6">
          {messages.length === 0 && (
            <div className="text-center text-slate-400">Commence la conversation en bas 👇</div>
          )}
          {messages.map(m => (
            <ChatBubble key={m.id} role={m.role} text={m.content} />
          ))}
        </main>

        <form onSubmit={handleSend} className="p-4 border-t">
          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              rows={2}
              placeholder="Écris ton message ici..."
              className="flex-1 resize-none rounded-md border px-3 py-2 focus:outline-none focus:ring"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-60"
            >
              {loading ? 'Envoi...' : 'Envoyer'}
            </button>
          </div>
        </form>
      </div>

      <footer className="mt-4 text-sm text-slate-500">
        Clef API côté serveur requise — ne la mets jamais dans le client.
      </footer>
    </div>
  )
}
