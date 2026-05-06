import { Server, Socket } from 'socket.io'
import { supabase } from '../lib/supabase'
import type { Question, Answer } from '../shared'

export function registerQuestionHandlers(io: Server, socket: Socket) {
  socket.on('teacher:push_question', async ({ questionId, activityId }: { questionId: string; activityId: string }) => {
    const { data: q } = await supabase
      .from('questions')
      .select('*')
      .eq('id', questionId)
      .single()

    if (!q) return

    await supabase
      .from('activities')
      .update({ current_question_id: questionId, is_active: true })
      .eq('id', activityId)

    const question: Question = {
      id: q.id,
      activityId: q.activity_id,
      type: q.type,
      title: q.title,
      options: q.options ?? undefined,
      order: q.order,
    }

    io.to(`activity:${activityId}`).emit('room:question_started', { question })
  })

  socket.on('teacher:end_question', async ({ questionId, activityId }: { questionId: string; activityId: string }) => {
    await supabase
      .from('activities')
      .update({ current_question_id: null })
      .eq('id', activityId)

    io.to(`activity:${activityId}`).emit('room:question_ended', { questionId })
  })

  socket.on('student:submit_answer', async ({
    questionId,
    value,
    sessionId,
  }: {
    questionId: string
    value: string
    sessionId: string
  }) => {
    const { error } = await supabase
      .from('answers')
      .upsert(
        { question_id: questionId, session_id: sessionId, value },
        { onConflict: 'question_id,session_id' }
      )

    if (error) {
      console.error('Failed to save answer:', error)
      return
    }

    const { data: allAnswers } = await supabase
      .from('answers')
      .select('*')
      .eq('question_id', questionId)

    const answers: Answer[] = (allAnswers ?? []).map(a => ({
      id: a.id,
      questionId: a.question_id,
      sessionId: a.session_id,
      value: a.value,
      createdAt: a.created_at,
    }))

    const activityId = socket.data.activityId as string | undefined
    if (activityId) {
      io.to(`activity:${activityId}`).emit('room:answer_updated', { questionId, answers })
    }
  })
}
