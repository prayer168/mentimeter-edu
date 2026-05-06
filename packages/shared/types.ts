export type QuestionType = 'poll' | 'open_ended'

export interface Question {
  id: string
  activityId: string
  type: QuestionType
  title: string
  options?: string[]
  order: number
}

export interface Activity {
  id: string
  teacherId: string
  title: string
  roomCode: string
  isActive: boolean
  currentQuestionId: string | null
  createdAt: string
}

export interface Answer {
  id: string
  questionId: string
  sessionId: string
  value: string
  createdAt: string
}

export interface SocketEvents {
  'teacher:push_question': { questionId: string }
  'teacher:end_question': { questionId: string }
  'student:join_room': { roomCode: string; sessionId: string }
  'student:submit_answer': { questionId: string; value: string; sessionId: string }
  'room:question_started': { question: Question }
  'room:question_ended': { questionId: string }
  'room:answer_updated': { questionId: string; answers: Answer[] }
}
