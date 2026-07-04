<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 花牌 Koi-Koi

日本傳統花牌 Koi-Koi 網頁遊戲，與花札師匠對戰。

**線上遊玩**：https://poirotw66.github.io/Koi-Koi/

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies: `npm install`
2. Run the app: `npm run dev`

## GitHub Pages 部署

Workflow 會將建置結果推送到 `gh-pages` 分支（避開 `deploy-pages` 在自訂網域 SSL 異常時的發布失敗）。

### 一次性設定（repo 管理員）

1. **Settings → Pages → Build and deployment**
   - **Source** → **Deploy from a branch**
   - **Branch** → `gh-pages` / `/ (root)`
2. **Settings → Pages → Custom domain**
   - **移除** `www.bloss0m.com`（此網域屬於 Bloss0m 主站，SSL 已失效會導致部署失敗）
   - 正確網址為：https://poirotw66.github.io/Koi-Koi/
3. 合併到 `main` 後 workflow 自動執行，或到 Actions 手動 **Run workflow**

若要在 Bloss0m 主站放連結，請連到上述 GitHub Pages URL，勿將整個 domain 綁定到此 repo。
