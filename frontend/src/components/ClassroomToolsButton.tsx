import { useState, useEffect } from 'react'

interface Props {
  onClick: () => void
  size?: 'sm' | 'md'
}

export default function ClassroomToolsButton({ onClick, size = 'md' }: Props) {
  const [pulse, setPulse] = useState(false)

  // 每 4 秒觸發一次閃爍吸引注意
  useEffect(() => {
    const id = setInterval(() => {
      setPulse(true)
      setTimeout(() => setPulse(false), 1000)
    }, 4000)
    return () => clearInterval(id)
  }, [])

  const base = size === 'sm'
    ? 'px-3 py-1.5 text-sm gap-1.5'
    : 'px-4 py-2.5 text-sm gap-2'

  return (
    <div className="relative">
      {/* 外層光暈 */}
      <span
        className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 blur-md transition-opacity duration-500 ${pulse ? 'opacity-80' : 'opacity-0'}`}
      />
      {/* 主按鈕 */}
      <button
        onClick={onClick}
        className={`relative z-10 flex items-center font-bold rounded-2xl text-white shadow-lg
          bg-gradient-to-r from-amber-400 to-orange-500
          hover:from-amber-500 hover:to-orange-600
          hover:shadow-orange-300 hover:shadow-xl
          hover:scale-105 active:scale-95
          transition-all duration-200 ${base}
          ${pulse ? 'scale-110 shadow-orange-400 shadow-xl' : ''}
        `}
        style={{
          animation: pulse ? 'wiggle 0.4s ease-in-out' : undefined,
        }}
      >
        <span
          className="text-base"
          style={{ animation: 'spin-once 0.6s ease-in-out', display: 'inline-block' }}
        >
          🛠️
        </span>
        課堂工具
      </button>

      {/* CSS 動畫定義 */}
      <style>{`
        @keyframes wiggle {
          0%, 100% { transform: scale(1.1) rotate(0deg); }
          25% { transform: scale(1.12) rotate(-3deg); }
          75% { transform: scale(1.12) rotate(3deg); }
        }
        @keyframes spin-once {
          0% { transform: rotate(0deg); }
          50% { transform: rotate(-20deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>
    </div>
  )
}
