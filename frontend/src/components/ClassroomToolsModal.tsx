interface Props {
  onClose: () => void
}

export default function ClassroomToolsModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/60 backdrop-blur-sm">
      {/* 標題列 */}
      <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white shrink-0 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-xl">🛠️</span>
          <span className="font-bold text-lg">課堂工具</span>
          <span className="text-amber-100 text-sm hidden sm:block">— 碼錶・時鐘・輪盤抽籤・倒數計時・白板</span>
        </div>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white text-2xl font-bold leading-none px-2 hover:bg-white/10 rounded-lg transition-colors"
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
  )
}
