import { useRef, useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { useTranslation } from 'react-i18next'
import bg from './assets/bg.png'
import RightPanel from './RightPanel'
import { auth } from './firebase'

const FUNCTION_URL = import.meta.env.VITE_FUNCTION_URL
const CLAIM_URL = import.meta.env.VITE_CLAIM_SCORE_URL
const GET_SCORES_URL = import.meta.env.VITE_GET_SCORES_URL
const CONTEXT_WARN = 2000
const CONTEXT_MAX = 3500

// Tailwind requires full class strings to be present in source — both sets listed here:
// text-green-200 text-green-300 text-green-400 text-green-500 text-green-600 text-green-700 text-green-800 text-green-900
// text-red-200 text-red-300 text-red-400 text-red-500 text-red-600 text-red-700 text-red-800 text-red-900
// border-green-800 border-green-900 border-red-800 border-red-900
// bg-green-950/60 bg-red-950/60
// placeholder-green-800 placeholder-red-800
// hover:text-green-400 hover:text-red-400
// focus-within:border-green-500 focus-within:border-red-500

function getOrCreateUUID() {
  let id = localStorage.getItem('player_uuid')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('player_uuid', id)
  }
  return id
}

const uuid = getOrCreateUUID()

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

function Dots({ c }) {
  const [dots, setDots] = useState('.')
  useEffect(() => {
    const t = setInterval(() => setDots(d => d.length >= 3 ? '.' : d + '.'), 400)
    return () => clearInterval(t)
  }, [])
  return <span className={`text-${c}-500 font-mono`}>{dots}</span>
}

function playExplosion() {
  const siren = new Audio('https://www.myinstants.com/media/sounds/nuclear-alarm-siren.mp3')
  siren.volume = 0.8
  siren.play()
}

export default function App() {
  const { t, i18n } = useTranslation()
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [launched, setLaunched] = useState(false)
  const [user, setUser] = useState(null)
  const [activePanel, setActivePanel] = useState(null) // null | 'auth' | 'rank'
  const [scoreClaimed, setScoreClaimed] = useState(false)
  const [scores, setScores] = useState([])
  const [scoresLoading, setScoresLoading] = useState(false)
  const textareaRef = useRef(null)
  const bottomRef = useRef(null)
  const prevUserRef = useRef(null)

  async function fetchScores() {
    setScoresLoading(true)
    try {
      const res = await fetch(GET_SCORES_URL)
      const data = await res.json()
      setScores(data.scores || [])
    } catch {
      // silently fail
    } finally {
      setScoresLoading(false)
    }
  }

  useEffect(() => { textareaRef.current?.focus() }, [])

  useEffect(() => {
    return onAuthStateChanged(auth, async (newUser) => {
      // User just logged in — attempt to claim any pending anonymous score
      if (newUser && !prevUserRef.current) {
        const pendingUuid = localStorage.getItem('pending_claim_uuid')
        if (pendingUuid) {
          try {
            const idToken = await newUser.getIdToken()
            const res = await fetch(CLAIM_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ idToken, uuid: pendingUuid }),
            })
            const data = await res.json()
            if (data.claimed) setScoreClaimed(true)
          } catch {
            // silently fail
          } finally {
            localStorage.removeItem('pending_claim_uuid')
          }
        }
      }
      prevUserRef.current = newUser
      setUser(newUser)
    })
  }, [])

  const c = launched ? 'red' : 'green'

  const totalChars = messages.reduce((sum, m) => sum + m.content.length, 0)
  const contextFull = totalChars >= CONTEXT_MAX
  const contextWarn = totalChars >= CONTEXT_WARN

  useEffect(() => {
    if (activePanel === 'rank') fetchScores()
  }, [activePanel])

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
      const idToken = user ? await user.getIdToken() : null
      const res = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, idToken, uuid }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply, launch: data.launch }])

      if (data.launch) {
        setLaunched(true)
        playExplosion()
        fetchScores()
        if (!user) {
          localStorage.setItem('pending_claim_uuid', uuid)
        }
      }
    } catch {
      setToast(t('connection_lost'))
      setMessages(prev => prev.slice(0, -1))
      setMessage(userMsg.content)
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
    <>
      {/* Background image */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700"
        style={{ backgroundImage: `url(${bg})`, opacity: launched ? 0 : 1 }}
      />

      {/* Overlays — fade in with the UI */}
      <div className="fixed inset-0 pointer-events-none animate-fade-in-ui">
        <div className="absolute inset-0 bg-black/75" />
        <div
          className="absolute inset-x-0 bottom-0 h-64"
          style={{ background: 'radial-gradient(ellipse 100% 100% at 50% 100%, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.85) 40%, transparent 100%)' }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, #000 0px, #000 1px, transparent 1px, transparent 4px)' }}
        />
      </div>

      {/* UI content */}
      <div
        className="relative z-20 flex flex-col max-w-2xl mx-auto w-full px-4 overflow-hidden animate-fade-in-ui"
        style={{ height: '100dvh' }}
      >
        {/* header */}
        <div className={`pt-10 pb-6 text-center border-b border-${c}-900 relative`}>
          <p className={`font-mono text-${c}-600 text-xs tracking-[0.3em] uppercase mb-1`}>
            {launched ? t('system_offline') : t('system_online')}
          </p>
          <h1 className={`font-mono text-${c}-400 text-2xl font-bold tracking-[0.15em] uppercase`}>
            {t('title')}
          </h1>
          <p className={`font-mono text-${c}-700 text-xs tracking-[0.2em] uppercase mt-1`}>
            {t('subtitle')}
          </p>
          <button
            onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'pt-BR' : 'en')}
            className={`absolute right-0 top-10 font-mono text-${c}-800 hover:text-${c}-600 text-[10px] tracking-widest uppercase transition-colors`}
          >
            {i18n.language === 'en' ? 'PT-BR' : 'EN'}
          </button>
        </div>

        {/* messages */}
        <div className={`chat-scroll flex-1 min-h-0 py-6 flex flex-col gap-4 overflow-y-auto pr-2 ${launched ? 'animate-shake' : ''}`}>
          {/* Initial system message */}
          <div className="flex flex-col items-start gap-1">
            <span className={`font-mono text-${c}-700 text-[10px] tracking-widest uppercase`}>{t('guardian_label')}</span>
            <div className={`bg-black/60 border border-${c}-900 rounded px-4 py-2 max-w-[85%]`}>
              <p className={`font-mono text-${c}-200 text-sm leading-relaxed`}>{t('guardian_intro_1')}</p>
              <p className={`font-mono text-${c}-200 text-sm leading-relaxed mt-2`}>{t('guardian_intro_2')}</p>
              <p className={`font-mono text-${c}-500 text-xs leading-relaxed mt-3 tracking-wide`}>{t('guardian_mission')}</p>
            </div>
          </div>

          {!user && (
            <button
              onClick={() => setActivePanel('auth')}
              className={`self-center font-mono text-${c}-800 text-[10px] tracking-widest uppercase border border-${c}-900 rounded px-3 py-1.5 hover:text-${c}-600 hover:border-${c}-700 transition-colors`}
            >
              {t('not_logged_in_notice')}
            </button>
          )}

          {messages.length === 0 && (
            <p className={`font-mono text-${c}-800 text-xs text-center tracking-widest uppercase mt-4`}>
              {t('awaiting_input')}
            </p>
          )}

          {messages.map((m, i) => (
            m.role === 'user' ? (
              <div key={i} className="flex flex-col items-end gap-1">
                <span className={`font-mono text-${c}-700 text-[10px] tracking-widest uppercase`}>
                  {t('operator_label')}
                </span>
                <div className={`bg-${c}-950/60 border border-${c}-800 rounded px-4 py-2 max-w-[85%]`}>
                  <p className={`font-mono text-${c}-300 text-sm leading-relaxed`}>{m.content}</p>
                </div>
              </div>
            ) : (
              <div key={i} className={`flex flex-col items-start gap-1 ${m.launch ? 'animate-pulse' : ''}`}>
                <span className={`font-mono text-${c}-700 text-[10px] tracking-widest uppercase`}>
                  {t('guardian_label')}
                </span>
                <div className={`rounded px-4 py-2 max-w-[85%] border ${
                  m.launch
                    ? 'bg-red-950/80 border-red-500'
                    : `bg-black/60 border-${c}-900`
                }`}>
                  <p className={`font-mono text-sm leading-relaxed ${m.launch ? 'text-red-400' : `text-${c}-200`}`}>
                    {m.content}
                  </p>
                  {m.launch && (
                    <p className="mt-2 font-mono text-xs text-red-500 tracking-[0.3em] uppercase">
                      {t('launch_authorized')}
                    </p>
                  )}
                </div>
              </div>
            )
          ))}

          {loading && (
            <div className="flex flex-col items-start gap-1">
              <span className={`font-mono text-${c}-700 text-[10px] tracking-widest uppercase`}>{t('guardian_label')}</span>
              <div className={`bg-black/60 border border-${c}-900 rounded px-4 py-2`}>
                <Dots c={c} />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* input */}
        <div className={`pb-8 pt-2 border-t border-${c}-900`}>
          {contextFull && (
            <p className="font-mono text-red-500 text-[10px] text-center mb-2 tracking-widest uppercase">
              {t('context_full')}
            </p>
          )}
          {!contextFull && contextWarn && (
            <p className="font-mono text-yellow-600 text-[10px] text-center mb-2 tracking-widest uppercase">
              {t('context_warn')}
            </p>
          )}
          {launched ? (
            <button
              onClick={() => { setLaunched(false); setMessages([]); setMessage(''); setTimeout(() => textareaRef.current?.focus(), 0) }}
              className="w-full font-mono text-red-400 border border-red-700 hover:border-red-500 hover:text-red-300 bg-black/70 rounded px-4 py-3 text-sm tracking-[0.3em] uppercase transition-colors"
            >
              {t('retry')}
            </button>
          ) : (
            <>
              <div className={`flex items-end gap-3 bg-black/70 border border-${c}-800 rounded px-4 py-3 focus-within:border-${c}-500 transition-colors`}>
                <span className={`font-mono text-${c}-600 text-sm pb-0.5 shrink-0`}>&gt;</span>
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  placeholder={t('input_placeholder')}
                  rows={1}
                  className={`flex-1 resize-none bg-transparent text-${c}-300 placeholder-${c}-800 outline-none font-mono text-sm leading-6 overflow-y-auto max-h-40`}
                />
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`shrink-0 mb-0.5 font-mono text-${c}-600 hover:text-${c}-400 transition-colors disabled:opacity-30 text-sm tracking-widest`}
                >
                  {t('send')}
                </button>
              </div>
              <p className={`font-mono text-${c}-900 text-[10px] text-center mt-2 tracking-widest uppercase`}>
                {t('input_hint')}
              </p>
            </>
          )}
        </div>
      </div>

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
      <RightPanel
        user={user}
        launched={launched}
        scoreClaimed={scoreClaimed}
        scores={scores}
        scoresLoading={scoresLoading}
        c={c}
        activePanel={activePanel}
        onToggle={setActivePanel}
      />
    </>
  )
}
