# Task 003: localStorage による予想状態の保存・復元

## 概要
ユーザーの予想入力をlocalStorageに保存し、リロードしても復元できるようにする。

## ブランチ / worktree
- `gitworktree/feature-003-localstorage`

## 依存タスク
- task-001（プロジェクト雛形）

## ブロックしているタスク
- なし

## 作業内容

1. **ストレージユーティリティ** (`src/lib/storage.ts`)
   - キー: `predictions:{bashoId}:{day}:{division}`
   - 値: `Record<number, "E" | "W" | null>`（matchesのindexに対応）
   - `savePredictions(bashoId, day, division, predictions)`
   - `loadPredictions(bashoId, day, division): Record<number, "E" | "W" | null>`
   - `clearPredictions(bashoId, day, division)`

2. **カスタムフック** (`src/hooks/usePredictions.ts`)
   - `usePredictions(bashoId, day, division)`
   - 返値: `{ predictions, setPrediction(index, value), clearAll }`
   - 初期化時にlocalStorageから復元
   - 変更時にlocalStorageに自動保存

3. **テスト**
   - storage.ts のユニットテスト（localStorage mock）

## 完了条件
- `usePredictions` フックが正しくlocalStorageと同期する
- ページリロード後に予想状態が復元される
- 場所/日目を切り替えると、それぞれ独立した予想状態が保持される
