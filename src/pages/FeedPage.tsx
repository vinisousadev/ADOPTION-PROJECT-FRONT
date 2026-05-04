import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getAvailableAnimals, getMyAnimals } from '../services/animalService'
import {
  createFeedPost,
  deleteFeedPost,
  getFeedPosts,
  patchFeedPost,
} from '../services/feedPostService'
import { uploadFeedPostPhoto } from '../services/feedPostPhotoUploadService'
import { getUserById } from '../services/userService'
import type { AnimalResponse, FeedPostResponse, FeedPostType, UserResponse } from '../types'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'

const MAX_FEED_PHOTO_SIZE = 4 * 1024 * 1024
const ALLOWED_FEED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const postTypeLabels: Record<FeedPostType, string> = {
  GENERAL: 'Atualizacao',
  ADOPTION_SUCCESS: 'Adocao realizada',
  ANIMAL_UPDATE: 'Noticia de animal',
}

function formatFeedDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function mergeAnimals(...animalGroups: AnimalResponse[][]) {
  const animalsById = new Map<number, AnimalResponse>()

  animalGroups.flat().forEach((animal) => {
    animalsById.set(animal.id, animal)
  })

  return Array.from(animalsById.values()).sort((firstAnimal, secondAnimal) =>
    firstAnimal.animalName.localeCompare(secondAnimal.animalName),
  )
}

export function FeedPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserResponse | null>(null)
  const [posts, setPosts] = useState<FeedPostResponse[]>([])
  const [animals, setAnimals] = useState<AnimalResponse[]>([])
  const [content, setContent] = useState('')
  const [postType, setPostType] = useState<FeedPostType>('GENERAL')
  const [selectedAnimalId, setSelectedAnimalId] = useState('')
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null)
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState('')
  const [editingPostId, setEditingPostId] = useState<number | null>(null)
  const [editingContent, setEditingContent] = useState('')
  const [editingPostType, setEditingPostType] = useState<FeedPostType>('GENERAL')
  const [editingAnimalId, setEditingAnimalId] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingPostId, setDeletingPostId] = useState<number | null>(null)
  const [updatingPostId, setUpdatingPostId] = useState<number | null>(null)

  const profilePhotoUrl = profile?.profilePhotoUrl

  const selectedAnimalIdNumber = useMemo(() => {
    return selectedAnimalId ? Number(selectedAnimalId) : undefined
  }, [selectedAnimalId])

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [postsResponse, availableAnimalsResponse, myAnimalsResponse] =
          await Promise.all([
            getFeedPosts(),
            getAvailableAnimals(),
            getMyAnimals().catch(() => null),
          ])

        setPosts(postsResponse.content)
        setAnimals(
          mergeAnimals(
            availableAnimalsResponse.content,
            myAnimalsResponse?.content ?? [],
          ),
        )
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error))
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialData()
  }, [])

  useEffect(() => {
    if (!user) {
      setProfile(null)
      return
    }

    const userId = user.userId

    async function loadProfile() {
      try {
        const userProfile = await getUserById(userId)
        setProfile(userProfile)
      } catch {
        setProfile(null)
      }
    }

    loadProfile()
  }, [user])

  useEffect(() => {
    if (!selectedPhoto) {
      setSelectedPhotoPreview('')
      return
    }

    const previewUrl = URL.createObjectURL(selectedPhoto)
    setSelectedPhotoPreview(previewUrl)

    return () => URL.revokeObjectURL(previewUrl)
  }, [selectedPhoto])

  function handlePhotoChange(file?: File) {
    setErrorMessage('')

    if (!file) {
      setSelectedPhoto(null)
      return
    }

    if (!ALLOWED_FEED_PHOTO_TYPES.includes(file.type)) {
      setErrorMessage('A foto do post deve ser JPG, PNG ou WEBP.')
      return
    }

    if (file.size > MAX_FEED_PHOTO_SIZE) {
      setErrorMessage('A foto do post deve ter no maximo 4MB.')
      return
    }

    setSelectedPhoto(file)
  }

  function clearComposer() {
    setContent('')
    setPostType('GENERAL')
    setSelectedAnimalId('')
    setSelectedPhoto(null)
    setSelectedPhotoPreview('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (content.trim().length < 10) {
      setErrorMessage('Escreva pelo menos 10 caracteres para publicar.')
      return
    }

    setIsSubmitting(true)

    try {
      const uploadedPhoto = selectedPhoto
        ? await uploadFeedPostPhoto(selectedPhoto)
        : null

      const createdPost = await createFeedPost({
        animalId: selectedAnimalIdNumber,
        content: content.trim(),
        imageUrl: uploadedPhoto?.publicUrl,
        postType,
      })

      setPosts((currentPosts) => [createdPost, ...currentPosts])
      clearComposer()
      setSuccessMessage('Publicacao criada com sucesso.')
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  function startEditingPost(post: FeedPostResponse) {
    setEditingPostId(post.id)
    setEditingContent(post.content)
    setEditingPostType(post.postType)
    setEditingAnimalId(post.animalId ? String(post.animalId) : '')
    setErrorMessage('')
    setSuccessMessage('')
  }

  function cancelEditingPost() {
    setEditingPostId(null)
    setEditingContent('')
    setEditingPostType('GENERAL')
    setEditingAnimalId('')
  }

  async function handleUpdatePost(postId: number) {
    setErrorMessage('')
    setSuccessMessage('')

    if (editingContent.trim().length < 10) {
      setErrorMessage('Escreva pelo menos 10 caracteres para atualizar.')
      return
    }

    setUpdatingPostId(postId)

    try {
      const updatedPost = await patchFeedPost(postId, {
        animalId: editingAnimalId ? Number(editingAnimalId) : undefined,
        content: editingContent.trim(),
        postType: editingPostType,
      })

      setPosts((currentPosts) =>
        currentPosts.map((post) => (post.id === postId ? updatedPost : post)),
      )
      cancelEditingPost()
      setSuccessMessage('Publicacao atualizada com sucesso.')
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setUpdatingPostId(null)
    }
  }

  async function handleDeletePost(postId: number) {
    const shouldDelete = window.confirm('Deseja remover esta publicacao?')

    if (!shouldDelete) {
      return
    }

    setErrorMessage('')
    setSuccessMessage('')
    setDeletingPostId(postId)

    try {
      await deleteFeedPost(postId)
      setPosts((currentPosts) =>
        currentPosts.filter((post) => post.id !== postId),
      )
      setSuccessMessage('Publicacao removida com sucesso.')
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setDeletingPostId(null)
    }
  }

  return (
    <section className="feed-page">
      <div className="page">
        <div>
          <p className="eyebrow">Comunidade</p>
          <h1>Feed</h1>
        </div>

        <p>
          Compartilhe novidades, historinhas de adocao e atualizacoes dos
          animais com outros tutores.
        </p>
      </div>

      <form className="feed-composer" onSubmit={handleSubmit}>
        <div className="feed-composer__avatar">
          {profilePhotoUrl ? (
            <img src={profilePhotoUrl} alt="" />
          ) : (
            <span>{getInitials(user?.name ?? 'U')}</span>
          )}
        </div>

        <div className="feed-composer__body">
          <div className="form-field">
            <label htmlFor="feed-content">Nova publicacao</label>
            <textarea
              id="feed-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Conte uma novidade sobre um animal, uma adocao ou uma conquista..."
              maxLength={1000}
              required
            />
          </div>

          <div className="feed-composer__actions feed-composer__actions--wide">
            <div className="form-field">
              <label htmlFor="feed-post-type">Tipo</label>
              <select
                id="feed-post-type"
                value={postType}
                onChange={(event) =>
                  setPostType(event.target.value as FeedPostType)
                }
              >
                <option value="GENERAL">Atualizacao</option>
                <option value="ADOPTION_SUCCESS">Adocao realizada</option>
                <option value="ANIMAL_UPDATE">Noticia de animal</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="feed-animal">Animal vinculado</label>
              <select
                id="feed-animal"
                value={selectedAnimalId}
                onChange={(event) => setSelectedAnimalId(event.target.value)}
              >
                <option value="">Nenhum animal</option>
                {animals.map((animal) => (
                  <option key={animal.id} value={animal.id}>
                    {animal.animalName} - {animal.species}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="feed-photo">Foto</label>
              <input
                id="feed-photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => handlePhotoChange(event.target.files?.[0])}
              />
            </div>

            <button className="button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Publicando...' : 'Publicar'}
            </button>
          </div>

          {selectedPhotoPreview && (
            <div className="feed-composer__preview">
              <img src={selectedPhotoPreview} alt="" />
              <button type="button" onClick={() => setSelectedPhoto(null)}>
                Remover foto
              </button>
            </div>
          )}
        </div>
      </form>

      {errorMessage && <p className="form-error">{errorMessage}</p>}
      {successMessage && <p className="form-success">{successMessage}</p>}
      {isLoading && <p>Carregando feed...</p>}

      {!isLoading && !errorMessage && posts.length === 0 && (
        <div className="feed-empty-state">
          <span>Feed vazio</span>
          <h2>Compartilhe a primeira novidade</h2>
          <p>
            Publique uma atualizacao, uma foto ou uma historia de adocao para
            movimentar a comunidade.
          </p>
        </div>
      )}

      {posts.length > 0 && (
        <div className="feed-list">
          {posts.map((post) => {
            const canManage = user?.userId === post.authorUserId
            const isEditing = editingPostId === post.id

            return (
              <article className="feed-post" key={post.id}>
                <div className="feed-post__avatar">
                  {post.authorProfilePhotoUrl ? (
                    <img src={post.authorProfilePhotoUrl} alt="" />
                  ) : (
                    <span>{getInitials(post.authorName)}</span>
                  )}
                </div>

                <div className="feed-post__content">
                  <header className="feed-post__header">
                    <div>
                      {post.authorUserId === user?.userId ? (
                        <Link to="/profile">{post.authorName}</Link>
                      ) : (
                        <span>{post.authorName}</span>
                      )}
                      <span>{formatFeedDate(post.createdAt)}</span>
                    </div>

                    <strong>{postTypeLabels[post.postType]}</strong>
                  </header>

                  {isEditing ? (
                    <div className="feed-post__editor">
                      <div className="form-field">
                        <label htmlFor={`feed-edit-content-${post.id}`}>
                          Texto
                        </label>
                        <textarea
                          id={`feed-edit-content-${post.id}`}
                          value={editingContent}
                          onChange={(event) =>
                            setEditingContent(event.target.value)
                          }
                          maxLength={1000}
                        />
                      </div>

                      <div className="feed-post__editor-grid">
                        <div className="form-field">
                          <label htmlFor={`feed-edit-type-${post.id}`}>
                            Tipo
                          </label>
                          <select
                            id={`feed-edit-type-${post.id}`}
                            value={editingPostType}
                            onChange={(event) =>
                              setEditingPostType(
                                event.target.value as FeedPostType,
                              )
                            }
                          >
                            <option value="GENERAL">Atualizacao</option>
                            <option value="ADOPTION_SUCCESS">
                              Adocao realizada
                            </option>
                            <option value="ANIMAL_UPDATE">
                              Noticia de animal
                            </option>
                          </select>
                        </div>

                        <div className="form-field">
                          <label htmlFor={`feed-edit-animal-${post.id}`}>
                            Animal
                          </label>
                          <select
                            id={`feed-edit-animal-${post.id}`}
                            value={editingAnimalId}
                            onChange={(event) =>
                              setEditingAnimalId(event.target.value)
                            }
                          >
                            <option value="">Sem alteracao</option>
                            {animals.map((animal) => (
                              <option key={animal.id} value={animal.id}>
                                {animal.animalName} - {animal.species}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="actions">
                        <button
                          className="button"
                          type="button"
                          disabled={updatingPostId === post.id}
                          onClick={() => handleUpdatePost(post.id)}
                        >
                          {updatingPostId === post.id
                            ? 'Salvando...'
                            : 'Salvar'}
                        </button>
                        <button
                          className="button button--secondary"
                          type="button"
                          onClick={cancelEditingPost}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p>{post.content}</p>

                      {post.imageUrl && (
                        <img
                          className="feed-post__image"
                          src={post.imageUrl}
                          alt=""
                        />
                      )}

                      {post.animalId && (
                        <Link
                          className="feed-post__animal-link"
                          to={`/animals/${post.animalId}`}
                        >
                          Ver animal: {post.animalName ?? 'detalhes'}
                        </Link>
                      )}

                      {canManage && (
                        <div className="feed-post__actions">
                          <button
                            className="button button--secondary"
                            type="button"
                            onClick={() => startEditingPost(post)}
                          >
                            Editar
                          </button>
                          <button
                            className="button button--danger"
                            type="button"
                            disabled={deletingPostId === post.id}
                            onClick={() => handleDeletePost(post.id)}
                          >
                            {deletingPostId === post.id
                              ? 'Removendo...'
                              : 'Remover'}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
