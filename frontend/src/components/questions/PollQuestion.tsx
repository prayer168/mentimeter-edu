import { Question } from '@shared/types'

interface Props {
  question: Question
  onAnswer: (value: string) => void
  answered: boolean
}

export default function PollQuestion({ question, onAnswer, answered }: Props) {
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
        <div className="flex flex-col gap-3">
          {question.options?.map(option => (
            <button
              key={option}
              onClick={() => onAnswer(option)}
              /* min-h-[52px] 確保觸控目標 >= 44px (Apple HIG) */
              className="w-full min-h-[52px] py-3 px-5 bg-white border-2 border-blue-300 rounded-xl text-base font-medium text-gray-800 text-left active:scale-[0.98] active:bg-blue-50 active:border-blue-500 transition-transform"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
