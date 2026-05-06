import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import type { AnimalResponse } from '../types'
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

function SmileIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8" />
      <path d="M9 10h.01" />
      <path d="M15 10h.01" />
      <path d="M8.5 14c1 1.4 2.1 2 3.5 2s2.5-.6 3.5-2" />
    </svg>
  )
}

type FeedComposerProps = {
  authorName: string
  profilePhotoUrl?: string
  animals: AnimalResponse[]
  content: string
  selectedAnimalId: number | null
  selectedPhotoPreview: string
  selectedVideoName: string
  errorMessage: string
  isOpen: boolean
  isSubmitting: boolean
  onClose: () => void
  onContentChange: (value: string) => void
  onOpen: () => void
  onAnimalSelect: (animalId: number | null) => void
  onPhotoChange: (file?: File) => void
  onRemovePhoto: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onVideoChange: (fileName: string) => void
}

export function FeedComposer({
  authorName,
  profilePhotoUrl,
  animals,
  content,
  selectedAnimalId,
  selectedPhotoPreview,
  selectedVideoName,
  errorMessage,
  isOpen,
  isSubmitting,
  onClose,
  onContentChange,
  onOpen,
  onAnimalSelect,
  onPhotoChange,
  onRemovePhoto,
  onSubmit,
  onVideoChange,
}: FeedComposerProps) {
  const photoInputRef = useRef<HTMLInputElement | null>(null)
  const videoInputRef = useRef<HTMLInputElement | null>(null)
  const [isAnimalPickerOpen, setIsAnimalPickerOpen] = useState(false)
  const [isEmojiMenuOpen, setIsEmojiMenuOpen] = useState(false)
  const selectedAnimal = animals.find((animal) => animal.id === selectedAnimalId)
  const emojiOptions = [
    '\u{1F43E}',
    '\u{1F431}',
    '\u{1F436}',
    '\u{1F49A}',
    '\u{1F60D}',
    '\u{1F64C}',
    '\u{2728}',
    '\u{1F3E1}',
  ]

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

            {selectedAnimal && (
              <div className="feed-composer__selected-animal">
                <span>Animal vinculado</span>
                <strong>{selectedAnimal.animalName}</strong>
                <button type="button" onClick={() => onAnimalSelect(null)}>
                  Remover
                </button>
              </div>
            )}

            {errorMessage && <p className="form-error">{errorMessage}</p>}

            <div className="feed-composer-modal__media">
              <div className="feed-animal-picker">
                <button
                  className="feed-media-button"
                  type="button"
                  disabled={animals.length === 0}
                  onClick={() =>
                    setIsAnimalPickerOpen((currentValue) => {
                      setIsEmojiMenuOpen(false)
                      return !currentValue
                    })
                  }
                >
                  Escolher animal
                </button>

                {isAnimalPickerOpen && animals.length > 0 && (
                  <div className="feed-animal-picker__list">
                    <button
                      className={!selectedAnimalId ? 'is-selected' : ''}
                      type="button"
                      onClick={() => {
                        onAnimalSelect(null)
                        setIsAnimalPickerOpen(false)
                      }}
                    >
                      Sem animal vinculado
                    </button>
                    {animals.map((animal) => (
                      <button
                        className={
                          selectedAnimalId === animal.id ? 'is-selected' : ''
                        }
                        key={animal.id}
                        type="button"
                        onClick={() => {
                          onAnimalSelect(animal.id)
                          setIsAnimalPickerOpen(false)
                        }}
                      >
                        <strong>{animal.animalName}</strong>
                        <span>{animal.species}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="feed-composer-emoji">
                <button
                  className="feed-media-button"
                  type="button"
                  onClick={() =>
                    setIsEmojiMenuOpen((currentValue) => {
                      setIsAnimalPickerOpen(false)
                      return !currentValue
                    })
                  }
                >
                  <SmileIcon />
                  Emoji
                </button>

                {isEmojiMenuOpen && (
                  <div className="feed-composer-emoji__menu">
                    {emojiOptions.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          onContentChange(`${content}${emoji}`)
                          setIsEmojiMenuOpen(false)
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
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
