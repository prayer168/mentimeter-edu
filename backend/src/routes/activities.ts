import { Router, Request, Response } from 'express'
import { supabase } from '../lib/supabase'
import type { Activity, Question, Answer } from '../shared'
import { requireAuth } from '../middleware/auth'

const router = Router()

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

async function uniqueRoomCode(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const code = generateRoomCode()
    const { data } = await supabase
      .from('activities')
      .select('id')
      .eq('room_code', code)
      .maybeSingle()
    if (!data) return code
  }
  throw new Error('無法產生唯一房間碼')
}

function toActivity(a: Record<string, unknown>): Activity {
  return {
    id: a.id as string,
    teacherId: a.teacher_id as string,
    title: a.title as string,
    roomCode: a.room_code as string,
    isActive: a.is_active as boolean,
    currentQuestionId: a.current_question_id as string | null,
    createdAt: a.created_at as string,
  }
}

function toQuestion(q: Record<string, unknown>): Question {
  return {
    id: q.id as string,
    activityId: q.activity_id as string,
    type: q.type as Question['type'],
    title: q.title as string,
    options: (q.options as string[] | null) ?? undefined,
    order: q.order as number,
  }
}

// 列出教師自己的所有活動（含題目數量）
router.get('/', requireAuth, async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('activities')
    .select('*, questions(count)')
    .eq('teacher_id', req.user!.id)
    .order('created_at', { ascending: false })

  if (error) {
    res.status(500).send(error.message)
    return
  }

  const result = (data ?? []).map(a => ({
    ...toActivity(a),
    questionCount: (a.questions as { count: number }[])[0]?.count ?? 0,
  }))

  res.json(result)
})

// 建立活動
router.post('/', requireAuth, async (req: Request, res: Response) => {
  const { title } = req.body as { title?: string }
  if (!title?.trim()) {
    res.status(400).send('title is required')
    return
  }

  const roomCode = await uniqueRoomCode()

  const { data, error } = await supabase
    .from('activities')
    .insert({
      title: title.trim(),
      teacher_id: req.user!.id,
      room_code: roomCode,
      is_active: false,
      current_question_id: null,
    })
    .select()
    .single()

  if (error) {
    console.error(error)
    res.status(500).send(error.message)
    return
  }

  res.json(toActivity(data))
})

// 取得單一活動 + 題目
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params

  const [actRes, qRes] = await Promise.all([
    supabase.from('activities').select('*').eq('id', id).single(),
    supabase.from('questions').select('*').eq('activity_id', id).order('order'),
  ])

  if (actRes.error) {
    res.status(404).send('Activity not found')
    return
  }

  res.json({
    activity: toActivity(actRes.data),
    questions: (qRes.data ?? []).map(toQuestion),
  })
})

// 取得活動的所有結果（題目 + 答案）
router.get('/:id/results', requireAuth, async (req: Request, res: Response) => {
  const { id } = req.params

  const [actRes, qRes] = await Promise.all([
    supabase.from('activities').select('*').eq('id', id).eq('teacher_id', req.user!.id).single(),
    supabase.from('questions').select('*').eq('activity_id', id).order('order'),
  ])

  if (actRes.error) {
    res.status(404).send('Activity not found')
    return
  }

  const questions = (qRes.data ?? []).map(toQuestion)

  // 一次撈出所有相關答案
  const questionIds = questions.map(q => q.id)
  const { data: answersData } = questionIds.length
    ? await supabase.from('answers').select('*').in('question_id', questionIds)
    : { data: [] }

  const answers: Answer[] = (answersData ?? []).map(a => ({
    id: a.id,
    questionId: a.question_id,
    sessionId: a.session_id,
    value: a.value,
    createdAt: a.created_at,
  }))

  res.json({
    activity: toActivity(actRes.data),
    questions,
    answers,
  })
})

export default router
