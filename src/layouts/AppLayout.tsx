import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function AppLayout() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__content">
          <Link className="app-logo" to="/">
            Adoption
          </Link>

          <nav className="app-nav" aria-label="Navegacao principal">
            <NavLink to="/">Inicio</NavLink>
            <NavLink to="/animals">Animais</NavLink>
            {user ? (
              <>
                <NavLink to="/animals/new">Cadastrar animal</NavLink>
                <NavLink to="/my-animals">Meus animais</NavLink>
                <NavLink to="/my-adoption-requests">Meus pedidos</NavLink>
                <NavLink to="/received-adoption-requests">Recebidos</NavLink>
                <NavLink to="/profile">Perfil</NavLink>
                <div className="session-summary">
                  <span>
                    {user.name} - {user.userType}
                  </span>
                  <button type="button" onClick={handleLogout}>
                    Sair
                  </button>
                </div>
              </>
            ) : (
              <NavLink to="/login">Login</NavLink>
            )}
          </nav>
        </div>
      </header>

      <main className="app-main">
        <Outlet />
      </main>

      <footer className="app-footer">
        <div className="app-footer__content">
          <span>Adoption Project</span>
        </div>
      </footer>
    </div>
  )
}
