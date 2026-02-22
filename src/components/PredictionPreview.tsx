interface Props {
  sourceUrl: string
  bashoDay: string
  headerComment: string
  matchLines: string
  footerComment: string
  fullText: string
  onHeaderCommentChange: (value: string) => void
  onFooterCommentChange: (value: string) => void
}

export function PredictionPreview({
  sourceUrl,
  bashoDay,
  headerComment,
  matchLines,
  footerComment,
  fullText,
  onHeaderCommentChange,
  onFooterCommentChange,
}: Props) {
  return (
    <div className="prediction-preview">
      <h2>生成テキスト</h2>

      <div className="preview-inputs">
        <div className="preview-row">
          <span className="preview-label">参照元</span>
          <a className="preview-value source-url" href={sourceUrl} target="_blank" rel="noopener noreferrer">{sourceUrl}</a>
        </div>
        <div className="preview-row">
          <span className="preview-label">場所・日目</span>
          <span className="preview-value">{bashoDay}</span>
        </div>
        <div className="preview-row">
          <label className="preview-label" htmlFor="header-comment">先頭コメント</label>
          <input
            id="header-comment"
            type="text"
            className="preview-input"
            value={headerComment}
            onChange={(e) => onHeaderCommentChange(e.target.value)}
          />
        </div>
        <div className="preview-row">
          <span className="preview-label">勝敗予想</span>
          <pre className="preview-matches">{matchLines}</pre>
        </div>
        <div className="preview-row">
          <label className="preview-label" htmlFor="footer-comment">末尾コメント</label>
          <input
            id="footer-comment"
            type="text"
            className="preview-input"
            value={footerComment}
            onChange={(e) => onFooterCommentChange(e.target.value)}
          />
        </div>
      </div>

      <h3>コピー用プレビュー</h3>
      <textarea
        readOnly
        value={fullText}
        rows={Math.max(fullText.split('\n').length + 1, 5)}
        className="preview-textarea"
      />
    </div>
  )
}
