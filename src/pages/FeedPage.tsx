import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { Area } from 'react-easy-crop'
import { motion } from 'framer-motion'
import { FeedComposer } from '../components/FeedComposer'
import { FeedPostCard } from '../components/FeedPostCard'
import { FeedProfileSidebar } from '../components/FeedProfileSidebar'
import { ImageCropper } from '../components/ImageCropper'
import { useAuth } from '../contexts/AuthContext'
import { getMyAnimals } from '../services/animalService'
import {
  createFeedPost,
  deleteFeedPost,
  getFeedPosts,
  patchFeedPost,
  uploadFeedPostPhoto,
} from '../services/feedPostService'
import { getUserById } from '../services/userService'
import type { AnimalResponse, FeedPostResponse, UserResponse } from '../types'
import { createCroppedImageFile } from '../utils/cropImage'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'
import {
  pageMotion,
  staggerItemMotion,
} from '../utils/motionVariants'

const MAX_FEED_PHOTO_SIZE = 4 * 1024 * 1024
const ALLOWED_FEED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const feedListMotion = {
  initial: 'hidden',
  animate: 'visible',
  variants: {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
} as const

export function FeedPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserResponse | null>(null)
  const [myAnimals, setMyAnimals] = useState<AnimalResponse[]>([])
  const [posts, setPosts] = useState<FeedPostResponse[]>([])
  const [content, setContent] = useState('')
  const [selectedAnimalId, setSelectedAnimalId] = useState<number | null>(null)
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
  const availableAnimals = myAnimals.filter(
    (animal) => animal.status === 'AVAILABLE',
  )

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
        const [userProfile, myAnimalsResponse] = await Promise.all([
          getUserById(userId),
          getMyAnimals(),
        ])
        setProfile(userProfile)
        setMyAnimals(myAnimalsResponse.content)
      } catch {
        setProfile(null)
        setMyAnimals([])
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
    setSelectedAnimalId(null)
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
        animalId: selectedAnimalId ?? undefined,
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
    <motion.section className="feed-page" {...pageMotion}>
      <div className="feed-layout">
        <FeedProfileSidebar user={user} profile={profile} postCount={posts.length} />

        <motion.div
          className="feed-main-column"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.45, ease: 'easeOut' }}
        >
          <FeedComposer
            authorName={user?.name ?? 'Usuario'}
            profilePhotoUrl={profilePhotoUrl}
            animals={availableAnimals}
            content={content}
            selectedAnimalId={selectedAnimalId}
            selectedPhotoPreview={selectedPhotoPreview}
            selectedVideoName={selectedVideoName}
            errorMessage={isComposerOpen ? errorMessage : ''}
            isOpen={isComposerOpen}
            isSubmitting={isSubmitting}
            onClose={closeComposer}
            onContentChange={setContent}
            onOpen={() => setIsComposerOpen(true)}
            onAnimalSelect={setSelectedAnimalId}
            onPhotoChange={handlePhotoChange}
            onRemovePhoto={() => setSelectedPhoto(null)}
            onSubmit={handleSubmit}
            onVideoChange={setSelectedVideoName}
          />

          {errorMessage && !isComposerOpen && (
            <p className="form-error">{errorMessage}</p>
          )}
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
            <motion.div className="feed-list" {...feedListMotion}>
              {posts.map((post) => (
                <motion.div key={post.id} {...staggerItemMotion}>
                  <FeedPostCard
                    post={post}
                    currentUserId={user?.userId}
                    currentUserName={user?.name}
                    currentUserProfilePhotoUrl={profilePhotoUrl}
                    currentUserType={profile?.userType ?? user?.userType}
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
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
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
    </motion.section>
  )
}
