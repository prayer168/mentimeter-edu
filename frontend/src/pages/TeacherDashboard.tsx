import { useState, useEffect } from 'react'
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
  { type: 'poll',       label: '單選投票',   color: 'blue'   },
  { type: 'open_ended', label: '開放作答',    color: 'purple' },
  { type: 'word_cloud', label: '文字雲',      color: 'pink'   },
  { type: 'scales',     label: '量尺評分',    color: 'orange' },
  { type: 'ranking',    label: '排序',        color: 'teal'   },
]

interface ActivityWithCount extends Activity {
  questionCount: number
}

interface LocalQuestion {
  type: QuestionType
  title: string
  options: string[]
  timeLimit: number
}

export default function TeacherDashboard() {
  const navigate = useNavigate()
  const { user, session, signOut } = useAuth()

  // 活動歷史
  const [pastActivities, setPastActivities] = useState<ActivityWithCount[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  // 當前正在編輯的活動
  const [activity, setActivity] = useState<Activity | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [showNewForm, setShowNewForm] = useState(false)

  // 建立活動表單
  const [activityTitle, setActivityTitle] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  // 新增題目表單
  const [newQ, setNewQ] = useState<LocalQuestion>({ type: 'poll', title: '', options: ['', ''], timeLimit: 0 })

  // AI 出題
  const [aiTopic, setAiTopic] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<Array<{ title: string; options: string[] }>>([])

  // 編輯活動名稱
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [addingQ, setAddingQ] = useState(false)

  // 課堂工具面板
  const [showTools, setShowTools] = useState(false)

  function authHeaders() {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token ?? ''}`,
    }
  }

  // 載入歷史活動
  useEffect(() => {
    if (!session) return
    fetch(`${BACKEND_URL}/activities`, { headers: authHeaders() })
      .then(r => r.json())
      .then((data: ActivityWithCount[]) => {
        setPastActivities(data)
        setLoadingHistory(false)
      })
      .catch(() => setLoadingHistory(false))
  }, [session])  // eslint-disable-line react-hooks/exhaustive-deps

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
      setQuestions([])
      setShowNewForm(false)
      setPastActivities(prev => [{ ...data, questionCount: 0 }, ...prev])
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
          timeLimit: newQ.timeLimit > 0 ? newQ.timeLimit : undefined,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      const q: Question = await res.json()
      setQuestions(prev => [...prev, q])
      setPastActivities(prev => prev.map(a => a.id === activity.id ? { ...a, questionCount: a.questionCount + 1 } : a))
      setNewQ({ type: 'poll', title: '', options: ['', ''], timeLimit: 0 })
    } catch (e) {
      setError(e instanceof Error ? e.message : '新增失敗')
    } finally {
      setAddingQ(false)
    }
  }

  async function generateAiQuestions() {
    if (!aiTopic.trim() || !activity) return
    setAiLoading(true)
    setAiSuggestions([])
    setError('')
    try {
      const res = await fetch(`${BACKEND_URL}/ai/generate-questions`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ topic: aiTopic.trim(), count: 3 }),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setAiSuggestions(data.questions ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'AI 出題失敗')
    } finally {
      setAiLoading(false)
    }
  }

  async function addAiQuestion(q: { title: string; options: string[] }) {
    if (!activity) return
    setAddingQ(true)
    try {
      const res = await fetch(`${BACKEND_URL}/questions`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          activityId: activity.id,
          type: 'poll',
          title: q.title,
          options: q.options,
          order: questions.length + 1,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      const created: Question = await res.json()
      setQuestions(prev => [...prev, created])
      setPastActivities(prev => prev.map(a => a.id === activity.id ? { ...a, questionCount: a.questionCount + 1 } : a))
      setAiSuggestions(prev => prev.filter(s => s.title !== q.title))
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
    if (newQ.options.length < MAX_OPTIONS)
      setNewQ(prev => ({ ...prev, options: [...prev.options, ''] }))
  }

  function removeOption(idx: number) {
    if (newQ.options.length > 2)
      setNewQ(prev => ({ ...prev, options: prev.options.filter((_, i) => i !== idx) }))
  }

  async function openExistingActivity(id: string) {
    const res = await fetch(`${BACKEND_URL}/activities/${id}`, { headers: authHeaders() })
    const data: { activity: Activity; questions: Question[] } = await res.json()
    setActivity(data.activity)
    setQuestions(data.questions)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function renameActivity(id: string) {
    if (!editingTitle.trim()) return
    try {
      const res = await fetch(`${BACKEND_URL}/activities/${id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ title: editingTitle.trim() }),
      })
      if (!res.ok) throw new Error()
      const updated: Activity = await res.json()
      setPastActivities(prev => prev.map(a => a.id === id ? { ...a, title: updated.title } : a))
      if (activity?.id === id) setActivity(prev => prev ? { ...prev, title: updated.title } : prev)
    } finally {
      setEditingId(null)
    }
  }

  async function deleteActivity(id: string, title: string) {
    if (!confirm(`確定要刪除「${title}」嗎？此操作無法復原。`)) return
    await fetch(`${BACKEND_URL}/activities/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    })
    setPastActivities(prev => prev.filter(a => a.id !== id))
    if (activity?.id === id) setActivity(null)
  }

  const joinUrl = activity ? `${window.location.origin}/join?code=${activity.roomCode}` : ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-indigo-800">教師後台</h1>
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

        {/* 當前活動編輯區 */}
        {activity && (
          <div className="flex flex-col gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col sm:flex-row items-center gap-6">
              <QRCodeDisplay url={joinUrl} roomCode={activity.roomCode} />
              <div className="flex-1 w-full">
                <h2 className="text-xl font-bold text-gray-800 mb-1">{activity.title}</h2>
                <p className="text-sm text-gray-500 mb-4">學生掃描 QR Code 或輸入房間碼加入</p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => navigate(`/teacher/present/${activity.id}`)}
                    disabled={questions.length === 0}
                    className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold disabled:opacity-40 hover:bg-green-700 transition-colors"
                  >
                    開始投影畫面 →
                  </button>
                  <button
                    onClick={() => setActivity(null)}
                    className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
                  >
                    ← 回到活動列表
                  </button>
                </div>
                {questions.length === 0 && (
                  <p className="text-xs text-gray-400 mt-1 text-center">請先新增至少一個題目</p>
                )}
              </div>
            </div>

            {/* AI 出題 */}
            <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">🤖</span>
                <h2 className="text-xl font-semibold text-gray-700">AI 自動出題</h2>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiTopic}
                  onChange={e => setAiTopic(e.target.value)}
                  placeholder="輸入單元名稱，例如：植物的生長"
                  className="flex-1 border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500"
                  onKeyDown={e => e.key === 'Enter' && generateAiQuestions()}
                />
                <button
                  onClick={generateAiQuestions}
                  disabled={!aiTopic.trim() || aiLoading}
                  className="px-5 py-3 bg-purple-600 text-white rounded-xl font-semibold disabled:opacity-40 hover:bg-purple-700 transition-colors whitespace-nowrap"
                >
                  {aiLoading ? '生成中…' : '✨ 出題'}
                </button>
              </div>
              {aiLoading && (
                <div className="flex items-center gap-2 text-purple-600 text-sm">
                  <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                  AI 正在思考題目，請稍候…
                </div>
              )}
              {aiSuggestions.length > 0 && (
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-medium text-gray-600">✅ AI 建議的題目，點「加入」加到題目列表：</p>
                  {aiSuggestions.map((q, i) => (
                    <div key={i} className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-start gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{q.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{q.options.join(' / ')}</p>
                      </div>
                      <button
                        onClick={() => addAiQuestion(q)}
                        disabled={addingQ}
                        className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-40 transition-colors shrink-0"
                      >
                        加入
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 新增題目 */}
            <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-4">
              <h2 className="text-xl font-semibold text-gray-700">新增題目</h2>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {TYPE_CONFIG.map(({ type, label }) => (
                  <button
                    key={type}
                    onClick={() => setNewQ(prev => ({ ...prev, type, options: type === 'scales' ? ['非常不同意', '非常同意'] : ['', ''], timeLimit: prev.timeLimit }))}
                    className={`py-2 px-1 rounded-xl font-medium text-xs border-2 transition-colors ${
                      newQ.type === type
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'border-gray-300 text-gray-600 hover:border-indigo-400'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={newQ.title}
                onChange={e => setNewQ(prev => ({ ...prev, title: e.target.value }))}
                placeholder="題目內容"
                className="border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
              />
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
                    <button onClick={addOption} className="text-sm text-blue-600 hover:underline self-start">＋ 新增項目</button>
                  )}
                </div>
              )}
              {newQ.type === 'scales' && (
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium text-gray-600">量尺標籤（1 ← → 10）</p>
                  <div className="flex gap-3">
                    {[['左側（1）', 0, '非常不同意'], ['右側（10）', 1, '非常同意']].map(([label, idx, ph]) => (
                      <div key={String(idx)} className="flex-1">
                        <p className="text-xs text-gray-400 mb-1">{label}</p>
                        <input
                          type="text"
                          value={newQ.options[Number(idx)] ?? ''}
                          onChange={e => updateOption(Number(idx), e.target.value)}
                          placeholder={String(ph)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-400"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* 計時器設定 */}
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-gray-600">⏱ 作答時限</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: '無限制', value: 0 },
                    { label: '10 秒', value: 10 },
                    { label: '20 秒', value: 20 },
                    { label: '30 秒', value: 30 },
                    { label: '60 秒', value: 60 },
                    { label: '90 秒', value: 90 },
                  ].map(({ label, value }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setNewQ(prev => ({ ...prev, timeLimit: value }))}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-colors ${
                        newQ.timeLimit === value
                          ? 'bg-amber-500 text-white border-amber-500'
                          : 'border-gray-300 text-gray-600 hover:border-amber-400'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                onClick={addQuestion}
                disabled={!newQ.title.trim() || addingQ}
                className="py-3 bg-indigo-600 text-white rounded-xl font-semibold disabled:opacity-40 hover:bg-indigo-700 transition-colors"
              >
                {addingQ ? '新增中…' : '新增題目'}
              </button>
            </div>

            {/* 題目列表 */}
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
                        {q.options && q.type !== 'scales' && (
                          <p className="text-xs text-gray-400 mt-1">{q.options.join(' / ')}</p>
                        )}
                        {q.timeLimit && q.timeLimit > 0 && (
                          <span className="text-xs text-amber-600 font-medium">⏱ {q.timeLimit} 秒</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 活動歷史 / 建立新活動 */}
        {!activity && (
          <div className="flex flex-col gap-4">
            {/* 建立新活動 */}
            {!showNewForm ? (
              <button
                onClick={() => setShowNewForm(true)}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-semibold text-lg hover:bg-blue-700 transition-colors shadow-md"
              >
                ＋ 建立新活動
              </button>
            ) : (
              <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-700">建立新活動</h2>
                  <button onClick={() => setShowNewForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
                </div>
                <input
                  type="text"
                  value={activityTitle}
                  onChange={e => setActivityTitle(e.target.value)}
                  placeholder="輸入活動名稱，例如：第三章複習"
                  autoFocus
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
            )}

            {/* 過去活動列表 */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">我的活動</h2>
              {loadingHistory ? (
                <p className="text-gray-400 text-center py-6">載入中…</p>
              ) : pastActivities.length === 0 ? (
                <p className="text-gray-400 text-center py-8">尚無活動，點上方按鈕建立第一個活動</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {pastActivities.map(a => (
                    <div key={a.id} className="flex flex-col gap-2 p-4 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors">
                      {editingId === a.id ? (
                        <div className="flex gap-2">
                          <input
                            autoFocus
                            type="text"
                            value={editingTitle}
                            onChange={e => setEditingTitle(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') renameActivity(a.id)
                              if (e.key === 'Escape') setEditingId(null)
                            }}
                            className="flex-1 border-2 border-blue-400 rounded-lg px-3 py-1.5 text-sm focus:outline-none"
                          />
                          <button
                            onClick={() => renameActivity(a.id)}
                            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            儲存
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1.5 text-sm border border-gray-300 text-gray-500 rounded-lg hover:bg-gray-50"
                          >
                            取消
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <p className="flex-1 font-semibold text-gray-800 truncate">{a.title}</p>
                          <button
                            onClick={() => { setEditingId(a.id); setEditingTitle(a.title) }}
                            className="text-xs px-2 py-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="編輯名稱"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => deleteActivity(a.id, a.title)}
                            className="text-xs px-2 py-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="刪除活動"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-400">
                          <span className="font-mono text-blue-600 font-bold tracking-wider">{a.roomCode}</span>
                          <span className="mx-2">·</span>
                          {a.questionCount} 題
                          <span className="mx-2">·</span>
                          {new Date(a.createdAt).toLocaleDateString('zh-TW')}
                        </p>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => navigate(`/teacher/results/${a.id}`)}
                            className="px-3 py-1.5 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            查看結果
                          </button>
                          <button
                            onClick={() => openExistingActivity(a.id)}
                            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            繼續使用
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 課堂工具浮動按鈕 */}
      <button
        onClick={() => setShowTools(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
        title="開啟課堂工具"
      >
        🛠️ 課堂工具
      </button>

      {/* 課堂工具 Modal */}
      {showTools && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/60 backdrop-blur-sm">
          {/* 標題列 */}
          <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xl">🛠️</span>
              <span className="font-bold text-lg">課堂工具</span>
              <span className="text-indigo-200 text-sm hidden sm:block">— 碼錶・時鐘・輪盤抽籤・倒數計時・白板</span>
            </div>
            <button
              onClick={() => setShowTools(false)}
              className="text-white/80 hover:text-white text-2xl font-bold leading-none px-2"
              title="關閉"
            >
              ×
            </button>
          </div>
          {/* iframe */}
          <iframe
            src="https://prayer168.github.io/classroom_tools/"
            className="flex-1 w-full border-0 bg-white"
            title="教室互動儀表板"
            allow="fullscreen"
          />
        </div>
      )}
    </div>
  )
}
