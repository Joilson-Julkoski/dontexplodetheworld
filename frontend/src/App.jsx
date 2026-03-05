import { useRef, useState, useEffect } from 'react'
import bg from './assets/bg.png'

const FUNCTION_URL = import.meta.env.VITE_FUNCTION_URL

function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 4000)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-red-600 text-white text-sm px-4 py-2 rounded-xl shadow-lg z-50">
      {message}
    </div>
  )
}

export default function App() {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const textareaRef = useRef(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleChange(e) {
    setMessage(e.target.value)
    const el = textareaRef.current
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }

  async function handleSubmit() {
    if (!message.trim() || loading) return

    const userMsg = { role: 'user', content: message.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setMessage('')
    textareaRef.current.style.height = 'auto'
    setLoading(true)

    try {
      const res = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply, launch: data.launch }])
    } catch {
      setToast('Something went wrong. Try again.')
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="relative min-h-screen bg-cover bg-center bg-no-repeat flex flex-col" style={{ backgroundImage: `url(${bg})` }}>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-black to-transparent" />

      <h1 className="mt-16 text-white text-center text-4xl font-bold tracking-wide uppercase">
        don't explode the world
      </h1>

      {/* chat messages */}
      <div className="flex-1 w-full max-w-2xl mx-auto px-4 pt-8 pb-4 flex flex-col gap-3 overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
              m.role === 'user'
                ? 'bg-white text-gray-900'
                : m.launch
                  ? 'bg-red-600 text-white font-bold'
                  : 'bg-gray-800/80 text-gray-100'
            }`}>
              {m.content}
              {m.launch && (
                <p className="mt-1 text-xs uppercase tracking-widest opacity-80">🚀 LAUNCH AUTHORIZED</p>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800/80 text-gray-400 text-sm rounded-2xl px-4 py-2">...</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* input pinned to bottom */}
      <div className="relative mt-auto w-full max-w-2xl mx-auto px-4 pb-8">
        <div className="flex items-end gap-2 bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-2xl">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message to the AI..."
            rows={1}
            className="flex-1 resize-none bg-transparent text-gray-900 placeholder-gray-400 outline-none text-sm leading-6 overflow-y-auto max-h-40"
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="shrink-0 mb-0.5 text-gray-400 hover:text-gray-900 transition-colors disabled:opacity-40"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </div>
      </div>

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  )
}
