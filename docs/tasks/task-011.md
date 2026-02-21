# Task 011: 場所セレクタを選択可能にする

## 優先度
**修正必須**

## 問題
`src/components/BashoSelector.tsx:32` - 場所セレクトが `disabled` 固定。仕様の「場所（YYYY年M月場所）を表示/選択」を満たしていない。

## ブランチ / worktree
- `gitworktree/feature-011-basho-selector`

## 依存タスク
- なし

## 作業内容

1. **利用可能な場所一覧の取得**
   - `public/data/torikumi/` 配下のディレクトリ構成から場所一覧を推定する方法を検討
   - 方法A: `public/data/torikumi/index.json` にメタ情報を持たせる（場所一覧）
   - 方法B: latest.jsonに`availableBasho`フィールドを追加
   - **推奨: 方法A** - スクレイパがindex.jsonも生成する

2. **index.json のスキーマ**
   ```json
   {
     "bashoList": [
       { "id": "202601", "label": "2026年1月場所", "days": 15 },
       { "id": "202603", "label": "2026年3月場所", "days": 12 }
     ],
     "latest": { "bashoId": "202603", "day": 12 }
   }
   ```

3. **サンプルindex.json の作成**
   - `public/data/torikumi/index.json` にサンプルデータ配置

4. **api.ts に場所一覧取得を追加**
   - `fetchIndex(): Promise<IndexData>`

5. **BashoSelector.tsx の改修**
   - 場所セレクトを `disabled` から選択可能に変更
   - 場所一覧をpropsで受け取り、ドロップダウンで表示
   - 場所変更時のコールバック `onBashoChange` を追加

6. **App.tsx の統合**
   - 初期化時にindex.jsonを取得
   - 場所変更 → 日目を1にリセット → 対応するJSONを取得

7. **スクレイパ (`scripts/fetch_torikumi.py`) の改修**
   - index.json を生成・更新する処理を追加

## 完了条件
- 場所セレクタが選択可能で、場所を切り替えると対応する取組が表示される
- index.jsonが存在し、フロントから読み込まれる
- スクレイパがindex.jsonを更新する
- `npm run build` が通る
