import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  createFeedPostComment,
  getFeedPostComments,
  likeFeedPost,
  unlikeFeedPost,
} from '../services/feedPostService'
import type { FeedPostCommentResponse, FeedPostResponse } from '../types'
import { formatFeedDate } from '../utils/feedPostFormatters'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'
import { getInitials } from '../utils/getInitials'
import { modalMotion } from '../utils/motionVariants'
import { FeedPostEditor } from './FeedPostEditor'

function LikeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 10v10" />
      <path d="M7 11 11.8 4.8c.9-1.2 2.8-.5 2.8 1v3.1H19c1.1 0 2 .9 1.8 2l-1 6.6c-.2 1-1 1.7-2 1.7H7" />
      <path d="M3.5 10.5h3.5v9H3.5z" />
    </svg>
  )
}

function CommentIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 5.5h14v10H8l-3 3v-13Z" />
      <path d="M8.5 9.5h7" />
      <path d="M8.5 12.5h4.5" />
    </svg>
  )
}

function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 12h.01" />
      <path d="M19 12h.01" />
      <path d="M5 12h.01" />
    </svg>
  )
}

type FeedPostCardProps = {
  post: FeedPostResponse
  currentUserId?: number
  currentUserName?: string
  currentUserProfilePhotoUrl?: string
  isEditing: boolean
  editingContent: string
  isDeleting: boolean
  isSaving: boolean
  onCancelEditing: () => void
  onDelete: (postId: number) => void
  onEdit: (post: FeedPostResponse) => void
  onEditingContentChange: (value: string) => void
  onSaveEditing: (postId: number) => void
}

export function FeedPostCard({
  post,
  currentUserId,
  currentUserName = 'Usuario',
  currentUserProfilePhotoUrl,
  isEditing,
  editingContent,
  isDeleting,
  isSaving,
  onCancelEditing,
  onDelete,
  onEdit,
  onEditingContentChange,
  onSaveEditing,
}: FeedPostCardProps) {
  const canManage = currentUserId === post.authorUserId
  const commentTextareaRef = useRef<HTMLTextAreaElement | null>(null)
  const actionsMenuRef = useRef<HTMLDivElement | null>(null)
  const emojiMenuRef = useRef<HTMLDivElement | null>(null)
  const [isLiked, setIsLiked] = useState(post.likedByCurrentUser)
  const [likeCount, setLikeCount] = useState(post.likeCount)
  const [commentCount, setCommentCount] = useState(post.commentCount)
  const [comments, setComments] = useState<FeedPostCommentResponse[]>([])
  const [commentText, setCommentText] = useState('')
  const [isPostModalOpen, setIsPostModalOpen] = useState(false)
  const [isEmojiMenuOpen, setIsEmojiMenuOpen] = useState(false)
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [isTogglingLike, setIsTogglingLike] = useState(false)
  const [commentsPage, setCommentsPage] = useState(0)
  const [hasMoreComments, setHasMoreComments] = useState(false)
  const [interactionError, setInteractionError] = useState('')
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false)

  const emojiOptions = [
    '\u{1F60D}',
    '\u{1F970}',
    '\u{1F44F}',
    '\u{2764}\u{FE0F}',
    '\u{1F43E}',
    '\u{1F64F}',
  ]

  useEffect(() => {
    const textarea = commentTextareaRef.current

    if (!textarea) {
      return
    }

    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`
  }, [commentText, isPostModalOpen])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        actionsMenuRef.current &&
        !actionsMenuRef.current.contains(event.target as Node)
      ) {
        setIsActionsMenuOpen(false)
      }

      if (
        emojiMenuRef.current &&
        !emojiMenuRef.current.contains(event.target as Node)
      ) {
        setIsEmojiMenuOpen(false)
      }
    }

    if (isActionsMenuOpen || isEmojiMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isActionsMenuOpen, isEmojiMenuOpen])

  async function handleToggleLike() {
    if (isTogglingLike) {
      return
    }

    setInteractionError('')
    setIsTogglingLike(true)

    try {
      const response = isLiked
        ? await unlikeFeedPost(post.id)
        : await likeFeedPost(post.id)

      setIsLiked(response.liked)
      setLikeCount(response.likeCount)
    } catch (error) {
      setInteractionError(getApiErrorMessage(error))
    } finally {
      setIsTogglingLike(false)
    }
  }

  async function loadComments(page = 0) {
    if (isLoadingComments) {
      return
    }

    setIsLoadingComments(true)

    try {
      const response = await getFeedPostComments(post.id, page)
      setComments((currentComments) =>
        page === 0 ? response.content : [...currentComments, ...response.content],
      )
      setCommentsPage(response.page.number)
      setHasMoreComments(response.page.number + 1 < response.page.totalPages)
    } catch (error) {
      setInteractionError(getApiErrorMessage(error))
    } finally {
      setIsLoadingComments(false)
    }
  }

  function openPostModal() {
    if (!post.imageUrl) {
      return
    }

    setIsPostModalOpen(true)
    setInteractionError('')

    if (comments.length === 0) {
      void loadComments()
    }
  }

  function closePostModal() {
    setIsPostModalOpen(false)
    setIsEmojiMenuOpen(false)
  }

  async function handleSubmitComment(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault()

    if (isSubmittingComment) {
      return
    }

    const normalizedComment = commentText.trim()

    if (normalizedComment.length < 2) {
      setInteractionError('Escreva um comentario antes de enviar.')
      return
    }

    setInteractionError('')
    setIsSubmittingComment(true)

    try {
      const createdComment = await createFeedPostComment(post.id, {
        content: normalizedComment,
      })

      setComments((currentComments) => [createdComment, ...currentComments])
      setCommentCount((currentCount) => currentCount + 1)
      setCommentText('')
      setIsEmojiMenuOpen(false)
    } catch (error) {
      setInteractionError(getApiErrorMessage(error))
    } finally {
      setIsSubmittingComment(false)
    }
  }

  function appendEmoji(emoji: string) {
    setCommentText((currentText) => `${currentText}${emoji}`)
  }

  const authorRoleLabel = post.authorRoleLabel === 'ONG' ? 'ONG' : 'Protetor'
  const hasCommentText = commentText.trim().length > 0

  return (
    <>
      <article className="feed-post">
        <div className="feed-post__top">
          <button
            className="feed-post__avatar feed-post__avatar--button"
            type="button"
            onClick={openPostModal}
            disabled={!post.imageUrl}
            aria-label="Abrir publicacao"
          >
            {post.authorProfilePhotoUrl ? (
              <img src={post.authorProfilePhotoUrl} alt="" />
            ) : (
              <span>{getInitials(post.authorName)}</span>
            )}
          </button>

          <header
            className={
              post.imageUrl
                ? 'feed-post__header feed-post__header--clickable'
                : 'feed-post__header'
            }
            onClick={openPostModal}
            role={post.imageUrl ? 'button' : undefined}
            tabIndex={post.imageUrl ? 0 : undefined}
            onKeyDown={(event) => {
              if (!post.imageUrl) {
                return
              }

              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                openPostModal()
              }
            }}
          >
            <div>
              {post.authorUserId === currentUserId ? (
                <Link to="/profile" onClick={(event) => event.stopPropagation()}>
                  {post.authorName}
                </Link>
              ) : (
                <span>{post.authorName}</span>
              )}
              <span className="feed-post__author-role">{authorRoleLabel}</span>
              <span>{formatFeedDate(post.createdAt)}</span>
            </div>

            {canManage && !isEditing && (
              <div
                ref={actionsMenuRef}
                className="feed-post__menu"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  className="feed-post__menu-trigger"
                  type="button"
                  onClick={() =>
                    setIsActionsMenuOpen((currentValue) => !currentValue)
                  }
                  aria-expanded={isActionsMenuOpen}
                  aria-label="Abrir opcoes do post"
                >
                  <MoreIcon />
                </button>

                <AnimatePresence>
                  {isActionsMenuOpen && (
                    <motion.div
                      className="feed-post__menu-dropdown"
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.16 }}
                    >
                    <button
                      type="button"
                      onClick={() => {
                        setIsActionsMenuOpen(false)
                        onEdit(post)
                      }}
                    >
                      Editar post
                    </button>
                    <button
                      className="feed-post__menu-danger"
                      type="button"
                      disabled={isDeleting}
                      onClick={() => {
                        setIsActionsMenuOpen(false)
                        onDelete(post.id)
                      }}
                    >
                      {isDeleting ? 'Removendo...' : 'Remover'}
                    </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </header>
        </div>

        <div className="feed-post__body">
          {isEditing ? (
            <FeedPostEditor
              content={editingContent}
              postId={post.id}
              isSaving={isSaving}
              onCancel={onCancelEditing}
              onContentChange={onEditingContentChange}
              onSave={onSaveEditing}
            />
          ) : (
            <>
              <div
                className={
                  post.imageUrl
                    ? 'feed-post__open-area feed-post__open-area--clickable'
                    : 'feed-post__open-area'
                }
                onClick={openPostModal}
                role={post.imageUrl ? 'button' : undefined}
                tabIndex={post.imageUrl ? 0 : undefined}
                onKeyDown={(event) => {
                  if (!post.imageUrl) {
                    return
                  }

                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    openPostModal()
                  }
                }}
                aria-label={post.imageUrl ? 'Abrir publicacao' : undefined}
              >
                <p>{post.content}</p>

                {post.imageUrl && (
                  <img
                    className="feed-post__image"
                    src={post.imageUrl}
                    alt=""
                  />
                )}
              </div>

              {post.animalId && (
                <Link
                  className="button button--secondary feed-post__animal-link"
                  to={`/animals/${post.animalId}`}
                >
                  Conheça {post.animalName ? `: ${post.animalName}` : ''}
                </Link>
              )}

              <div className="feed-post__social-summary">
                <span>{likeCount} curtidas</span>
                <span>{commentCount} comentarios</span>
              </div>

              <div className="feed-post__social-actions">
                <button
                  className={isLiked ? 'is-active' : ''}
                  type="button"
                  disabled={isTogglingLike}
                  onClick={handleToggleLike}
                >
                  <LikeIcon />
                  Curtir
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (post.imageUrl) {
                      openPostModal()
                    }
                  }}
                  disabled={!post.imageUrl}
                >
                  <CommentIcon />
                  Comentar
                </button>
              </div>

              {interactionError && (
                <p className="feed-post__interaction-error">
                  {interactionError}
                </p>
              )}
            </>
          )}
        </div>
      </article>

      <AnimatePresence>
        {isPostModalOpen && (
        <motion.div
          className="modal-backdrop feed-post-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.article className="feed-post-modal" {...modalMotion}>
            <button
              className="feed-post-modal__close"
              type="button"
              onClick={closePostModal}
              aria-label="Fechar publicacao"
            >
              x
            </button>

            <div className="feed-post-modal__media">
              {post.imageUrl ? (
                <img src={post.imageUrl} alt="" />
              ) : (
                <div className="feed-post-modal__empty-media">
                  Publicacao sem foto
                </div>
              )}
            </div>

            <div className="feed-post-modal__details">
              <div className="feed-post-modal__author">
                <div className="feed-post__avatar">
                  {post.authorProfilePhotoUrl ? (
                    <img src={post.authorProfilePhotoUrl} alt="" />
                  ) : (
                    <span>{getInitials(post.authorName)}</span>
                  )}
                </div>

                <div>
                  {post.authorUserId === currentUserId ? (
                    <Link to="/profile">{post.authorName}</Link>
                  ) : (
                    <strong>{post.authorName}</strong>
                  )}
                  <span>{authorRoleLabel}</span>
                  <small>{formatFeedDate(post.createdAt)}</small>
                </div>
              </div>

              <p className="feed-post-modal__content">{post.content}</p>

              {post.animalId && (
                <Link
                  className="button button--secondary feed-post-modal__animal-link"
                  to={`/animals/${post.animalId}`}
                  onClick={closePostModal}
                >
                  Conheça{post.animalName ? `: ${post.animalName}` : ''}
                </Link>
              )}

              <div className="feed-post__social-summary">
                <span>{likeCount} curtidas</span>
                <span>{commentCount} comentarios</span>
              </div>

              <div className="feed-post__social-actions">
                <button
                  className={isLiked ? 'is-active' : ''}
                  type="button"
                  disabled={isTogglingLike}
                  onClick={handleToggleLike}
                >
                  <LikeIcon />
                  Curtir
                </button>
                <button
                  type="button"
                  onClick={() => commentTextareaRef.current?.focus()}
                >
                  <CommentIcon />
                  Comentar
                </button>
              </div>

              {interactionError && (
                <p className="feed-post__interaction-error">
                  {interactionError}
                </p>
              )}

              <div className="feed-post__comments feed-post-modal__comments">
                <div className="feed-post__comment-composer">
                  <div className="feed-post__comment-avatar">
                    {currentUserProfilePhotoUrl ? (
                      <img src={currentUserProfilePhotoUrl} alt="" />
                    ) : (
                      <span>{getInitials(currentUserName)}</span>
                    )}
                  </div>

                  <form
                    className="feed-post__comment-field"
                    onSubmit={handleSubmitComment}
                  >
                    <div className="feed-post__comment-input-wrap">
                      <textarea
                        ref={commentTextareaRef}
                        value={commentText}
                        onChange={(event) => setCommentText(event.target.value)}
                        placeholder="Adicionar comentario..."
                        rows={1}
                        maxLength={500}
                      />

                      <div
                        ref={emojiMenuRef}
                        className="feed-post__emoji-wrapper"
                      >
                        <button
                          className="feed-post__emoji-button"
                          type="button"
                          onClick={() =>
                            setIsEmojiMenuOpen((currentValue) => !currentValue)
                          }
                          aria-expanded={isEmojiMenuOpen}
                          aria-label="Abrir emojis"
                        >
                          {'\u{1F642}'}
                        </button>

                        <AnimatePresence>
                          {isEmojiMenuOpen && (
                          <motion.div
                            className="feed-post__emoji-menu"
                            initial={{ opacity: 0, y: 8, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.98 }}
                            transition={{ duration: 0.16 }}
                          >
                            {emojiOptions.map((emoji) => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => appendEmoji(emoji)}
                              >
                                {emoji}
                              </button>
                            ))}
                          </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {hasCommentText && (
                        <button
                          className="feed-post__comment-submit"
                          type="submit"
                          disabled={isSubmittingComment}
                        >
                          {isSubmittingComment ? '...' : 'Enviar'}
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {isLoadingComments && <p>Carregando comentarios...</p>}

                {comments.length > 0 ? (
                  <div className="feed-post-modal__comment-scroll">
                    <div className="feed-post__comment-list">
                      {comments.map((comment) => (
                        <article
                          className="feed-post__comment"
                          key={comment.id}
                        >
                          <div className="feed-post__comment-avatar">
                            {comment.authorProfilePhotoUrl ? (
                              <img src={comment.authorProfilePhotoUrl} alt="" />
                            ) : (
                              <span>{getInitials(comment.authorName)}</span>
                            )}
                          </div>
                          <div>
                            <strong>{comment.authorName}</strong>
                            <p>{comment.content}</p>
                          </div>
                        </article>
                      ))}
                    </div>

                    {hasMoreComments && (
                      <button
                        className="feed-post-modal__more-comments"
                        type="button"
                        disabled={isLoadingComments}
                        onClick={() => loadComments(commentsPage + 1)}
                      >
                        {isLoadingComments
                          ? 'Carregando...'
                          : 'Ver mais comentarios'}
                      </button>
                    )}
                  </div>
                ) : (
                  !isLoadingComments && (
                    <p className="feed-post-modal__empty-comments">
                      Nenhum comentario ainda.
                    </p>
                  )
                )}
              </div>
            </div>
          </motion.article>
        </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
