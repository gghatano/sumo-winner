# Task 009: 日目変更時の状態不整合を修正

## 優先度
**修正必須**

## 問題
`src/App.tsx:34` - 日目変更時に `setDay(newDay)` を先に実行し、`fetchTorikumi` 失敗時も `data` は旧日のまま残るため、UI上の「日目」と実際の取組データが不一致になる。

## ブランチ / worktree
- `gitworktree/feature-009-day-change-fix`

## 依存タスク
- なし

## 作業内容

1. **App.tsx の `handleDayChange` を修正**
   - `fetchTorikumi` の成功後に `setDay` と `setData` を同時更新する
   - 失敗時は `day` を変更しない（ロールバック）
   - ローディング状態を表示して、取得中のUXも改善

   ```tsx
   const handleDayChange = async (newDay: number) => {
     if (!data) return
     setLoading(true)
     try {
       const newData = await fetchTorikumi(data.basho.id, newDay)
       setData(newData)
       setDay(newDay)  // 成功後に更新
     } catch {
       // 失敗時: dayを変更しない（ロールバック）
       // エラー通知を表示してもよい
     } finally {
       setLoading(false)
     }
   }
   ```

## 完了条件
- fetch成功時のみ日目とデータが同時に更新される
- fetch失敗時にUIの日目とデータが不整合にならない
- `npm run build` が通る
