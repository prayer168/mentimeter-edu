import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import BearLogo from '../components/BearLogo'

type Tab = 'login' | 'register'
type View = 'main' | 'forgot'

export default function TeacherLogin() {
  const { signIn, signUp, resetPassword } = useAuth()
  const navigate = useNavigate()

  const [tab, setTab] = useState<Tab>('login')
  const [view, setView] = useState<View>('main')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [resetEmail, setResetEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  function switchTab(t: Tab) {
    setTab(t)
    setError('')
    setInfo('')
  }

  function openForgot() {
    setResetEmail(email)
    setError('')
    setInfo('')
    setView('forgot')
  }

  function closeForgot() {
    setError('')
    setInfo('')
    setView('main')
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

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setInfo('')
    const { error } = await resetPassword(resetEmail)
    if (error) {
      setError(translateError(error))
    } else {
      setInfo('重設密碼信已寄出，請至信箱點擊連結。')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 w-full max-w-sm flex flex-col gap-5">

        {/* Logo */}
        <div className="text-center">
          <div className="flex justify-center mb-2">
            <div className="rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 p-2 shadow-md">
              <BearLogo size={56} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-indigo-800">熊學堂</h1>
          <p className="text-sm text-gray-500 mt-1">教師專用後台</p>
        </div>

        {view === 'main' ? (
          <>
            {/* 登入 / 註冊 頁籤 */}
            <div className="flex border-b border-gray-200">
              {(['login', 'register'] as Tab[]).map(t => (
                <button
                  key={t}
                  onClick={() => switchTab(t)}
                  className={`flex-1 pb-2.5 text-sm font-medium transition-colors ${
                    tab === t
                      ? 'border-b-2 border-indigo-600 text-indigo-600'
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
                  className="border-2 border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-700">密碼</label>
                  {tab === 'login' && (
                    <button
                      type="button"
                      onClick={openForgot}
                      className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors"
                    >
                      忘記密碼？
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="至少 6 個字元"
                  className="border-2 border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
              {info  && <p className="text-sm text-green-600 bg-green-50 rounded-lg px-3 py-2">{info}</p>}

              <button
                type="submit"
                disabled={loading}
                className="py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold disabled:opacity-40 hover:shadow-md transition-all"
              >
                {loading ? '處理中…' : tab === 'login' ? '登入' : '建立帳號'}
              </button>
            </form>
          </>
        ) : (
          /* 忘記密碼畫面 */
          <form onSubmit={handleReset} className="flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-1">重設密碼</h2>
              <p className="text-sm text-gray-500">輸入您的帳號信箱，我們會寄送重設連結。</p>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">電子郵件</label>
              <input
                type="email"
                value={resetEmail}
                onChange={e => setResetEmail(e.target.value)}
                required
                autoFocus
                placeholder="teacher@school.edu.tw"
                className="border-2 border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
            {info  && <p className="text-sm text-green-600 bg-green-50 rounded-lg px-3 py-2">{info}</p>}

            <button
              type="submit"
              disabled={loading}
              className="py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold disabled:opacity-40 hover:shadow-md transition-all"
            >
              {loading ? '傳送中…' : '傳送重設信'}
            </button>
            <button
              type="button"
              onClick={closeForgot}
              className="py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              ← 返回登入
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

function translateError(msg: string): string {
  if (msg.includes('Invalid login credentials')) return '電子郵件或密碼錯誤'
  if (msg.includes('Email not confirmed')) return '請先至信箱確認帳號'
  if (msg.includes('User already registered')) return '此電子郵件已註冊，請直接登入'
  if (msg.includes('Password should be')) return '密碼至少需要 6 個字元'
  if (msg.includes('rate limit')) return '操作太頻繁，請稍後再試'
  return msg
}
