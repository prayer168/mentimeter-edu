import { useEffect, useRef } from 'react'
import { Answer, Question } from '@shared/types'

interface Props {
  question: Question
  answers: Answer[]
}

export default function OpenEndedResult({ question, answers }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [answers.length])

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-center text-white">{question.title}</h2>
      <p className="text-center text-gray-400 text-sm">共 {answers.length} 則回答</p>

      <div className="flex flex-col gap-2 max-h-[28rem] overflow-y-auto pr-1">
        {answers.length === 0 ? (
          <p className="text-center text-gray-500 py-12 text-lg">等待學生作答…</p>
        ) : (
          answers.map((a, i) => (
            <div
              key={a.id}
              className="bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white text-base shadow-sm"
              style={{ animation: 'slideIn 0.3s ease-out' }}
            >
              <span className="text-gray-400 text-sm mr-2">{i + 1}.</span>
              {a.value}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
