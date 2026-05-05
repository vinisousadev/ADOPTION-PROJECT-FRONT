import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { FeedPostResponse } from '../types'
import { formatFeedDate } from '../utils/feedPostFormatters'
import { getInitials } from '../utils/getInitials'
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
  const [isLiked, setIsLiked] = useState(post.likedByCurrentUser)
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false)
  const likeCount = post.likeCount + (isLiked && !post.likedByCurrentUser ? 1 : 0)

  return (
    <article className="feed-post">
      <div className="feed-post__top">
        <div className="feed-post__avatar">
          {post.authorProfilePhotoUrl ? (
            <img src={post.authorProfilePhotoUrl} alt="" />
          ) : (
            <span>{getInitials(post.authorName)}</span>
          )}
        </div>

        <header className="feed-post__header">
          <div>
            {post.authorUserId === currentUserId ? (
              <Link to="/profile">{post.authorName}</Link>
            ) : (
              <span>{post.authorName}</span>
            )}
            <span className="feed-post__author-role">
              {post.authorRoleLabel === 'ONG' ? 'ONG' : 'Protetor'}
            </span>
            <span>{formatFeedDate(post.createdAt)}</span>
          </div>

          {canManage && !isEditing && (
            <div className="feed-post__menu">
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

              {isActionsMenuOpen && (
                <div className="feed-post__menu-dropdown">
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
                </div>
              )}
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
            <p>{post.content}</p>

            {post.imageUrl && (
              <img className="feed-post__image" src={post.imageUrl} alt="" />
            )}

            <div className="feed-post__social-summary">
              <span>{likeCount} curtidas</span>
              <span>{post.commentCount} comentarios</span>
            </div>

            <div className="feed-post__social-actions">
              <button
                className={isLiked ? 'is-active' : ''}
                type="button"
                onClick={() => setIsLiked((currentValue) => !currentValue)}
              >
                <LikeIcon />
                Curtir
              </button>
              <button type="button">
                <CommentIcon />
                Comentar
              </button>
            </div>
          </>
        )}
      </div>
    </article>
  )
}
