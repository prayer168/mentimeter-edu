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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-center w-full">
      <input
        type="text"
        inputMode="text"
        autoCapitalize="characters"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        maxLength={6}
        value={code}
        onChange={e => setCode(e.target.value.toUpperCase())}
        placeholder="XXXXXX"
        className="w-44 text-center font-mono tracking-[0.4em] border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 uppercase"
        style={{ fontSize: '1.75rem' }}
      />
      <button
        type="submit"
        disabled={code.trim().length !== 6 || loading}
        className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg disabled:opacity-40 active:scale-95 transition-transform"
      >
        {loading ? '加入中…' : '加入活動'}
      </button>
    </form>
  )
}
