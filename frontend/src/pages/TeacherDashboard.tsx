import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, Question, QuestionType } from '@shared/types'
import QRCodeDisplay from '../components/QRCodeDisplay'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3001'
const MAX_OPTIONS = 6

interface LocalQuestion {
  type: QuestionType
  title: string
  options: string[]
}

export default function TeacherDashboard() {
  const navigate = useNavigate()
  const [activityTitle, setActivityTitle] = useState('')
  const [activity, setActivity] = useState<Activity | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const [newQ, setNewQ] = useState<LocalQuestion>({ type: 'poll', title: '', options: ['', ''] })
  const [addingQ, setAddingQ] = useState(false)

  async function createActivity() {
    if (!activityTitle.trim()) return
    setCreating(true)
    setError('')
    try {
      const res = await fetch(`${BACKEND_URL}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: activityTitle.trim() }),
      })
      if (!res.ok) throw new Error(await res.text())
      const data: Activity = await res.json()
      setActivity(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : '建立失敗')
    } finally {
      setCreating(false)
    }
  }

  async function addQuestion() {
    if (!activity || !newQ.title.trim()) return
    const validOptions = newQ.options.filter(o => o.trim())
    if (newQ.type === 'poll' && validOptions.length < 2) {
      setError('Poll 題目至少需要 2 個選項')
      return
    }
    setAddingQ(true)
    setError('')
    try {
      const res = await fetch(`${BACKEND_URL}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityId: activity.id,
          type: newQ.type,
          title: newQ.title.trim(),
          options: newQ.type === 'poll' ? validOptions : undefined,
          order: questions.length + 1,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      const q: Question = await res.json()
      setQuestions(prev => [...prev, q])
      setNewQ({ type: 'poll', title: '', options: ['', ''] })
    } catch (e) {
      setError(e instanceof Error ? e.message : '新增失敗')
    } finally {
      setAddingQ(false)
    }
  }

  function updateOption(idx: number, val: string) {
    setNewQ(prev => {
      const opts = [...prev.options]
      opts[idx] = val
      return { ...prev, options: opts }
    })
  }

  function addOption() {
    if (newQ.options.length < MAX_OPTIONS) {
      setNewQ(prev => ({ ...prev, options: [...prev.options, ''] }))
    }
  }

  function removeOption(idx: number) {
    if (newQ.options.length > 2) {
      setNewQ(prev => ({ ...prev, options: prev.options.filter((_, i) => i !== idx) }))
    }
  }

  const joinUrl = activity
    ? `${window.location.origin}/join?code=${activity.roomCode}`
    : ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-blue-800 mb-6">教師後台</h1>

        {!activity ? (
          <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-gray-700">建立新活動</h2>
            <input
              type="text"
              value={activityTitle}
              onChange={e => setActivityTitle(e.target.value)}
              placeholder="輸入活動名稱，例如：第三章複習"
              className="border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
              onKeyDown={e => e.key === 'Enter' && createActivity()}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              onClick={createActivity}
              disabled={!activityTitle.trim() || creating}
              className="py-3 bg-blue-600 text-white rounded-xl font-semibold disabled:opacity-40 hover:bg-blue-700 transition-colors"
            >
              {creating ? '建立中…' : '建立活動'}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col sm:flex-row items-center gap-6">
              <QRCodeDisplay url={joinUrl} roomCode={activity.roomCode} />
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-800 mb-1">{activity.title}</h2>
                <p className="text-sm text-gray-500 mb-4">學生掃描 QR Code 或輸入房間碼加入</p>
                <button
                  onClick={() => navigate(`/teacher/present/${activity.id}`)}
                  disabled={questions.length === 0}
                  className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold disabled:opacity-40 hover:bg-green-700 transition-colors"
                >
                  開始投影畫面 →
                </button>
                {questions.length === 0 && (
                  <p className="text-xs text-gray-400 mt-1 text-center">請先新增至少一個題目</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-4">
              <h2 className="text-xl font-semibold text-gray-700">新增題目</h2>

              <div className="flex gap-3">
                <button
                  onClick={() => setNewQ(prev => ({ ...prev, type: 'poll' }))}
                  className={`flex-1 py-2 rounded-xl font-medium border-2 transition-colors ${newQ.type === 'poll' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:border-blue-400'}`}
                >
                  投票（Poll）
                </button>
                <button
                  onClick={() => setNewQ(prev => ({ ...prev, type: 'open_ended' }))}
                  className={`flex-1 py-2 rounded-xl font-medium border-2 transition-colors ${newQ.type === 'open_ended' ? 'bg-purple-600 text-white border-purple-600' : 'border-gray-300 text-gray-600 hover:border-purple-400'}`}
                >
                  開放作答
                </button>
              </div>

              <input
                type="text"
                value={newQ.title}
                onChange={e => setNewQ(prev => ({ ...prev, title: e.target.value }))}
                placeholder="題目內容"
                className="border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
              />

              {newQ.type === 'poll' && (
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium text-gray-600">選項（最多 {MAX_OPTIONS} 個）</p>
                  {newQ.options.map((opt, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={opt}
                        onChange={e => updateOption(i, e.target.value)}
                        placeholder={`選項 ${i + 1}`}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400"
                      />
                      {newQ.options.length > 2 && (
                        <button
                          onClick={() => removeOption(i)}
                          className="px-3 text-red-400 hover:text-red-600 font-bold text-lg"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  {newQ.options.length < MAX_OPTIONS && (
                    <button
                      onClick={addOption}
                      className="text-sm text-blue-600 hover:underline self-start"
                    >
                      ＋ 新增選項
                    </button>
                  )}
                </div>
              )}

              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                onClick={addQuestion}
                disabled={!newQ.title.trim() || addingQ}
                className="py-3 bg-indigo-600 text-white rounded-xl font-semibold disabled:opacity-40 hover:bg-indigo-700 transition-colors"
              >
                {addingQ ? '新增中…' : '新增題目'}
              </button>
            </div>

            {questions.length > 0 && (
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-3">題目列表</h2>
                <div className="flex flex-col gap-2">
                  {questions.map((q, i) => (
                    <div key={q.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className="font-bold text-gray-400 w-6 shrink-0">{i + 1}</span>
                      <div className="flex-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mr-2 ${q.type === 'poll' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                          {q.type === 'poll' ? 'Poll' : '開放'}
                        </span>
                        <span className="text-gray-800">{q.title}</span>
                        {q.options && (
                          <p className="text-xs text-gray-400 mt-1">{q.options.join(' / ')}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
