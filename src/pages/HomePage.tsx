import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const adoptionStories = [
  {
    id: 1,
    title: 'Luna encontrou a Camila',
    location: 'Joao Pessoa, PB',
    imageUrl:
      'https://images.unsplash.com/photo-1560743641-3914f2c45636?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 2,
    title: 'Thor ganhou um novo quintal',
    location: 'Campina Grande, PB',
    imageUrl:
      'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 3,
    title: 'Mel virou parte da rotina',
    location: 'Recife, PE',
    imageUrl:
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 4,
    title: 'Nina achou colo e paciencia',
    location: 'Natal, RN',
    imageUrl:
      'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80',
  },
]

export function HomePage() {
  const { isAuthenticated } = useAuth()
  const [activeStoryIndex, setActiveStoryIndex] = useState(0)
  const [heroOffset, setHeroOffset] = useState(0)

  function showPreviousStory() {
    setActiveStoryIndex((currentIndex) =>
      currentIndex === 0 ? adoptionStories.length - 1 : currentIndex - 1,
    )
  }

  function showNextStory() {
    setActiveStoryIndex((currentIndex) =>
      currentIndex === adoptionStories.length - 1 ? 0 : currentIndex + 1,
    )
  }

  useEffect(() => {
    const intervalId = window.setInterval(showNextStory, 4500)

    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    const revealElements = Array.from(
      document.querySelectorAll<HTMLElement>('.reveal-on-scroll'),
    )
    let animationFrameId = 0

    function revealVisibleElements() {
      const revealLimit = window.innerHeight * 0.82

      revealElements.forEach((element) => {
        if (element.classList.contains('is-visible')) {
          return
        }

        const elementTop = element.getBoundingClientRect().top

        if (elementTop < revealLimit) {
          element.classList.add('is-visible')
        }
      })
    }

    function scheduleRevealCheck() {
      window.cancelAnimationFrame(animationFrameId)
      animationFrameId = window.requestAnimationFrame(revealVisibleElements)
    }

    revealVisibleElements()
    window.addEventListener('scroll', scheduleRevealCheck, { passive: true })
    window.addEventListener('resize', scheduleRevealCheck)

    return () => {
      window.cancelAnimationFrame(animationFrameId)
      window.removeEventListener('scroll', scheduleRevealCheck)
      window.removeEventListener('resize', scheduleRevealCheck)
    }
  }, [])

  useEffect(() => {
    function handleScroll() {
      setHeroOffset(Math.min(window.scrollY * 0.14, 70))
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section className="home-page">
      <div
        className="home-hero"
        style={{ backgroundPosition: `center calc(50% + ${heroOffset}px)` }}
      >
        <div className="home-hero__content">
          <p className="eyebrow">Adocao responsavel</p>
          <h1>Encontre uma nova familia para cada animal</h1>
          <p>
            Conecte pessoas que querem adotar com tutores que buscam um lar
            seguro, carinhoso e preparado para receber um novo companheiro.
          </p>

          <div className="actions">
            <Link className="button" to="/animals">
              Ver animais
            </Link>
            {isAuthenticated ? (
              <Link className="button button--secondary" to="/animals/new">
                Cadastrar animal
              </Link>
            ) : (
              <Link className="button button--secondary" to="/register">
                Criar conta
              </Link>
            )}
          </div>
        </div>
      </div>

      <div
        className="home-stats reveal-on-scroll"
        aria-label="Resumo da plataforma"
      >
        <article>
          <strong>+ cuidado</strong>
          <span>Pedidos organizados entre adotantes e tutores.</span>
        </article>

        <article>
          <strong>+ clareza</strong>
          <span>Fotos, localizacao e detalhes reunidos em um so lugar.</span>
        </article>

        <article>
          <strong>+ controle</strong>
          <span>Acompanhe solicitacoes enviadas e recebidas.</span>
        </article>
      </div>

      <section className="home-section home-section--intro reveal-on-scroll">
        <div>
          <p className="eyebrow">Animais esperando</p>
          <h2>Uma listagem feita para decidir com carinho</h2>
        </div>
        <p>
          Cada perfil mostra fotos, idade, porte, sexo, saude, localizacao e
          dados do tutor. Assim a pessoa interessada consegue entender melhor o
          animal antes de enviar uma solicitacao.
        </p>
      </section>

      <div className="home-feature-grid reveal-on-scroll">
        <article className="home-feature home-feature--photo">
          <div>
            <span>Fotos reais</span>
            <h3>Galeria do animal</h3>
            <p>
              O cadastro aceita varias fotos e deixa o tutor escolher o melhor
              corte para apresentar o animal com mais cuidado.
            </p>
          </div>
        </article>

        <article className="home-feature">
          <span>Status claro</span>
          <h3>Disponibilidade visivel</h3>
          <p>
            Os cards mostram quando o animal esta disponivel e evitam pedidos
            confusos quando o processo ja avancou.
          </p>
        </article>

        <article className="home-feature">
          <span>Localizacao</span>
          <h3>Mais contexto antes do contato</h3>
          <p>
            Cidade, estado e responsavel aparecem no detalhe para ajudar a
            alinhar distancia, logistica e responsabilidade.
          </p>
        </article>
      </div>

      <section className="home-section reveal-on-scroll">
        <div>
          <p className="eyebrow">Como funciona</p>
          <h2>Do interesse ao pedido, tudo fica registrado</h2>
        </div>
      </section>

      <div
        className="home-highlights reveal-on-scroll"
        aria-label="Etapas da adocao"
      >
        <article>
          <span>01</span>
          <h2>Conheca</h2>
          <p>Veja animais disponiveis com fotos, detalhes e localizacao.</p>
        </article>

        <article>
          <span>02</span>
          <h2>Solicite</h2>
          <p>Envie uma mensagem ao tutor contando por que quer adotar.</p>
        </article>

        <article>
          <span>03</span>
          <h2>Acompanhe</h2>
          <p>Consulte seus pedidos e responda solicitacoes recebidas.</p>
        </article>
      </div>

      <section className="home-stories-section reveal-on-scroll">
        <div className="home-section home-section--compact">
          <div>
            <p className="eyebrow">Historias reais</p>
            <h2>Novos donos, novas rotinas e novos começos</h2>
          </div>
          <p>
            Algumas adocoes viram uma mudanca pequena no comeco, mas enorme na
            vida de quem chega e de quem recebe.
          </p>
        </div>

        <div className="home-stories-carousel" aria-label="Historias de adocao">
          <div
            className="home-stories-carousel__track"
            style={{ transform: `translateX(-${activeStoryIndex * 100}%)` }}
          >
            {adoptionStories.map((story) => (
              <article className="home-story-card" key={story.id}>
                <img src={story.imageUrl} alt={story.title} />
                <div>
                  <h3>{story.title}</h3>
                  <p>{story.location}</p>
                </div>
              </article>
            ))}
          </div>

          <button
            className="home-stories-carousel__button home-stories-carousel__button--previous"
            type="button"
            onClick={showPreviousStory}
            aria-label="Ver historia anterior"
          >
            ‹
          </button>
          <button
            className="home-stories-carousel__button home-stories-carousel__button--next"
            type="button"
            onClick={showNextStory}
            aria-label="Ver proxima historia"
          >
            ›
          </button>

          <div className="home-stories-carousel__dots" aria-hidden="true">
            {adoptionStories.map((story, index) => (
              <span
                className={
                  index === activeStoryIndex
                    ? 'home-stories-carousel__dot home-stories-carousel__dot--active'
                    : 'home-stories-carousel__dot'
                }
                key={story.id}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="home-owner-section reveal-on-scroll">
        <div className="home-owner-section__image" aria-hidden="true" />
        <div className="home-owner-section__content">
          <p className="eyebrow">Para tutores</p>
          <h2>Cadastre animais e gerencie os pedidos recebidos</h2>
          <p>
            O tutor acompanha quem demonstrou interesse, ve a mensagem enviada
            pelo adotante e pode aprovar ou rejeitar a solicitacao com mais
            seguranca.
          </p>

          <div className="actions">
            <Link className="button" to={isAuthenticated ? '/animals/new' : '/login'}>
              Cadastrar animal
            </Link>
            <Link className="button button--secondary" to="/received-adoption-requests">
              Ver recebidos
            </Link>
          </div>
        </div>
      </section>

      <section className="home-final-cta reveal-on-scroll">
        <p className="eyebrow">Comece agora</p>
        <h2>Procure um animal ou anuncie um companheiro para adocao</h2>
        <div className="actions">
          <Link className="button" to="/animals">
            Explorar animais
          </Link>
          <Link className="button button--secondary" to={isAuthenticated ? '/my-adoption-requests' : '/register'}>
            {isAuthenticated ? 'Meus pedidos' : 'Criar conta'}
          </Link>
        </div>
      </section>
    </section>
  )
}
