// Tailwind dynamic class safelist (c = 'green' | 'red'):
// border-green-700 border-red-700
// hover:border-green-500 hover:border-red-500
// hover:border-green-400 hover:border-red-400
// hover:text-green-300 hover:text-red-300
// hover:text-green-600 hover:text-red-600

import { loginWithGoogle, loginWithGithub, logout } from './firebase'
import { useState } from 'react'

export default function Sidebar({ user, launched, scoreClaimed, c, open, onToggle }) {
  const [error, setError] = useState(null)

  async function handleLogin(provider) {
    setError(null)
    try {
      if (provider === 'google') await loginWithGoogle()
      else await loginWithGithub()
    } catch {
      setError('Login failed.')
    }
  }

  return (
    <div className="fixed right-0 top-0 h-full flex z-30">
      {/* Panel */}
      <div
        className={`overflow-hidden transition-all duration-300 bg-black/95 border-l border-${c}-900 flex flex-col ${open ? 'w-56' : 'w-0'}`}
      >
        <div className="p-4 pt-20 flex flex-col gap-4 min-w-[224px]">
          <p className={`font-mono text-${c}-600 text-[10px] tracking-[0.3em] uppercase`}>
            Operator Access
          </p>

          {!user ? (
            <div className="flex flex-col gap-2">
              <p className={`font-mono text-${c}-800 text-[10px] uppercase tracking-widest`}>
                {launched ? 'Login to claim your score' : 'Login to save your score'}
              </p>
              <button
                onClick={() => handleLogin('google')}
                className={`w-full font-mono text-xs text-${c}-400 border border-${c}-800 hover:border-${c}-500 hover:text-${c}-300 bg-black/50 rounded px-3 py-2 transition-colors text-left`}
              >
                ⬡ Google
              </button>
              <button
                onClick={() => handleLogin('github')}
                className={`w-full font-mono text-xs text-${c}-400 border border-${c}-800 hover:border-${c}-500 hover:text-${c}-300 bg-black/50 rounded px-3 py-2 transition-colors text-left`}
              >
                ◈ GitHub
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 min-w-0">
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt=""
                    className={`w-6 h-6 rounded-full border border-${c}-800 opacity-80 shrink-0`}
                  />
                )}
                <p className={`font-mono text-${c}-400 text-xs truncate`}>{user.displayName}</p>
              </div>

              {scoreClaimed ? (
                <p className={`font-mono text-${c}-500 text-[10px] uppercase tracking-widest`}>
                  ✓ Anonymous score claimed
                </p>
              ) : launched ? (
                <p className={`font-mono text-${c}-500 text-[10px] uppercase tracking-widest`}>
                  ✓ Score auto-saved
                </p>
              ) : (
                <p className={`font-mono text-${c}-800 text-[10px] uppercase tracking-widest`}>
                  Score saves automatically on win
                </p>
              )}

              <button
                onClick={logout}
                className={`font-mono text-${c}-800 hover:text-${c}-600 text-[10px] uppercase tracking-widest text-left transition-colors mt-1`}
              >
                Logout
              </button>
            </div>
          )}

          {error && (
            <p className="font-mono text-red-500 text-[10px]">{error}</p>
          )}
        </div>
      </div>

      {/* Toggle tab */}
      <button
        onClick={onToggle}
        className={`self-start mt-24 bg-black/80 border border-${c}-900 border-l-0 text-${c}-600 hover:text-${c}-400 w-7 h-14 flex items-center justify-center rounded-r transition-colors shrink-0`}
      >
        <span className="font-mono text-xs">{open ? '◀' : '▶'}</span>
      </button>
    </div>
  )
}
