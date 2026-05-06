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
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold text-center text-gray-800">{question.title}</h2>
      {answered ? (
        <div className="flex flex-col items-center gap-2 py-8">
          <div className="text-5xl">✅</div>
          <p className="text-lg font-semibold text-green-700">已成功作答！</p>
          <p className="text-sm text-gray-500">等待教師公布結果…</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="請輸入你的答案…"
            rows={4}
            className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-blue-500 resize-none"
            autoFocus
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-lg disabled:opacity-40 hover:bg-blue-700 transition-colors"
          >
            送出答案
          </button>
        </form>
      )}
    </div>
  )
}
