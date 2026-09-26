import { useState } from "react"
import type { CardType } from "../lib/types"

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function formatRangeItem(item: string | number): string {
  return String(item)
}

export default function Card({ type, range, notes, index = 0, total = 1 }: CardType) {
  const [promptOpen, setPromptOpen] = useState(false)

  const [rolledRange] = useState<string>(() => {
    if (!range || range.length === 0) return ""
    const picked = pickRandom(range)
    return formatRangeItem(picked)
  })

  return (
    <div className="w-full min-w-0 flex-1 rounded-2xl border border-stone-200/80 bg-white flex flex-col justify-between p-8 min-h-[400px] shadow-sm">
      <div className="flex flex-col gap-7 min-w-0">
        {/* TYPE SECTION */}
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-stone-400 mb-2">
            TYPE
          </p>
          <h2 className="text-3xl font-serif text-stone-900 font-normal leading-tight break-words">
            {type}
          </h2>
        </div>

        {/* RANGE SECTION */}
        <div className="text-left">
          <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-stone-400 mb-2">
            RANGE
          </p>
          <p className="text-xl font-sans text-stone-800 font-normal break-words">
            {rolledRange}
          </p>
          {range && range.length > 1 && (
            <p className="text-xs text-stone-400 font-light mt-1">
              1 of {range.length}
            </p>
          )}
        </div>

        {/* NOTES SECTION */}
        {notes && (
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => setPromptOpen((o) => !o)}
              className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.15em] text-stone-400 hover:text-stone-600 transition-colors bg-transparent border-none p-0 cursor-pointer outline-none"
            >
              <svg
                className={`w-3 h-3 transition-transform duration-200 ${
                  promptOpen ? "rotate-90" : "rotate-0"
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
              <span>NOTES</span>
            </button>
            {promptOpen && (
              <p className="mt-3 text-sm text-stone-600 font-light leading-relaxed border-l-2 border-stone-300 pl-3 break-words whitespace-pre-wrap text-left">
                {notes}
              </p>
            )}
          </div>
        )}
      </div>

      {/* FOOTER COUNTER */}
      <div className="flex justify-end pt-4">
        <span className="text-xs text-stone-400 font-light tracking-widest tabular-nums">
          {index + 1} / {total}
        </span>
      </div>
    </div>
  )
}