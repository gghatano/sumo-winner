# Task 013: usePredictions の空bashoId保存を防止

## 優先度
改善（推奨）

## 問題
`src/hooks/usePredictions.ts:17` - 初期描画時に `bashoId === ''` でも保存処理が走り、`predictions::1:makuuchi` のような不要キーがlocalStorageに作られる。

## ブランチ / worktree
- `gitworktree/feature-013-empty-basho-guard`

## 依存タスク
- なし

## 作業内容

1. **`src/hooks/usePredictions.ts` を修正**
   - `bashoId` が空文字の場合、save/loadをスキップ
   - 初期状態は空オブジェクト `{}` を返す

   ```ts
   useEffect(() => {
     if (!bashoId) return  // ガード追加
     setPredictionsState(loadPredictions(bashoId, day, division))
   }, [bashoId, day, division])

   useEffect(() => {
     if (!bashoId) return  // ガード追加
     savePredictions(bashoId, day, division, predictions)
   }, [bashoId, day, division, predictions])
   ```

2. **テスト追加** (`src/lib/__tests__/storage.test.ts`)
   - 空のbashoIdでsave/loadが呼ばれてもlocalStorageに書き込まれないことを検証

## 完了条件
- bashoIdが空の状態でlocalStorageに不要データが保存されない
- テストが全パスする
