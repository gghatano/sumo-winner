# Task 005: クリップボードコピー機能 + UI統合

## 概要
生成テキストをクリップボードにコピーするボタンを実装し、全UIコンポーネントを統合する。

## ブランチ / worktree
- `gitworktree/feature-005-clipboard`

## 依存タスク
- task-002（取組表示UI）
- task-003（localStorage）
- task-004（テキスト生成）

## ブロックしているタスク
- なし

## 作業内容

1. **コピーボタン**
   - `navigator.clipboard.writeText()` でコピー
   - コピー成功時にフィードバック表示（「コピーしました」等、数秒で消える）
   - フォールバック: `document.execCommand('copy')`

2. **App.tsx 全体統合**
   - BashoSelector + MatchList + PredictionPreview + CopyButton を統合
   - usePredictions フックで状態を一元管理
   - 予想ボタンクリック → localStorage保存 → テキスト再生成 の流れを接続

3. **スタイリング**
   - 最低限のCSS（見やすいレイアウト）
   - モバイル対応（レスポンシブ）

## 完了条件
- 全コンポーネントが統合されて一連の操作が可能
- コピーボタンで生成テキストがクリップボードに入る
- コピー成功のフィードバックが表示される
- モバイルでも操作可能
