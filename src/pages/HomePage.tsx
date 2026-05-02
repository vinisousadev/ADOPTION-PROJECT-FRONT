import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyAnimals } from '../services/animalService'
import type { AnimalResponse } from '../types'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'

export function HomePage() {
  const [myAnimals, setMyAnimals] = useState<AnimalResponse[]>([])
  const [protectedRouteMessage, setProtectedRouteMessage] = useState('')
  const [isLoadingProtectedRoute, setIsLoadingProtectedRoute] = useState(false)

  async function handleTestProtectedRoute() {
    setProtectedRouteMessage('')
    setIsLoadingProtectedRoute(true)

    try {
      const response = await getMyAnimals()

      setMyAnimals(response.content)
      setProtectedRouteMessage(
        `Rota protegida acessada com sucesso. Total: ${response.page.totalElements}.`,
      )
    } catch (error) {
      setProtectedRouteMessage(getApiErrorMessage(error))
      setMyAnimals([])
    } finally {
      setIsLoadingProtectedRoute(false)
    }
  }

  return (
    <section className="page">
      <h1>Frontend de adocao iniciado</h1>
      <p>
        A base do React com TypeScript ja esta usando rotas. A partir daqui,
        vamos encaixar login, sessao e as telas principais do sistema.
      </p>

      <div className="actions">
        <Link className="button" to="/login">
          Ir para login
        </Link>
      </div>

      <div className="test-panel">
        <div>
          <h2>Teste de rota protegida</h2>
          <p>
            Chama GET /animals/mine usando o token salvo apos o login.
          </p>
        </div>

        <button
          className="button"
          type="button"
          onClick={handleTestProtectedRoute}
          disabled={isLoadingProtectedRoute}
        >
          {isLoadingProtectedRoute ? 'Testando...' : 'Testar token'}
        </button>

        {protectedRouteMessage && (
          <p className="test-panel__message">{protectedRouteMessage}</p>
        )}

        {myAnimals.length > 0 && (
          <ul className="simple-list">
            {myAnimals.map((animal) => (
              <li key={animal.id}>{animal.animalName}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
