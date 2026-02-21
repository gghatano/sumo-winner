# Task 017: handleBashoChange の状態不整合を修正

## 優先度
**修正必須**

## 問題
`src/App.tsx:41` - `handleBashoChange` で `setSelectedBashoId(newBashoId)` と `setDay(1)` を先に反映してから `fetchTorikumi` を呼んでいるため、fetch失敗時に `data` だけ旧場所のまま残り、場所/日目表示と取組内容が不一致になる。task-009 で `handleDayChange` は修正済みだが、同じパターンが `handleBashoChange` に残っている。

## ブランチ / worktree
- `gitworktree/feature-017-basho-change-fix`

## 依存タスク
- なし

## 作業内容

1. **`src/App.tsx` の `handleBashoChange` を修正**
   - `fetchTorikumi` 成功後に `setSelectedBashoId` / `setDay` / `setData` を一括更新
   - 失敗時はロールバック（何も変更しない）
   - fetch中は `fetching` ステートを使い、セレクタをdisabledに

2. **場所セレクタにもdisabledを適用**（改善提案も同時対応）
   - `BashoSelector` の場所セレクトにも `disabled` propを反映
   - fetch中は場所・日目の両方を操作不可にしてレース条件を防止

## 完了条件
- 場所変更のfetch成功時のみUI状態が更新される
- fetch失敗時にselectedBashoId/dayがロールバックされる
- fetch中は場所・日目セレクタが両方disabledになる
- `npm run build` が通る
