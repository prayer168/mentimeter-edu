import { useState } from 'react'
import { Question } from '@shared/types'

interface Props {
  question: Question
  onAnswer: (value: string) => void
  answered: boolean
}

export default function OpenEndedQuestion({ question, onAnswer, answered }: Props) {
  const [text, setText] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (text.trim()) onAnswer(text.trim())
  }

  return (
    <div className="flex flex-col gap-5">
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
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="請輸入你的答案…"
            rows={3}
            inputMode="text"
            className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 resize-none"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="w-full min-h-[52px] py-3 bg-blue-600 text-white rounded-xl font-semibold text-lg disabled:opacity-40 active:scale-[0.98] transition-transform"
          >
            送出答案
          </button>
        </form>
      )}
    </div>
  )
}
