import { Question } from '@shared/types'

interface Props {
  question: Question
  onAnswer: (value: string) => void
  answered: boolean
}

export default function PollQuestion({ question, onAnswer, answered }: Props) {
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
        <div className="grid gap-3">
          {question.options?.map(option => (
            <button
              key={option}
              onClick={() => onAnswer(option)}
              className="w-full py-4 px-6 bg-white border-2 border-blue-300 rounded-xl text-base font-medium text-gray-800 hover:bg-blue-50 hover:border-blue-500 active:scale-95 transition-all"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
