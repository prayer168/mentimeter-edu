# 仿 Mentimeter 教學 APP 開發踩坑紀錄

> 記錄開發過程中遇到的問題與解決方式，隨時更新。
> 專案：熊學堂互動課堂工具（https://mentimeter-edu.vercel.app/）
> 使用工具：Claude Code、React、Node.js、Supabase、Socket.io、Railway、Vercel

---

## 環境設定

### ❌ 坑 1：Claude.ai 匯出 Google Drive 認證無限循環
- **問題**：按下「Authenticate to export to Google Drive」後，一直跳回桌面版 Claude 要求再次驗證，無法完成。
- **原因**：Claude.ai 的 Google Drive 整合認證流程在某些情況下會卡住。
- **解決方式**：不透過 Claude 匯出，直接下載檔案後手動上傳 Google Drive，或直接存到本機專案資料夾使用。

---

### ❌ 坑 2：PowerShell 無法執行 npm 指令（UnauthorizedAccess）
- **問題**：在 Windows PowerShell 執行 `npm install -g @anthropic-ai/claude-code` 時出現錯誤：
  ```
  npm : 因為這個系統上已停用指令碼執行，所以無法載入檔案
  SecurityError: (:) [], PSSecurityException
  ```
- **解決方式**：改用**命令提示字元（CMD）** 執行，不要用 PowerShell。

---

### ❌ 坑 3：Node.js 未安裝
- **問題**：`node --version` 找不到指令。
- **解決方式**：至 [nodejs.org](https://nodejs.org) 下載 LTS，安裝後重開終端機。
- **目前版本**：Node.js v24.x

---

### ✅ 正確的 Windows 安裝順序
```
1. 安裝 Node.js LTS（nodejs.org）
2. 關閉所有終端機，重新開啟 CMD（不是 PowerShell）
3. node --version
4. npm install -g @anthropic-ai/claude-code
5. claude --version
6. cd 到專案資料夾，執行 claude
```

---

## Supabase 設定

### 專案資訊
- **專案名稱**：mentimeter-edu
- **專案 ID**：cmeiwebdaavcurzivegm
- **URL**：https://cmeiwebdaavcurzivegm.supabase.co

### ❌ 坑 4：Supabase 免費方案 7 天閒置自動暫停
- **問題**：收到 Supabase 郵件通知，專案因超過 7 天無活動即將被自動暫停。
- **解決方式**：在 Railway 後端的 `backend/src/index.ts` 加入 keep-alive：
  ```typescript
  // 每 5 天 ping 一次 Supabase，防止閒置暫停
  const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000
  setInterval(async () => {
    try {
      await supabase.from('activities').select('id').limit(1)
      console.log('[keep-alive] Supabase ping OK', new Date().toISOString())
    } catch (err) {
      console.error('[keep-alive] Supabase ping failed', err)
    }
  }, FIVE_DAYS_MS)
  ```
- **注意**：keep-alive 加入後的第一次 Railway 部署會重啟，屬正常現象。

---

## 部署

### Railway（後端）
- **專案名稱**：zucchini-amazement
- **服務**：backend
- **分支**：`master`（push 後自動部署）
- **啟動指令**：`node dist/index.js`
- **Build**：Nixpacks，TypeScript 自動編譯

### Vercel（前端）
- **網址**：https://mentimeter-edu.vercel.app/
- **分支**：`main`（push 後自動部署，約 1-2 分鐘）
- **注意**：前端和後端在不同 Git 分支，`main` 給 Vercel，`master` 給 Railway

### ❌ 坑 5：Railway Deploy Crashed（push 觸發重新部署）
- **問題**：向 GitHub push 後，Railway 自動觸發重新部署，短暫出現「Deploy Crashed」郵件通知。
- **原因**：Railway 重啟伺服器期間有短暫停機，並非程式碼錯誤。
- **解決方式**：等待 1-2 分鐘後自動恢復，或在 Railway Dashboard 點「Restart Deployment」。

---

## UI / 品牌設計

### 品牌規範（2026-05-20 確定）
| 元素 | 規格 |
|------|------|
| 吉祥物 | 台灣黑熊 SVG（`BearLogo` 元件），不使用 🐻 emoji |
| 教師主色 | `from-indigo-500 to-purple-600` 漸層（紫色） |
| 學生主色 | `from-emerald-400 to-green-500` 漸層（綠色） |
| 頁面背景 | `from-indigo-50 via-purple-50 to-pink-50` |
| 六種題型 | 純中文：文字雲、單選投票、開放作答、量尺評分、排序競賽、計時作答 |

### 已完成的 UI 改善
- [x] 首頁 CTA 按鈕以顏色區分角色（紫色=教師、綠色=學生），加上角色標籤
- [x] 吉祥物統一為台灣黑熊 SVG（首頁、登入頁一致）
- [x] 登入頁配色改為品牌紫（背景、按鈕、頁籤底線）
- [x] 登入頁加入「忘記密碼？」功能（切換至重設密碼畫面）
- [x] 學生加入頁按鈕改為紫色（未填滿 6 碼時顯示灰色禁用樣式）
- [x] 學生加入頁加入「← 返回首頁」按鈕
- [x] 六種題型卡片加入 hover tooltip 說明
- [x] 「Poll 投票」改為純中文「單選投票」

---

## Claude Code 使用技巧

### 💡 tip 1：CLAUDE.md 放在專案根目錄
- Claude Code 每次啟動時自動讀取專案根目錄的 `CLAUDE.md`
- 路徑：`G:\google drive\Dropbox (十年磨一劍)\0000000000數位教材\APP\Mentimeter_Prayer\mentimeter-edu\CLAUDE.md`

### 💡 tip 2：給 Claude Code 的 prompt 要具體
- ❌ 太模糊：「幫我做 Poll 功能」
- ✅ 夠具體：「建立 Poll 元件：教師輸入 4 個選項，學生端點選後，Socket.io 廣播結果，Recharts 即時更新長條圖」

### 💡 tip 3：每次只給一個任務
- 完成一個功能、確認沒問題後，再給下一個任務

### 💡 tip 4：分支注意事項
- 前端改動 → commit/push 到 `main` 分支
- 後端改動 → commit/push 到 `master` 分支
- 兩個分支目前不合併，各自獨立部署

---

## 開發進度

### Phase 1（核心功能）✅ 完成
- [x] 教師註冊／登入（含忘記密碼）
- [x] 建立、編輯名稱、刪除活動
- [x] 自動產生 6 碼房間碼與 QR Code
- [x] 學生匿名加入房間
- [x] 教師推送題目，學生即時作答（Socket.io）
- [x] 單選投票（Poll）長條圖結果
- [x] 開放作答滾動列表

### Phase 2（題型擴充）✅ 完成
- [x] 文字雲（Word Cloud）
- [x] 量尺評分（Scales）
- [x] 排序競賽（Ranking）
- [x] 題目計時器（自動收回答案）
- [x] 歷史結果查看頁面

### Phase 3（部署 & 品牌）✅ 完成
- [x] Railway 後端部署
- [x] Vercel 前端部署
- [x] Supabase keep-alive
- [x] 品牌視覺統一（熊學堂、台灣黑熊、品牌色）

### Phase 4（待開發）
- [ ] AI 自動出題（Claude API）
- [ ] 結果匯出 PDF
- [ ] Pin on Image 題型
- [ ] 計時作答（TimedQuestion）完整實作

---

## 待解決問題

> 遇到新問題先記在這裡，解決後移到上方對應分類。

- 無

---

*最後更新：2026-05-20*
