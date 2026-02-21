# Task 012: APIレスポンスのランタイム検証を追加

## 優先度
改善（推奨）

## 問題
`src/lib/api.ts:5` - JSONレスポンスのランタイム検証がなく、データ破損時に下流で例外が発生する。

## ブランチ / worktree
- `gitworktree/feature-012-api-validation`

## 依存タスク
- なし

## 作業内容

1. **バリデーション関数** (`src/lib/api.ts` に追加)
   - `validateTorikumiData(data: unknown): TorikumiData`
   - 最小限のチェック:
     - `day` が 1〜15 の範囲
     - `matches` が配列
     - 各matchに `east`, `west` が文字列で存在
     - `basho.id`, `basho.label` が文字列で存在
   - 検証失敗時は明確なエラーメッセージ付きの例外をスロー

2. **fetchLatest / fetchTorikumi でバリデーション適用**

3. **テスト** (`src/lib/__tests__/api.test.ts`)
   - 正常なJSON → パスする
   - dayが範囲外 → エラー
   - matchesが配列でない → エラー
   - east/westが欠落 → エラー

## 完了条件
- 不正なJSONがフロントに到達しない
- テストが全パスする
