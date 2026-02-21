# Task 018: fetchIndex のバリデーション追加

## 優先度
改善（推奨）

## 問題
`src/lib/api.ts:6` - `fetchIndex` が `index.json` を未検証で返しており、壊れたインデックス配信時に下流でクラッシュする。

## ブランチ / worktree
- `gitworktree/feature-018-index-validation`

## 依存タスク
- なし

## 作業内容

1. **バリデーション関数** (`src/lib/validate.ts` に追加)
   - `validateTorikumiIndex(data: unknown): TorikumiIndex`
   - チェック内容:
     - `bashoList` が配列
     - 各要素に `id`(string), `label`(string), `days`(number, 1以上) が存在
     - `latest` が存在し、`bashoId`(string), `day`(number) を持つ

2. **`fetchIndex` でバリデーション適用**

3. **テスト** (`src/lib/__tests__/api.test.ts` に追加)
   - 正常なindex → パス
   - bashoListが配列でない → エラー
   - latest欠落 → エラー

## 完了条件
- 不正なindex.jsonがフロントに到達しない
- テストが全パスする
