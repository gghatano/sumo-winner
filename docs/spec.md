以下を **Claude Code にそのまま渡せる「仕様書（+実装指示）」**として整理します。
前提として、Yahoo!スポーツナビの取組ページは日別URLが存在します（例：`/sumo/torikumi/202601/12` の形式）。 ([スポーツナビ][1])

---

# 仕様書：大相撲 取組予想メモ自動生成（GitHub Pages）

## 1. 目的 / 背景

* 大相撲の「何場所の何日目か」を表示し、その日の取組に対して **勝敗予想（どちらが勝つか）をクリックで入力**し、
  入力結果から **所定フォーマットのテキスト**を生成してコピペ可能にする。
* データ取得元は Yahoo!スポーツナビ「取組」ページ（ユーザー指定）。 ([スポーツナビ][2])

## 2. ゴール（ユーザー価値）

* 毎日やる「取組一覧を見て、勝敗予想を書いて、整形して投稿する」作業を省力化。
* 「その日（場所/日目）の取組一覧」→「選択UI」→「投稿用テキスト生成」までをワンストップ化。

## 3. スコープ

### 3.1 対象

* 幕内（まずは幕内のみ。十両は後回しにできるよう設計）
* 1場所あたり15日（初日〜千秋楽）
* 最新場所・最新日（少なくとも当日分）の表示

### 3.2 非対象（初期リリースではやらない）

* 自動予測モデル（Bradley–Terry 等）は入れない。**予想は人がクリック入力**。
* 過去場所の完全アーカイブ（必要なら後から拡張）
* ログイン、サーバーDB

## 4. 前提/制約（重要）

* GitHub Pages は静的ホスティングのため、**ブラウザからYahooへ直接fetchするとCORSで失敗する可能性が高い**。
  → **GitHub Actions で定期取得して repo 内にJSONを生成**し、Pages側はそのJSONを読む方式を標準とする。
* 取得元サイトの負荷を避け、**取得頻度を抑える（例：1時間に1回）**、User-Agent明示、リトライ/バックオフを実装。

## 5. ユースケース

1. ユーザーがページを開く
2. 「場所（YYYY年M月場所）」と「日目」を確認（デフォルトは最新）
3. 取組一覧が表示される
4. 各取組について「東が勝つ / 西が勝つ」をクリック（未選択も許容）
5. 下部のテキストエリアに、指定フォーマットのテキストがリアルタイムに生成される
6. コピーボタンでクリップボードにコピー

## 6. 画面要件（UI）

### 6.1 画面構成（1ページ）

* ヘッダ：タイトル、データ更新日時
* セレクタ：

  * 場所セレクト（例：2026年1月場所）
  * 日目セレクト（初日〜千秋楽）
  * （任意）「幕内/十両」タブ（初期は幕内固定でもOK）
* 取組リスト（カード/テーブルどちらでも可）

  * 東力士名 / 西力士名
  * 予想ボタン：`東○` / `西○` / `未選択に戻す`
* 生成結果プレビュー（テキストエリア）

  * 先頭に「十二日目（・ω・）ノ」等のヘッダ（固定文言＋日目可変）
  * その下に予想結果の行を並べる
  * コピーボタン

### 6.2 表示フォーマット（生成テキスト）

* 例（ユーザー提示に準拠）：

  * 予想した勝者側に `○`、敗者側に `●` を付ける
  * 未選択は記号なし、または `・` など（要件としては「未選択でも生成はする」）
* 文字揃えは「概ね見やすい」でよい（厳密な等幅整形は必須にしない）

## 7. データ要件

### 7.1 取得対象（最低限）

* 場所ID（例：202601）
* 日（1〜15）
* 取組一覧（順序保持）

  * 東力士名
  * 西力士名
  * （任意）番付、決まり手、勝敗結果（結果ページなので存在するが、予想用途では必須ではない）

### 7.2 URLパターン

* 日別ページが存在：`https://sports.yahoo.co.jp/sumo/torikumi/{YYYYMM}/{day}` ([スポーツナビ][1])
* トップは最新場所の導線を持つ：`https://sports.yahoo.co.jp/sumo/torikumi/` ([スポーツナビ][2])

### 7.3 JSONスキーマ（repoに保存）

例：`public/data/torikumi/latest.json` と `public/data/torikumi/{YYYYMM}/{day}.json`

```json
{
  "source": "https://sports.yahoo.co.jp/sumo/torikumi/202601/12",
  "basho": { "id": "202601", "label": "2026年1月場所" },
  "day": 12,
  "updatedAt": "2026-01-22T09:05:00Z",
  "division": "makuuchi",
  "matches": [
    { "east": "高安", "west": "大の里" },
    { "east": "豊昇龍", "west": "霧島" }
  ]
}
```

## 8. 状態管理（ユーザーの予想）

* 保存先：`localStorage`
* キー設計：

  * `predictions:{bashoId}:{day}:{division}`
* 値：配列（matchesのindexに対応）または `{matchId: "E"|"W"|null}`
* 画面再読み込みでも復元する

## 9. 技術選定（推奨）

### 9.1 フロント（GitHub Pages）

* TypeScript + Vite + React（もしくは Preact）

  * 理由：状態管理（localStorage）、UI部品、ビルド/デプロイが安定
* 代替：素のHTML+Vanilla JSでも可（工数最小ならこちら）

### 9.2 データ取得（GitHub Actions）

* Python（requests + BeautifulSoup4）でHTMLを解析しJSON生成
* スケジュール：

  * 大会中は `毎時`、大会外は `1日1回` でもよい（まずは毎時固定でOK）
* 生成物をコミットしてPagesで配信（`public/data/...` 配下）

## 10. パーサ要件（Yahoo HTML → JSON）

* 入力：`/sumo/torikumi/` および `.../{YYYYMM}/{day}`
* 出力：

  * 最新場所IDの特定（トップページから推定）
  * 日別ページの取組一覧抽出（幕内のみ）
* 注意：

  * HTML構造変更に備え、**CSSセレクタに依存しすぎない**
    例：見出し「結果」「幕内」などの文言近傍でブロック抽出 → その配下の東西名を拾う
  * 取得失敗時は前回JSONを残す（Actionsを失敗で止めない/通知は任意）

## 11. リポジトリ構成（案）

```
.
├─ .github/workflows/fetch_torikumi.yml
├─ scripts/
│   └─ fetch_torikumi.py
├─ public/
│   └─ data/torikumi/...
├─ src/
│   ├─ app.tsx
│   ├─ lib/storage.ts
│   ├─ lib/format.ts
│   └─ components/...
├─ index.html
├─ package.json
└─ README.md
```

## 12. GitHub Actions 要件（fetch_torikumi.yml）

* `cron`: `0 * * * *`（毎時）
* `workflow_dispatch`: 手動実行可能
* Steps:

  1. checkout
  2. python3 setup
  3. `python3 scripts/fetch_torikumi.py`
  4. 差分があればコミット＆push
* コミットメッセージ：`chore(data): update torikumi {bashoId} day {day}`

## 13. 受け入れ基準（Acceptance Criteria）

1. Pagesを開くと、最新場所・最新日がデフォルト選択され、取組が表示される
2. 各取組で「東勝ち/西勝ち」をクリックすると、即座に生成テキストが更新される
3. リロードしても選択状態が復元される
4. コピーボタンで生成テキストがクリップボードに入る
5. GitHub Actions が定期的にJSONを更新し、Pages側に反映される

## 14. 実装タスク分割（Claude Code向け）

* T1: Vite+React+TSでPagesデプロイ雛形（gh-pages or actionsでbuildしてdocs/へ）
* T2: JSON読み込み → basho/day selector → 取組表示
* T3: localStorageで予想状態の保存/復元
* T4: テキスト整形（ヘッダ+各行、○●付与）
* T5: Copy-to-clipboard
* T6: Pythonスクレイパ（トップ→最新basho推定、日別取組抽出）
* T7: Actionsワークフロー（cron + commit）
* T8: README（使い方、運用、取得元、注意点）

---

## Claude Code への依頼文（そのまま貼れる）

```
目的：
大相撲の取組予想メモ作成を省力化するWeb（GitHub Pages）を作る。

要件：
- 取組データは Yahoo!スポーツナビ https://sports.yahoo.co.jp/sumo/torikumi/ から取得する。
- GitHub Pagesは静的なので、GitHub Actionsで定期取得してJSONをrepoに保存し、フロントはそのJSONを読む構成にする。
- 画面で「場所」「日目」を表示/選択できる。
- 取組一覧（まず幕内のみ）を表示し、各取組ごとに「東が勝つ/西が勝つ/未選択」をクリック入力できる。
- 入力に応じて、下記のような投稿用テキストを生成して表示し、コピーボタンでクリップボードにコピーできる。
  - 例：十二日目（・ω・）ノ
        ○翔猿 －御嶽海
        ●熱海富士－安青錦
        …（○●は勝敗予想に応じて付与。未選択は記号なしでもよい）
- 予想入力はlocalStorageに保存し、リロードしても復元される。

技術選定：
- フロント：Vite + React + TypeScript（または同等の静的フレームワーク）
- 取得：Python + requests + BeautifulSoup4
- Actions：cron毎時 + workflow_dispatch。JSON更新があればコミットしてpush。

納品物：
- フロント一式（Pagesで動作）
- scripts/fetch_torikumi.py
- .github/workflows/fetch_torikumi.yml
- README.md（運用手順含む）

受け入れ基準：
- 最新場所/最新日が表示され、取組が出る
- クリックで○●付きテキストが生成される
- localStorage復元できる
- ActionsでJSONが更新される
```

---

必要なら、生成テキストの「揃え（全角/半角スペース）」や「未選択行の扱い（記号/空欄）」まで、投稿媒体（X/Slack等）前提で最適化した版も作れます。どの媒体向けに寄せますか？

[1]: https://sports.yahoo.co.jp/sumo/torikumi/202601/12 "大相撲 - 2026年1月場所 取組結果 - スポーツナビ"
[2]: https://sports.yahoo.co.jp/sumo/torikumi/ "大相撲 - 2026年1月場所 取組結果 - スポーツナビ"

