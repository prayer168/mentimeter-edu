import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Activity, Question, Answer } from '@shared/types'
import { useAuth } from '../contexts/AuthContext'
import PollResult from '../components/questions/PollResult'
import OpenEndedResult from '../components/questions/OpenEndedResult'
import WordCloudResult from '../components/questions/WordCloudResult'
import ScalesResult from '../components/questions/ScalesResult'
import RankingResult from '../components/questions/RankingResult'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3001'

const TYPE_LABEL: Record<string, string> = {
  poll: 'Poll', open_ended: '開放', word_cloud: '文字雲', scales: '量尺', ranking: '排序',
}
const TYPE_COLOR: Record<string, string> = {
  poll: 'text-blue-400', open_ended: 'text-purple-400', word_cloud: 'text-pink-400',
  scales: 'text-orange-400', ranking: 'text-teal-400',
}

export default function TeacherResults() {
  const { activityId } = useParams<{ activityId: string }>()
  const navigate = useNavigate()
  const { session } = useAuth()

  const [activity, setActivity] = useState<Activity | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Answer[]>([])
  const [loading, setLoading] = useState(true)
  const [activeIdx, setActiveIdx] = useState(0)

  useEffect(() => {
    if (!activityId || !session) return
    fetch(`${BACKEND_URL}/activities/${activityId}/results`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then(r => r.json())
      .then((data: { activity: Activity; questions: Question[]; answers: Answer[] }) => {
        setActivity(data.activity)
        setQuestions(data.questions)
        setAnswers(data.answers)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [activityId, session])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400">載入中…</p>
      </div>
    )
  }

  const currentQ = questions[activeIdx]
  const currentAnswers = currentQ ? answers.filter(a => a.questionId === currentQ.id) : []

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 bg-gray-800 shadow shrink-0">
        <div>
          <h1 className="text-xl font-bold">{activity?.title}</h1>
          <p className="text-sm text-gray-400">
            房間碼：<span className="font-mono text-yellow-400 font-bold tracking-widest">{activity?.roomCode}</span>
            <span className="ml-3 text-gray-500">{questions.length} 題・{answers.length} 則回答</span>
          </p>
        </div>
        <button
          onClick={() => navigate('/teacher')}
          className="text-sm text-gray-400 hover:text-white"
        >
          ← 返回後台
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* 左側題目列表 */}
        <aside className="w-64 bg-gray-800 p-4 overflow-y-auto flex flex-col gap-2 shrink-0">
          <p className="text-xs font-semibold text-gray-400 uppercase mb-1">題目列表</p>
          {questions.length === 0 && (
            <p className="text-gray-500 text-sm">此活動尚無題目</p>
          )}
          {questions.map((q, i) => {
            const aCount = answers.filter(a => a.questionId === q.id).length
            return (
              <button
                key={q.id}
                onClick={() => setActiveIdx(i)}
                className={`text-left p-3 rounded-xl text-sm transition-colors ${
                  activeIdx === i ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                }`}
              >
                <span className="font-bold mr-2">{i + 1}.</span>
                <span className={`text-xs mr-1 ${TYPE_COLOR[q.type] ?? 'text-gray-300'}`}>
                  [{TYPE_LABEL[q.type] ?? q.type}]
                </span>
                {q.title}
                <span className="block text-xs text-gray-400 mt-0.5 ml-5">{aCount} 則回答</span>
              </button>
            )
          })}
        </aside>

        {/* 右側結果 */}
        <main className="flex-1 overflow-y-auto p-8">
          {!currentQ ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 text-xl">選擇左側題目查看結果</p>
            </div>
          ) : (
            <div className="w-full max-w-3xl mx-auto bg-gray-800 rounded-2xl p-6 shadow-xl">
              {currentQ.type === 'poll' ? (
                <PollResult question={currentQ} answers={currentAnswers} />
              ) : currentQ.type === 'word_cloud' ? (
                <WordCloudResult question={currentQ} answers={currentAnswers} />
              ) : currentQ.type === 'scales' ? (
                <ScalesResult question={currentQ} answers={currentAnswers} />
              ) : currentQ.type === 'ranking' ? (
                <RankingResult question={currentQ} answers={currentAnswers} />
              ) : (
                <OpenEndedResult question={currentQ} answers={currentAnswers} />
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
