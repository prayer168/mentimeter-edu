import { useState } from 'react'
import { Question } from '@shared/types'

interface Props {
  question: Question
  onAnswer: (value: string) => void
  answered: boolean
}

export default function WordCloudQuestion({ question, onAnswer, answered }: Props) {
  const [text, setText] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = text.trim()
    if (trimmed) onAnswer(trimmed)
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-lg font-bold text-center text-gray-800 leading-snug">
        {question.title}
      </h2>
      <p className="text-center text-sm text-gray-400">輸入 1～3 個關鍵字</p>

      {answered ? (
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="text-6xl">✅</div>
          <p className="text-lg font-semibold text-green-700">已成功作答！</p>
          <p className="text-sm text-gray-400">等待教師公布結果…</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="例如：光合作用"
            maxLength={20}
            inputMode="text"
            className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-center text-lg focus:outline-none focus:border-purple-500"
          />
          <p className="text-xs text-right text-gray-400">{text.length} / 20</p>
          <button
            type="submit"
            disabled={!text.trim()}
            className="w-full min-h-[52px] py-3 bg-purple-600 text-white rounded-xl font-semibold text-lg disabled:opacity-40 active:scale-[0.98] transition-transform"
          >
            送出
          </button>
        </form>
      )}
    </div>
  )
}
