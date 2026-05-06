import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Answer, Question } from '@shared/types'

interface Props {
  question: Question
  answers: Answer[]
}

export default function ScalesResult({ question, answers }: Props) {
  const minLabel = question.options?.[0] ?? '非常不同意'
  const maxLabel = question.options?.[1] ?? '非常同意'

  const { data, avg } = useMemo(() => {
    const counts = Array.from({ length: 10 }, (_, i) => ({ name: String(i + 1), count: 0 }))
    let sum = 0
    for (const a of answers) {
      const n = parseInt(a.value)
      if (n >= 1 && n <= 10) {
        counts[n - 1].count++
        sum += n
      }
    }
    return {
      data: counts,
      avg: answers.length > 0 ? (sum / answers.length).toFixed(1) : null,
    }
  }, [answers])

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-center text-white">{question.title}</h2>
      <div className="flex justify-center items-baseline gap-3">
        <span className="text-gray-400 text-sm">{answers.length} 人作答</span>
        {avg && (
          <span className="text-5xl font-bold text-orange-400">{avg}</span>
        )}
        {avg && <span className="text-gray-400 text-sm">/ 10</span>}
      </div>

      <div className="flex justify-between text-xs text-gray-500 px-1">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
          <XAxis dataKey="name" tick={{ fontSize: 13, fill: '#9ca3af' }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
          <Tooltip
            contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 8 }}
            labelStyle={{ color: '#f3f4f6' }}
            formatter={(v) => [`${v} 人`, '人數']}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={`hsl(${30 + (i / 9) * 60}, 90%, 60%)`}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
