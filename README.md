# 投票應用前端

這是一個使用 Angular 17 和 Angular Material 構建的現代化投票應用前端。

## 功能特點

- 🗳️ 投票創建和管理
- 📊 實時統計和圖表
- 👤 用戶認證和個人資料
- 📱 響應式設計
- 🎨 現代化 UI/UX

## 技術棧

- **框架**: Angular 17
- **UI 庫**: Angular Material
- **圖表**: Chart.js + ng2-charts
- **樣式**: SCSS
- **測試**: Jasmine + Karma

## 快速開始

### 安裝依賴

```bash
npm install
```

### 開發服務器

```bash
npm start
```

應用將在 `http://localhost:4200` 運行。

### 構建生產版本

```bash
npm run build:prod
```

### 運行測試

```bash
npm test
```

## 項目結構

```
src/
├── app/
│   ├── modules/
│   │   ├── auth/          # 認證模組
│   │   ├── polls/         # 投票模組
│   │   └── profile/       # 個人資料模組
│   ├── services/          # 服務層
│   ├── guards/           # 路由守衛
│   └── shared/           # 共享組件
├── environments/         # 環境配置
└── assets/              # 靜態資源
```

## 主要組件

- **投票列表**: 瀏覽所有投票
- **投票詳情**: 查看和參與投票
- **創建投票**: 創建新的投票
- **我的投票**: 管理個人創建的投票
- **投票統計**: 查看詳細統計分析
- **個人資料**: 管理帳戶設定
- **投票歷史**: 查看投票記錄

## 開發指南

### 添加新組件

```bash
ng generate component modules/your-module/components/your-component
```

### 添加新服務

```bash
ng generate service services/your-service
```

## 貢獻

1. Fork 項目
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 授權

此項目採用 MIT 授權 - 查看 [LICENSE](LICENSE) 文件了解詳情。 