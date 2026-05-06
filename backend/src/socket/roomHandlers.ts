import { Server, Socket } from 'socket.io'
import { supabase } from '../lib/supabase'

export function registerRoomHandlers(io: Server, socket: Socket) {
  socket.on('student:join_room', async ({ roomCode, sessionId }: { roomCode: string; sessionId: string }) => {
    const { data: activity } = await supabase
      .from('activities')
      .select('id, current_question_id, questions(id, type, title, options, order, activity_id)')
      .eq('room_code', roomCode)
      .single()

    if (!activity) {
      socket.emit('student:join_ack', { success: false, error: '找不到該房間碼，請確認後重試' })
      return
    }

    await socket.join(`activity:${activity.id}`)
    socket.data.sessionId = sessionId
    socket.data.activityId = activity.id

    socket.emit('student:join_ack', { success: true })

    if (activity.current_question_id) {
      const currentQ = (activity.questions as Array<{ id: string; type: string; title: string; options: string[] | null; order: number; activity_id: string }>)
        .find(q => q.id === activity.current_question_id)
      if (currentQ) {
        socket.emit('room:question_started', {
          question: {
            id: currentQ.id,
            activityId: currentQ.activity_id,
            type: currentQ.type,
            title: currentQ.title,
            options: currentQ.options ?? undefined,
            order: currentQ.order,
          },
        })
      }
    }
  })

  socket.on('teacher:join_activity', async ({ activityId }: { activityId: string }) => {
    await socket.join(`teacher:${activityId}`)
    await socket.join(`activity:${activityId}`)
    socket.data.activityId = activityId
  })
}
