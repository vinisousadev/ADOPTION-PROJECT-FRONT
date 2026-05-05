import { Link } from 'react-router-dom'
import type { AuthenticatedUser, UserResponse } from '../types'
import { getInitials } from '../utils/getInitials'

type FeedProfileSidebarProps = {
  user?: AuthenticatedUser | null
  profile?: UserResponse | null
  postCount: number
}

function getRoleLabel(userType?: UserResponse['userType']) {
  if (userType === 'ADMIN') {
    return 'ONG'
  }

  return 'Protetor'
}

function getLocation(profile?: UserResponse | null) {
  if (profile?.city && profile.state) {
    return `${profile.city}, ${profile.state}`
  }

  if (profile?.city) {
    return profile.city
  }

  if (profile?.state) {
    return profile.state
  }

  return 'Localizacao nao informada'
}

export function FeedProfileSidebar({
  user,
  profile,
  postCount,
}: FeedProfileSidebarProps) {
  const displayName = profile?.name ?? user?.name ?? 'Usuario'
  const photoUrl = profile?.profilePhotoUrl
  const roleLabel = getRoleLabel(profile?.userType)
  const location = getLocation(profile)

  return (
    <aside className="feed-profile-card" aria-label="Resumo do perfil">
      <Link className="feed-profile-card__avatar" to="/profile">
        {photoUrl ? (
          <img src={photoUrl} alt="Ir para perfil" />
        ) : (
          <span>{getInitials(displayName)}</span>
        )}
      </Link>

      <div className="feed-profile-card__body">
        <span className="feed-profile-card__role">{roleLabel}</span>
        <h2>{displayName}</h2>
        <p>{location}</p>
      </div>

      <div className="feed-profile-card__meta">
        <div>
          <strong>{postCount}</strong>
          <span>posts no feed</span>
        </div>
        <div>
          <strong>{roleLabel}</strong>
          <span>cargo atual</span>
        </div>
      </div>

      <Link className="button button--secondary" to="/profile">
        Ver perfil
      </Link>
    </aside>
  )
}
