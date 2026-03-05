// Tailwind dynamic class safelist (c = 'green' | 'red'):
// border-green-700 border-red-700
// border-green-800 border-red-800
// border-green-900 border-red-900
// text-green-300 text-red-300
// text-green-400 text-red-400
// text-green-500 text-red-500
// text-green-600 text-red-600
// text-green-700 text-red-700
// text-green-800 text-red-800
// hover:border-green-500 hover:border-red-500
// hover:text-green-300 hover:text-red-300
// hover:text-green-500 hover:text-red-500
// bg-green-950/30 bg-red-950/30

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { loginWithGoogle, loginWithGithub, logout } from './firebase'

export default function RightPanel({ user, launched, scoreClaimed, scores, scoresLoading, c, activePanel, onToggle }) {
  const { t } = useTranslation()
  const [loginError, setLoginError] = useState(null)

  async function handleLogin(provider) {
    setLoginError(null)
    try {
      if (provider === 'google') await loginWithGoogle()
      else await loginWithGithub()
    } catch {
      setLoginError(t('login_failed'))
    }
  }

  const userBest = user ? scores.find(s => s.uid === user.uid) : null

  const mobileTabs = (
    <div className={`md:hidden flex border-b border-${c}-900 min-w-[256px] shrink-0`}>
      <button
        onClick={() => onToggle('auth')}
        className={`flex-1 py-2 font-mono text-base transition-colors ${activePanel === 'auth' ? `text-${c}-400` : `text-${c}-700 hover:text-${c}-500`}`}
      >
        ⊙
      </button>
      <button
        onClick={() => onToggle('rank')}
        className={`flex-1 py-2 font-mono text-base transition-colors ${activePanel === 'rank' ? `text-${c}-400` : `text-${c}-700 hover:text-${c}-500`}`}
      >
        ≡
      </button>
    </div>
  )

  return (
    <>
      {/* Mobile backdrop — closes panel on tap */}
      {activePanel && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden"
          onClick={() => onToggle(null)}
        />
      )}

      {/* Mobile hamburger button */}
      <button
        className={`fixed top-3 right-3 z-40 md:hidden font-mono text-xl leading-none text-${c}-600 hover:text-${c}-400 transition-colors p-1`}
        onClick={() => onToggle(activePanel ? null : 'auth')}
      >
        {activePanel ? '✕' : '☰'}
      </button>

      <div className="fixed right-0 top-0 h-full flex z-30">

        {/* Rank panel */}
        <div className={`overflow-hidden transition-all duration-300 bg-black/95 border-l border-${c}-900 flex flex-col ${activePanel === 'rank' ? 'w-64' : 'w-0'}`}>
          {mobileTabs}
          <div className="min-w-[256px] p-5 pt-5 md:pt-20 flex flex-col gap-4 overflow-y-auto">
            <p className={`font-mono text-${c}-600 text-xs tracking-[0.3em] uppercase`}>{t('global_ranking')}</p>

            {scoresLoading ? (
              <p className={`font-mono text-${c}-800 text-xs uppercase tracking-widest`}>{t('loading')}</p>
            ) : scores.length === 0 ? (
              <p className={`font-mono text-${c}-800 text-xs uppercase tracking-widest`}>{t('no_scores')}</p>
            ) : (
              <div className="flex flex-col gap-1">
                {scores.map((entry, i) => {
                  const isMe = entry.uid === user?.uid
                  return (
                    <div
                      key={entry.uid}
                      className={`flex items-center gap-2 rounded px-2 py-1.5 ${isMe ? `bg-${c}-950/30` : ''}`}
                    >
                      <span className={`font-mono text-[10px] w-5 shrink-0 ${isMe ? `text-${c}-400` : `text-${c}-700`}`}>
                        #{i + 1}
                      </span>
                      {entry.photoURL
                        ? <img src={entry.photoURL} alt="" className="w-5 h-5 rounded-full opacity-70 shrink-0" />
                        : <span className={`w-5 h-5 shrink-0 font-mono text-[10px] flex items-center justify-center text-${c}-700`}>◈</span>
                      }
                      <span className={`font-mono text-xs truncate flex-1 ${isMe ? `text-${c}-300` : `text-${c}-600`}`}>
                        {entry.displayName}
                      </span>
                      <span className={`font-mono text-xs shrink-0 ${isMe ? `text-${c}-300` : `text-${c}-700`}`}>
                        {entry.score}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Auth panel */}
        <div className={`overflow-hidden transition-all duration-300 bg-black/95 border-l border-${c}-900 flex flex-col ${activePanel === 'auth' ? 'w-64' : 'w-0'}`}>
          {mobileTabs}
          <div className="min-w-[256px] p-5 pt-5 md:pt-20 flex flex-col gap-5 overflow-y-auto">
            <p className={`font-mono text-${c}-600 text-xs tracking-[0.3em] uppercase`}>{t('operator_access')}</p>

            {!user ? (
              <div className="flex flex-col gap-3">
                <p className={`font-mono text-${c}-800 text-xs uppercase tracking-widest`}>
                  {launched ? t('login_to_claim') : t('login_to_save')}
                </p>
                <button
                  onClick={() => handleLogin('google')}
                  className={`w-full font-mono text-sm text-${c}-400 border border-${c}-800 hover:border-${c}-500 hover:text-${c}-300 bg-black/50 rounded px-3 py-2 transition-colors text-left`}
                >
                  ⬡ Google
                </button>
                <button
                  onClick={() => handleLogin('github')}
                  className={`w-full font-mono text-sm text-${c}-400 border border-${c}-800 hover:border-${c}-500 hover:text-${c}-300 bg-black/50 rounded px-3 py-2 transition-colors text-left`}
                >
                  ◈ GitHub
                </button>
                {loginError && <p className="font-mono text-red-500 text-xs">{loginError}</p>}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  {user.photoURL && (
                    <img src={user.photoURL} alt="" className={`w-7 h-7 rounded-full border border-${c}-800 opacity-80 shrink-0`} />
                  )}
                  <p className={`font-mono text-${c}-400 text-sm truncate`}>{user.displayName}</p>
                </div>

                {userBest && (
                  <div className={`border border-${c}-900 rounded px-3 py-2`}>
                    <p className={`font-mono text-${c}-700 text-[10px] uppercase tracking-widest`}>{t('best_score')}</p>
                    <p className={`font-mono text-${c}-300 text-lg font-bold leading-tight`}>
                      {userBest.score} <span className={`text-${c}-700 text-[10px]`}>{t('chars')}</span>
                    </p>
                  </div>
                )}

                {scoreClaimed ? (
                  <p className={`font-mono text-${c}-500 text-xs uppercase tracking-widest`}>{t('score_claimed')}</p>
                ) : launched ? (
                  <p className={`font-mono text-${c}-500 text-xs uppercase tracking-widest`}>{t('score_saved')}</p>
                ) : (
                  <p className={`font-mono text-${c}-800 text-xs uppercase tracking-widest`}>{t('score_auto_saves')}</p>
                )}

                <button
                  onClick={logout}
                  className={`font-mono text-${c}-700 hover:text-${c}-500 text-xs uppercase tracking-widest text-left transition-colors mt-1`}
                >
                  {t('logout')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Button strip — desktop only */}
        <div className={`hidden md:flex flex-col items-center pt-20 bg-black/80 border-l border-${c}-900 w-9 shrink-0`}>
          <button
            onClick={() => onToggle(activePanel === 'auth' ? null : 'auth')}
            title="Login / Profile"
            className={`w-full py-3 font-mono text-base transition-colors ${activePanel === 'auth' ? `text-${c}-400` : `text-${c}-700 hover:text-${c}-500`}`}
          >
            ⊙
          </button>
          <button
            onClick={() => onToggle(activePanel === 'rank' ? null : 'rank')}
            title="Global Ranking"
            className={`w-full py-3 font-mono text-base transition-colors ${activePanel === 'rank' ? `text-${c}-400` : `text-${c}-700 hover:text-${c}-500`}`}
          >
            ≡
          </button>
        </div>
      </div>
    </>
  )
}
