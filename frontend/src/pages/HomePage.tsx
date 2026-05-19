import { useNavigate } from 'react-router-dom'
import BearLogo from '../components/BearLogo'

const FEATURES = [
  { icon: '☁️', label: '文字雲', color: 'bg-pink-100 border-pink-300', text: 'text-pink-600' },
  { icon: '📊', label: '單選投票', color: 'bg-blue-100 border-blue-300', text: 'text-blue-600' },
  { icon: '💬', label: '開放作答', color: 'bg-purple-100 border-purple-300', text: 'text-purple-600' },
  { icon: '🎚️', label: '量尺評分', color: 'bg-orange-100 border-orange-300', text: 'text-orange-600' },
  { icon: '🏆', label: '排序競賽', color: 'bg-green-100 border-green-300', text: 'text-green-600' },
  { icon: '⏱️', label: '計時作答', color: 'bg-yellow-100 border-yellow-300', text: 'text-yellow-600' },
]

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 p-1 shadow-lg hover:scale-105 transition-transform">
            <BearLogo size={44} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-indigo-800 leading-none">熊學堂</h1>
            <span className="text-xs font-bold text-purple-500 tracking-widest">互動課堂工具</span>
          </div>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="px-5 py-2 text-sm font-semibold text-indigo-600 border-2 border-indigo-300 rounded-xl hover:bg-indigo-50 transition-colors"
        >
          教師登入
        </button>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 pt-10 pb-20 text-center">
        <div className="flex justify-center mb-6">
          <div className="rounded-3xl bg-gradient-to-br from-indigo-400 to-purple-500 p-3 shadow-2xl hover:rotate-3 transition-transform">
            <BearLogo size={100} />
          </div>
        </div>

        <h2 className="text-5xl font-extrabold text-gray-800 mb-4 leading-tight">
          讓課堂互動
          <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent"> 活起來！</span>
        </h2>
        <p className="text-xl text-gray-500 mb-10 max-w-xl mx-auto">
          台灣黑熊陪你上課 🐻 專為國小課堂設計的即時互動工具，老師出題，學生搶答，結果即時呈現。
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">教師</span>
            <button
              onClick={() => navigate('/teacher')}
              className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              🚀 開始教學
            </button>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">學生</span>
            <button
              onClick={() => navigate('/join')}
              className="px-8 py-4 bg-gradient-to-r from-emerald-400 to-green-500 text-white text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              📱 加入課堂
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="mb-16">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">六種互動題型</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {FEATURES.map(({ icon, label, color, text }) => (
              <div
                key={label}
                className={`${color} border-2 rounded-2xl p-4 flex flex-col items-center gap-2 hover:scale-105 transition-transform cursor-default`}
              >
                <span className="text-3xl">{icon}</span>
                <span className={`text-sm font-bold ${text}`}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-3xl mx-auto">
          <h3 className="text-2xl font-extrabold text-gray-800 mb-8">怎麼用？超簡單！</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { step: '1', icon: '✏️', title: '老師出題', desc: '登入後建立活動，新增各種互動題目' },
              { step: '2', icon: '📲', title: '學生掃碼', desc: '手機掃 QR Code 或輸入房間碼加入' },
              { step: '3', icon: '📈', title: '即時結果', desc: '學生作答後，圖表即時更新在大螢幕' },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white font-extrabold text-lg flex items-center justify-center shadow-md">
                  {step}
                </div>
                <div className="text-3xl">{icon}</div>
                <p className="font-bold text-gray-800">{title}</p>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-gray-400 flex items-center justify-center gap-2">
        <BearLogo size={20} />
        熊學堂 — 台灣黑熊陪你上每一堂課
      </footer>
    </div>
  )
}
