import { useRef, useState } from 'react'

function App() {
  const [message, setMessage] = useState('')
  const [focused, setFocused] = useState(false)
  const textareaRef = useRef(null)

  function handleChange(e) {
    setMessage(e.target.value)
    const el = textareaRef.current
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }

  function handleSubmit() {
    if (!message.trim()) return
    // TODO: call Firebase function
    console.log('send:', message)
    setMessage('')
    textareaRef.current.style.height = 'auto'
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat flex flex-col justify-center items-center">
      <h1 className="text-gray-900 text-center text-4xl font-bold mb-6 tracking-wide uppercase">
        don't explode the world
      </h1>
      <div className={`w-full max-w-2xl px-4 transition-all duration-300 ${focused ? '-translate-y-4' : ''}`}>
        <div className="flex items-end gap-2 bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-2xl">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Type your message to the AI..."
            rows={1}
            className="flex-1 resize-none bg-transparent text-gray-900 placeholder-gray-400 outline-none text-sm leading-6 overflow-y-auto max-h-40"
          />
          <button
            onClick={handleSubmit}
            className="shrink-0 mb-0.5 text-gray-400 hover:text-gray-900 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
