// Tailwind dynamic class safelist (c = 'green' | 'red'):
// border-green-900 border-red-900 border-l-0
// text-green-600 text-red-600
// text-green-700 text-red-700
// text-green-800 text-red-800
// text-green-300 text-red-300
// text-green-400 text-red-400
// hover:text-green-400 hover:text-red-400
// bg-green-950/30 bg-red-950/30

export default function Leaderboard({ scores, loading, user, c, open, onToggle }) {
  return (
    <div className="fixed left-0 top-0 h-full flex z-30">
      {/* Panel */}
      <div
        className={`overflow-hidden transition-all duration-300 bg-black/95 border-r border-${c}-900 flex flex-col ${open ? 'w-64' : 'w-0'}`}
      >
        <div className="p-5 pt-20 flex flex-col gap-4 min-w-[256px]">
          <p className={`font-mono text-${c}-600 text-xs tracking-[0.3em] uppercase`}>
            Global Ranking
          </p>

          {loading ? (
            <p className={`font-mono text-${c}-800 text-xs uppercase tracking-widest`}>Loading...</p>
          ) : scores.length === 0 ? (
            <p className={`font-mono text-${c}-800 text-xs uppercase tracking-widest`}>No scores yet</p>
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

      {/* Toggle tab — on the right side of the panel */}
      <button
        onClick={onToggle}
        className={`self-start mt-24 bg-black/80 border border-${c}-900 border-l-0 text-${c}-600 hover:text-${c}-400 w-8 h-16 flex items-center justify-center rounded-r transition-colors shrink-0`}
      >
        <span className="font-mono text-sm">{open ? '◀' : '▶'}</span>
      </button>
    </div>
  )
}
