import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../services/notificationService'
import { getUserById } from '../services/userService'
import type { NotificationResponse, UserResponse } from '../types'
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

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5 7 7 0 1 0 20.5 15.5Z" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 8h18c0-1-3-1-3-8" />
      <path d="M10 20a2 2 0 0 0 4 0" />
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
  const notificationMenuRef = useRef<HTMLDivElement | null>(null)
  const userMenuRef = useRef<HTMLDivElement | null>(null)
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationResponse[]>([])
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0)
  const [profile, setProfile] = useState<UserResponse | null>(null)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const storedTheme = localStorage.getItem('adot:theme')

    return storedTheme === 'dark' ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('adot:theme', theme)
  }, [theme])

  useEffect(() => {
    if (!user) {
      setProfile(null)
      setNotifications([])
      setUnreadNotificationCount(0)
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

  useEffect(() => {
    if (!user) {
      return
    }

    async function loadNotifications() {
      try {
        const [notificationsResponse, unreadCount] = await Promise.all([
          getNotifications(),
          getUnreadNotificationCount(),
        ])

        setNotifications(notificationsResponse.content)
        setUnreadNotificationCount(unreadCount)
      } catch {
        setNotifications([])
        setUnreadNotificationCount(0)
      }
    }

    loadNotifications()

    const intervalId = window.setInterval(loadNotifications, 45000)

    return () => window.clearInterval(intervalId)
  }, [user])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false)
      }

      if (
        notificationMenuRef.current &&
        !notificationMenuRef.current.contains(event.target as Node)
      ) {
        setIsNotificationMenuOpen(false)
      }
    }

    if (isUserMenuOpen || isNotificationMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isUserMenuOpen, isNotificationMenuOpen])

  function handleLogout() {
    logout()
    setIsUserMenuOpen(false)
    navigate('/login')
  }

  function toggleTheme() {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))
  }

  async function handleNotificationClick(notification: NotificationResponse) {
    try {
      if (!notification.read) {
        await markNotificationAsRead(notification.id)
        setUnreadNotificationCount((currentCount) => Math.max(currentCount - 1, 0))
        setNotifications((currentNotifications) =>
          currentNotifications.map((currentNotification) =>
            currentNotification.id === notification.id
              ? { ...currentNotification, read: true, readAt: new Date().toISOString() }
              : currentNotification,
          ),
        )
      }
    } finally {
      setIsNotificationMenuOpen(false)

      if (notification.actionUrl) {
        navigate(notification.actionUrl)
      }
    }
  }

  async function handleMarkAllNotificationsAsRead() {
    await markAllNotificationsAsRead()
    setUnreadNotificationCount(0)
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => ({
        ...notification,
        read: true,
        readAt: notification.readAt ?? new Date().toISOString(),
      })),
    )
  }

  const profilePhotoUrl = profile?.profilePhotoUrl
  const isDarkTheme = theme === 'dark'

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
            <button
              className="theme-toggle"
              type="button"
              onClick={toggleTheme}
              aria-label={
                isDarkTheme ? 'Ativar tema claro' : 'Ativar tema escuro'
              }
              aria-pressed={isDarkTheme}
            >
              <span className="theme-toggle__track">
                <span className="theme-toggle__icon theme-toggle__icon--sun">
                  <SunIcon />
                </span>
                <span className="theme-toggle__icon theme-toggle__icon--moon">
                  <MoonIcon />
                </span>
                <span className="theme-toggle__thumb">
                  {isDarkTheme ? <MoonIcon /> : <SunIcon />}
                </span>
              </span>
            </button>

            {user ? (
              <div
                ref={notificationMenuRef}
                className="notification-menu"
              >
                <button
                  className="notification-menu__trigger"
                  type="button"
                  onClick={() =>
                    setIsNotificationMenuOpen((currentValue) => !currentValue)
                  }
                  aria-expanded={isNotificationMenuOpen}
                  aria-haspopup="menu"
                  aria-label="Abrir notificacoes"
                >
                  <BellIcon />
                  {unreadNotificationCount > 0 && (
                    <span className="notification-menu__badge">
                      {unreadNotificationCount > 9
                        ? '9+'
                        : unreadNotificationCount}
                    </span>
                  )}
                </button>

                {isNotificationMenuOpen && (
                  <div className="notification-menu__dropdown" role="menu">
                    <div className="notification-menu__header">
                      <strong>Notificacoes</strong>
                      {unreadNotificationCount > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllNotificationsAsRead}
                        >
                          Marcar lidas
                        </button>
                      )}
                    </div>

                    {notifications.length > 0 ? (
                      <div className="notification-menu__list">
                        {notifications.map((notification) => (
                          <button
                            className={
                              notification.read
                                ? 'notification-menu__item'
                                : 'notification-menu__item notification-menu__item--unread'
                            }
                            key={notification.id}
                            type="button"
                            role="menuitem"
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <strong>{notification.title}</strong>
                            <span>{notification.message}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="notification-menu__empty">
                        Nenhuma notificacao ainda.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : null}

            {user ? (
              <div
                ref={userMenuRef}
                className="user-menu"
              >
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
                    <Link
                      to="/animals/new"
                      role="menuitem"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Cadastrar animal
                    </Link>
                    <Link
                      to="/my-animals"
                      role="menuitem"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Meus animais
                    </Link>
                    <Link
                      to="/received-adoption-requests"
                      role="menuitem"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Pedidos recebidos
                    </Link>
                    <Link
                      to="/my-adoption-requests"
                      role="menuitem"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Solicitacoes feitas
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
