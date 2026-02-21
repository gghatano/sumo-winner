# Task 014: テストのアサーション強化・異常系テスト追加

## 優先度
改善（推奨）

## 問題
- `tests/test_parser.py:66` - 「幕内なしHTML」テストが `isinstance(list)` のみで `== []` を検証していない
- `src/lib/__tests__/format.test.ts:4` - `dayToKanji` の異常系（0, 16, NaN）テストがない

## ブランチ / worktree
- `gitworktree/feature-014-test-improvements`

## 依存タスク
- task-010（スクレイパ修正後のテスト追加と合わせてもよい）

## 作業内容

1. **`tests/test_parser.py` の改善**
   - `test_empty_html` のアサーションを `assert result == []` に変更
   - 幕内セクションが無いHTMLで空配列が返ることのテスト追加

2. **`src/lib/__tests__/format.test.ts` の改善**
   - `dayToKanji` 異常系テスト追加:
     - `dayToKanji(0)` → 例外 or フォールバック文字列
     - `dayToKanji(16)` → 例外 or フォールバック文字列
     - `dayToKanji(NaN)` → 例外 or フォールバック文字列
   - `src/lib/format.ts` の `dayToKanji` にも異常入力時のガード追加

3. **`src/lib/format.ts` の修正**
   - 範囲外の日目に対して適切なデフォルト動作（例: `${day}日目` をそのまま返す）

## 完了条件
- 全テストがパスする
- 異常入力でクラッシュしない
