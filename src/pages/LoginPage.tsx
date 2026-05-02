import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../services/authService'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'

export function LoginPage() {
  
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const loginResponse = await login({ email, password })

      localStorage.setItem('adoption:token', loginResponse.token)
      localStorage.setItem(
        'adoption:user',
        JSON.stringify({
          userId: loginResponse.userId,
          name: loginResponse.name,
          email: loginResponse.email,
          userType: loginResponse.userType,
        }),
      )

      navigate('/')
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

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

        <div className="actions">
          <button className="button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
          <Link className="button button--secondary" to="/">
            Voltar
          </Link>
        </div>
      </form>
    </section>
  )
}
