import { Router, Request, Response } from 'express'
import { supabase } from '../lib/supabase'
import type { Question } from '../shared'

const router = Router()

router.post('/', async (req: Request, res: Response) => {
  const { activityId, type, title, options, order, timeLimit } = req.body as {
    activityId?: string
    type?: string
    title?: string
    options?: string[]
    order?: number
    timeLimit?: number
  }

  if (!activityId || !type || !title?.trim()) {
    res.status(400).send('activityId, type, and title are required')
    return
  }

  const validTypes = ['poll', 'open_ended', 'word_cloud', 'scales', 'ranking']
  if (!validTypes.includes(type)) {
    res.status(400).send(`type must be one of: ${validTypes.join(', ')}`)
    return
  }

  const { data, error } = await supabase
    .from('questions')
    .insert({
      activity_id: activityId,
      type,
      title: title.trim(),
      options: type === 'poll' ? (options ?? []) : null,
      order: order ?? 1,
      time_limit: timeLimit && timeLimit > 0 ? timeLimit : null,
    })
    .select()
    .single()

  if (error) {
    console.error(error)
    res.status(500).send(error.message)
    return
  }

  const question: Question = {
    id: data.id,
    activityId: data.activity_id,
    type: data.type,
    title: data.title,
    options: data.options ?? undefined,
    order: data.order,
    timeLimit: data.time_limit ?? undefined,
  }
  res.json(question)
})

export default router
