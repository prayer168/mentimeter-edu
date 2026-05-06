import { Router, Request, Response } from 'express'
import { supabase } from '../lib/supabase'
import { Activity, Question } from '@shared/types'
import { nanoid } from 'nanoid'

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

router.post('/', async (req: Request, res: Response) => {
  const { title, teacherId } = req.body as { title?: string; teacherId?: string }
  if (!title?.trim()) {
    res.status(400).send('title is required')
    return
  }

  const roomCode = await uniqueRoomCode()
  const effectiveTeacherId = teacherId ?? 'anonymous-' + nanoid(8)

  const { data, error } = await supabase
    .from('activities')
    .insert({
      title: title.trim(),
      teacher_id: effectiveTeacherId,
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

  const activity: Activity = {
    id: data.id,
    teacherId: data.teacher_id,
    title: data.title,
    roomCode: data.room_code,
    isActive: data.is_active,
    currentQuestionId: data.current_question_id,
    createdAt: data.created_at,
  }
  res.json(activity)
})

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

  const a = actRes.data
  const activity: Activity = {
    id: a.id,
    teacherId: a.teacher_id,
    title: a.title,
    roomCode: a.room_code,
    isActive: a.is_active,
    currentQuestionId: a.current_question_id,
    createdAt: a.created_at,
  }

  const questions: Question[] = (qRes.data ?? []).map(q => ({
    id: q.id,
    activityId: q.activity_id,
    type: q.type,
    title: q.title,
    options: q.options ?? undefined,
    order: q.order,
  }))

  res.json({ activity, questions })
})

export default router
