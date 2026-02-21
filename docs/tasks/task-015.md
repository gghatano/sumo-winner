# Task 015: GitHub Actions の continue-on-error 見直し

## 優先度
改善（推奨）

## 問題
`.github/workflows/fetch_torikumi.yml:28` - `continue-on-error: true` でスクレイパの取得失敗が成功扱いになり、運用上の検知が困難。

## ブランチ / worktree
- `gitworktree/feature-015-actions-error-handling`

## 依存タスク
- なし

## 作業内容

1. **ワークフローの修正** (`.github/workflows/fetch_torikumi.yml`)
   - `continue-on-error: true` を削除
   - 代わりに、スクリプト側でエラーハンドリングを担保（既にexit 0で終了する設計）
   - スクレイパの終了コードを活用:
     - 正常取得: exit 0
     - 取得失敗（前回データ保持）: exit 0（ログに警告）
     - 致命的エラー: exit 1（ワークフローが失敗通知）

2. **`scripts/fetch_torikumi.py` の修正**
   - 取得失敗時の終了コード整理:
     - ネットワークエラー等で一部取得失敗 → exit 0（前回データ保持、警告ログ）
     - 全取得失敗（1件も取得できない） → exit 1（ワークフロー失敗で通知）

3. **ワークフローにステータス出力を追加**
   - 取得結果のサマリーをGitHub Actions のjob summaryに出力（任意）

## 完了条件
- 一部取得失敗ではワークフローが成功扱い（前回データ保持）
- 全取得失敗ではワークフローが失敗扱い（通知可能）
- `continue-on-error: true` が除去されている
