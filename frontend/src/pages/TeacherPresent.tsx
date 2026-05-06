import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Activity, Question, Answer } from '@shared/types'
import { useSocket } from '../hooks/useSocket'
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
  poll: 'text-blue-300', open_ended: 'text-purple-300', word_cloud: 'text-pink-300',
  scales: 'text-orange-300', ranking: 'text-teal-300',
}

export default function TeacherPresent() {
  const { activityId } = useParams<{ activityId: string }>()
  const navigate = useNavigate()
  const { socket, connected } = useSocket()

  const [activity, setActivity] = useState<Activity | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!activityId) return
    fetch(`${BACKEND_URL}/activities/${activityId}`)
      .then(r => r.json())
      .then((data: { activity: Activity; questions: Question[] }) => {
        setActivity(data.activity)
        setQuestions(data.questions)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [activityId])

  useEffect(() => {
    if (!connected || !activityId) return
    socket.emit('teacher:join_activity', { activityId })

    function onAnswerUpdated({ questionId, answers: newAnswers }: { questionId: string; answers: Answer[] }) {
      if (currentQuestion?.id === questionId) {
        setAnswers(newAnswers)
      }
    }

    socket.on('room:answer_updated', onAnswerUpdated)
    return () => { socket.off('room:answer_updated', onAnswerUpdated) }
  }, [connected, activityId, socket, currentQuestion?.id])

  const pushQuestion = useCallback((question: Question) => {
    setCurrentQuestion(question)
    setAnswers([])
    socket.emit('teacher:push_question', { questionId: question.id, activityId })
  }, [socket, activityId])

  const endQuestion = useCallback(() => {
    if (!currentQuestion) return
    socket.emit('teacher:end_question', { questionId: currentQuestion.id, activityId })
    setCurrentQuestion(null)
    setAnswers([])
  }, [socket, currentQuestion, activityId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">載入中…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 bg-gray-800 shadow">
        <div>
          <h1 className="text-xl font-bold">{activity?.title}</h1>
          <p className="text-sm text-gray-400">
            房間碼：<span className="font-mono text-yellow-400 font-bold tracking-widest">{activity?.roomCode}</span>
            {' '}
            <span className={`ml-2 text-xs ${connected ? 'text-green-400' : 'text-red-400'}`}>
              {connected ? '● 已連線' : '○ 連線中…'}
            </span>
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
        <aside className="w-64 bg-gray-800 p-4 overflow-y-auto flex flex-col gap-2">
          <p className="text-xs font-semibold text-gray-400 uppercase mb-1">題目列表</p>
          {questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => pushQuestion(q)}
              disabled={currentQuestion?.id === q.id}
              className={`text-left p-3 rounded-xl text-sm transition-colors ${
                currentQuestion?.id === q.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              }`}
            >
              <span className="font-bold mr-2">{i + 1}.</span>
              <span className={`text-xs mr-1 ${TYPE_COLOR[q.type] ?? 'text-gray-300'}`}>
                [{TYPE_LABEL[q.type] ?? q.type}]
              </span>
              {q.title}
            </button>
          ))}
        </aside>

        <main className="flex-1 flex flex-col items-center justify-start p-8 overflow-y-auto">
          {!currentQuestion ? (
            <div className="flex flex-col items-center gap-4 mt-20">
              <p className="text-2xl text-gray-400">選擇左側題目開始投影</p>
              <p className="text-gray-500">學生可用房間碼 <span className="font-mono text-yellow-400 font-bold">{activity?.roomCode}</span> 加入</p>
            </div>
          ) : (
            <div className="w-full max-w-3xl">
              <div className="bg-gray-800 rounded-2xl p-6 shadow-xl">
                {currentQuestion.type === 'poll' ? (
                  <PollResult question={currentQuestion} answers={answers} />
                ) : currentQuestion.type === 'word_cloud' ? (
                  <WordCloudResult question={currentQuestion} answers={answers} />
                ) : currentQuestion.type === 'scales' ? (
                  <ScalesResult question={currentQuestion} answers={answers} />
                ) : currentQuestion.type === 'ranking' ? (
                  <RankingResult question={currentQuestion} answers={answers} />
                ) : (
                  <OpenEndedResult question={currentQuestion} answers={answers} />
                )}
              </div>
              <div className="mt-4 flex justify-center">
                <button
                  onClick={endQuestion}
                  className="px-8 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
                >
                  關閉此題，準備下一題
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
