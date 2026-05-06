# 仿 Mentimeter 教學 APP 開發踩坑紀錄

> 記錄開發過程中遇到的問題與解決方式，隨時更新。
> 專案：仿 Mentimeter 國小自然科教學互動工具
> 使用工具：Claude Code、React、Node.js、Supabase、Socket.io

---

## 環境設定

### ❌ 坑 1：Claude.ai 匯出 Google Drive 認證無限循環
- **問題**：按下「Authenticate to export to Google Drive」後，一直跳回桌面版 Claude 要求再次驗證，無法完成。
- **原因**：Claude.ai 的 Google Drive 整合認證流程在某些情況下會卡住。
- **解決方式**：不透過 Claude 匯出，直接下載檔案後手動上傳 Google Drive，或直接存到本機專案資料夾使用。
- **備註**：`CLAUDE.md` 本來就應該放在本機專案資料夾，Claude Code 是讀取本地檔案，不是從雲端讀。

---

### ❌ 坑 2：PowerShell 無法執行 npm 指令（UnauthorizedAccess）
- **問題**：在 Windows PowerShell 執行 `npm install -g @anthropic-ai/claude-code` 時出現錯誤：
  ```
  npm : 因為這個系統上已停用指令碼執行，所以無法載入檔案
  SecurityError: (:) [], PSSecurityException
  FullyQualifiedErrorId : UnauthorizedAccess
  ```
- **原因**：Windows PowerShell 預設的執行政策（Execution Policy）會封鎖 npm 的 `.ps1` 腳本。
- **解決方式**：改用**命令提示字元（CMD）** 執行，不要用 PowerShell。
  1. 按 `Win + R`
  2. 輸入 `cmd`，按 Enter
  3. 在 CMD 重新執行 `npm install -g @anthropic-ai/claude-code`
- **備註**：CMD 沒有 PowerShell 的執行政策限制，可以正常安裝。

---

### ❌ 坑 3：Node.js 未安裝，node 指令找不到
- **問題**：在 PowerShell 執行 `node --version` 出現：
  ```
  無法辨識 'node' 詞彙是否為 Cmdlet、函數、指令檔或可執行程式的名稱
  CommandNotFoundException
  ```
- **原因**：電腦上尚未安裝 Node.js。
- **解決方式**：
  1. 前往 [https://nodejs.org](https://nodejs.org) 下載 LTS 版本
  2. 執行安裝程式，一路按「Next」
  3. **安裝完後必須關掉 PowerShell／CMD 再重新開啟**，否則路徑不會更新
  4. 重開後執行 `node --version` 確認
- **版本備註**：目前使用 Node.js v24.15.0

---

### ✅ 正確的 Windows 安裝順序
```
1. 安裝 Node.js LTS（nodejs.org）
2. 關閉所有終端機視窗，重新開啟 CMD（不是 PowerShell）
3. 確認：node --version
4. 安裝 Claude Code：npm install -g @anthropic-ai/claude-code
5. 確認：claude --version
6. 建立專案資料夾：mkdir mentimeter-edu && cd mentimeter-edu
7. 複製 CLAUDE.md 到該資料夾
8. 啟動：claude
```

---

### ✅ Claude Code 成功啟動（首次登入流程）
- **步驟**：
  1. 在專案資料夾執行 `claude`
  2. 出現主題選擇畫面 → 選「2. Dark mode」按 Enter
  3. 瀏覽器自動開啟 Claude.ai 登入頁面 → 登入帳號
  4. 看到「**Build something great — You're all set up for Claude Code**」表示登入成功
  5. 關掉瀏覽器視窗，回到 CMD 即可開始使用
- **備註**：之後再開啟 Claude Code 不需要重新登入，直接 `claude` 啟動即可。

---

## Supabase 設定

> 待補充

---

## Claude Code 使用技巧

### 💡 tip 1：CLAUDE.md 放在專案根目錄
- Claude Code 每次啟動時會自動讀取專案根目錄的 `CLAUDE.md`
- 這個檔案要放在**本機專案資料夾**，不是雲端
- 路徑範例：`C:\Users\Roki\mentimeter-edu\CLAUDE.md`

### 💡 tip 2：給 Claude Code 的 prompt 要具體
- ❌ 太模糊：「幫我做 Poll 功能」
- ✅ 夠具體：「建立 Poll 元件：教師輸入 4 個選項，學生端點選後，Socket.io 廣播結果，Recharts 即時更新長條圖」

### 💡 tip 3：每次只給一個任務
- 不要一次丟太多需求，Claude Code 跨太多功能容易失焦
- 完成一個功能、確認沒問題後，再給下一個任務

### 💡 tip 4：遇到 Allow / Trust 提示直接按 Y
- Claude Code 執行過程中會詢問是否允許寫入檔案或信任資料夾
- 直接按 `Y` 然後 Enter 即可，這是正常的權限確認

---

## 開發進度

- [x] 環境設定完成（Node.js + Claude Code 安裝、登入）
- [ ] Phase 1：Poll + Open Ended + 房間管理
- [ ] Phase 2：Word Cloud + Scales + Ranking
- [ ] Phase 3：Pin on Image + 報表 + 部署

---

## 待解決問題

> 遇到新問題先記在這裡，解決後移到上方對應分類。

-

---

*最後更新：2026-05-06*
