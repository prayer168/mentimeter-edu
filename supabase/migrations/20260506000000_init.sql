-- ===================================================
-- Mentimeter EDU — Phase 1 Initial Schema
-- ===================================================

-- 教師帳號（擴充 Supabase Auth）
CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 活動
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id TEXT NOT NULL,           -- 暫時用 TEXT，Phase 2 改為 UUID REFERENCES teachers(id)
  title TEXT NOT NULL,
  room_code CHAR(6) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  current_question_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 題目
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('poll', 'open_ended')),
  title TEXT NOT NULL,
  options JSONB,
  "order" INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 答案（學生匿名）
CREATE TABLE IF NOT EXISTS answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (question_id, session_id)    -- 每位學生每題只能答一次
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_activities_room_code ON activities(room_code);
CREATE INDEX IF NOT EXISTS idx_questions_activity_id ON questions(activity_id);
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id);

-- ===================================================
-- Row Level Security（RLS）
-- ===================================================

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- activities：所有人可讀（學生需要查房間碼）；後端 service role 可寫
CREATE POLICY "Public read activities" ON activities
  FOR SELECT USING (true);

-- questions：所有人可讀
CREATE POLICY "Public read questions" ON questions
  FOR SELECT USING (true);

-- answers：所有人可讀（教師端需即時看到）
CREATE POLICY "Public read answers" ON answers
  FOR SELECT USING (true);

-- 寫入由後端 service_role key 執行，繞過 RLS，不需額外 policy
