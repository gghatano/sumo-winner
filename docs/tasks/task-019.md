# Task 019: vitest の include 設定でgitworktree配下を除外

## 優先度
改善（推奨）

## 問題
`vitest.config.ts` にinclude指定がなく、`gitworktree/` 配下のテストファイルまで実行されてしまう（20ファイル実行される問題）。

## ブランチ / worktree
- `gitworktree/feature-019-vitest-include`

## 依存タスク
- なし

## 作業内容

1. **`vitest.config.ts` を修正**
   - `include` を明示的に設定してプロジェクトルート直下のテストのみ対象にする
   ```ts
   test: {
     include: ['src/**/*.test.ts'],
     exclude: ['**/gitworktree/**'],
     environment: 'jsdom',
     setupFiles: ['./src/lib/__tests__/setup.ts'],
   }
   ```

2. **`npm run test` で正しいテストのみ実行されることを確認**

## 完了条件
- `npm run test` がgitworktree配下のテストを拾わない
- プロジェクトルートのテストは全パスする
