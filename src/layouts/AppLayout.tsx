import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getUserById } from '../services/userService'
import type { UserResponse } from '../types'
import adotLogoUrl from '../assets/adot-logo.png'
import adotLogoTextUrl from '../assets/adot-logo-text.png'

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10.5V20h5v-5h4v5h5v-9.5" />
    </svg>
  )
}

function FeedIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 6h14" />
      <path d="M5 12h14" />
      <path d="M5 18h9" />
    </svg>
  )
}

function AnimalIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8.5 11.5c1.2-1.3 5.8-1.3 7 0 1.4 1.5 2.9 3.2 2.1 5.1-.7 1.7-2.8 1.2-5.6 1.2s-4.9.5-5.6-1.2c-.8-1.9.7-3.6 2.1-5.1Z" />
      <path d="M5.5 10.5c1.1 0 2-1.1 2-2.5s-.9-2.5-2-2.5-2 1.1-2 2.5.9 2.5 2 2.5Z" />
      <path d="M18.5 10.5c1.1 0 2-1.1 2-2.5s-.9-2.5-2-2.5-2 1.1-2 2.5.9 2.5 2 2.5Z" />
      <path d="M10 8.5c1.1 0 2-1.1 2-2.5s-.9-2.5-2-2.5S8 4.6 8 6s.9 2.5 2 2.5Z" />
      <path d="M14 8.5c1.1 0 2-1.1 2-2.5s-.9-2.5-2-2.5-2 1.1-2 2.5.9 2.5 2 2.5Z" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export function AppLayout() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [profile, setProfile] = useState<UserResponse | null>(null)

  useEffect(() => {
    if (!user) {
      setProfile(null)
      return
    }

    const userId = user.userId

    async function loadProfile() {
      try {
        const userProfile = await getUserById(userId)
        setProfile(userProfile)
      } catch {
        setProfile(null)
      }
    }

    loadProfile()
  }, [user])

  function handleLogout() {
    logout()
    setIsUserMenuOpen(false)
    navigate('/login')
  }

  const profilePhotoUrl = profile?.profilePhotoUrl

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__content">
          <Link className="app-logo" to="/">
            <img src={adotLogoTextUrl} alt="Adot" />
          </Link>

          <nav
            className="app-nav app-nav--center"
            aria-label="Navegacao principal"
          >
            {user ? (
              <>
                <NavLink className="app-icon-link" to="/" title="Inicio">
                  <HomeIcon />
                  <span>Inicio</span>
                </NavLink>
                <NavLink className="app-icon-link" to="/feed" title="Feed">
                  <FeedIcon />
                  <span>Feed</span>
                </NavLink>
                <NavLink
                  className="app-icon-link"
                  to="/animal-area"
                  title="Animais"
                >
                  <AnimalIcon />
                  <span>Animais</span>
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/">Inicio</NavLink>
                <NavLink to="/animals">Animais</NavLink>
              </>
            )}
          </nav>

          <div className="app-header__actions">
            {user ? (
              <div className="user-menu">
                <button
                  className="user-menu__trigger"
                  type="button"
                  onClick={() =>
                    setIsUserMenuOpen((currentValue) => !currentValue)
                  }
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="menu"
                >
                  <span className="user-menu__avatar">
                    {profilePhotoUrl ? (
                      <img src={profilePhotoUrl} alt="" />
                    ) : (
                      getInitials(user.name)
                    )}
                  </span>
                  <ChevronDownIcon />
                </button>

                {isUserMenuOpen && (
                  <div className="user-menu__dropdown" role="menu">
                    <div className="user-menu__summary">
                      <strong>{user.name}</strong>
                      <span>{user.userType}</span>
                    </div>
                    <Link
                      to="/profile"
                      role="menuitem"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Perfil
                    </Link>
                    <button type="button" role="menuitem" onClick={handleLogout}>
                      Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <NavLink className="button button--secondary" to="/login">
                Login
              </NavLink>
            )}
          </div>
        </div>
      </header>

      <main className="app-main">
        <Outlet />
      </main>

      <footer className="app-footer">
        <div className="app-footer__content">
          <img src={adotLogoUrl} alt="" aria-hidden="true" />
          <span>Adot</span>
        </div>
      </footer>
    </div>
  )
}
