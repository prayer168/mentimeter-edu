import { useState } from 'react'
import { Question } from '@shared/types'

interface Props {
  question: Question
  onAnswer: (value: string) => void
  answered: boolean
}

export default function RankingQuestion({ question, onAnswer, answered }: Props) {
  const [items, setItems] = useState<string[]>(() => {
    const opts = [...(question.options ?? [])]
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]]
    }
    return opts
  })

  function move(idx: number, dir: -1 | 1) {
    const next = [...items]
    const target = idx + dir
    if (target < 0 || target >= next.length) return
    ;[next[idx], next[target]] = [next[target], next[idx]]
    setItems(next)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onAnswer(JSON.stringify(items))
  }

  const RANK_COLOR = ['text-yellow-500', 'text-gray-400', 'text-orange-400']

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-center text-gray-800 leading-snug">
        {question.title}
      </h2>
      <p className="text-center text-sm text-gray-400">點 ▲▼ 調整順序，第 1 名在最上方</p>

      {answered ? (
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="text-6xl">✅</div>
          <p className="text-lg font-semibold text-green-700">已成功作答！</p>
          <p className="text-sm text-gray-400">等待教師公布結果…</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            {items.map((item, i) => (
              <div
                key={item}
                className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2"
              >
                {/* 排名號碼 */}
                <span className={`w-7 text-base font-bold shrink-0 text-center ${RANK_COLOR[i] ?? 'text-gray-400'}`}>
                  {i + 1}
                </span>

                {/* 項目文字 */}
                <span className="flex-1 text-base text-gray-800 leading-snug">{item}</span>

                {/* 上下按鈕 — min 44×44px */}
                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    aria-label="往上"
                    className="w-11 h-11 flex items-center justify-center rounded-xl bg-white border border-gray-300 text-gray-600 text-lg font-bold disabled:opacity-20 active:bg-gray-100 active:scale-95 transition-transform"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === items.length - 1}
                    aria-label="往下"
                    className="w-11 h-11 flex items-center justify-center rounded-xl bg-white border border-gray-300 text-gray-600 text-lg font-bold disabled:opacity-20 active:bg-gray-100 active:scale-95 transition-transform"
                  >
                    ▼
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="w-full min-h-[52px] py-3 bg-teal-600 text-white rounded-xl font-semibold text-lg active:scale-[0.98] transition-transform mt-1"
          >
            確認排序
          </button>
        </form>
      )}
    </div>
  )
}
