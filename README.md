# 配送管理システム

配送業務の効率化を目的に開発したWebアプリケーションです。配送データの管理から通知・帳票出力まで、実務を想定した機能を一通り実装しています。

[![CI/CD](https://github.com/KaNaHiRi/delivery-app/actions/workflows/ci.yml/badge.svg)](https://github.com/KaNaHiRi/delivery-app/actions)
[![Deploy](https://img.shields.io/badge/deploy-vercel-black?logo=vercel)](https://delivery-app-delta-ecru.vercel.app)

## デモ

**URL：** https://delivery-app-delta-ecru.vercel.app

| アカウント | メール | パスワード | 権限 |
|-----------|--------|-----------|------|
| 管理者 | admin@clinic.com | admin123 | 全操作可 |
| 一般ユーザー | tanaka@clinic.com | user123 | 閲覧・ステータス変更 |

> ※デモ用アカウントです。個人情報は入力しないでください。

## 主な機能

### 配送管理
- 配送データの登録・編集・削除・ステータス管理（未処理→配送中→完了）
- キーワード・ステータス・日付範囲・拠点別フィルター
- よく使う検索条件のプリセット保存
- ドラッグ&ドロップによる表示順変更

### 分析・レポート
- rechartsによる統計ダッシュボード
- jsPDF + html2canvasによるPDF帳票出力
- Excel/CSVエクスポート

### 通知・連携
- 期限アラート・ステータス変更のブラウザ通知
- Resend + React Emailによるメール通知
- PWA対応（スマートフォンへのインストール・オフライン表示）

### その他
- RBAC（管理者 / 一般ユーザー 2段階権限）
- 全操作の監査ログ記録
- 日本語/英語切り替え（next-intl）
- ダークモード対応
- 大量データ対応の仮想スクロール（@tanstack/react-virtual）
- 5秒〜1分間隔の自動データ更新

## 技術スタック

### フロントエンド
| 技術 | バージョン | 用途 |
|------|-----------|------|
| Next.js | 15.1.5 | フレームワーク（App Router） |
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
| GitHub Actions | CI/CDパイプライン |
| Sentry | エラー監視 |
| Resend | メール送信 |

### テスト
| 技術 | 用途 |
|------|------|
| Jest + React Testing Library | 単体テスト（74件） |
| Playwright | E2Eテスト（12件） |
| Storybook | UIコンポーネントカタログ |

## ローカル起動手順

### 前提条件
- Node.js 18以上

### インストール

```bash
git clone https://github.com/KaNaHiRi/delivery-app.git
cd delivery-app
npm install
cp .env.example .env.local
npx prisma migrate dev
npx prisma db seed
npm run dev
```

ブラウザで http://localhost:3000 を開いてください。

### 環境変数（.env.local）

```env
DATABASE_URL=file:./prisma/dev.db
AUTH_SECRET=your-secret-here
RESEND_API_KEY=re_xxxxxxxxxx
EMAIL_FROM=onboarding@resend.dev
```

## テスト

```bash
# 単体テスト（74件）
npm test

# E2Eテスト
npx playwright test

# Storybook
npm run storybook
```

## プロジェクト構成

```
delivery-app/
├── app/
│   ├── api/          # API Routes
│   ├── components/   # UIコンポーネント
│   ├── hooks/        # カスタムHooks
│   ├── types/        # TypeScript型定義
│   └── utils/        # ユーティリティ
├── lib/              # DB・APIクライアント
├── prisma/           # スキーマ・マイグレーション
└── e2e/              # Playwrightテスト
```

## 開発背景

本業で業務システムの開発・保守を長年担当してきた経験から、実務で使えるレベルの品質を意識して開発しました。CI/CDの整備やテストカバレッジの確保など、個人開発でも運用を見据えた実装を心がけています。

## 作者

**KaNaHiRi**

ポートフォリオ：https://portfolio-kahahiris-projects.vercel.app
