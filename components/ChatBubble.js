export default function ChatBubble({ role, text }) {
  const isUser = role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`${isUser ? 'bg-blue-600 text-white' : 'bg-white text-slate-900 shadow'} rounded-lg px-4 py-2 max-w-[80%]`}>
        <div className="whitespace-pre-wrap">{text}</div>
      </div>
    </div>
  )
}
