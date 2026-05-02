import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="page">
      <p className="eyebrow">404</p>
      <h1>Pagina nao encontrada</h1>
      <p>A rota acessada nao existe ou ainda nao foi criada no frontend.</p>

      <div className="actions">
        <Link className="button" to="/">
          Voltar para inicio
        </Link>
      </div>
    </section>
  )
}
