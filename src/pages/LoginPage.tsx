import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { resendEmailConfirmation } from '../services/authService'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'

export function LoginPage() {
  
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResendingEmail, setIsResendingEmail] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setIsSubmitting(true)

    try {
      await login({ email, password })
      navigate('/')
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleResendConfirmation() {
    if (!email) {
      setErrorMessage('Informe seu email para reenviar a confirmacao.')
      return
    }

    setErrorMessage('')
    setSuccessMessage('')
    setIsResendingEmail(true)

    try {
      const response = await resendEmailConfirmation(email)
      setSuccessMessage(response.message || 'Email de confirmacao reenviado.')
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsResendingEmail(false)
    }
  }

  const shouldShowResendConfirmation =
    errorMessage.toLowerCase().includes('email') &&
    errorMessage.toLowerCase().includes('confirm')

  return (
    <section className="auth-page">
      <div className="auth-copy">
        <p className="eyebrow">Acesso</p>
        <h1>Entre na sua conta</h1>
        <p>
          Use seu email e senha para acessar os animais, pedidos e ferramentas
          da plataforma.
        </p>
      </div>

      <form className="form-panel" onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="ana@email.com"
            required
            autoComplete="email"
          />
        </div>

        <div className="form-field">
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Sua senha"
            required
            autoComplete="current-password"
          />
        </div>

        {errorMessage && <p className="form-error">{errorMessage}</p>}
        {successMessage && <p className="form-success">{successMessage}</p>}

        <div className="actions">
          <button className="button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
          {shouldShowResendConfirmation && (
            <button
              className="button button--secondary"
              type="button"
              disabled={isResendingEmail}
              onClick={handleResendConfirmation}
            >
              {isResendingEmail ? 'Reenviando...' : 'Reenviar email'}
            </button>
          )}
          <Link className="button button--secondary" to="/register">
            Registre-se
          </Link>
          <Link className="button button--secondary" to="/">
            Voltar
          </Link>
        </div>
      </form>
    </section>
  )
}
