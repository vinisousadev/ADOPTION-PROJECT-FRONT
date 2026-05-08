import type { ReactNode } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { AdoptionRequestResponse } from '../types'
import { AdoptionRequestChatModal } from './AdoptionRequestChatModal'
import {
  formatAdoptionRequestStatus,
  formatDateTime,
  formatRequestLocation,
} from '../utils/adoptionRequestFormatters'

type AdoptionRequestCardProps = {
  request: AdoptionRequestResponse
  children?: ReactNode
  variant: 'sent' | 'received'
}

export function AdoptionRequestCard({
  request,
  children,
  variant,
}: AdoptionRequestCardProps) {
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <article className="request-card">
      <div className="request-card__header">
        <div>
          <h2>{request.animalName || `Animal #${request.animalId}`}</h2>
          <p>
            {variant === 'sent'
              ? `Responsavel: ${request.ownerName || 'Nao informado'}`
              : `Solicitante: ${request.requesterName || 'Nao informado'}`}
          </p>
        </div>
        <span>{formatAdoptionRequestStatus(request.status)}</span>
      </div>

      <dl>
        <div>
          <dt>Pedido em</dt>
          <dd>{formatDateTime(request.requestDate)}</dd>
        </div>
        <div>
          <dt>Resposta</dt>
          <dd>{formatDateTime(request.responseDate)}</dd>
        </div>
        <div>
          <dt>Localizacao</dt>
          <dd>{formatRequestLocation(request.ownerCity, request.ownerState)}</dd>
        </div>
      </dl>

      <div className="request-card__message">
        <strong>Mensagem</strong>
        <p>{request.message || 'Sem mensagem informada.'}</p>
      </div>

      <div className="actions request-card__actions">
        <div className="request-card__decision-actions">{children}</div>
        <div className="request-card__secondary-actions">
          <button
            className="button button--secondary"
            type="button"
            onClick={() => setIsChatOpen(true)}
          >
            Conversar
          </button>
          <Link
            className="button button--secondary"
            to={`/animals/${request.animalId}`}
          >
            Ver detalhes
          </Link>
        </div>
      </div>

      {isChatOpen && (
        <AdoptionRequestChatModal
          request={request}
          variant={variant}
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </article>
  )
}
