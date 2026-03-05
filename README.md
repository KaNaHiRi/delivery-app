# 🚚 配送管理システム（Delivery Management System）

> **医療・クリニック向け** 配送・物品管理Webアプリケーション  
> Next.js 15 + TypeScript + Prisma + SQLite で構築したフルスタックシステム

[![CI/CD](https://github.com/KaNaHiRi/delivery-app/actions/workflows/ci.yml/badge.svg)](https://github.com/KaNaHiRi/delivery-app/actions)
[![Deploy](https://img.shields.io/badge/deploy-vercel-black?logo=vercel)](https://delivery-app-delta-ecru.vercel.app)
[![Tests](https://img.shields.io/badge/tests-74%20passed-brightgreen)](#テスト)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)

## 🌐 デモ

**デモURL**: https://delivery-app-delta-ecru.vercel.app

| アカウント | メール | パスワード | 権限 |
|-----------|--------|-----------|------|
| 管理者 | admin@clinic.com | admin123 | 全操作可 |
| 一般ユーザー | tanaka@clinic.com | user123 | 閲覧・ステータス変更 |

---

## 📸 スクリーンショット

> ※ デモサイトにてご確認ください

- ダッシュボード（統計・グラフ表示）
- 配送一覧（ソート・フィルター・仮想スクロール）
- メール通知機能
- PDF帳票出力

---

## ✨ 主な機能

### 📊 コア機能
- **配送データ管理** — 登録・編集・削除・ステータス管理（未処理→配送中→完了）
- **高度な検索・フィルター** — キーワード・ステータス・日付範囲・拠点別フィルター
- **クイックフィルター** — 「今日」「今週」「期限超過」などワンクリック絞り込み
- **フィルタープリセット** — よく使う条件を保存・再利用

### 📈 分析・レポート
- **ダッシュボード** — recharts によるリアルタイム統計グラフ
- **カスタムダッシュボード** — ウィジェットのON/OFF・並び順変更
- **PDF帳票出力** — jsPDF + html2canvas による配送票・レポート生成
- **Excel/CSVエクスポート** — データ一括出力

### 🔒 セキュリティ・認証
- **NextAuth.js v5** による認証
- **RBAC（ロールベースアクセス制御）** — 管理者 / 一般ユーザー 2段階権限
- **操作履歴** — 全変更操作をAuditLogとして記録
- **Sentry** によるエラー監視

### 📧 通知機能
- **ブラウザ通知** — 期限アラート・ステータス変更通知
- **メール通知** — Resend + React Email による配送状況メール
- **PWA対応** — スマートフォンへのインストール・オフライン表示

### 🌏 その他
- **国際化（i18n）** — 日本語 / 英語 切り替え（next-intl）
- **ダークモード** — ライト/ダーク テーマ対応
- **仮想スクロール** — 大量データでも高速表示（@tanstack/react-virtual）
- **複数拠点対応** — 拠点ごとのデータ管理
- **自動更新** — 5秒〜1分間隔の自動データリフレッシュ
- **D&Dソート** — ドラッグ&ドロップで表示順変更

---

## 🛠️ 技術スタック

### フロントエンド
| 技術 | バージョン | 用途 |
|------|-----------|------|
| Next.js | 15.1.5 | フレームワーク（App Router + Turbopack） |
| TypeScript | 5.x | 型安全な開発 |
| Tailwind CSS | v3 | スタイリング |
| recharts | latest | グラフ・チャート |
| @tanstack/react-virtual | latest | 仮想スクロール |

### バックエンド・DB
| 技術 | バージョン | 用途 |
|------|-----------|------|
| Prisma | v6 | ORM |
| SQLite | — | データベース（本番はPostgreSQL推奨） |
| NextAuth.js | v5 beta | 認証 |
| Zod | v4 | バリデーション |

### インフラ・ツール
| 技術 | 用途 |
|------|------|
| Vercel | ホスティング・自動デプロイ |
| GitHub Actions | CI/CD パイプライン |
| Sentry | エラー監視 |
| Resend | メール送信 |

### テスト
| 技術 | 用途 |
|------|------|
| Jest + React Testing Library | 単体テスト（74件） |
| Playwright | E2Eテスト（12件） |
| Storybook | UIコンポーネントカタログ |

---

## 🚀 ローカル起動手順

### 前提条件
- Node.js 18以上
- npm または yarn

### インストール
```bash
# リポジトリのクローン
git clone https://github.com/KaNaHiRi/delivery-app.git
cd delivery-app

# 依存関係インストール
npm install

# 環境変数の設定
cp .env.example .env.local
# .env.local を編集してください（後述）

# DBのセットアップ
npx prisma migrate dev
npx prisma db seed

# 開発サーバー起動
npm run dev
```

ブラウザで http://localhost:3000 を開く

### 環境変数（.env.local）
```env
# データベース
DATABASE_URL=file:./prisma/dev.db

# 認証（openssl rand -base64 32 で生成）
AUTH_SECRET=your-secret-here

# Sentry（省略可）
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=

# メール送信（Resend）
RESEND_API_KEY=re_xxxxxxxxxx
EMAIL_FROM=onboarding@resend.dev
```

---

## 🧪 テスト
```bash
# 単体テスト（74件）
npm test

# E2Eテスト（Playwright）
npx playwright test

# Storybook
npm run storybook
```

---

## 📁 プロジェクト構成
```
my-delivery-app/
├── app/
│   ├── api/          # API Routes（RESTful）
│   ├── components/   # 25+ UIコンポーネント
│   ├── hooks/        # カスタムHooks
│   ├── types/        # TypeScript型定義
│   ├── utils/        # ユーティリティ関数
│   └── page.tsx      # メインページ
├── lib/              # DB・API クライアント
├── prisma/           # スキーマ・マイグレーション
├── e2e/              # Playwright テスト
└── docs/             # 詳細ドキュメント
```

詳細は [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) を参照

---

## 📖 ドキュメント

| ドキュメント | 内容 |
|-------------|------|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | システム設計・データフロー |
| [API.md](docs/API.md) | API エンドポイント仕様 |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | 本番デプロイ手順 |

---

## 🏥 医療システムへの応用

このシステムは配送管理を例に構築していますが、以下の用途に転用可能です：

- **クリニック向け** 患者呼び出し・検査フロー管理
- **調剤薬局向け** 薬品在庫・処方管理
- **訪問医療向け** 訪問スケジュール・担当者管理

業務システム開発のご相談は [CrowdWorks](https://crowdworks.jp) / [Coconala](https://coconala.com) にてご依頼ください。

---

## 📝 ライセンス

MIT License — 自由にご利用いただけます

---

## 👤 開発者

**KAZU**  
医療システム部門 10年以上の経験を持つフルスタックエンジニア  
C# / Delphi / WPF → Next.js / TypeScript にシフト中

[![CrowdWorks](https://img.shields.io/badge/CrowdWorks-受注中-orange)](https://crowdworks.jp/public/employees/6351824?ref=login_header)