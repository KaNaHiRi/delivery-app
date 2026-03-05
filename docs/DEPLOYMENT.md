# デプロイ手順

## Vercel（推奨）

### 初回セットアップ

1. [vercel.com](https://vercel.com) にログイン
2. "New Project" → GitHub連携 → リポジトリ選択
3. Environment Variables を設定（下記参照）
4. "Deploy" ボタンをクリック

### 必須環境変数

| 変数名 | 説明 | 取得方法 |
|--------|------|---------|
| DATABASE_URL | DB接続文字列 | Vercel Postgres または外部DB |
| AUTH_SECRET | JWT署名キー | `openssl rand -base64 32` |
| NEXT_PUBLIC_SENTRY_DSN | Sentry DSN | sentry.io ダッシュボード |
| SENTRY_AUTH_TOKEN | Sentry認証 | sentry.io → Settings → Auth Tokens |
| RESEND_API_KEY | メール送信 | resend.com ダッシュボード |
| EMAIL_FROM | 送信元アドレス | Resend認証済みドメイン |

### 本番DB（PostgreSQL）への切り替え
```bash
# prisma/schema.prisma を変更
datasource db {
  provider = "postgresql"   # sqlite → postgresql
  url      = env("DATABASE_URL")
}

# マイグレーション実行
npx prisma migrate deploy
```

## GitHub Actions CI/CD

`.github/workflows/ci.yml` により以下が自動実行されます：

1. **PR時**: TypeScript型チェック → Jest（74件）→ Playwright E2E
2. **mainマージ時**: ビルド確認 → Vercel 自動デプロイ

## ローカル本番ビルド確認
```bash
npm run build
npm start
```