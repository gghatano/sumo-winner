# Task 006: Python スクレイパ（Yahoo!スポーツナビ → JSON）

## 概要
Yahoo!スポーツナビの取組ページからHTMLを解析し、JSONファイルを生成するPythonスクリプト。

## ブランチ / worktree
- `gitworktree/feature-006-scraper`

## 依存タスク
- なし（フロントと並行で着手可能）

## ブロックしているタスク
- task-007（GitHub Actions）

## 作業内容

1. **スクリプト本体** (`scripts/fetch_torikumi.py`)
   - **最新場所ID特定**: トップページ `https://sports.yahoo.co.jp/sumo/torikumi/` から最新bashoIdを推定
   - **日別取組抽出**: `https://sports.yahoo.co.jp/sumo/torikumi/{YYYYMM}/{day}` から幕内取組を抽出
   - **JSON出力**:
     - `public/data/torikumi/{YYYYMM}/{day}.json`
     - `public/data/torikumi/latest.json`（最新日のデータへのシンボリックリンクまたはコピー）

2. **パーサ実装方針**
   - CSSセレクタに依存しすぎない
   - 見出し「幕内」等の文言近傍でブロック抽出 → 配下の東西名を取得
   - HTML構造変更に備えたロバストな実装

3. **取得マナー**
   - User-Agent明示（例: `sumo-predict-bot/1.0`）
   - リトライ/エクスポネンシャルバックオフ
   - 取得間隔を適切に設定
   - 取得失敗時は前回JSONを残す（上書きしない）

4. **依存関係** (`requirements.txt`)
   - requests
   - beautifulsoup4

5. **テスト**
   - サンプルHTMLを用意してパーサのユニットテスト
   - 出力JSONがスキーマに準拠することの検証

## 完了条件
- `python3 scripts/fetch_torikumi.py` を実行すると `public/data/torikumi/` にJSONが生成される
- 出力JSONがREQUIREMENTS.mdのスキーマに準拠している
- 取得失敗時にエラーで止まらず、前回データが保持される
- User-Agent、リトライが実装されている
