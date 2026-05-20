# 熊學堂 — 互動課堂工具

> 本文件供 Claude Code 在每個開發 session 啟動時讀取，確保所有任務的技術方向、命名規則與架構一致。

---

## 專案概述

**網站名稱：** 熊學堂互動課堂工具
**線上網址：** https://mentimeter-edu.vercel.app/
**專案路徑（本機）：** `G:\google drive\Dropbox (十年磨一劍)\0000000000數位教材\APP\Mentimeter_Prayer\mentimeter-edu`

供國小教師使用的即時互動教學工具，功能仿照 Mentimeter。台灣黑熊吉祥物（SVG，`BearLogo` 元件），品牌色：indigo/purple 漸層。

**使用情境：**
- 教師建立「活動房間」並投影教師端畫面
- 學生用手機掃描 QR Code 或輸入 6 碼房間碼加入
- 教師逐題推送題目，學生即時作答，結果同步顯示在投影畫面

---

## 技術棧（Tech Stack）

### 前端
- **框架**：React 18 + Vite 5
- **語言**：TypeScript
- **樣式**：Tailwind CSS
- **路由**：React Router v6
- **圖表**：Recharts
- **即時通訊**：Socket.io-client
- **部署**：Vercel（`main` 分支自動部署）

### 後端
- **執行環境**：Node.js v24
- **框架**：Express.js
- **即時通訊**：Socket.io
- **資料庫**：Supabase（PostgreSQL，專案 ID：`cmeiwebdaavcurzivegm`）
- **客戶端**：@supabase/supabase-js v2
- **驗證**：Supabase Auth（Email/Password）
- **部署**：Railway（專案名稱：`zucchini-amazement`，`master` 分支）

### Git 分支說明
| 分支 | 用途 |
|------|------|
| `main` | 前端（Vercel 自動部署） |
| `master` | 後端（Railway 自動部署） |

---

## 專案目錄結構

```
mentimeter-edu/
├── CLAUDE.md
├── 仿Mentimeter教學APP開發踩坑紀錄_2.md
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
│       │   └── AuthContext.tsx     ← Supabase Auth（含 resetPassword）
│       ├── components/
│       │   ├── BearLogo.tsx        ← 台灣黑熊 SVG 吉祥物元件
│       │   ├── ProtectedRoute.tsx
│       │   ├── QRCodeDisplay.tsx
│       │   ├── RoomCodeInput.tsx   ← 學生輸入房間碼（紫色按鈕）
│       │   └── questions/
│       │       ├── PollQuestion.tsx / PollResult.tsx
│       │       ├── OpenEndedQuestion.tsx / OpenEndedResult.tsx
│       │       ├── WordCloudQuestion.tsx / WordCloudResult.tsx
│       │       ├── ScalesQuestion.tsx / ScalesResult.tsx
│       │       └── RankingQuestion.tsx / RankingResult.tsx
│       ├── hooks/
│       │   └── useSocket.ts
│       ├── lib/
│       │   ├── supabase.ts
│       │   └── socket.ts
│       └── pages/
│           ├── HomePage.tsx        ← 首頁（教師/學生 CTA、六種題型卡片）
│           ├── TeacherLogin.tsx    ← 登入／註冊／忘記密碼
│           ├── TeacherDashboard.tsx ← 教師後台（活動管理）
│           ├── TeacherPresent.tsx  ← 教師投影畫面
│           ├── TeacherResults.tsx  ← 查看歷史結果
│           ├── StudentJoin.tsx     ← 學生輸入房間碼（含返回首頁）
│           └── StudentAnswer.tsx   ← 學生作答
└── backend/
    ├── package.json
    └── src/
        ├── index.ts               ← 伺服器進入點 + Supabase keep-alive（每 5 天）
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
| 路徑 | 元件 | 說明 |
|------|------|------|
| `/` | `HomePage` | 首頁（教師/學生 CTA、六種題型說明） |
| `/login` | `TeacherLogin` | 教師登入／註冊／忘記密碼 |
| `/teacher` | `TeacherDashboard` | 教師後台（需登入） |
| `/teacher/present/:activityId` | `TeacherPresent` | 教師投影畫面（需登入） |
| `/teacher/results/:activityId` | `TeacherResults` | 查看歷史結果（需登入） |
| `/join` | `StudentJoin` | 學生輸入房間碼（含返回首頁） |
| `/answer/:roomCode` | `StudentAnswer` | 學生作答 |

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

## UI 設計規範

| 元素 | 規格 |
|------|------|
| 品牌色（教師） | `from-indigo-500 to-purple-600` 漸層 |
| 品牌色（學生） | `from-emerald-400 to-green-500` 漸層 |
| 背景 | `from-indigo-50 via-purple-50 to-pink-50` |
| 吉祥物 | `<BearLogo size={N} />` SVG，統一使用，不用 🐻 emoji |
| 按鈕圓角 | `rounded-2xl` |
| 卡片圓角 | `rounded-2xl` 或 `rounded-3xl` |
| 六種題型標籤 | 文字雲、單選投票、開放作答、量尺評分、排序競賽、計時作答（純中文） |

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
VITE_SUPABASE_ANON_KEY=（anon key）
VITE_BACKEND_URL=https://（Railway 後端網址）
```

### backend/.env（Railway 環境變數設定）
```
SUPABASE_URL=https://cmeiwebdaavcurzivegm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=（service role key）
PORT=3001
FRONTEND_URL=https://mentimeter-edu.vercel.app
```

---

## 啟動開發伺服器（本機）

```bash
cd "G:\google drive\Dropbox (十年磨一劍)\0000000000數位教材\APP\Mentimeter_Prayer\mentimeter-edu"
npm run dev
```

- 前端：http://localhost:5173
- 後端：http://localhost:3001

### 若 port 3001 被佔用（Windows）
```
netstat -ano | findstr :3001
taskkill /PID <PID號碼> /F
```

---

## 功能完成狀態

### 已完成
- [x] 教師註冊／登入（Supabase Auth）
- [x] 忘記密碼（Supabase resetPasswordForEmail）
- [x] 建立、編輯名稱、刪除活動
- [x] 自動產生 6 碼房間碼與 QR Code
- [x] 新增題目：單選投票、開放作答、文字雲、量尺評分、排序競賽
- [x] 題目計時器（10/20/30/60/90 秒，時間到自動關閉）
- [x] 學生用房間碼加入（匿名，localStorage sessionId）
- [x] 教師推送題目到學生端（Socket.io）
- [x] 學生即時作答，教師投影畫面即時更新
- [x] 各題型結果圖表（長條圖、文字列表、文字雲、量尺、排序）
- [x] 歷史結果查看頁面
- [x] 基本 RWD（學生端手機適配）
- [x] 前端部署：Vercel（`main` 分支）
- [x] 後端部署：Railway（`master` 分支，`zucchini-amazement`）
- [x] Supabase keep-alive（後端每 5 天自動 ping，防止免費方案閒置暫停）
- [x] 首頁品牌設計（黑熊吉祥物、教師/學生 CTA 顏色區分）
- [x] 登入頁品牌統一（黑熊 SVG、紫色漸層）
- [x] 六種題型說明 Tooltip（hover 顯示）
- [x] 學生加入頁返回首頁按鈕

### 待完成
- [ ] AI 自動出題（Claude API）
- [ ] 結果匯出 PDF
- [ ] Pin on Image 題型
- [ ] 計時作答（TimedQuestion）完整實作

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
1. 此功能屬於前端（`main` 分支）、後端（`master` 分支），還是兩端都需修改？
2. 是否需要新增或修改 `packages/shared/types.ts` 的型別？
3. 是否涉及 Socket.io 事件？若是，確保前後端事件名稱與 payload 一致。
4. 是否需要新增 Supabase 資料表或欄位？若是，提供對應的 migration SQL。
5. 後端 `src/shared.ts` 是 prebuild 自動複製的，不要直接編輯它。
6. UI 修改需符合品牌設計規範（indigo/purple/emerald 色系、BearLogo 元件）。
7. 完成後確認 TypeScript 無型別錯誤。
