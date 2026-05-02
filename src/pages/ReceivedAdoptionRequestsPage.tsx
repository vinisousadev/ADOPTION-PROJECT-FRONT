import { useEffect, useState } from 'react'
import { AdoptionRequestCard } from '../components/AdoptionRequestCard'
import {
  approveAdoptionRequest,
  getReceivedAdoptionRequests,
  rejectAdoptionRequest,
} from '../services/adoptionRequestService'
import type { AdoptionRequestResponse } from '../types'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'

export function ReceivedAdoptionRequestsPage() {
  const [requests, setRequests] = useState<AdoptionRequestResponse[]>([])
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [actionRequestId, setActionRequestId] = useState<number | null>(null)

  useEffect(() => {
    async function loadRequests() {
      try {
        const response = await getReceivedAdoptionRequests()
        setRequests(response.content)
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error))
      } finally {
        setIsLoading(false)
      }
    }

    loadRequests()
  }, [])

  async function handleApproveRequest(requestId: number) {
    setErrorMessage('')
    setSuccessMessage('')
    setActionRequestId(requestId)

    try {
      const updatedRequest = await approveAdoptionRequest(requestId)
      setRequests((currentRequests) =>
        currentRequests.map((request) =>
          request.id === requestId ? updatedRequest : request,
        ),
      )
      setSuccessMessage('Solicitacao aprovada com sucesso.')
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setActionRequestId(null)
    }
  }

  async function handleRejectRequest(requestId: number) {
    setErrorMessage('')
    setSuccessMessage('')
    setActionRequestId(requestId)

    try {
      const updatedRequest = await rejectAdoptionRequest(requestId)
      setRequests((currentRequests) =>
        currentRequests.map((request) =>
          request.id === requestId ? updatedRequest : request,
        ),
      )
      setSuccessMessage('Solicitacao rejeitada com sucesso.')
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
        <h1>Solicitacoes recebidas</h1>
      </div>

      <p>Analise os pedidos enviados para os animais que voce cadastrou.</p>

      {isLoading && <p>Carregando solicitacoes...</p>}
      {errorMessage && <p className="form-error">{errorMessage}</p>}
      {successMessage && <p className="form-success">{successMessage}</p>}

      {!isLoading && !errorMessage && requests.length === 0 && (
        <p className="empty-state">Voce ainda nao recebeu solicitacoes.</p>
      )}

      {requests.length > 0 && (
        <div className="request-grid">
          {requests.map((request) => (
            <AdoptionRequestCard
              key={request.id}
              request={request}
              variant="received"
            >
              {request.status === 'PENDING' && (
                <>
                  <button
                    className="button"
                    type="button"
                    disabled={actionRequestId === request.id}
                    onClick={() => handleApproveRequest(request.id)}
                  >
                    {actionRequestId === request.id ? 'Aprovando...' : 'Aprovar'}
                  </button>
                  <button
                    className="button button--danger"
                    type="button"
                    disabled={actionRequestId === request.id}
                    onClick={() => handleRejectRequest(request.id)}
                  >
                    {actionRequestId === request.id ? 'Rejeitando...' : 'Rejeitar'}
                  </button>
                </>
              )}
            </AdoptionRequestCard>
          ))}
        </div>
      )}
    </section>
  )
}
