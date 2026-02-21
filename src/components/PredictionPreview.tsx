interface Props {
  text: string
}

export function PredictionPreview({ text }: Props) {
  return (
    <div className="prediction-preview">
      <h2>生成テキスト</h2>
      <textarea
        readOnly
        value={text}
        rows={20}
        className="preview-textarea"
      />
    </div>
  )
}
