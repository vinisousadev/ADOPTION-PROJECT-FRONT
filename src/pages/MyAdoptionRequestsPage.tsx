import { useEffect, useState } from 'react'
import { AdoptionRequestCard } from '../components/AdoptionRequestCard'
import {
  cancelAdoptionRequest,
  getMyAdoptionRequests,
} from '../services/adoptionRequestService'
import type { AdoptionRequestResponse } from '../types'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'

export function MyAdoptionRequestsPage() {
  const [requests, setRequests] = useState<AdoptionRequestResponse[]>([])
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [actionRequestId, setActionRequestId] = useState<number | null>(null)

  useEffect(() => {
    async function loadRequests() {
      try {
        const response = await getMyAdoptionRequests()
        setRequests(response.content)
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error))
      } finally {
        setIsLoading(false)
      }
    }

    loadRequests()
  }, [])

  async function handleCancelRequest(requestId: number) {
    const shouldCancel = window.confirm('Deseja cancelar esta solicitacao?')

    if (!shouldCancel) {
      return
    }

    setErrorMessage('')
    setSuccessMessage('')
    setActionRequestId(requestId)

    try {
      const updatedRequest = await cancelAdoptionRequest(requestId)
      setRequests((currentRequests) =>
        currentRequests.map((request) =>
          request.id === requestId ? updatedRequest : request,
        ),
      )
      setSuccessMessage('Solicitacao cancelada com sucesso.')
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setActionRequestId(null)
    }
  }

  return (
    <section className="page">
      <div>
        <p className="eyebrow">Adocoes</p>
        <h1>Minhas solicitacoes</h1>
      </div>

      <p>Acompanhe os pedidos de adocao que voce enviou.</p>

      {isLoading && <p>Carregando solicitacoes...</p>}
      {errorMessage && <p className="form-error">{errorMessage}</p>}
      {successMessage && <p className="form-success">{successMessage}</p>}

      {!isLoading && !errorMessage && requests.length === 0 && (
        <p className="empty-state">Voce ainda nao enviou solicitacoes.</p>
      )}

      {requests.length > 0 && (
        <div className="request-grid">
          {requests.map((request) => (
            <AdoptionRequestCard
              key={request.id}
              request={request}
              variant="sent"
            >
              {request.status === 'PENDING' && (
                <button
                  className="button button--danger"
                  type="button"
                  disabled={actionRequestId === request.id}
                  onClick={() => handleCancelRequest(request.id)}
                >
                  {actionRequestId === request.id ? 'Cancelando...' : 'Cancelar'}
                </button>
              )}
            </AdoptionRequestCard>
          ))}
        </div>
      )}
    </section>
  )
}
