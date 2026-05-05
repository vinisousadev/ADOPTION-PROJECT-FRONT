type FeedPostEditorProps = {
  content: string
  postId: number
  isSaving: boolean
  onCancel: () => void
  onContentChange: (value: string) => void
  onSave: (postId: number) => void
}

export function FeedPostEditor({
  content,
  postId,
  isSaving,
  onCancel,
  onContentChange,
  onSave,
}: FeedPostEditorProps) {
  return (
    <div className="feed-post__editor">
      <div className="form-field">
        <label htmlFor={`feed-edit-content-${postId}`}>Texto</label>
        <textarea
          id={`feed-edit-content-${postId}`}
          value={content}
          onChange={(event) => onContentChange(event.target.value)}
          maxLength={1000}
        />
      </div>

      <div className="actions">
        <button
          className="button"
          type="button"
          disabled={isSaving}
          onClick={() => onSave(postId)}
        >
          {isSaving ? 'Salvando...' : 'Salvar'}
        </button>
        <button className="button button--secondary" type="button" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </div>
  )
}
