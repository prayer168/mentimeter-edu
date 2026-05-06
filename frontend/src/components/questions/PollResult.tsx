import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Question, Answer } from '@shared/types'

interface Props {
  question: Question
  answers: Answer[]
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function PollResult({ question, answers }: Props) {
  const data = (question.options ?? []).map((option, i) => ({
    name: option,
    count: answers.filter(a => a.value === option).length,
    color: COLORS[i % COLORS.length],
  }))

  const total = answers.length

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-center text-gray-800">{question.title}</h2>
      <p className="text-center text-gray-500">共 {total} 票</p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 14, fill: '#374151' }}
            angle={-20}
            textAnchor="end"
            interval={0}
          />
          <YAxis allowDecimals={false} tick={{ fontSize: 13 }} />
          <Tooltip formatter={(v) => [`${v} 票`, '數量']} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
