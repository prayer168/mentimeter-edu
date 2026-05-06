import { useState } from 'react'
import { Question } from '@shared/types'

interface Props {
  question: Question
  onAnswer: (value: string) => void
  answered: boolean
}

export default function ScalesQuestion({ question, onAnswer, answered }: Props) {
  const [value, setValue] = useState<number | null>(null)
  const minLabel = question.options?.[0] ?? '非常不同意'
  const maxLabel = question.options?.[1] ?? '非常同意'

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (value !== null) onAnswer(String(value))
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-center text-gray-800 leading-snug">
        {question.title}
      </h2>

      {answered ? (
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="text-6xl">✅</div>
          <p className="text-lg font-semibold text-green-700">已成功作答！</p>
          <p className="text-sm text-gray-400">等待教師公布結果…</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* 標籤列 */}
          <div className="flex justify-between text-xs text-gray-400 px-1">
            <span>1 — {minLabel}</span>
            <span>{maxLabel} — 10</span>
          </div>

          {/* 數字按鈕：2行×5列，aspect-square 確保每格正方形，觸控面積足夠 */}
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setValue(n)}
                className={`aspect-square w-full flex items-center justify-center rounded-xl font-bold text-lg border-2 transition-all active:scale-95 ${
                  value === n
                    ? 'bg-orange-500 border-orange-500 text-white shadow-md scale-105'
                    : 'bg-white border-gray-200 text-gray-700 active:border-orange-400'
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          {/* 已選顯示 */}
          <div className="h-10 flex items-center justify-center">
            {value !== null && (
              <p className="text-3xl font-bold text-orange-500 animate-[wordPop_0.2s_ease-out]">
                {value} 分
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={value === null}
            className="w-full min-h-[52px] py-3 bg-orange-500 text-white rounded-xl font-semibold text-lg disabled:opacity-40 active:scale-[0.98] transition-transform"
          >
            送出
          </button>
        </form>
      )}
    </div>
  )
}
