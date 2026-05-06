import { useMemo } from 'react'
import { Answer, Question } from '@shared/types'

interface Props {
  question: Question
  answers: Answer[]
}

const COLORS = [
  'text-blue-300', 'text-emerald-300', 'text-yellow-300',
  'text-pink-300', 'text-purple-300', 'text-cyan-300',
  'text-orange-300', 'text-teal-300', 'text-rose-300',
  'text-lime-300', 'text-indigo-300', 'text-amber-300',
]

function seededRandom(seed: string, offset = 0): number {
  let h = offset * 2654435761
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 2654435761)
  }
  return ((h >>> 0) % 1000) / 1000
}

export default function WordCloudResult({ question, answers }: Props) {
  const words = useMemo(() => {
    const freq = new Map<string, number>()
    for (const a of answers) {
      const key = a.value.trim()
      if (key) freq.set(key, (freq.get(key) ?? 0) + 1)
    }
    const entries = [...freq.entries()].sort((a, b) => b[1] - a[1])
    const maxCount = entries[0]?.[1] ?? 1
    return entries.map(([text, count]) => ({
      text,
      count,
      fontSize: 1.2 + (count / maxCount) * 2.8,
      rotation: Math.round((seededRandom(text, 1) - 0.5) * 28),
      color: COLORS[Math.floor(seededRandom(text, 2) * COLORS.length)],
    }))
  }, [answers])

  return (
    <div className="flex flex-col gap-4 select-none">
      <h2 className="text-2xl font-bold text-center text-white">{question.title}</h2>
      <p className="text-center text-gray-400 text-sm">共 {answers.length} 則回答</p>
      {words.length === 0 ? (
        <p className="text-center text-gray-500 py-12 text-lg">等待學生作答…</p>
      ) : (
        <div className="flex flex-wrap gap-x-6 gap-y-5 justify-center items-center py-6 min-h-48">
          {words.map(({ text, count, fontSize, rotation, color }) => (
            <span
              key={text}
              title={count > 1 ? `${count} 人` : undefined}
              className={`inline-block font-bold leading-tight ${color}`}
              style={{
                fontSize: `${fontSize}rem`,
                transform: `rotate(${rotation}deg)`,
                textShadow: '0 2px 8px rgba(0,0,0,0.4)',
                animation: 'wordPop 0.4s ease-out',
              }}
            >
              {text}
              {count > 1 && <sup className="text-[0.45em] opacity-70 ml-0.5">{count}</sup>}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
