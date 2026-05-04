import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getUserById } from '../services/userService'
import type { UserResponse } from '../types'

function formatUserType(userType: string) {
  return userType === 'ADMIN' ? 'Administrador' : 'Usuario comum'
}

function formatOptionalValue(value?: string) {
  return value || 'Nao informado'
}

export function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [profileNotice, setProfileNotice] = useState('')

  useEffect(() => {
    async function loadProfile() {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        const userResponse = await getUserById(user.userId)
        setProfile(userResponse)
      } catch {
        setProfileNotice(
          'O backend ainda nao permite buscar todos os dados do perfil para usuario comum. Exibindo os dados da sessao.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [user])

  if (!user) {
    return null
  }

  if (isLoading) {
    return (
      <section className="page">
        <p>Carregando perfil...</p>
      </section>
    )
  }

  const profileName = profile?.name ?? user.name
  const profileEmail = profile?.email ?? user.email
  const profileUserType = profile?.userType ?? user.userType

  return (
    <section className="profile-page">
      <div className="profile-header">
        <div>
          <p className="eyebrow">Meu perfil</p>
          <h1>{profileName}</h1>
          <p>Consulte seus dados de acesso e informacoes cadastradas.</p>
        </div>

        <div className="profile-avatar" aria-hidden="true">
          {profileName.charAt(0).toUpperCase()}
        </div>
      </div>

      {profileNotice && <p className="empty-state">{profileNotice}</p>}

      <dl className="profile-details">
        <div>
          <dt>Nome</dt>
          <dd>{profileName}</dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>{profileEmail}</dd>
        </div>
        <div>
          <dt>Tipo de usuario</dt>
          <dd>{formatUserType(profileUserType)}</dd>
        </div>
        <div>
          <dt>CPF</dt>
          <dd>{formatOptionalValue(profile?.cpf)}</dd>
        </div>
        <div>
          <dt>Telefone</dt>
          <dd>{formatOptionalValue(profile?.phone)}</dd>
        </div>
        <div>
          <dt>Cidade</dt>
          <dd>{formatOptionalValue(profile?.city)}</dd>
        </div>
        <div>
          <dt>Estado</dt>
          <dd>{formatOptionalValue(profile?.state)}</dd>
        </div>
        <div>
          <dt>Cadastro</dt>
          <dd>
            {profile?.registrationDate
              ? new Date(profile.registrationDate).toLocaleDateString('pt-BR')
              : 'Nao informado'}
          </dd>
        </div>
      </dl>

      <div className="actions">
        <Link className="button" to="/my-animals">
          Meus animais
        </Link>
        <Link className="button button--secondary" to="/my-adoption-requests">
          Meus pedidos
        </Link>
      </div>
    </section>
  )
}
