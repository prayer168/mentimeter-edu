# 仿 Mentimeter 教學互動 APP — Phase 1 MVP

> 本文件供 Claude Code 在每個開發 session 啟動時讀取，確保所有任務的技術方向、命名規則與架構一致。

---

## 專案概述

本專案目標是建立一個供國小自然科教師使用的即時互動教學工具，功能仿照 Mentimeter。
Phase 1 MVP 聚焦於兩個核心題型：**Poll（投票）** 與 **Open Ended（開放作答）**，並建立完整的房間管理與教師／學生雙端架構。

**使用情境：**
- 教師在課堂上建立一個「活動房間」，並投影教師端畫面
- 學生用手機或平板掃描 QR Code 或輸入房間碼加入
- 教師逐題推送題目，學生即時作答，結果同步顯示在教師投影畫面

---

## 技術棧（Tech Stack）

### 前端
- **框架**：React 18 + Vite
- **語言**：TypeScript
- **樣式**：Tailwind CSS + shadcn/ui
- **路由**：React Router v6
- **圖表**：Recharts（Poll 結果長條圖）
- **即時通訊（客戶端）**：Socket.io-client

### 後端
- **執行環境**：Node.js 20+
- **框架**：Express.js
- **即時通訊（伺服器端）**：Socket.io
- **資料庫**：Supabase（PostgreSQL）
- **ORM**：Supabase JS Client（`@supabase/supabase-js`）
- **驗證**：Supabase Auth（Email/Password）

### 開發工具
- **套件管理**：npm
- **程式碼規範**：ESLint + Prettier
- **型別共享**：`/packages/shared/types.ts`（前後端共用型別定義）

---

## 專案目錄結構

```
mentimeter-edu/
├── CLAUDE.md                  ← 本文件
├── packages/
│   └── shared/
│       └── types.ts           ← 前後端共用型別
├── frontend/                  ← React + Vite 前端
│   ├── src/
│   │   ├── pages/
│   │   │   ├── TeacherDashboard.tsx   ← 教師後台（建立活動）
│   │   │   ├── TeacherPresent.tsx     ← 教師投影畫面（顯示結果）
│   │   │   ├── StudentJoin.tsx        ← 學生輸入房間碼頁面
│   │   │   └── StudentAnswer.tsx      ← 學生作答頁面
│   │   ├── components/
│   │   │   ├── questions/
│   │   │   │   ├── PollQuestion.tsx        ← Poll 作答元件（學生端）
│   │   │   │   ├── PollResult.tsx          ← Poll 結果圖表（教師端）
│   │   │   │   ├── OpenEndedQuestion.tsx   ← 開放作答元件（學生端）
│   │   │   │   └── OpenEndedResult.tsx     ← 開放作答結果列表（教師端）
│   │   │   ├── RoomCodeInput.tsx      ← 房間碼輸入元件
│   │   │   └── QRCodeDisplay.tsx      ← QR Code 顯示元件
│   │   ├── hooks/
│   │   │   └── useSocket.ts           ← Socket.io 連線 Hook
│   │   ├── lib/
│   │   │   ├── supabase.ts            ← Supabase 客戶端初始化
│   │   │   └── socket.ts              ← Socket.io 客戶端初始化
│   │   └── App.tsx
│   └── package.json
├── backend/                   ← Node.js + Express 後端
│   ├── src/
│   │   ├── index.ts           ← 伺服器進入點
│   │   ├── socket/
│   │   │   ├── index.ts       ← Socket.io 事件總路由
│   │   │   ├── roomHandlers.ts     ← 房間加入／離開事件
│   │   │   └── questionHandlers.ts ← 推送題目／接收答案事件
│   │   ├── routes/
│   │   │   ├── activities.ts  ← REST API：活動 CRUD
│   │   │   └── auth.ts        ← REST API：教師登入
│   │   └── lib/
│   │       └── supabase.ts    ← Supabase 伺服器端客戶端
│   └── package.json
└── package.json               ← 根目錄，管理 workspace
```

---

## 共用型別定義（packages/shared/types.ts）

```typescript
// 題型列舉
export type QuestionType = 'poll' | 'open_ended'

// 題目
export interface Question {
  id: string
  activityId: string
  type: QuestionType
  title: string
  options?: string[]   // Poll 專用，最多 6 個選項
  order: number
}

// 活動（一堂課的互動集合）
export interface Activity {
  id: string
  teacherId: string
  title: string
  roomCode: string     // 6 碼英數，學生輸入用
  isActive: boolean
  currentQuestionId: string | null
  createdAt: string
}

// 學生答案
export interface Answer {
  id: string
  questionId: string
  sessionId: string    // 學生匿名 session ID，不儲存個人資料
  value: string        // Poll：選項文字；Open Ended：回答內容
  createdAt: string
}

// Socket.io 事件型別
export interface SocketEvents {
  // 教師 → 伺服器
  'teacher:push_question': { questionId: string }
  'teacher:end_question': { questionId: string }

  // 學生 → 伺服器
  'student:join_room': { roomCode: string; sessionId: string }
  'student:submit_answer': { questionId: string; value: string; sessionId: string }

  // 伺服器 → 所有人
  'room:question_started': { question: Question }
  'room:question_ended': { questionId: string }
  'room:answer_updated': { questionId: string; answers: Answer[] }
}
```

---

## 資料庫 Schema（Supabase PostgreSQL）

```sql
-- 教師帳號（由 Supabase Auth 管理，此為擴充資料）
CREATE TABLE teachers (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 活動
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  room_code CHAR(6) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  current_question_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 題目
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('poll', 'open_ended')) NOT NULL,
  title TEXT NOT NULL,
  options JSONB,          -- Poll 選項陣列，e.g. ["選項A","選項B"]
  "order" INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 答案（學生匿名作答，不儲存個人識別資訊）
CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,   -- 學生瀏覽器產生的匿名 UUID
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_activities_room_code ON activities(room_code);
CREATE INDEX idx_answers_question_id ON answers(question_id);
```

---

## Socket.io 房間機制

- 每個活動對應一個 Socket.io **room**，名稱為 `activity:{activityId}`
- 教師連線後加入 `teacher:{activityId}` 頻道
- 學生用房間碼加入後，後端查詢對應的 `activityId`，並將學生加入 `activity:{activityId}`
- 答案更新時，後端廣播 `room:answer_updated` 給該 room 的所有成員

```
學生裝置          後端伺服器              教師投影畫面
   │                  │                       │
   │─ student:join ──►│                       │
   │                  │─ room:question_started►│（教師推送題目）
   │◄─ question_started│                       │
   │                  │                       │
   │─ submit_answer ──►│                       │
   │                  │─ room:answer_updated ──►│（即時更新圖表）
```

---

## 環境變數

### frontend/.env.local
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_BACKEND_URL=http://localhost:3001
```

### backend/.env
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=3001
FRONTEND_URL=http://localhost:5173
```

---

## 命名規則

| 項目 | 規則 | 範例 |
|------|------|------|
| React 元件檔案 | PascalCase | `PollResult.tsx` |
| Hook 檔案 | camelCase，以 `use` 開頭 | `useSocket.ts` |
| Supabase 資料表 | snake_case | `activities`, `questions` |
| Socket 事件名稱 | `角色:動作` 格式 | `student:submit_answer` |
| CSS class | Tailwind utility，避免自訂 class | — |
| 型別／介面 | PascalCase | `Question`, `Answer` |
| 常數 | UPPER_SNAKE_CASE | `MAX_OPTIONS = 6` |

---

## Phase 1 完成標準（Definition of Done）

以下所有項目完成後，Phase 1 MVP 即告完成：

- [ ] 教師可以註冊／登入
- [ ] 教師可以建立活動，並新增 Poll 與 Open Ended 題目
- [ ] 系統自動產生 6 碼房間碼與 QR Code
- [ ] 學生可以用房間碼加入活動（無需註冊）
- [ ] 教師可以推送題目到學生端
- [ ] 學生作答後，教師投影畫面即時更新（延遲 < 500ms）
- [ ] Poll 結果以 Recharts 長條圖顯示
- [ ] Open Ended 結果以滾動文字列表顯示
- [ ] 教師可以關閉當前題目，準備下一題
- [ ] 基本 RWD 支援（學生端在手機上可正常操作）

---

## 開發注意事項

1. **學生隱私**：學生作答完全匿名，只記錄瀏覽器產生的 `sessionId`，不收集任何個人資料。
2. **中文支援**：所有 UI 文字使用繁體中文，字型優先使用系統預設的 CJK 字型。
3. **錯誤處理**：Socket.io 斷線時，前端需自動重連並提示使用者。
4. **房間碼唯一性**：產生房間碼時，後端需確認 Supabase 中無重複碼才寫入。
5. **Phase 2 預留**：題型元件設計應預留擴充介面，方便後續加入 Word Cloud、Scales、Ranking。

---

## 給 Claude Code 的任務指引

每次接到新任務時，請依序確認：
1. 此功能屬於前端、後端，還是兩端都需修改？
2. 是否需要新增或修改 `packages/shared/types.ts` 的型別？
3. 是否涉及 Socket.io 事件？若是，確保前後端事件名稱與 payload 格式一致。
4. 是否需要新增 Supabase 資料表或欄位？若是，提供對應的 migration SQL。
5. 完成後確認 TypeScript 無型別錯誤（`tsc --noEmit`）。
