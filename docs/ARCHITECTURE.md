# システムアーキテクチャ

## 全体構成
```
[ブラウザ]
    ↓ HTTPS
[Vercel Edge Network]
    ↓
[Next.js App Router]
    ├── page.tsx（クライアントコンポーネント）
    ├── API Routes（/api/*）
    │       ↓
    │   [Prisma ORM]
    │       ↓
    │   [SQLite / PostgreSQL]
    └── NextAuth.js（JWT認証）
```

## データフロー

### 配送データ取得
```
page.tsx
  → deliveryApi.getAll()        # lib/deliveryApi.ts
  → GET /api/deliveries         # app/api/deliveries/route.ts
  → prisma.delivery.findMany()  # lib/prisma.ts
  → SQLite
```

### 認証フロー
```
ログインフォーム
  → NextAuth.js Credentials Provider
  → JWT生成（AUTH_SECRET で署名）
  → Cookie保存
  → proxy.ts（旧middleware.ts）でルート保護
```

## コンポーネント設計

### カスタムHooks（責務分離）

| Hook | 役割 |
|------|------|
| `useDeliveryActions` | CRUD操作（削除・ステータス変更・一括操作） |
| `useModalState` | 14個のモーダル開閉を一元管理 |
| `useFilterState` | 検索・フィルター状態を集約 |
| `useRole` | 認証ロール取得 |
| `usePermissions` | 権限チェック |
| `useKeyboardShortcuts` | キーボードショートカット |
| `useFormValidation` | フォームバリデーション（Zod） |

### 権限制御（3層構造）
```
Layer 1: proxy.ts
  → 未ログインユーザーを /login にリダイレクト

Layer 2: page.tsx
  → useRole() でロール取得
  → getPermissions() で権限オブジェクト生成
  → UIの表示/非表示を制御

Layer 3: API Route
  → getToken() でJWT検証
  → adminのみ許可する操作を保護
```

## DBスキーマ関係図
```
Location (拠点)
    ↑ 1:N
Delivery (配送) ←N:1→ Staff (担当者)
                ←N:1→ Customer (顧客)

AuditLog (操作履歴) ※ 独立テーブル
```

## パフォーマンス最適化

- `useMemo` / `useCallback` による再レンダリング抑制
- `@tanstack/react-virtual` による仮想スクロール（数千件対応）
- フィルターキャッシュ（`clearFilterCache`）
- Turbopack による高速ビルド