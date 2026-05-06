-- Phase 2: 新增題型支援
-- 更新 questions.type 的 CHECK 約束以支援 word_cloud / scales / ranking

ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_type_check;

ALTER TABLE questions
  ADD CONSTRAINT questions_type_check
  CHECK (type IN ('poll', 'open_ended', 'word_cloud', 'scales', 'ranking'));
