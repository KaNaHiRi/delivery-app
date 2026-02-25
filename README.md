# 配送管理システム

Next.js 16 (App Router) + TypeScript で構築した、フル機能の配送管理Webアプリケーションです。

[![CI](https://github.com/KaNaHiRi/delivery-app/actions/workflows/ci.yml/badge.svg)](https://github.com/KaNaHiRi/delivery-app/actions/workflows/ci.yml)
[![Deploy](https://github.com/KaNaHiRi/delivery-app/actions/workflows/deploy.yml/badge.svg)](https://github.com/KaNaHiRi/delivery-app/actions/workflows/deploy.yml)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v3-38bdf8)
![License](https://img.shields.io/badge/license-MIT-green)

## 🌐 デモ

**デプロイURL**: [https://delivery-app-delta-ecru.vercel.app](https://delivery-app-delta-ecru.vercel.app)

| ロール | メールアドレス | パスワード | 権限 |
|--------|--------------|-----------|------|
| 管理者 | admin@clinic.com | admin123 | 全操作可 |
| 一般ユーザー | tanaka@clinic.com | user123 | 閲覧・ステータス変更・印刷・エクスポートのみ |

## 📋 プロジェクト概要

Next.js/TypeScriptの学習を目的とした60日間の学習計画の一環として開発。  
実務で使えるプロフェッショナルな実装を重視し、CRUD操作からデータ分析、認証・認可、E2Eテスト、CI/CDまで、実際の業務システムに必要な機能を網羅しています。

- **目的**: Next.js/TypeScriptを習得してフリーランスフロントエンド開発者へ転身
- **期間**: 60日計画（現在32日目完了）
- **開発者**: 医療システム部門でシステム開発を担当（C#/Delphi経験10年以上）

## ✨ 実装済み機能（Day 1〜32）

| Day | 機能 |
|-----|------|
| 1-3 | CRUD基本機能（追加・編集・削除・一覧表示） |
| 4-5 | 検索・フィルター・ソート |
| 6-7 | ページネーション・一括操作 |
| 8 | CSV出力（全件/フィルター済み/選択） |
| 9 | CSVインポート（バリデーション・プレビュー） |
| 10 | 統計ダッシュボード（recharts） |
| 11 | ダークモード |
| 12 | 印刷機能・PDF出力 |
| 13 | バックアップ/リストア |
| 14 | 通知機能（Notification API） |
| 15 | データ可視化強化 |
| 16 | Excelエクスポート |
| 17 | カスタム期間選択 |
| 18 | 高度なフィルター・プリセット |
| 19 | パフォーマンス最適化（useMemo/useCallback/React.memo） |
| 20 | テスト・アクセシビリティ（WCAG 2.1 AA）・SEO |
| 21 | エラーハンドリング・PWA対応 |
| 22 | 国際化（next-intl・日本語/英語） |
| 23 | 自動更新（ポーリング）・ドラッグ＆ドロップ並び替え |
| 24 | ユーザー認証（NextAuth.js v5） |
| 25 | ロール別アクセス制御（RBAC） |
| 26 | API Routes・サーバーサイドデータ永続化 |
| 27 | 仮想スクロール（@tanstack/react-virtual） |
| 28 | キーボードショートカット |
| 29 | 単体テスト強化（Jest 64件） |
| 30 | Storybook 10（コンポーネントドキュメント） |
| 31 | E2Eテスト（Playwright 12件） |
| 32 | CI/CDパイプライン（GitHub Actions） |

## 🛠️ 技術スタック

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3
- **Auth**: NextAuth.js v5 (Credentials + JWT)
- **Charts**: recharts
- **Virtual Scroll**: @tanstack/react-virtual
- **i18n**: next-intl
- **Unit Test**: Jest + React Testing Library（64件）
- **E2E Test**: Playwright（12件）
- **Component Docs**: Storybook 10
- **CI/CD**: GitHub Actions
- **Hosting**: Vercel

## 🚀 セットアップ
```bash
git clone https://github.com/KaNaHiRi/delivery-app.git
cd delivery-app
npm install
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## 🧪 テスト実行
```bash
# 単体テスト（64件）
npm test

# E2Eテスト（12件）
npm run e2e

# Storybook
npm run storybook
```

## ⌨️ キーボードショートカット

| キー | 動作 |
|------|------|
| `N` | 新規登録モーダルを開く（管理者のみ） |
| `/` | 検索ボックスにフォーカス |
| `V` | 仮想スクロール切り替え |
| `R` | データを再取得 |
| `?` | ショートカット一覧を表示 |
| `Esc` | モーダルを閉じる / フィルターをクリア |

## 📂 プロジェクト構造
```
my-delivery-app/
├── app/                    # Next.js App Router
│   ├── api/deliveries/     # API Routes
│   ├── components/         # UIコンポーネント
│   ├── hooks/              # カスタムフック
│   ├── types/              # 型定義
│   └── utils/              # ユーティリティ
├── lib/                    # サーバーサイドロジック
├── e2e/                    # Playwright E2Eテスト
├── .github/workflows/      # GitHub Actions CI/CD
├── .storybook/             # Storybook設定
├── messages/               # i18n翻訳ファイル
└── data/                   # サーバーサイドデータ永続化
```

## 👨‍💻 開発者

**KaNaHiRi**
- 医療システム部門 / C#・Delphi・VBA　経験10年以上
- 目標: Next.js/TypeScriptを習得してフリーランスフロントエンド開発者へ転身
- GitHub: [@KaNaHiRi](https://github.com/KaNaHiRi)

## 📝 ライセンス

MIT License

---

**Last Updated**: 2026-02-23 / **Version**: 1.0.0 (Day 32完了)