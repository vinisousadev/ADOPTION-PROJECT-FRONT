import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  getAdoptionRequestMessages,
  sendAdoptionRequestMessage,
} from '../services/adoptionRequestService'
import type {
  AdoptionRequestMessageResponse,
  AdoptionRequestResponse,
} from '../types'
import {
  formatAdoptionRequestStatus,
  formatDateTime,
} from '../utils/adoptionRequestFormatters'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'

type AdoptionRequestChatModalProps = {
  request: AdoptionRequestResponse
  variant: 'sent' | 'received'
  onClose: () => void
}

function getInitials(name?: string) {
  if (!name) {
    return 'A'
  }

  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function ChatAvatar({
  name,
  photoUrl,
}: {
  name?: string
  photoUrl?: string
}) {
  return (
    <span className="adoption-chat__avatar" aria-hidden="true">
      {photoUrl ? <img src={photoUrl} alt="" /> : getInitials(name)}
    </span>
  )
}

export function AdoptionRequestChatModal({
  request,
  variant,
  onClose,
}: AdoptionRequestChatModalProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<AdoptionRequestMessageResponse[]>([])
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const messageListRef = useRef<HTMLDivElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const participantName =
    variant === 'sent'
      ? request.ownerName || 'Responsavel nao informado'
      : request.requesterName || 'Solicitante nao informado'

  const canSendMessage =
    request.status === 'PENDING' || request.status === 'APPROVED'

  useEffect(() => {
    async function loadMessages(showLoading = false) {
      setErrorMessage('')

      if (showLoading) {
        setIsLoading(true)
      }

      try {
        const response = await getAdoptionRequestMessages(request.id)
        setMessages(response.content)
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error))
      } finally {
        if (showLoading) {
          setIsLoading(false)
        }
      }
    }

    loadMessages(true)

    const intervalId = window.setInterval(() => {
      loadMessages()
    }, 10000)

    return () => window.clearInterval(intervalId)
  }, [request.id])

  useEffect(() => {
    if (!messageListRef.current) {
      return
    }

    messageListRef.current.scrollTop = messageListRef.current.scrollHeight
  }, [messages])

  function handleTextareaChange(value: string) {
    setMessage(value)

    if (!textareaRef.current) {
      return
    }

    textareaRef.current.style.height = 'auto'
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedMessage = message.trim()

    if (!trimmedMessage) {
      return
    }

    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const savedMessage = await sendAdoptionRequestMessage(request.id, {
        message: trimmedMessage,
      })

      setMessages((currentMessages) => [...currentMessages, savedMessage])
      setMessage('')

      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="modal-backdrop adoption-chat-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <section
        className="adoption-chat-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="adoption-chat-title"
      >
        <header className="adoption-chat__header">
          <div>
            <p className="eyebrow">Conversa de adocao</p>
            <h2 id="adoption-chat-title">
              {request.animalName || `Animal #${request.animalId}`}
            </h2>
            <p>
              Conversa com <strong>{participantName}</strong>
            </p>
          </div>

          <button
            className="adoption-chat__close"
            type="button"
            aria-label="Fechar conversa"
            onClick={onClose}
          >
            x
          </button>
        </header>

        <div className="adoption-chat__summary">
          <span>{formatAdoptionRequestStatus(request.status)}</span>
          <Link to={`/animals/${request.animalId}`}>Ver animal</Link>
        </div>

        <div className="adoption-chat__messages" ref={messageListRef}>
          {isLoading && <p>Carregando conversa...</p>}

          {!isLoading && !errorMessage && messages.length === 0 && (
            <p className="adoption-chat__empty">
              Nenhuma mensagem ainda. Comece a conversa com cuidado e clareza.
            </p>
          )}

          {messages.map((chatMessage) => {
            const isOwnMessage = chatMessage.senderId === user?.userId

            return (
              <article
                className={`adoption-chat__message${
                  isOwnMessage ? ' adoption-chat__message--own' : ''
                }`}
                key={chatMessage.id}
              >
                <ChatAvatar
                  name={chatMessage.senderName}
                  photoUrl={chatMessage.senderProfilePhotoUrl}
                />
                <div>
                  <div className="adoption-chat__message-meta">
                    <strong>{chatMessage.senderName}</strong>
                    <span>{formatDateTime(chatMessage.createdAt)}</span>
                  </div>
                  <p>{chatMessage.message}</p>
                </div>
              </article>
            )
          })}
        </div>

        {errorMessage && <p className="form-error">{errorMessage}</p>}

        <form className="adoption-chat__composer" onSubmit={handleSubmit}>
          <ChatAvatar name={user?.name} />
          <div className="adoption-chat__input">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(event) => handleTextareaChange(event.target.value)}
              placeholder={
                canSendMessage
                  ? 'Escreva uma mensagem...'
                  : 'Conversa fechada para esta solicitacao.'
              }
              rows={1}
              disabled={!canSendMessage || isSubmitting}
              maxLength={1000}
            />
            <button
              className="button"
              type="submit"
              disabled={!canSendMessage || isSubmitting || !message.trim()}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
