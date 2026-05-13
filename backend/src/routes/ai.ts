import { Router, Request, Response } from 'express'
import Anthropic from '@anthropic-ai/sdk'
import { requireAuth } from '../middleware/auth'

const router = Router()

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

router.post('/generate-questions', requireAuth, async (req: Request, res: Response) => {
  const { topic, count = 3 } = req.body as { topic?: string; count?: number }

  if (!topic?.trim()) {
    res.status(400).send('topic is required')
    return
  }

  const safeCount = Math.min(Math.max(1, Number(count) || 3), 5)

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      system: `你是一位國小自然科教師助手，專門出題。請嚴格依照 JSON 格式輸出，不要有任何多餘文字。`,
      messages: [
        {
          role: 'user',
          content: `為國小自然科「${topic.trim()}」單元出 ${safeCount} 道 Poll 投票題，每題有 3-4 個選項。

請以以下 JSON 格式回覆（只輸出 JSON，不要其他文字）：
{
  "questions": [
    {
      "title": "題目內容",
      "options": ["選項A", "選項B", "選項C", "選項D"]
    }
  ]
}

要求：
- 題目使用繁體中文
- 選項簡短明確（5字以內最佳）
- 難度適合國小學生
- 涵蓋不同面向的知識點`,
        },
      ],
    })

    const text = message.content.find(b => b.type === 'text')?.text ?? ''

    // 擷取 JSON（防止 Claude 偶爾前後多輸出文字）
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      res.status(500).send('AI 回傳格式異常，請再試一次')
      return
    }

    const parsed = JSON.parse(jsonMatch[0]) as {
      questions: Array<{ title: string; options: string[] }>
    }

    if (!Array.isArray(parsed.questions)) {
      res.status(500).send('AI 回傳格式異常')
      return
    }

    res.json({ questions: parsed.questions })
  } catch (err) {
    console.error('[AI] generate-questions error:', err)
    res.status(500).send('AI 出題失敗，請確認 API Key 是否設定')
  }
})

export default router
