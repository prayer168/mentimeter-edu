import { useMemo } from 'react'
import { Answer, Question } from '@shared/types'

interface Props {
  question: Question
  answers: Answer[]
}

export default function RankingResult({ question, answers }: Props) {
  const options = question.options ?? []

  const ranked = useMemo(() => {
    // 計算每個選項的平均排名（排名越小越好）
    const sumRank: Record<string, number> = {}
    const countRank: Record<string, number> = {}
    for (const opt of options) {
      sumRank[opt] = 0
      countRank[opt] = 0
    }

    for (const a of answers) {
      try {
        const order: string[] = JSON.parse(a.value)
        order.forEach((item, idx) => {
          if (item in sumRank) {
            sumRank[item] += idx + 1
            countRank[item]++
          }
        })
      } catch {
        // ignore malformed answers
      }
    }

    return options
      .map(opt => ({
        name: opt,
        avg: countRank[opt] > 0 ? sumRank[opt] / countRank[opt] : options.length + 1,
        count: countRank[opt],
      }))
      .sort((a, b) => a.avg - b.avg)
  }, [answers, options])

  const MEDAL = ['🥇', '🥈', '🥉']

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-center text-white">{question.title}</h2>
      <p className="text-center text-gray-400 text-sm">
        {answers.length} 人作答 · 依平均排名排列
      </p>

      {answers.length === 0 ? (
        <p className="text-center text-gray-500 py-12 text-lg">等待學生作答…</p>
      ) : (
        <div className="flex flex-col gap-3 mt-2">
          {ranked.map((item, i) => {
            const barWidth = Math.max(8, Math.round((1 - (item.avg - 1) / (options.length - 1 || 1)) * 100))
            return (
              <div key={item.name} className="flex items-center gap-3">
                <span className="text-2xl w-8 shrink-0 text-center">
                  {MEDAL[i] ?? <span className="text-gray-400 font-bold">{i + 1}</span>}
                </span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-white text-sm font-medium">{item.name}</span>
                    <span className="text-gray-400 text-xs">平均第 {item.avg.toFixed(1)} 名</span>
                  </div>
                  <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${barWidth}%`,
                        background: `hsl(${160 - i * 25}, 70%, 55%)`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
