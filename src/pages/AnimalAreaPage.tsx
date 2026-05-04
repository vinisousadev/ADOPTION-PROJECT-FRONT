import { Link } from 'react-router-dom'

const animalActions = [
  {
    title: 'Animais disponiveis',
    description: 'Veja todos os animais que estao aguardando uma familia.',
    to: '/animals',
  },
  {
    title: 'Meus animais',
    description: 'Acompanhe e gerencie os animais cadastrados por voce.',
    to: '/my-animals',
  },
  {
    title: 'Pedidos recebidos',
    description: 'Analise quem solicitou adocao dos seus animais.',
    to: '/received-adoption-requests',
  },
  {
    title: 'Solicitacoes feitas',
    description: 'Veja o andamento dos pedidos de adocao que voce enviou.',
    to: '/my-adoption-requests',
  },
  {
    title: 'Cadastrar animal',
    description: 'Adicione um novo animal com dados, fotos e localizacao.',
    to: '/animals/new',
  },
]

export function AnimalAreaPage() {
  return (
    <section className="animal-area-page">
      <div className="page">
        <div>
          <p className="eyebrow">Animais</p>
          <h1>Central dos animais</h1>
        </div>

        <p>
          Escolha o que voce quer fazer: ver animais disponiveis, acompanhar
          pedidos ou cadastrar um novo animal.
        </p>
      </div>

      <div className="animal-area-grid">
        {animalActions.map((action) => (
          <Link className="animal-area-card" key={action.to} to={action.to}>
            <span>{action.title}</span>
            <p>{action.description}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
