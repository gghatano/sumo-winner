# Task 007: GitHub Actions ワークフロー（定期取得 + コミット）

## 概要
GitHub Actionsで定期的にスクレイパを実行し、JSONデータを更新・コミットするワークフロー。

## ブランチ / worktree
- `gitworktree/feature-007-actions`

## 依存タスク
- task-006（Pythonスクレイパ）

## ブロックしているタスク
- なし

## 作業内容

1. **ワークフロー定義** (`.github/workflows/fetch_torikumi.yml`)
   - トリガー:
     - `schedule`: `cron: '0 * * * *'`（毎時）
     - `workflow_dispatch`: 手動実行可能
   - Steps:
     1. `actions/checkout@v4`
     2. `actions/setup-python@v5`（Python 3.12）
     3. `pip install -r requirements.txt`
     4. `python scripts/fetch_torikumi.py`
     5. 差分チェック（`git diff --quiet` で判定）
     6. 差分があればコミット＆push
   - コミットメッセージ: `chore(data): update torikumi {bashoId} day {day}`
   - コミッター: `github-actions[bot]`

2. **権限設定**
   - `permissions: contents: write`（pushに必要）

3. **エラーハンドリング**
   - スクレイパ失敗時もワークフロー自体は失敗にしない（`continue-on-error` or exit code制御）

## 完了条件
- ワークフローが正しいYAML構文で定義されている
- 手動実行（workflow_dispatch）でJSONが更新・コミットされる
- 差分がない場合はコミットをスキップする
- スクレイパ失敗時にワークフローが壊れない
