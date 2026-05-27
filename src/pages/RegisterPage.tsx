import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  getBrazilianStates,
  getCitiesByState,
} from '../services/locationService'
import { createUser } from '../services/userService'
import type { BrazilianCity, BrazilianState, UserRoleLabel } from '../types'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'
import { onlyDigits } from '../utils/onlyDigits'

type RegisterFormState = {
  name: string
  phone: string
  email: string
  city: string
  state: string
  roleLabel: UserRoleLabel
  password: string
}

const initialFormState: RegisterFormState = {
  name: '',
  phone: '',
  email: '',
  city: '',
  state: '',
  roleLabel: 'PROTETOR',
  password: '',
}

export function RegisterPage() {
  const [form, setForm] = useState(initialFormState)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [states, setStates] = useState<BrazilianState[]>([])
  const [cities, setCities] = useState<BrazilianCity[]>([])
  const [isLoadingStates, setIsLoadingStates] = useState(false)
  const [isLoadingCities, setIsLoadingCities] = useState(false)

  useEffect(() => {
    async function loadStates() {
      setIsLoadingStates(true)

      try {
        const statesResponse = await getBrazilianStates()
        setStates(statesResponse)
      } catch {
        setErrorMessage('Nao foi possivel carregar os estados.')
      } finally {
        setIsLoadingStates(false)
      }
    }

    loadStates()
  }, [])

  useEffect(() => {
    if (!form.state) {
      setCities([])
      return
    }

    async function loadCities() {
      setIsLoadingCities(true)
      setCities([])

      try {
        const citiesResponse = await getCitiesByState(form.state)
        setCities(citiesResponse)
      } catch {
        setErrorMessage('Nao foi possivel carregar as cidades.')
      } finally {
        setIsLoadingCities(false)
      }
    }

    loadCities()
  }, [form.state])

  function updateField(field: keyof RegisterFormState, value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))
  }

  function validateForm() {
    if (form.name.trim().length < 3) {
      return 'Informe seu nome completo.'
    }

    if (form.phone && onlyDigits(form.phone).length < 10) {
      return 'Informe um telefone com DDD.'
    }

    if (!form.email.includes('@')) {
      return 'Informe um email valido.'
    }

    if (!form.state) {
      return 'Selecione um estado.'
    }

    if (!form.city) {
      return 'Selecione uma cidade.'
    }

    if (form.password.length < 6) {
      return 'A senha deve ter pelo menos 6 caracteres.'
    }

    return ''
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    const validationError = validateForm()

    if (validationError) {
      setErrorMessage(validationError)
      return
    }

    setIsSubmitting(true)

    try {
      const cleanedPhone = onlyDigits(form.phone)

      await createUser({
        name: form.name.trim(),
        phone: cleanedPhone || undefined,
        email: form.email.trim(),
        city: form.city || undefined,
        state: form.state ? form.state.toUpperCase() : undefined,
        passwordHash: form.password,
        roleLabel: form.roleLabel,
      })

      setForm(initialFormState)
      setSuccessMessage(
        'Cadastro criado com sucesso. Enviamos um email para voce confirmar sua conta antes do login.',
      )
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth-page auth-page--wide">
      <div className="auth-copy">
        <p className="eyebrow">Cadastro</p>
        <h1>Crie sua conta</h1>
        <p>
          Preencha seus dados para acessar a plataforma, cadastrar animais e
          solicitar adocoes.
        </p>
      </div>

      <form className="form-panel" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="name">Nome completo</label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              placeholder="Ana Souza"
              required
              maxLength={100}
              autoComplete="name"
            />
          </div>

          <div className="form-field">
            <label htmlFor="phone">Telefone</label>
            <input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(event) =>
                updateField('phone', onlyDigits(event.target.value))
              }
              placeholder="83999999999"
              inputMode="numeric"
              maxLength={11}
              autoComplete="tel"
            />
          </div>

          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
              placeholder="ana@email.com"
              required
              maxLength={120}
              autoComplete="email"
            />
          </div>

          <div className="form-field">
            <label htmlFor="roleLabel">Tipo de perfil</label>
            <select
              id="roleLabel"
              value={form.roleLabel}
              onChange={(event) =>
                updateField('roleLabel', event.target.value as UserRoleLabel)
              }
              required
            >
              <option value="PROTETOR">Protetor</option>
              <option value="ONG">ONG</option>
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="state">Estado</label>
            <select
              id="state"
              value={form.state}
              onChange={(event) => {
                updateField('state', event.target.value)
                updateField('city', '')
              }}
              required
              disabled={isLoadingStates}
              autoComplete="address-level1"
            >
              <option value="">
                {isLoadingStates ? 'Carregando estados...' : 'Selecione'}
              </option>
              {states.map((state) => (
                <option key={state.id} value={state.abbreviation}>
                  {state.name} ({state.abbreviation})
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="city">Cidade</label>
            <select
              id="city"
              value={form.city}
              onChange={(event) => updateField('city', event.target.value)}
              required
              disabled={!form.state || isLoadingCities}
              autoComplete="address-level2"
            >
              <option value="">
                {isLoadingCities ? 'Carregando cidades...' : 'Selecione'}
              </option>
              {cities.map((city) => (
                <option key={city.id} value={city.name}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field form-field--full">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(event) => updateField('password', event.target.value)}
              placeholder="Minimo de 6 caracteres"
              required
              maxLength={255}
              autoComplete="new-password"
            />
          </div>
        </div>

        {errorMessage && <p className="form-error">{errorMessage}</p>}
        {successMessage && <p className="form-success">{successMessage}</p>}

        <div className="actions">
          <button className="button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Criando conta...' : 'Criar conta'}
          </button>
          <Link className="button button--secondary" to="/login">
            Ir para login
          </Link>
        </div>
      </form>
    </section>
  )
}
