## サマリー
主要機能は一通り実装されていますが、仕様との不整合と日付切替時の状態不整合があり、現状はそのまま Ship 非推奨です。特に「幕内のみ保証」と「日目変更失敗時の整合性」は修正必須です。

## 問題点（修正必須）
- [ ] `src/App.tsx:34` - 日目変更時に `setDay(newDay)` を先に実行し、`fetchTorikumi` 失敗時も `data` は旧日のまま残るため、UI上の「日目」と実際の取組データが不一致になります（`src/App.tsx:36-40`, `src/App.tsx:45`）。`fetchTorikumi` 成功後に `setDay`/`setData` を同時更新するか、失敗時に日目をロールバックしてください。
- [ ] `scripts/fetch_torikumi.py:154` - `parse_torikumi` の最終フォールバックが全テーブル走査のため、`幕内` セクションを見つけられない場合に十両等を誤って取り込む可能性があります。仕様の「幕内のみ」（`docs/spec.md` セクション3/10）に違反し得るため、幕内文脈が確認できない場合は空配列を返すよう制限が必要です。
- [ ] `src/components/BashoSelector.tsx:32` - 場所セレクトが `disabled` 固定で、仕様の「場所（YYYY年M月場所）を表示/選択」（`docs/spec.md` セクション6, 5のユースケース）を満たしていません。少なくとも利用可能な場所一覧を選択可能にし、選択変更で対応JSONを読み込む実装が必要です。

## 改善提案（推奨）
- [ ] `src/lib/api.ts:5` - APIレスポンスのランタイム検証がなく、JSON破損時に下流で例外化します。最小限のスキーマ検証（`day` 範囲、`matches` 配列、`east/west` 文字列）を追加すると堅牢性が上がります。
- [ ] `src/hooks/usePredictions.ts:17` - 初期描画時に `bashoId === ''` でも保存処理が走り、`predictions::1:makuuchi` キーが作られます。`bashoId` が空の間は save/load をスキップすると不要データを防げます。
- [ ] `tests/test_parser.py:66` - 「幕内なしHTML」のテストが `isinstance(list)` のみで期待仕様を担保していません。`== []` を明示し、幕内限定の回帰を防ぐべきです。
- [ ] `src/lib/__tests__/format.test.ts:4` - `dayToKanji` の異常系（0, 16, NaN）テストがありません。入力破損時のクラッシュ防止のため追加推奨です。
- [ ] `.github/workflows/fetch_torikumi.yml:28` - `continue-on-error: true` で取得失敗が成功扱いになります。運用上の検知性を上げるため、ステップ自体は失敗扱いにしつつ「前回JSONを保持」はスクリプト側で担保する構成が望ましいです。

## 良い点
- `src/types.ts` で `Prediction` を `'E' | 'W' | null` に限定しており、フロントの型安全性は高いです。
- `src/lib/format.ts` で日目表記変換とテキスト整形を分離しており、責務分離が明確です。
- `scripts/fetch_torikumi.py` は User-Agent 明示、リトライ、指数バックオフを実装しており取得マナーに配慮されています。
- `fetch_torikumi.yml` のコミットメッセージに `bashoId/day` を含める実装は運用トレース性が高いです。

## 総合評価
修正後に再レビュー必要です。上記「修正必須」3点を解消すれば、初期リリース基準に近づきます。
