import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BearLogo from '../components/BearLogo'
import ClassroomToolsButton from '../components/ClassroomToolsButton'
import ClassroomToolsModal from '../components/ClassroomToolsModal'

const FEATURES = [
  { icon: '☁️', label: '文字雲',   desc: '學生輸入關鍵字，高頻詞彙自動放大', color: 'bg-pink-50 border-pink-200',     text: 'text-pink-600'   },
  { icon: '📊', label: '單選投票', desc: '即時長條圖呈現投票結果',           color: 'bg-blue-50 border-blue-200',     text: 'text-blue-600'   },
  { icon: '💬', label: '開放作答', desc: '學生自由發言，所有回答即時顯示',   color: 'bg-purple-50 border-purple-200', text: 'text-purple-600' },
  { icon: '🎚️', label: '量尺評分', desc: '滑桿評分，統計平均值與分布',       color: 'bg-orange-50 border-orange-200', text: 'text-orange-600' },
  { icon: '🏆', label: '排序競賽', desc: '學生排出優先順序，彙整眾人結果',   color: 'bg-green-50 border-green-200',   text: 'text-green-600'  },
  { icon: '⏱️', label: '計時作答', desc: '倒數計時，時間到自動收回答案',     color: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-600' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [showTools, setShowTools] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">

      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 p-1 shadow-md">
              <BearLogo size={36} />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-indigo-800 leading-none">熊學堂</h1>
              <span className="text-[10px] font-bold text-purple-500 tracking-widest hidden sm:block">互動課堂工具</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://prayer168.github.io/science-portal/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl text-xs sm:text-sm shadow hover:opacity-90 hover:scale-105 transition-all"
              title="黑熊老師自然科學數位教材中心"
            >
              🔬 <span className="hidden sm:inline">黑熊老師自然科學數位教材中心</span>
            </a>
            <ClassroomToolsButton onClick={() => setShowTools(true)} size="sm" />
            <button
              onClick={() => navigate('/login')}
              className="px-3 py-1.5 sm:px-5 sm:py-2 text-sm font-semibold text-indigo-600 border-2 border-indigo-300 rounded-xl hover:bg-indigo-50 transition-colors"
            >
              教師登入
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6">
        <section className="py-10 sm:py-16 text-center">
          <div className="flex justify-center mb-6">
            <div className="rounded-3xl bg-gradient-to-br from-indigo-400 to-purple-500 p-3 sm:p-4 shadow-2xl hover:rotate-3 transition-transform">
              <BearLogo size={80} />
            </div>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-800 mb-3 leading-tight">
            讓課堂互動
            <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent"> 活起來！</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-500 mb-8 max-w-xl mx-auto px-2">
            台灣黑熊陪你上課 🐻 專為國小課堂設計的即時互動工具，老師出題，學生搶答，結果即時呈現。
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12 px-4 sm:px-0">
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">教師</span>
              <button
                onClick={() => navigate('/teacher')}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-base sm:text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
              >
                🚀 開始教學
              </button>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">學生</span>
              <button
                onClick={() => navigate('/join')}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-400 to-green-500 text-white text-base sm:text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
              >
                📱 加入課堂
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mb-12">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">六種互動題型</p>
            <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
              {FEATURES.map(({ icon, label, desc, color, text }) => (
                <div
                  key={label}
                  className={`${color} border rounded-xl sm:rounded-2xl p-2 sm:p-4 flex flex-col items-center gap-1 sm:gap-2 hover:scale-105 transition-transform group relative cursor-default`}
                >
                  <span className="text-2xl sm:text-3xl">{icon}</span>
                  <span className={`text-xs sm:text-sm font-bold ${text}`}>{label}</span>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-36 sm:w-44 bg-gray-800 text-white text-xs rounded-xl px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center leading-relaxed shadow-lg">
                    {desc}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-6 sm:p-10 max-w-3xl mx-auto">
            <h3 className="text-xl sm:text-2xl font-extrabold text-gray-800 mb-6 sm:mb-8">怎麼用？超簡單！</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { step: '1', icon: '✏️', title: '老師出題', desc: '登入後建立活動，新增各種互動題目' },
                { step: '2', icon: '📲', title: '學生掃碼', desc: '手機掃 QR Code 或輸入房間碼加入' },
                { step: '3', icon: '📈', title: '即時結果', desc: '學生作答後，圖表即時更新在大螢幕' },
              ].map(({ step, icon, title, desc }) => (
                <div key={step} className="flex sm:flex-col items-center sm:items-center text-left sm:text-center gap-4 sm:gap-2">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white font-extrabold text-base sm:text-lg flex items-center justify-center shadow-md shrink-0">
                    {step}
                  </div>
                  <div>
                    <p className="text-2xl mb-1">{icon}</p>
                    <p className="font-bold text-gray-800 text-sm sm:text-base">{title}</p>
                    <p className="text-xs sm:text-sm text-gray-500">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs sm:text-sm text-gray-400 flex items-center justify-center gap-2 border-t border-gray-100">
        <BearLogo size={16} />
        熊學堂 — 台灣黑熊陪你上每一堂課
      </footer>

      {showTools && <ClassroomToolsModal onClose={() => setShowTools(false)} />}
    </div>
  )
}
