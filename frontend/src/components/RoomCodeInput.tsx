import { useState } from 'react'

interface Props {
  onSubmit: (code: string) => void
  loading?: boolean
}

export default function RoomCodeInput({ onSubmit, loading }: Props) {
  const [code, setCode] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = code.trim().toUpperCase()
    if (trimmed.length === 6) onSubmit(trimmed)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-center">
      <input
        type="text"
        maxLength={6}
        value={code}
        onChange={e => setCode(e.target.value.toUpperCase())}
        placeholder="輸入 6 碼房間碼"
        className="w-48 text-center text-3xl font-mono tracking-widest border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 uppercase"
        autoFocus
      />
      <button
        type="submit"
        disabled={code.trim().length !== 6 || loading}
        className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold text-lg disabled:opacity-40 hover:bg-blue-700 transition-colors"
      >
        {loading ? '加入中…' : '加入活動'}
      </button>
    </form>
  )
}
