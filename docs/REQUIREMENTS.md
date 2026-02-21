# 大相撲 取組予想メモ自動生成 - 要件・技術・開発ルール

## 1. プロジェクト概要

大相撲の取組予想メモ作成を省力化するWebアプリ（GitHub Pages）。
取組一覧を見て勝敗予想をクリック入力し、投稿用テキストを生成・コピーできる。

## 2. 機能要件

### 2.1 データ取得
- Yahoo!スポーツナビ（`https://sports.yahoo.co.jp/sumo/torikumi/`）から取組データを取得
- GitHub Actionsで定期取得し、JSONをリポジトリに保存
- フロントはそのJSONを読む（CORS回避）

### 2.2 画面（SPA・1ページ構成）
- **ヘッダ**: タイトル、データ更新日時
- **セレクタ**: 場所（YYYY年M月場所）、日目（初日〜千秋楽）
- **取組リスト**: 東力士名/西力士名、予想ボタン（東○/西○/未選択に戻す）
- **生成結果プレビュー**: テキストエリア＋コピーボタン

### 2.3 予想入力
- 各取組ごとに「東が勝つ/西が勝つ/未選択」をクリック入力
- 入力に応じてリアルタイムにテキスト生成
- localStorageに保存し、リロードでも復元

### 2.4 テキスト生成フォーマット
```
十二日目（・ω・）ノ
○翔猿 －御嶽海●
●熱海富士－安青錦○
…
```
- 予想勝者に `○`、敗者に `●`
- 未選択は記号なし（`・`等でもOK）

### 2.5 スコープ
- **対象**: 幕内のみ（十両は後から拡張可能な設計にする）
- **非対象（初期）**: 自動予測モデル、過去場所アーカイブ、ログイン/サーバーDB

## 3. 技術スタック

| レイヤ | 技術 |
|---|---|
| フロント | TypeScript + Vite + React |
| ホスティング | GitHub Pages |
| データ取得 | Python + requests + BeautifulSoup4 |
| CI/CD | GitHub Actions（cron毎時 + workflow_dispatch） |
| 状態管理 | localStorage |

## 4. データ設計

### 4.1 JSONスキーマ
保存先: `public/data/torikumi/{YYYYMM}/{day}.json` + `public/data/torikumi/latest.json`

```json
{
  "source": "https://sports.yahoo.co.jp/sumo/torikumi/202601/12",
  "basho": { "id": "202601", "label": "2026年1月場所" },
  "day": 12,
  "updatedAt": "2026-01-22T09:05:00Z",
  "division": "makuuchi",
  "matches": [
    { "east": "高安", "west": "大の里" },
    { "east": "豊昇龍", "west": "霧島" }
  ]
}
```

### 4.2 localStorage キー設計
- キー: `predictions:{bashoId}:{day}:{division}`
- 値: `{ [matchIndex]: "E" | "W" | null }`

## 5. URLパターン（Yahoo!スポーツナビ）
- トップ: `https://sports.yahoo.co.jp/sumo/torikumi/`
- 日別: `https://sports.yahoo.co.jp/sumo/torikumi/{YYYYMM}/{day}`

## 6. リポジトリ構成

```
.
├─ .github/workflows/fetch_torikumi.yml
├─ scripts/
│   └─ fetch_torikumi.py
├─ public/
│   └─ data/torikumi/...
├─ src/
│   ├─ App.tsx
│   ├─ lib/storage.ts
│   ├─ lib/format.ts
│   └─ components/...
├─ index.html
├─ package.json
├─ vite.config.ts
├─ tsconfig.json
└─ README.md
```

## 7. 受け入れ基準

1. Pagesを開くと最新場所・最新日がデフォルト選択され、取組が表示される
2. 各取組で「東勝ち/西勝ち」をクリックすると、即座に生成テキストが更新される
3. リロードしても選択状態が復元される
4. コピーボタンで生成テキストがクリップボードに入る
5. GitHub Actionsが定期的にJSONを更新し、Pages側に反映される

## 8. 開発ルール

### 8.1 ブランチ戦略
- git worktreeで並行開発
- worktree配置: `gitworktree/feature-<task番号>-<キーワード>`
- mainブランチでは直接開発しない

### 8.2 スクレイパ注意事項
- 取得頻度を抑える（毎時1回）
- User-Agent明示
- リトライ/バックオフ実装
- CSSセレクタに依存しすぎない（文言近傍でブロック抽出）
- 取得失敗時は前回JSONを残す

### 8.3 GitHub Actions コミットメッセージ
- `chore(data): update torikumi {bashoId} day {day}`

## 9. タスク依存関係

```
T1(scaffolding) ──┬──→ T2(JSON+UI) ──→ T5(clipboard)
                  ├──→ T3(localStorage)
                  └──→ T4(text format) ──→ T5(clipboard)

T6(scraper) ──────→ T7(Actions)

T8(README) は全タスク完了後
```

### 並行開発プラン
- **Phase 1** (並行): T1 + T6
- **Phase 2** (T1完了後、並行): T2 + T3 + T4
- **Phase 3** (並行): T5(T2,T4完了後) + T7(T6完了後)
- **Phase 4**: T8
