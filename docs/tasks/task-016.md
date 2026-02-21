# Task 016: ローカル開発環境の整備（テスト実行可能にする）

## 優先度
**修正必須**（レビュー時にテスト実行できなかった問題の対応）

## 問題
- `npm run test` が実行できない（vitest が正しくインストール/設定されていない可能性）
- `python -m pytest` が実行できない（python3コマンドへの対応）

## ブランチ / worktree
- `gitworktree/feature-016-dev-environment`

## 依存タスク
- なし（他タスクに先行して対応推奨）

## 作業内容

1. **package.json の確認・修正**
   - `vitest`, `jsdom` が devDependencies に含まれていることを確認
   - `"test": "vitest run"` スクリプトが存在することを確認
   - 不足があれば追加

2. **vitest.config.ts の確認**
   - jsdom環境設定、setupFiles等が正しいことを確認

3. **`npm install && npm run test` で全テストがパスすることを確認**

4. **Python側の対応**
   - README.mdに `python3` コマンドでの実行手順も記載
   - テスト実行: `python3 -m pytest tests/`
   - `scripts/fetch_torikumi.py` の shebang を `#!/usr/bin/env python3` に設定

5. **`python3 -m pytest tests/` で全テストがパスすることを確認**

## 完了条件
- `npm install && npm run test` が成功する
- `pip install -r requirements.txt && python3 -m pytest tests/` が成功する
- READMEの手順に沿って環境構築できる
