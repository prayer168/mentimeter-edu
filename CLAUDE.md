# 仿 Mentimeter 教學互動 APP

> 本文件供 Claude Code 在每個開發 session 啟動時讀取，確保所有任務的技術方向、命名規則與架構一致。

---

## 專案概述

供國小自然科教師使用的即時互動教學工具，功能仿照 Mentimeter。

**使用情境：**
- 教師建立「活動房間」並投影教師端畫面
- 學生用手機掃描 QR Code 或輸入房間碼加入
- 教師逐題推送題目，學生即時作答，結果同步顯示在投影畫面

**專案路徑：** `C:\Users\Roki\mentimeter-edu`

---

## 技術棧（Tech Stack）

### 前端
- **框架**：React 18 + Vite 5
- **語言**：TypeScript
- **樣式**：Tailwind CSS
- **路由**：React Router v6
- **圖表**：Recharts
- **即時通訊**：Socket.io-client

### 後端
- **執行環境**：Node.js v24
- **框架**：Express.js
- **即時通訊**：Socket.io
- **資料庫**：Supabase（PostgreSQL）
- **客戶端**：@supabase/supabase-js v2
- **驗證**：Supabase Auth（Email/Password）

### 開發工具
- **套件管理**：npm workspaces
- **後端執行**：ts-node-dev

---

## 專案目錄結構

```
mentimeter-edu/
├── CLAUDE.md
├── package.json                    ← npm workspace 根目錄
├── packages/shared/
│   └── types.ts                    ← 前後端共用型別
├── frontend/
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── vercel.json
│   └── src/
│       ├── App.tsx                 ← 路由設定
│       ├── main.tsx
│       ├── index.css
│       ├── contexts/
│       │   └── AuthContext.tsx     ← Supabase Auth 狀態管理
│       ├── components/
│       │   ├── ProtectedRoute.tsx
│       │   ├── QRCodeDisplay.tsx
│       │   ├── RoomCodeInput.tsx
│       │   └── questions/
│       │       ├── PollQuestion.tsx
│       │       ├── PollResult.tsx
│       │       ├── OpenEndedQuestion.tsx
│       │       ├── OpenEndedResult.tsx
│       │       ├── WordCloudQuestion.tsx
│       │       ├── WordCloudResult.tsx
│       │       ├── ScalesQuestion.tsx
│       │       ├── ScalesResult.tsx
│       │       ├── RankingQuestion.tsx
│       │       └── RankingResult.tsx
│       ├── hooks/
│       │   └── useSocket.ts
│       ├── lib/
│       │   ├── supabase.ts
│       │   └── socket.ts
│       └── pages/
│           ├── TeacherLogin.tsx    ← 登入／註冊
│           ├── TeacherDashboard.tsx ← 教師後台（活動管理）
│           ├── TeacherPresent.tsx  ← 教師投影畫面
│           ├── TeacherResults.tsx  ← 查看歷史結果
│           ├── StudentJoin.tsx     ← 學生輸入房間碼
│           └── StudentAnswer.tsx   ← 學生作答
└── backend/
    ├── package.json
    └── src/
        ├── index.ts               ← 伺服器進入點（port 3001）
        ├── shared.ts              ← prebuild 複製自 packages/shared/types.ts
        ├── lib/supabase.ts
        ├── middleware/auth.ts     ← JWT 驗證 middleware
        ├── types/express.d.ts
        ├── routes/
        │   ├── activities.ts      ← GET/POST/PATCH/DELETE /activities
        │   └── questions.ts       ← POST /questions
        └── socket/
            ├── index.ts
            ├── roomHandlers.ts
            └── questionHandlers.ts
```

---

## 路由對照

### 前端頁面路由
| 路徑 | 說明 |
|------|------|
| `/` | 重新導向到 `/teacher` |
| `/login` | 教師登入／註冊 |
| `/teacher` | 教師後台（需登入） |
| `/teacher/present/:activityId` | 教師投影畫面（需登入） |
| `/teacher/results/:activityId` | 查看歷史結果（需登入） |
| `/join` | 學生輸入房間碼 |
| `/answer/:roomCode` | 學生作答 |

### 後端 API
| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | `/activities` | 列出教師的所有活動 |
| POST | `/activities` | 建立活動 |
| GET | `/activities/:id` | 取得活動＋題目 |
| PATCH | `/activities/:id` | 修改活動名稱 |
| DELETE | `/activities/:id` | 刪除活動 |
| GET | `/activities/:id/results` | 取得活動結果 |
| POST | `/questions` | 新增題目 |
| GET | `/health` | 健康檢查 |

---

## 共用型別（packages/shared/types.ts）

```typescript
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
  value: string
  createdAt: string
}
```

---

## 資料庫 Schema（Supabase PostgreSQL）

```sql
CREATE TABLE teachers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  room_code CHAR(6) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  current_question_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('poll', 'open_ended', 'word_cloud', 'scales', 'ranking')) NOT NULL,
  title TEXT NOT NULL,
  options JSONB,
  "order" INTEGER NOT NULL,
  time_limit INTEGER,           -- 倒數秒數，NULL 表示無限制
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (question_id, session_id)
);

CREATE INDEX idx_activities_room_code ON activities(room_code);
CREATE INDEX idx_answers_question_id ON answers(question_id);
```

> **注意**：`time_limit` 欄位是後來用 `ALTER TABLE questions ADD COLUMN IF NOT EXISTS time_limit INTEGER;` 新增的。

---

## 環境變數

### frontend/.env.local
```
VITE_SUPABASE_URL=https://cmeiwebdaavcurzivegm.supabase.co
VITE_SUPABASE_ANON_KEY=（legacy JWT anon key）
VITE_BACKEND_URL=http://localhost:3001
```

### backend/.env
```
SUPABASE_URL=https://cmeiwebdaavcurzivegm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=（legacy JWT service role key）
PORT=3001
FRONTEND_URL=http://localhost:5173,http://localhost:5174
```

---

## 啟動開發伺服器

```
cd C:\Users\Roki\mentimeter-edu
npm run dev
```

- 前端：http://localhost:5173（若被佔用會自動往上找）
- 後端：http://localhost:3001（若被佔用需手動 kill）

### 若 port 3001 被佔用
```
netstat -ano | findstr :3001
taskkill /PID <PID號碼> /F
```

---

## 功能完成狀態

### 已完成
- [x] 教師註冊／登入（Supabase Auth）
- [x] 建立、編輯名稱、刪除活動
- [x] 自動產生 6 碼房間碼與 QR Code
- [x] 新增題目：Poll、Open Ended、Word Cloud、Scales、Ranking
- [x] 題目計時器（10/20/30/60/90 秒，時間到自動關閉）
- [x] 學生用房間碼加入（匿名，localStorage sessionId）
- [x] 教師推送題目到學生端（Socket.io）
- [x] 學生即時作答，教師投影畫面即時更新
- [x] Poll 結果 Recharts 長條圖
- [x] Open Ended 滾動文字列表
- [x] Word Cloud、Scales、Ranking 結果顯示
- [x] 歷史結果查看頁面
- [x] 基本 RWD（學生端手機適配）

### 待完成
- [ ] 部署：後端 Railway、前端 Vercel
- [ ] AI 自動出題（Claude API）
- [ ] 結果匯出 PDF
- [ ] Pin on Image 題型

---

## 命名規則

| 項目 | 規則 | 範例 |
|------|------|------|
| React 元件 | PascalCase | `PollResult.tsx` |
| Hook | camelCase + use 前綴 | `useSocket.ts` |
| Supabase 資料表 | snake_case | `activities` |
| Socket 事件 | `角色:動作` | `student:submit_answer` |
| CSS | Tailwind utility | — |
| 型別／介面 | PascalCase | `Question` |
| 常數 | UPPER_SNAKE_CASE | `MAX_OPTIONS = 6` |

---

## 給 Claude Code 的任務指引

每次接到新任務時，請依序確認：
1. 此功能屬於前端、後端，還是兩端都需修改？
2. 是否需要新增或修改 `packages/shared/types.ts` 的型別？
3. 是否涉及 Socket.io 事件？若是，確保前後端事件名稱與 payload 一致。
4. 是否需要新增 Supabase 資料表或欄位？若是，提供對應的 migration SQL。
5. 後端 `src/shared.ts` 是 prebuild 自動複製的，不要直接編輯它。
6. 完成後確認 TypeScript 無型別錯誤。
