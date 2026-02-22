# [開発中]sumo-predict

大相撲の取組予想メモ作成を省力化するWebアプリです。

## 機能

- **取組一覧表示** - 場所・日目を選択して取組一覧を表示
- **勝敗予想のクリック入力** - 各取組の勝敗予想をワンクリックで入力
- **投稿用テキストの自動生成+コピー** - 予想結果を投稿用テキストとして整形し、クリップボードにコピー
- **予想データのlocalStorage保存** - 入力した予想をブラウザのlocalStorageに自動保存

## 技術スタック

- **フロントエンド**: Vite + React + TypeScript
- **スクレイパ**: Python + BeautifulSoup4
- **CI/CD**: GitHub Actions

## リポジトリ構成

```
.
├── .github/workflows/
│   ├── deploy.yml              # デプロイ用ワークフロー
│   └── fetch_torikumi.yml      # データ自動取得ワークフロー
├── public/data/torikumi/       # 取組データ（JSON）
├── scripts/
│   └── fetch_torikumi.py       # 取組データ取得スクリプト
├── src/
│   ├── components/
│   │   ├── BashoSelector.tsx   # 場所・日目セレクタ
│   │   ├── MatchList.tsx       # 取組一覧
│   │   └── PredictionPreview.tsx # 予想プレビュー
│   ├── hooks/
│   │   └── usePredictions.ts   # 予想データ管理フック
│   ├── lib/
│   │   ├── api.ts              # データ取得
│   │   ├── format.ts           # テキスト整形
│   │   └── storage.ts          # localStorage操作
│   ├── App.tsx
│   ├── main.tsx
│   └── types.ts
├── tests/                      # スクレイパのテスト
├── index.html
├── package.json
├── requirements.txt
├── vite.config.ts
└── vitest.config.ts
```

## ローカル開発

```bash
npm install
npm run dev
```

## テスト実行

```bash
# フロントエンドテスト
npm run test

# スクレイパテスト
pip install -r requirements.txt
python -m pytest tests/
```

## データ取得（手動）

```bash
python scripts/fetch_torikumi.py
python scripts/fetch_torikumi.py --basho 202601 --day 12
```

## GitHub Actions

毎時自動でデータを更新します。手動実行も可能です。

## データ取得元

[Yahoo!スポーツナビ](https://sports.yahoo.co.jp/sumo/torikumi/)から取組データを取得しています。

- 取得頻度を抑えて利用しています
- 個人利用目的です
