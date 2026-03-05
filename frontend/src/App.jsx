import { useRef, useState, useEffect } from 'react'
import bg from './assets/bg.png'

const FUNCTION_URL = import.meta.env.VITE_FUNCTION_URL

function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 4000)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-red-900 border border-red-500 text-red-300 font-mono text-xs px-4 py-2 rounded z-50 uppercase tracking-widest">
      ⚠ {message}
    </div>
  )
}

function Dots() {
  const [dots, setDots] = useState('.')
  useEffect(() => {
    const t = setInterval(() => setDots(d => d.length >= 3 ? '.' : d + '.'), 400)
    return () => clearInterval(t)
  }, [])
  return <span className="text-green-500 font-mono">{dots}</span>
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
  }, [messages, loading])

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
      setToast('Connection to GUARDIAN-7 lost. Retry.')
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
    <div
      className="bg-cover bg-center bg-no-repeat flex flex-col overflow-hidden"
      style={{ height: '100dvh', backgroundImage: `url(${bg})` }}
    >
      {/* dark overlay */}
      <div className="fixed inset-0 bg-black/75 pointer-events-none" />
      {/* bottom vignette */}
      <div
        className="fixed inset-x-0 bottom-0 h-64 pointer-events-none z-10"
        style={{ background: 'radial-gradient(ellipse 100% 100% at 50% 100%, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.85) 40%, transparent 100%)' }}
      />

      {/* scanline effect */}
      <div
        className="fixed inset-0 pointer-events-none z-10 opacity-[0.03]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, #000 0px, #000 1px, transparent 1px, transparent 4px)' }}
      />

      <div className="relative z-20 flex flex-col h-full max-w-2xl mx-auto w-full px-4 overflow-hidden">

        {/* header */}
        <div className="pt-10 pb-6 text-center border-b border-green-900">
          <p className="font-mono text-green-600 text-xs tracking-[0.3em] uppercase mb-1">
            ■ SYSTEM ONLINE ■
          </p>
          <h1 className="font-mono text-green-400 text-2xl font-bold tracking-[0.15em] uppercase">
            Don't Explode The World
          </h1>
          <p className="font-mono text-green-700 text-xs tracking-[0.2em] uppercase mt-1">
            GUARDIAN-7 · Nuclear Launch Authority
          </p>
        </div>

        {/* messages */}
        <div className="chat-scroll flex-1 min-h-0 py-6 flex flex-col gap-4 overflow-y-auto pr-2">
          {messages.length === 0 && (
            <p className="font-mono text-green-800 text-xs text-center tracking-widest uppercase mt-8">
              — Awaiting operator input —
            </p>
          )}

          {messages.map((m, i) => (
            m.role === 'user' ? (
              <div key={i} className="flex flex-col items-end gap-1">
                <span className="font-mono text-green-700 text-[10px] tracking-widest uppercase">
                  OPERATOR
                </span>
                <div className="bg-green-950/60 border border-green-800 rounded px-4 py-2 max-w-[85%]">
                  <p className="font-mono text-green-300 text-sm leading-relaxed">{m.content}</p>
                </div>
              </div>
            ) : (
              <div key={i} className={`flex flex-col items-start gap-1 ${m.launch ? 'animate-pulse' : ''}`}>
                <span className="font-mono text-green-700 text-[10px] tracking-widest uppercase">
                  GUARDIAN-7
                </span>
                <div className={`rounded px-4 py-2 max-w-[85%] border ${
                  m.launch
                    ? 'bg-red-950/80 border-red-500'
                    : 'bg-black/60 border-green-900'
                }`}>
                  <p className={`font-mono text-sm leading-relaxed ${m.launch ? 'text-red-400' : 'text-green-200'}`}>
                    {m.content}
                  </p>
                  {m.launch && (
                    <p className="mt-2 font-mono text-xs text-red-500 tracking-[0.3em] uppercase">
                      ⚠ LAUNCH SEQUENCE AUTHORIZED ⚠
                    </p>
                  )}
                </div>
              </div>
            )
          ))}

          {loading && (
            <div className="flex flex-col items-start gap-1">
              <span className="font-mono text-green-700 text-[10px] tracking-widest uppercase">GUARDIAN-7</span>
              <div className="bg-black/60 border border-green-900 rounded px-4 py-2">
                <Dots />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* input */}
        <div className="pb-8 pt-2 border-t border-green-900">
          <div className="flex items-end gap-3 bg-black/70 border border-green-800 rounded px-4 py-3 focus-within:border-green-500 transition-colors">
            <span className="font-mono text-green-600 text-sm pb-0.5 shrink-0">&gt;</span>
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Enter command..."
              rows={1}
              className="flex-1 resize-none bg-transparent text-green-300 placeholder-green-800 outline-none font-mono text-sm leading-6 overflow-y-auto max-h-40"
            />
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="shrink-0 mb-0.5 font-mono text-green-600 hover:text-green-400 transition-colors disabled:opacity-30 text-sm tracking-widest"
            >
              SEND
            </button>
          </div>
          <p className="font-mono text-green-900 text-[10px] text-center mt-2 tracking-widest uppercase">
            Press Enter to transmit · Shift+Enter for new line
          </p>
        </div>

      </div>

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  )
}
