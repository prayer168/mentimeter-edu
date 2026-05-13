export type QuestionType = 'poll' | 'open_ended' | 'word_cloud' | 'scales' | 'ranking'

export interface Question {
  id: string
  activityId: string
  type: QuestionType
  title: string
  options?: string[]   // poll/ranking: 選項; scales: [minLabel, maxLabel]
  order: number
  timeLimit?: number   // 倒數秒數，undefined 或 0 表示無限制
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
  value: string        // poll/word_cloud: 文字; scales: "7"; ranking: JSON 陣列字串
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
