import { useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect } from 'react'
import RoomCodeInput from '../components/RoomCodeInput'

export default function StudentJoin() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const code = searchParams.get('code')
    if (code && /^[A-Z0-9]{6}$/.test(code)) {
      navigate(`/answer/${code}`, { replace: true })
    }
  }, [searchParams, navigate])

  function handleSubmit(code: string) {
    navigate(`/answer/${code}`)
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-purple-50 to-blue-100 flex flex-col">
      {/* 頂部品牌列 */}
      <header className="px-4 pt-[env(safe-area-inset-top)] pb-0">
        <div className="py-3 text-center">
          <span className="text-sm font-semibold text-purple-700 tracking-wide">🐻 熊學堂</span>
        </div>
      </header>

      {/* 主要內容：不置中，讓鍵盤彈起時自然向上捲 */}
      <main className="flex-1 flex flex-col items-center px-4 pt-12 pb-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm flex flex-col items-center gap-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-blue-800 mb-1">加入活動</h1>
            <p className="text-gray-500 text-sm">輸入老師提供的 6 碼房間碼</p>
          </div>
          <RoomCodeInput onSubmit={handleSubmit} />
        </div>
      </main>
    </div>
  )
}
