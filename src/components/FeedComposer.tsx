import { useRef } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { getInitials } from '../utils/getInitials'

function VideoIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M4 7.5h10.5v9H4z" />
      <path d="m14.5 10 5.5-3v10l-5.5-3" />
    </svg>
  )
}

function PhotoIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="m4 15 4-4 4 4 2-2 6 6" />
      <path d="M15.5 9.5h.01" />
    </svg>
  )
}

type FeedComposerProps = {
  authorName: string
  profilePhotoUrl?: string
  content: string
  selectedPhotoPreview: string
  selectedVideoName: string
  isOpen: boolean
  isSubmitting: boolean
  onClose: () => void
  onContentChange: (value: string) => void
  onOpen: () => void
  onPhotoChange: (file?: File) => void
  onRemovePhoto: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onVideoChange: (fileName: string) => void
}

export function FeedComposer({
  authorName,
  profilePhotoUrl,
  content,
  selectedPhotoPreview,
  selectedVideoName,
  isOpen,
  isSubmitting,
  onClose,
  onContentChange,
  onOpen,
  onPhotoChange,
  onRemovePhoto,
  onSubmit,
  onVideoChange,
}: FeedComposerProps) {
  const photoInputRef = useRef<HTMLInputElement | null>(null)
  const videoInputRef = useRef<HTMLInputElement | null>(null)

  return (
    <>
      <div className="feed-composer-card">
        <Link className="feed-composer-card__avatar" to="/profile">
          {profilePhotoUrl ? (
            <img src={profilePhotoUrl} alt="Ir para perfil" />
          ) : (
            <span>{getInitials(authorName)}</span>
          )}
        </Link>

        <button
          className="feed-composer-card__prompt"
          type="button"
          onClick={onOpen}
        >
          Fazer publicacao de animal
        </button>
      </div>

      {isOpen && (
        <div className="modal-backdrop">
          <form className="feed-composer-modal" onSubmit={onSubmit}>
            <header className="feed-composer-modal__header">
              <div>
                <h2>Nova publicacao</h2>
                <p>Compartilhe uma novidade com a comunidade.</p>
              </div>
              <button
                className="terms-modal__close"
                type="button"
                onClick={onClose}
                aria-label="Fechar"
              >
                x
              </button>
            </header>

            <div className="feed-composer-modal__author">
              <Link className="feed-composer__avatar" to="/profile">
                {profilePhotoUrl ? (
                  <img src={profilePhotoUrl} alt="Ir para perfil" />
                ) : (
                  <span>{getInitials(authorName)}</span>
                )}
              </Link>
              <strong>{authorName}</strong>
            </div>

            <div className="form-field">
              <label htmlFor="feed-content">Publicacao</label>
              <textarea
                id="feed-content"
                className="feed-composer-modal__textarea"
                value={content}
                onChange={(event) => onContentChange(event.target.value)}
                placeholder="FAZER PUBLICACAO DE ANIMAL"
                maxLength={1000}
                autoFocus
                required
              />
            </div>

            {selectedPhotoPreview && (
              <div className="feed-composer__preview">
                <img src={selectedPhotoPreview} alt="" />
                <button type="button" onClick={onRemovePhoto}>
                  Remover foto
                </button>
              </div>
            )}

            {selectedVideoName && (
              <p className="field-hint">
                Video selecionado: {selectedVideoName}. O envio de video sera
                ativado em uma proxima etapa.
              </p>
            )}

            <div className="feed-composer-modal__media">
              <button
                className="feed-media-button"
                type="button"
                onClick={() => videoInputRef.current?.click()}
              >
                <VideoIcon />
                Video
              </button>
              <button
                className="feed-media-button"
                type="button"
                onClick={() => photoInputRef.current?.click()}
              >
                <PhotoIcon />
                Foto
              </button>
            </div>

            <input
              ref={videoInputRef}
              className="feed-hidden-input"
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={(event) => {
                onVideoChange(event.target.files?.[0]?.name ?? '')
                event.currentTarget.value = ''
              }}
            />
            <input
              ref={photoInputRef}
              className="feed-hidden-input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => {
                onPhotoChange(event.target.files?.[0])
                event.currentTarget.value = ''
              }}
            />

            <div className="actions">
              <button className="button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Publicando...' : 'Publicar'}
              </button>
              <button
                className="button button--secondary"
                type="button"
                onClick={onClose}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
