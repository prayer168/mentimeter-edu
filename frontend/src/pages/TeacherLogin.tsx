import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

type Tab = 'login' | 'register'

export default function TeacherLogin() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const [tab, setTab] = useState<Tab>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  function switchTab(t: Tab) {
    setTab(t)
    setError('')
    setInfo('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setInfo('')

    if (tab === 'login') {
      const { error } = await signIn(email, password)
      if (error) {
        setError(translateError(error))
      } else {
        navigate('/teacher')
      }
    } else {
      const { error, needsConfirmation } = await signUp(email, password)
      if (error) {
        setError(translateError(error))
      } else if (needsConfirmation) {
        setInfo('確認信已寄出，請至信箱點擊連結後再回來登入。')
        setTab('login')
      } else {
        navigate('/teacher')
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm flex flex-col gap-6">
        <div className="text-center">
          <div className="text-4xl mb-1">🐻</div>
          <h1 className="text-2xl font-bold text-indigo-800">熊學堂</h1>
          <p className="text-sm text-gray-500 mt-1">教師專用後台</p>
        </div>

        <div className="flex border-b border-gray-200">
          {(['login', 'register'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className={`flex-1 pb-2.5 text-sm font-medium transition-colors ${
                tab === t
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {t === 'login' ? '登入' : '註冊'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">電子郵件</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              placeholder="teacher@school.edu.tw"
              className="border-2 border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">密碼</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="至少 6 個字元"
              className="border-2 border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}
          {info && (
            <p className="text-sm text-green-600 bg-green-50 rounded-lg px-3 py-2">{info}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="py-3 bg-blue-600 text-white rounded-xl font-semibold disabled:opacity-40 hover:bg-blue-700 transition-colors"
          >
            {loading ? '處理中…' : tab === 'login' ? '登入' : '建立帳號'}
          </button>
        </form>
      </div>
    </div>
  )
}

function translateError(msg: string): string {
  if (msg.includes('Invalid login credentials')) return '電子郵件或密碼錯誤'
  if (msg.includes('Email not confirmed')) return '請先至信箱確認帳號'
  if (msg.includes('User already registered')) return '此電子郵件已註冊，請直接登入'
  if (msg.includes('Password should be')) return '密碼至少需要 6 個字元'
  return msg
}
