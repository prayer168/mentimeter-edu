import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Question } from '@shared/types'
import { useSocket } from '../hooks/useSocket'
import PollQuestion from '../components/questions/PollQuestion'
import OpenEndedQuestion from '../components/questions/OpenEndedQuestion'
import WordCloudQuestion from '../components/questions/WordCloudQuestion'
import ScalesQuestion from '../components/questions/ScalesQuestion'
import RankingQuestion from '../components/questions/RankingQuestion'

function getOrCreateSessionId(): string {
  const key = 'menti_session_id'
  let id = localStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(key, id)
  }
  return id
}

export default function StudentAnswer() {
  const { roomCode } = useParams<{ roomCode: string }>()
  const navigate = useNavigate()
  const { socket, connected } = useSocket()
  const sessionId = useRef(getOrCreateSessionId())

  const [joined, setJoined] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [answered, setAnswered] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!connected || !roomCode || joined) return

    socket.emit('student:join_room', { roomCode, sessionId: sessionId.current })

    function onJoined({ success, error: err }: { success: boolean; error?: string }) {
      if (success) setJoined(true)
      else setError(err ?? '加入失敗，請確認房間碼')
    }

    function onQuestionStarted({ question }: { question: Question }) {
      setCurrentQuestion(question)
      setAnswered(false)
    }

    function onQuestionEnded() {
      setCurrentQuestion(null)
      setAnswered(false)
    }

    socket.on('student:join_ack', onJoined)
    socket.on('room:question_started', onQuestionStarted)
    socket.on('room:question_ended', onQuestionEnded)

    return () => {
      socket.off('student:join_ack', onJoined)
      socket.off('room:question_started', onQuestionStarted)
      socket.off('room:question_ended', onQuestionEnded)
    }
  }, [connected, roomCode, joined, socket])

  function submitAnswer(value: string) {
    if (!currentQuestion) return
    socket.emit('student:submit_answer', {
      questionId: currentQuestion.id,
      value,
      sessionId: sessionId.current,
    })
    setAnswered(true)
  }

  if (!connected) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-blue-50">
        <p className="text-gray-500">連線中，請稍候…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-red-50 p-6 gap-4">
        <p className="text-red-600 font-semibold text-lg text-center">{error}</p>
        <button
          onClick={() => navigate('/join')}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold"
        >
          重新輸入房間碼
        </button>
      </div>
    )
  }

  if (!joined) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-blue-50">
        <p className="text-gray-500">加入活動中…</p>
      </div>
    )
  }

  return (
    /* min-h-[100dvh]：使用動態視口高度，鍵盤彈起時不會錯位 */
    <div className="min-h-[100dvh] bg-gradient-to-br from-blue-50 to-purple-100 flex flex-col">
      <header
        className="px-4 py-3 bg-blue-700 text-white flex items-center justify-between shrink-0"
        style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
      >
        <span className="font-bold text-sm">Mentimeter EDU</span>
        <span className="text-xs font-mono tracking-widest text-blue-200 bg-blue-800 px-2 py-1 rounded-lg">
          {roomCode}
        </span>
      </header>

      {/* overflow-y-auto 讓鍵盤彈起時內容可捲動 */}
      <div className="flex-1 overflow-y-auto">
        <div className="min-h-full flex flex-col justify-center px-4 py-6">
          <div className="bg-white rounded-2xl shadow-lg p-5 w-full max-w-sm mx-auto">
            {!currentQuestion ? (
              <div className="flex flex-col items-center gap-3 py-10">
                <div className="text-5xl animate-pulse">⏳</div>
                <p className="text-lg font-semibold text-gray-700">等待老師出題中…</p>
                <p className="text-sm text-gray-400">已成功加入活動，請稍候</p>
              </div>
            ) : currentQuestion.type === 'poll' ? (
              <PollQuestion question={currentQuestion} onAnswer={submitAnswer} answered={answered} />
            ) : currentQuestion.type === 'word_cloud' ? (
              <WordCloudQuestion question={currentQuestion} onAnswer={submitAnswer} answered={answered} />
            ) : currentQuestion.type === 'scales' ? (
              <ScalesQuestion question={currentQuestion} onAnswer={submitAnswer} answered={answered} />
            ) : currentQuestion.type === 'ranking' ? (
              <RankingQuestion question={currentQuestion} onAnswer={submitAnswer} answered={answered} />
            ) : (
              <OpenEndedQuestion question={currentQuestion} onAnswer={submitAnswer} answered={answered} />
            )}
          </div>
        </div>
      </div>

      <div
        className="shrink-0"
        style={{ height: 'env(safe-area-inset-bottom)' }}
      />
    </div>
  )
}
