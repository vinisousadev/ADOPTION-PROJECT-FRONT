import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { confirmEmail } from '../services/authService'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'

export function ConfirmEmailPage() {
  const [searchParams] = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')

    if (!token) {
      setErrorMessage('Token de confirmacao nao encontrado.')
      setIsLoading(false)
      return
    }

    const confirmationToken = token

    async function handleConfirmEmail() {
      try {
        const response = await confirmEmail(confirmationToken)
        setSuccessMessage(response.message || 'Email confirmado com sucesso.')
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error))
      } finally {
        setIsLoading(false)
      }
    }

    handleConfirmEmail()
  }, [searchParams])

  return (
    <section className="auth-page">
      <div className="auth-copy">
        <p className="eyebrow">Confirmacao</p>
        <h1>Confirme seu email</h1>
        <p>
          Esta etapa protege sua conta e ajuda a manter a comunidade mais
          segura.
        </p>
      </div>

      <div className="form-panel">
        {isLoading && <p className="form-success">Confirmando email...</p>}
        {successMessage && <p className="form-success">{successMessage}</p>}
        {errorMessage && <p className="form-error">{errorMessage}</p>}

        <div className="actions">
          <Link className="button" to="/login">
            Ir para login
          </Link>
          <Link className="button button--secondary" to="/">
            Voltar ao inicio
          </Link>
        </div>
      </div>
    </section>
  )
}
