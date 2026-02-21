# 配送管理システム

Next.js 15 (App Router) + TypeScript で構築した、フル機能の配送管理Webアプリケーションです。

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8)
![License](https://img.shields.io/badge/license-MIT-green)

## 🌐 デモ

**デプロイURL**: [https://delivery-app-delta-ecru.vercel.app](https://delivery-app-delta-ecru.vercel.app)

## 📋 プロジェクト概要

このプロジェクトは、Next.js/TypeScriptの学習を目的とした60日間の学習計画の一環として開発されました。  
実務で使えるプロフェッショナルな実装を重視し、CRUD操作からデータ分析、印刷機能まで、実際の業務システムに必要な機能を網羅しています。

### 開発背景
- **目的**: Next.js/TypeScriptを習得してフリーランスフロントエンド開発者へ転身
- **期間**: 60日計画（現在12日目完了）
- **開発者**: 医療システム部門でシステム開発を担当（C#/Delphi経験10年以上）

## ✨ 主な機能

### 📦 Day 1-3: CRUD基本機能
- ✅ 配送データの追加・編集・削除
- ✅ 配送一覧表示
- ✅ ステータス管理（配送前/配送中/配送完了）
- ✅ LocalStorageでのデータ永続化

### 🔍 Day 4-5: 検索・フィルター・ソート
- ✅ リアルタイム検索（名前・住所・ID）
- ✅ ステータスフィルター
- ✅ 全フィールドのソート機能（昇順・降順）
- ✅ フィルター設定の保存・復元

### 📄 Day 6-7: ページネーション・一括操作
- ✅ ページネーション（5/10/25/50件表示切替）
- ✅ 一括選択（全選択/個別選択）
- ✅ 一括削除
- ✅ 一括ステータス変更

### 📥 Day 8: CSV出力
- ✅ 全データ/フィルター済み/選択データの3パターン出力
- ✅ 文字コード設定（UTF-8/Shift-JIS）
- ✅ 区切り文字設定（カンマ/タブ）
- ✅ BOM付与オプション
- ✅ タイムスタンプ付きファイル名生成

### 📤 Day 9: CSVインポート
- ✅ ファイルアップロード（ファイル選択 + ドラッグ&ドロップ）
- ✅ データバリデーション（必須項目・ステータス・日付形式）
- ✅ インポート前プレビュー表示
- ✅ エラーハンドリング（行番号付き詳細エラー）
- ✅ 追加/上書きモード選択

### 📊 Day 10: 統計ダッシュボード
- ✅ 4枚の集計カード（総件数・配送中・完了・本日の配送）
- ✅ ステータス別棒グラフ（recharts）
- ✅ ステータス構成比円グラフ（割合表示付きLegend）
- ✅ リアルタイム集計更新

### 🌓 Day 11: ダークモード
- ✅ ライト/ダーク切り替えトグルボタン
- ✅ LocalStorageで設定保存・復元
- ✅ Tailwind CSS v4の`.dark`クラスで全体対応
- ✅ rechartsグラフもダークモード対応
- ✅ システム設定から独立した独自テーマ制御

### 🖨️ Day 12: 印刷機能
- ✅ 個別配送データの印刷
- ✅ 選択した複数データの一括印刷
- ✅ 印刷プレビュー機能
- ✅ 印刷用のレイアウト最適化（@media print）
- ✅ PDF出力機能（ブラウザのPDF保存機能を活用）

## 🛠️ 技術スタック

### フロントエンド
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Charts**: recharts
- **Icons**: lucide-react

### インフラ・デプロイ
- **Hosting**: Vercel
- **CI/CD**: GitHub連携による自動デプロイ
- **Storage**: LocalStorage（ブラウザストレージ）

### 開発ツール
- **Package Manager**: npm
- **Version Control**: Git / GitHub
- **Code Editor**: VS Code（推奨）

## 📂 プロジェクト構造
```
my-delivery-app/
├── app/
│   ├── page.tsx                 # メインページ（約900行）
│   ├── globals.css              # Tailwind v4 + ダークモード設定
│   ├── layout.tsx               # ルートレイアウト
│   ├── types/
│   │   └── delivery.ts          # 型定義
│   ├── components/
│   │   ├── CsvExportModal.tsx   # CSV出力モーダル
│   │   ├── CsvImportModal.tsx   # CSVインポートモーダル
│   │   ├── DashboardStats.tsx   # 統計ダッシュボード
│   │   ├── ThemeToggle.tsx      # ダークモード切り替え
│   │   └── PrintableDeliverySlip.tsx  # 印刷用コンポーネント
│   └── utils/
│       └── csv.ts               # CSV処理ユーティリティ
├── public/
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
└── README.md
```

## 🚀 セットアップ手順

### 必要な環境
- Node.js 18.17以上
- npm または yarn

### インストール
```bash
# リポジトリをクローン
git clone https://github.com/KaNaHiRi/delivery-app.git
cd delivery-app

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

### ビルド
```bash
# プロダクションビルド
npm run build

# プロダクションサーバーを起動
npm start
```

## 💡 使い方

### 1. 配送データの追加
1. 「新規追加」ボタンをクリック
2. 配送先名、住所、配送日、ステータスを入力
3. 「追加」ボタンで保存

### 2. データの検索・フィルター
- 検索ボックス: 名前、住所、IDで絞り込み
- ステータスフィルター: 配送前/配送中/配送完了で絞り込み
- カラムヘッダークリック: 各項目でソート

### 3. CSV操作
- **CSV出力**: 「CSV出力」ボタン → 出力範囲・形式を選択 → ダウンロード
- **CSVインポート**: 「CSVインポート」ボタン → ファイル選択 → プレビュー確認 → インポート

### 4. 一括操作
1. チェックボックスで複数選択
2. 「一括削除」または「一括ステータス変更」を実行
3. 「一括印刷」で選択データをまとめて印刷

### 5. 印刷機能
- **個別印刷**: 各行の「印刷」ボタン → プレビュー確認 → 印刷実行
- **一括印刷**: 複数選択 → 「一括印刷」ボタン → プレビュー確認 → 印刷実行
- **PDF保存**: 印刷ダイアログで「PDFに保存」を選択

### 6. ダークモード
- 右上のトグルボタンでライト/ダーク切り替え
- 設定は自動的に保存されます

## 📊 データ形式

### Delivery型定義
```typescript
interface Delivery {
  id: string;              // 配送ID（自動生成: D1234567890）
  name: string;            // 配送先名
  address: string;         // 配送先住所
  status: 'pending' | 'in_transit' | 'completed';  // ステータス
  deliveryDate: string;    // 配送日（YYYY-MM-DD形式）
}
```

### CSVフォーマット例
```csv
id,name,address,status,deliveryDate
D1234567890,山田太郎,東京都渋谷区1-2-3,pending,2025-02-15
D1234567891,佐藤花子,大阪府大阪市4-5-6,in_transit,2025-02-16
```

## 🎨 カスタマイズ

### Tailwind CSS v4の特徴
このプロジェクトは最新のTailwind CSS v4を使用しています。

**主な変更点**:
- `tailwind.config.ts` は不要
- `app/globals.css` で設定
- `@import "tailwindcss"` で読み込み
- ダークモードは `.dark` クラスで制御

### テーマカラーの変更

`app/globals.css` で変数を変更:
```css
:root {
  --background: #ffffff;
  --foreground: #171717;
}

html.dark, .dark {
  --background: #111827;
  --foreground: #f3f4f6;
}
```

## 📈 今後の予定

- [ ] Day 13: バックアップ/リストア機能
- [ ] Day 14: データ検証・エラーチェック強化
- [ ] Day 15: 配送ルート最適化（地図API連携）
- [ ] Day 16: 通知機能（配送予定日リマインダー）
- [ ] Day 17-18: ユーザー認証・権限管理
- [ ] Day 19-20: モバイル対応最適化
- [ ] ...60日目まで継続

## 🤝 貢献

プルリクエストを歓迎します！大きな変更の場合は、まずissueを開いて変更内容を議論してください。

## 📝 ライセンス

MIT License

## 👨‍💻 開発者

**KaNaHiRi**
- 職業: 医療システム部門 
- 経験: C#/Delphi/VBA 10年以上
- 目標: Next.js/TypeScriptを習得してフリーランスフロントエンド開発者へ転身
- GitHub: [@KaNaHiRi](https://github.com/KaNaHiRi)

## 🙏 謝辞

このプロジェクトは、実務で使えるプロフェッショナルな実装を学ぶために作成されました。  
医療システム開発で培った経験を活かし、モダンなWebアプリケーション開発に挑戦しています。

---

**Last Updated**: 2025-02-13  
**Version**: 1.0.0 (Day 12完了)