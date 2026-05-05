import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { Area } from 'react-easy-crop'
import { FeedComposer } from '../components/FeedComposer'
import { FeedPostCard } from '../components/FeedPostCard'
import { FeedProfileSidebar } from '../components/FeedProfileSidebar'
import { ImageCropper } from '../components/ImageCropper'
import { useAuth } from '../contexts/AuthContext'
import {
  createFeedPost,
  deleteFeedPost,
  getFeedPosts,
  patchFeedPost,
  uploadFeedPostPhoto,
} from '../services/feedPostService'
import { getUserById } from '../services/userService'
import type { FeedPostResponse, UserResponse } from '../types'
import { createCroppedImageFile } from '../utils/cropImage'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'

const MAX_FEED_PHOTO_SIZE = 4 * 1024 * 1024
const ALLOWED_FEED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function FeedPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserResponse | null>(null)
  const [posts, setPosts] = useState<FeedPostResponse[]>([])
  const [content, setContent] = useState('')
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null)
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState('')
  const [photoToCrop, setPhotoToCrop] = useState<File | null>(null)
  const [photoToCropPreview, setPhotoToCropPreview] = useState('')
  const [selectedVideoName, setSelectedVideoName] = useState('')
  const [isComposerOpen, setIsComposerOpen] = useState(false)
  const [editingPostId, setEditingPostId] = useState<number | null>(null)
  const [editingContent, setEditingContent] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingPostId, setDeletingPostId] = useState<number | null>(null)
  const [updatingPostId, setUpdatingPostId] = useState<number | null>(null)

  const profilePhotoUrl = profile?.profilePhotoUrl

  useEffect(() => {
    async function loadInitialData() {
      try {
        const postsResponse = await getFeedPosts()
        setPosts(postsResponse.content)
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

  useEffect(() => {
    if (!photoToCrop) {
      setPhotoToCropPreview('')
      return
    }

    const previewUrl = URL.createObjectURL(photoToCrop)
    setPhotoToCropPreview(previewUrl)

    return () => URL.revokeObjectURL(previewUrl)
  }, [photoToCrop])

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

    setPhotoToCrop(file)
  }

  function cancelPhotoCrop() {
    setPhotoToCrop(null)
    setPhotoToCropPreview('')
  }

  async function confirmPhotoCrop(croppedAreaPixels: Area) {
    if (!photoToCrop || !photoToCropPreview) {
      return
    }

    try {
      const croppedPhoto = await createCroppedImageFile(
        photoToCropPreview,
        croppedAreaPixels,
        photoToCrop.name || 'feed-photo.jpg',
      )

      setSelectedPhoto(croppedPhoto)
      cancelPhotoCrop()
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    }
  }

  function clearComposer() {
    setContent('')
    setSelectedPhoto(null)
    setSelectedPhotoPreview('')
    setPhotoToCrop(null)
    setPhotoToCropPreview('')
    setSelectedVideoName('')
  }

  function closeComposer() {
    setIsComposerOpen(false)
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
      let createdPost = await createFeedPost({
        content: content.trim(),
      })

      if (selectedPhoto) {
        createdPost = await uploadFeedPostPhoto(createdPost.id, selectedPhoto)
      }

      setPosts((currentPosts) => [createdPost, ...currentPosts])
      clearComposer()
      closeComposer()
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
    setErrorMessage('')
    setSuccessMessage('')
  }

  function cancelEditingPost() {
    setEditingPostId(null)
    setEditingContent('')
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
        content: editingContent.trim(),
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
      <div className="feed-layout">
        <FeedProfileSidebar user={user} profile={profile} postCount={posts.length} />

        <div className="feed-main-column">
          <FeedComposer
            authorName={user?.name ?? 'Usuario'}
            profilePhotoUrl={profilePhotoUrl}
            content={content}
            selectedPhotoPreview={selectedPhotoPreview}
            selectedVideoName={selectedVideoName}
            isOpen={isComposerOpen}
            isSubmitting={isSubmitting}
            onClose={closeComposer}
            onContentChange={setContent}
            onOpen={() => setIsComposerOpen(true)}
            onPhotoChange={handlePhotoChange}
            onRemovePhoto={() => setSelectedPhoto(null)}
            onSubmit={handleSubmit}
            onVideoChange={setSelectedVideoName}
          />

          {errorMessage && <p className="form-error">{errorMessage}</p>}
          {successMessage && <p className="form-success">{successMessage}</p>}
          {isLoading && <p>Carregando feed...</p>}

          {!isLoading && !errorMessage && posts.length === 0 && (
            <div className="feed-empty-state">
              <span>Feed vazio</span>
              <h2>Compartilhe a primeira novidade</h2>
              <p>
                Publique uma atualizacao, uma foto ou uma historia de adocao
                para movimentar a comunidade.
              </p>
            </div>
          )}

          {posts.length > 0 && (
            <div className="feed-list">
              {posts.map((post) => (
                <FeedPostCard
                  key={post.id}
                  post={post}
                  currentUserId={user?.userId}
                  isEditing={editingPostId === post.id}
                  editingContent={editingContent}
                  isDeleting={deletingPostId === post.id}
                  isSaving={updatingPostId === post.id}
                  onCancelEditing={cancelEditingPost}
                  onDelete={handleDeletePost}
                  onEdit={startEditingPost}
                  onEditingContentChange={setEditingContent}
                  onSaveEditing={handleUpdatePost}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {photoToCropPreview && (
        <div className="modal-backdrop">
          <div className="feed-photo-crop-modal">
            <div className="profile-photo-modal__header">
              <div>
                <h2>Ajustar foto do post</h2>
                <p>Recorte a imagem para ela encaixar melhor no feed.</p>
              </div>
              <button
                className="terms-modal__close"
                type="button"
                onClick={cancelPhotoCrop}
                aria-label="Fechar"
              >
                x
              </button>
            </div>

            <ImageCropper
              imageSrc={photoToCropPreview}
              aspect={4 / 3}
              confirmLabel="Usar foto"
              onCancel={cancelPhotoCrop}
              onConfirm={confirmPhotoCrop}
            />
          </div>
        </div>
      )}
    </section>
  )
}
