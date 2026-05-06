import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, Question, QuestionType } from '@shared/types'
import { useAuth } from '../contexts/AuthContext'
import QRCodeDisplay from '../components/QRCodeDisplay'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3001'
const MAX_OPTIONS = 6

const BADGE_CLASS: Record<string, string> = {
  poll: 'bg-blue-100 text-blue-700',
  open_ended: 'bg-purple-100 text-purple-700',
  word_cloud: 'bg-pink-100 text-pink-700',
  scales: 'bg-orange-100 text-orange-700',
  ranking: 'bg-teal-100 text-teal-700',
}

const TYPE_CONFIG: { type: QuestionType; label: string; color: string }[] = [
  { type: 'poll',       label: 'Poll 投票',  color: 'blue'   },
  { type: 'open_ended', label: '開放作答',    color: 'purple' },
  { type: 'word_cloud', label: '文字雲',      color: 'pink'   },
  { type: 'scales',     label: '量尺評分',    color: 'orange' },
  { type: 'ranking',    label: '排序',        color: 'teal'   },
]

interface LocalQuestion {
  type: QuestionType
  title: string
  options: string[]       // poll/ranking: 選項; scales: [minLabel, maxLabel]
}

export default function TeacherDashboard() {
  const navigate = useNavigate()
  const { user, session, signOut } = useAuth()

  const [activityTitle, setActivityTitle] = useState('')
  const [activity, setActivity] = useState<Activity | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const [newQ, setNewQ] = useState<LocalQuestion>({ type: 'poll', title: '', options: ['', ''] })
  const [addingQ, setAddingQ] = useState(false)

  function authHeaders() {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token ?? ''}`,
    }
  }

  async function createActivity() {
    if (!activityTitle.trim()) return
    setCreating(true)
    setError('')
    try {
      const res = await fetch(`${BACKEND_URL}/activities`, {
        method: 'POST',
        headers: authHeaders(),
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
    if ((newQ.type === 'poll' || newQ.type === 'ranking') && validOptions.length < 2) {
      setError(`${newQ.type === 'poll' ? 'Poll' : '排序'} 題目至少需要 2 個項目`)
      return
    }
    setAddingQ(true)
    setError('')
    try {
      const res = await fetch(`${BACKEND_URL}/questions`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          activityId: activity.id,
          type: newQ.type,
          title: newQ.title.trim(),
          options: ['poll', 'ranking'].includes(newQ.type)
            ? validOptions
            : newQ.type === 'scales'
              ? [newQ.options[0]?.trim() || '非常不同意', newQ.options[1]?.trim() || '非常同意']
              : undefined,
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
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-blue-800">教師後台</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:block">{user?.email}</span>
            <button
              onClick={() => signOut()}
              className="text-sm px-4 py-2 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
            >
              登出
            </button>
          </div>
        </div>

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
            {/* QR Code + info */}
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

            {/* Add question */}
            <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-4">
              <h2 className="text-xl font-semibold text-gray-700">新增題目</h2>

              {/* 題型選擇 */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {TYPE_CONFIG.map(({ type, label, color }) => {
                  const active = newQ.type === type
                  return (
                    <button
                      key={type}
                      onClick={() => setNewQ(prev => ({ ...prev, type, options: type === 'scales' ? ['非常不同意', '非常同意'] : ['', ''] }))}
                      className={`py-2 px-1 rounded-xl font-medium text-xs border-2 transition-colors ${
                        active
                          ? `bg-${color}-600 text-white border-${color}-600`
                          : `border-gray-300 text-gray-600 hover:border-${color}-400`
                      }`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>

              {/* 題目標題 */}
              <input
                type="text"
                value={newQ.title}
                onChange={e => setNewQ(prev => ({ ...prev, title: e.target.value }))}
                placeholder="題目內容"
                className="border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
              />

              {/* Poll / Ranking：多選項 */}
              {(newQ.type === 'poll' || newQ.type === 'ranking') && (
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium text-gray-600">
                    {newQ.type === 'poll' ? `選項（最多 ${MAX_OPTIONS} 個）` : `排序項目（最多 ${MAX_OPTIONS} 個）`}
                  </p>
                  {newQ.options.map((opt, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={opt}
                        onChange={e => updateOption(i, e.target.value)}
                        placeholder={`項目 ${i + 1}`}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400"
                      />
                      {newQ.options.length > 2 && (
                        <button onClick={() => removeOption(i)} className="px-3 text-red-400 hover:text-red-600 font-bold text-lg">×</button>
                      )}
                    </div>
                  ))}
                  {newQ.options.length < MAX_OPTIONS && (
                    <button onClick={addOption} className="text-sm text-blue-600 hover:underline self-start">
                      ＋ 新增項目
                    </button>
                  )}
                </div>
              )}

              {/* Scales：左右標籤 */}
              {newQ.type === 'scales' && (
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium text-gray-600">量尺標籤（1 ← → 10）</p>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <p className="text-xs text-gray-400 mb-1">左側（1）</p>
                      <input
                        type="text"
                        value={newQ.options[0] ?? ''}
                        onChange={e => updateOption(0, e.target.value)}
                        placeholder="非常不同意"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-400"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-400 mb-1">右側（10）</p>
                      <input
                        type="text"
                        value={newQ.options[1] ?? ''}
                        onChange={e => updateOption(1, e.target.value)}
                        placeholder="非常同意"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-400"
                      />
                    </div>
                  </div>
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

            {/* Question list */}
            {questions.length > 0 && (
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-3">題目列表</h2>
                <div className="flex flex-col gap-2">
                  {questions.map((q, i) => (
                    <div key={q.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className="font-bold text-gray-400 w-6 shrink-0">{i + 1}</span>
                      <div className="flex-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mr-2 ${BADGE_CLASS[q.type] ?? 'bg-gray-100 text-gray-700'}`}>
                          {TYPE_CONFIG.find(t => t.type === q.type)?.label ?? q.type}
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
