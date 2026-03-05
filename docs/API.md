# API仕様書

## 認証

全エンドポイントは NextAuth.js JWT 認証が必要です。  
`Cookie: next-auth.session-token` を自動送信します。

## エンドポイント一覧

### 配送（Deliveries）

#### GET /api/deliveries
配送一覧取得

**権限**: 認証済み全員

**クエリパラメータ**:
| パラメータ | 型 | 説明 |
|-----------|-----|------|
| locationId | string | 拠点IDでフィルター（省略可） |

**レスポンス例**:
```json
[
  {
    "id": "clxxxxx",
    "name": "田中太郎",
    "address": "東京都渋谷区1-1-1",
    "status": "pending",
    "deliveryDate": "2025-04-01",
    "staff": { "id": "sxxx", "name": "佐藤" },
    "customer": null,
    "location": { "id": "lxxx", "name": "東京拠点" }
  }
]
```

#### POST /api/deliveries
配送登録

**権限**: adminのみ

**リクエストボディ**:
```json
{
  "name": "田中太郎",
  "address": "東京都渋谷区1-1-1",
  "status": "pending",
  "deliveryDate": "2025-04-01",
  "staffId": "sxxx",
  "customerId": null,
  "locationId": "lxxx"
}
```

#### PUT /api/deliveries/[id]
配送更新

**権限**:
- ステータス変更のみ: admin / user
- その他の変更: adminのみ

#### DELETE /api/deliveries/[id]
配送削除

**権限**: adminのみ

---

### 担当者（Staff）

| メソッド | パス | 権限 |
|---------|------|------|
| GET | /api/staff | 認証済み全員 |
| POST | /api/staff | adminのみ |
| PUT | /api/staff/[id] | adminのみ |
| DELETE | /api/staff/[id] | adminのみ |

### 顧客（Customers）

| メソッド | パス | 権限 |
|---------|------|------|
| GET | /api/customers | 認証済み全員 |
| POST | /api/customers | adminのみ |
| PUT | /api/customers/[id] | adminのみ |
| DELETE | /api/customers/[id] | adminのみ |

### 拠点（Locations）

| メソッド | パス | 権限 |
|---------|------|------|
| GET | /api/locations | 認証済み全員 |
| POST | /api/locations | adminのみ |
| PUT | /api/locations/[id] | adminのみ |
| DELETE | /api/locations/[id] | adminのみ |

### 操作履歴（AuditLog）

#### GET /api/audit-logs
**権限**: 認証済み全員

**クエリパラメータ**:
| パラメータ | 説明 |
|-----------|------|
| entityType | 対象種別（Delivery / Staff 等） |
| entityId | 対象ID |
| limit | 取得件数（デフォルト: 50） |

### メール通知（Email）

#### POST /api/email/send-status
配送ステータス変更通知メールを送信

#### POST /api/email/send-deadline
配送期限アラートメールを送信

## エラーレスポンス
```json
{
  "error": "エラーメッセージ"
}
```

| ステータスコード | 意味 |
|----------------|------|
| 400 | バリデーションエラー |
| 401 | 未認証 |
| 403 | 権限不足 |
| 404 | リソース未検出 |
| 500 | サーバーエラー |