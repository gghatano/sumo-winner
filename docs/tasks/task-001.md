# Task 001: プロジェクト雛形セットアップ（Vite + React + TypeScript）

## 概要
Vite + React + TypeScript でプロジェクトの土台を作り、GitHub Pagesへのデプロイ設定を行う。

## ブランチ / worktree
- `gitworktree/feature-001-scaffolding`

## 依存タスク
- なし（最初に着手可能）

## ブロックしているタスク
- task-002, task-003, task-004

## 作業内容

1. **Viteプロジェクト初期化**
   - `npm create vite@latest` 相当の構成（React + TypeScript）
   - `package.json`, `vite.config.ts`, `tsconfig.json` 設定

2. **ディレクトリ構成**
   ```
   src/
     App.tsx
     main.tsx
     lib/        （空、後続タスク用）
     components/ （空、後続タスク用）
   public/
     data/torikumi/  （サンプルJSON配置）
   index.html
   ```

3. **サンプルJSONデータ作成**
   - `public/data/torikumi/latest.json`
   - `public/data/torikumi/202601/12.json`
   - スキーマに準拠したダミーデータ（開発・テスト用）

4. **GitHub Pages デプロイ設定**
   - `vite.config.ts` に `base` 設定
   - `.github/workflows/deploy.yml`（build → Pages デプロイ）

5. **最低限のApp.tsx**
   - "大相撲 取組予想メモ" とタイトル表示するだけの骨格

## 完了条件
- `npm run dev` でローカル開発サーバーが起動する
- `npm run build` でビルドが通る
- サンプルJSONが `public/data/` に配置されている
- GitHub Pages用のデプロイworkflowが存在する
