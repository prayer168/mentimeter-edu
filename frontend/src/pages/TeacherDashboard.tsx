import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, Question, QuestionType } from '@shared/types'
import { useAuth } from '../contexts/AuthContext'
import QRCodeDisplay from '../components/QRCodeDisplay'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3001'
const MAX_OPTIONS = 6

const BADGE_CLASS: Record<string, string> = {
  poll:       'bg-blue-100 text-blue-700',
  open_ended: 'bg-purple-100 text-purple-700',
  word_cloud: 'bg-pink-100 text-pink-700',
  scales:     'bg-orange-100 text-orange-700',
  ranking:    'bg-teal-100 text-teal-700',
}

const TYPE_CONFIG: {
  type: QuestionType; label: string; icon: string; desc: string; active: string; ring: string; border: string; dropHover: string
}[] = [
  { type: 'poll',       label: '單選投票', icon: '📊', desc: '多選一，即時長條圖結果',   active: 'bg-blue-500',   ring: 'ring-blue-300',   border: 'border-blue-200',   dropHover: 'hover:border-blue-400 hover:bg-blue-50'   },
  { type: 'open_ended', label: '開放作答', icon: '💬', desc: '自由輸入，滾動顯示回應',   active: 'bg-purple-500', ring: 'ring-purple-300', border: 'border-purple-200', dropHover: 'hover:border-purple-400 hover:bg-purple-50' },
  { type: 'word_cloud', label: '文字雲',   icon: '☁️', desc: '關鍵詞，字體大小代表頻率', active: 'bg-pink-500',   ring: 'ring-pink-300',   border: 'border-pink-200',   dropHover: 'hover:border-pink-400 hover:bg-pink-50'   },
  { type: 'scales',     label: '量尺評分', icon: '🎚️', desc: '1–10 分滑桿評分量尺',    active: 'bg-orange-500', ring: 'ring-orange-300', border: 'border-orange-200', dropHover: 'hover:border-orange-400 hover:bg-orange-50' },
  { type: 'ranking',    label: '排序競賽', icon: '🏆', desc: '拖曳排序，統計各項名次',   active: 'bg-teal-500',   ring: 'ring-teal-300',   border: 'border-teal-200',   dropHover: 'hover:border-teal-400 hover:bg-teal-50'   },
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

  const [pastActivities, setPastActivities] = useState<ActivityWithCount[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  const [activity, setActivity] = useState<Activity | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [showNewForm, setShowNewForm] = useState(false)

  const [activityTitle, setActivityTitle] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [starterType, setStarterType] = useState<QuestionType>('poll')

  const [newQ, setNewQ] = useState<LocalQuestion>({ type: 'poll', title: '', options: ['', ''], timeLimit: 0 })

  const [aiTopic, setAiTopic] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<Array<{ title: string; options: string[] }>>([])

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [addingQ, setAddingQ] = useState(false)

  const [showTools, setShowTools] = useState(false)
  const [showCreateDropdown, setShowCreateDropdown] = useState(false)

  function authHeaders() {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token ?? ''}`,
    }
  }

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
      setNewQ(prev => ({ ...prev, type: starterType, options: starterType === 'scales' ? ['非常不同意', '非常同意'] : ['', ''] }))
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
      setNewQ({ type: newQ.type, title: '', options: newQ.type === 'scales' ? ['非常不同意', '非常同意'] : ['', ''], timeLimit: newQ.timeLimit })
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
    <div className="min-h-screen bg-gray-50">

      {/* 頂部導覽列 */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 h-12 sm:h-14 flex items-center justify-between gap-2">
          {/* 左：Logo + 麵包屑 */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 transition-colors font-semibold text-sm shrink-0"
            >
              🐻 <span className="hidden sm:inline">熊學堂</span>
            </button>
            <span className="text-gray-300">/</span>
            <span className="text-gray-700 font-semibold text-sm truncate max-w-[120px] sm:max-w-xs">
              {activity ? activity.title : '教師後台'}
            </span>
          </div>
          {/* 右：科學教材 + 課堂工具 + 登出 */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <a
              href="https://prayer168.github.io/science-portal/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl text-xs sm:text-sm shadow hover:opacity-90 hover:scale-105 transition-all"
              title="黑熊老師自然科學數位教材中心"
            >
              🔬 <span className="hidden sm:inline">科學教材</span>
            </a>
            <button
              onClick={() => setShowTools(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl text-xs sm:text-sm shadow hover:opacity-90 hover:scale-105 transition-all"
              title="開啟課堂工具"
            >
              🛠️ <span className="hidden sm:inline">課堂工具</span>
            </button>
            <span className="text-xs text-gray-400 hidden lg:block max-w-[100px] truncate">{user?.email}</span>
            <button
              onClick={async () => { await signOut(); navigate('/') }}
              className="text-xs px-2.5 py-1.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              登出
            </button>
          </div>
        </div>

        {/* 題型快捷列 — 僅在編輯活動時顯示 */}
        {activity && (
          <div className="border-t border-gray-100 bg-gray-50">
            <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2 flex items-center gap-1 overflow-x-auto">
              <span className="text-xs font-semibold text-gray-400 mr-1 shrink-0">出題：</span>
              {TYPE_CONFIG.map(({ type, icon, label, active, ring }) => (
                <button
                  key={type}
                  onClick={() => {
                    setNewQ(prev => ({ ...prev, type, options: type === 'scales' ? ['非常不同意', '非常同意'] : ['', ''], timeLimit: prev.timeLimit }))
                    document.getElementById('add-question-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                    newQ.type === type
                      ? `${active} text-white shadow-sm ring-2 ${ring}`
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* 活動編輯區 */}
        {activity && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">

            {/* 左欄：QR Code + 題目列表 */}
            <div className="lg:col-span-1 flex flex-col gap-4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex flex-col items-center gap-4">
                <QRCodeDisplay url={joinUrl} roomCode={activity.roomCode} />
                <div className="w-full flex flex-col gap-2">
                  <button
                    onClick={() => navigate(`/teacher/present/${activity.id}`)}
                    disabled={questions.length === 0}
                    className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-sm disabled:opacity-40 hover:shadow-md transition-all"
                  >
                    🚀 開始投影畫面
                  </button>
                  <button
                    onClick={() => setActivity(null)}
                    className="w-full py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ← 返回活動列表
                  </button>
                </div>
                {questions.length === 0 && (
                  <p className="text-xs text-amber-500 bg-amber-50 rounded-lg px-3 py-2 text-center w-full">請先新增至少一道題目</p>
                )}
              </div>

              {questions.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">題目列表 ({questions.length})</h3>
                  <div className="flex flex-col gap-2">
                    {questions.map((q, i) => (
                      <div key={q.id} className="flex items-start gap-2 p-2 bg-gray-50 rounded-xl">
                        <span className="text-xs font-bold text-gray-400 w-5 shrink-0 mt-0.5">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-md mr-1 ${BADGE_CLASS[q.type] ?? 'bg-gray-100 text-gray-700'}`}>
                            {TYPE_CONFIG.find(t => t.type === q.type)?.label ?? q.type}
                          </span>
                          <span className="text-xs text-gray-700 leading-snug">{q.title}</span>
                          {q.timeLimit && q.timeLimit > 0 && (
                            <span className="block text-xs text-amber-500 mt-0.5">⏱ {q.timeLimit}秒</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 右欄：AI 出題 + 新增題目 */}
            <div className="lg:col-span-2 flex flex-col gap-4">

              {/* AI 出題 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🤖</span>
                  <h2 className="text-lg font-semibold text-gray-700">AI 自動出題</h2>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiTopic}
                    onChange={e => setAiTopic(e.target.value)}
                    placeholder="輸入單元名稱，例如：植物的生長"
                    className="flex-1 border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 text-sm"
                    onKeyDown={e => e.key === 'Enter' && generateAiQuestions()}
                  />
                  <button
                    onClick={generateAiQuestions}
                    disabled={!aiTopic.trim() || aiLoading}
                    className="px-5 py-3 bg-purple-600 text-white rounded-xl font-semibold disabled:opacity-40 hover:bg-purple-700 transition-colors whitespace-nowrap text-sm"
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
                          <p className="font-medium text-gray-800 text-sm">{q.title}</p>
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
              <div id="add-question-form" className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex flex-col gap-4">
                <h2 className="text-base font-bold text-gray-700">新增題目</h2>
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
                  className="border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-sm"
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
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 text-sm"
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
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-400 text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                {error && <p className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}
                <button
                  onClick={addQuestion}
                  disabled={!newQ.title.trim() || addingQ}
                  className="py-3 bg-indigo-600 text-white rounded-xl font-semibold disabled:opacity-40 hover:bg-indigo-700 transition-colors"
                >
                  {addingQ ? '新增中…' : '新增題目'}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* 活動列表 / 建立新活動 */}
        {!activity && (
          <div className="flex flex-col gap-4">

            {/* 建立新活動按鈕（下拉選單） */}
            {!showNewForm ? (
              <div className="relative">
                <button
                  onClick={() => setShowCreateDropdown(v => !v)}
                  className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-bold text-base sm:text-lg hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2"
                >
                  ＋ 建立新活動
                  <span className={`text-base transition-transform duration-200 ${showCreateDropdown ? 'rotate-180' : ''}`}>▾</span>
                </button>

                {showCreateDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowCreateDropdown(false)} />
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-indigo-100 p-4 z-20">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">選擇起始題型</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {TYPE_CONFIG.map(({ type, label, icon, desc, border, dropHover }) => (
                          <button
                            key={type}
                            onClick={() => {
                              setShowCreateDropdown(false)
                              setStarterType(type)
                              setNewQ(prev => ({
                                ...prev,
                                type,
                                options: type === 'scales' ? ['非常不同意', '非常同意'] : ['', ''],
                              }))
                              setShowNewForm(true)
                            }}
                            className={`flex flex-col items-start p-3 rounded-xl border-2 transition-colors text-left ${border} ${dropHover}`}
                          >
                            <span className="text-2xl mb-1">{icon}</span>
                            <span className="font-semibold text-gray-800 text-sm">{label}</span>
                            <span className="text-xs text-gray-400 mt-0.5 leading-snug">{desc}</span>
                          </button>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => { setShowCreateDropdown(false); setShowNewForm(true) }}
                          className="w-full py-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                        >
                          → 直接輸入活動名稱
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                  <h2 className="font-bold text-base">🎯 建立新活動</h2>
                  <button onClick={() => setShowNewForm(false)} className="text-white/70 hover:text-white text-xl leading-none">×</button>
                </div>

                <div className="p-5 flex flex-col gap-5">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">活動名稱</label>
                    <input
                      type="text"
                      value={activityTitle}
                      onChange={e => setActivityTitle(e.target.value)}
                      placeholder="例如：第三章 植物的生長 複習"
                      autoFocus
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-400 text-sm transition-colors"
                      onKeyDown={e => e.key === 'Enter' && activityTitle.trim() && createActivity()}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">選擇第一道題型</label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {TYPE_CONFIG.map(({ type, icon, label, active }) => (
                        <button
                          key={type}
                          onClick={() => setStarterType(type)}
                          className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-xs font-semibold ${
                            starterType === type
                              ? `${active} text-white border-transparent shadow-md scale-105`
                              : 'border-gray-200 text-gray-600 hover:border-indigo-300 hover:bg-indigo-50'
                          }`}
                        >
                          <span className="text-2xl">{icon}</span>
                          <span className="leading-tight text-center">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {error && <p className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}

                  <button
                    onClick={createActivity}
                    disabled={!activityTitle.trim() || creating}
                    className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold disabled:opacity-40 hover:shadow-md transition-all"
                  >
                    {creating ? '建立中…' : '🚀 建立活動'}
                  </button>
                </div>
              </div>
            )}

            {/* 活動列表 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-700 mb-4">我的活動</h2>
              {loadingHistory ? (
                <p className="text-gray-400 text-center py-6">載入中…</p>
              ) : pastActivities.length === 0 ? (
                <p className="text-gray-400 text-center py-8">尚無活動，點上方按鈕建立第一個活動</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {pastActivities.map(a => (
                    <div key={a.id} className="flex flex-col gap-2 p-4 border border-gray-200 rounded-xl hover:border-indigo-300 transition-colors">
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
                            className="flex-1 border-2 border-indigo-400 rounded-lg px-3 py-1.5 text-sm focus:outline-none"
                          />
                          <button
                            onClick={() => renameActivity(a.id)}
                            className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
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
                            className="text-xs px-2 py-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
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
                          <span className="font-mono text-indigo-600 font-bold tracking-wider">{a.roomCode}</span>
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
                            className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
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

      {/* 課堂工具 Modal */}
      {showTools && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/60 backdrop-blur-sm">
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
