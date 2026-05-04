import { useEffect, useState } from 'react'
import type { FormEvent, UIEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AnimalPhotoCarousel } from '../components/AnimalPhotoCarousel'
import { useAuth } from '../contexts/AuthContext'
import { createAdoptionRequest } from '../services/adoptionRequestService'
import { getAnimalPhotos } from '../services/animalPhotoService'
import { getAnimalById } from '../services/animalService'
import type { AnimalPhotoResponse, AnimalResponse } from '../types'
import {
  formatAnimalAge,
  formatAnimalLocation,
  formatAnimalOwnerName,
  formatAnimalSex,
  formatAnimalSize,
  formatAnimalStatus,
  formatAnimalWeight,
  formatYesNo,
} from '../utils/animalFormatters'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'

const adoptionResponsibilityTerms = [
  'Lembrando que adotar os gatos/cachorros nao e nenhum favor, essa decisao deve ser tomada por amor e compaixao. Adocoes que considerarmos irresponsaveis serao negadas.',
  'Ao adotar o animal descrito no site, declaro-me apto a assumir a guarda e a responsabilidade sobre o mesmo, estando de acordo com todas as orientacoes a seguir:',
  'Declaro estar ciente de todos os cuidados que este animal exige para sua guarda e manutencao, alem de conhecer todos os riscos inerentes a especie e raca no convivio com humanos, estando apto a guarda-lo e vigia-lo, comprometendo-me a proporcionar boas condicoes de alojamento, alimentacao, vacinas e espaco fisico que possibilite o animal se exercitar.',
  'Declaro, ainda, que todos que convivem comigo na residencia estao de acordo com a chegada do animal. Responsabilizo-me por preservar a saude e integridade do animal e a submete-lo aos cuidados medico-veterinarios sempre que necessario.',
  'Comprometo-me a nao transmitir a posse deste animal a outrem sem o conhecimento do doador, a permitir acesso do doador ao local onde se encontra o animal para averiguacao de suas condicoes. Tenho conhecimento de que, caso seja contestado por parte do doador situacao inadequada para o bem-estar do animal, perderei a sua guarda, sem prejuizo das penalidades legais.',
  'Comprometo-me a castrar/esterilizar o animal adotado assim que o mesmo atingir a maturidade sexual, por volta dos 06 meses, contribuindo para o controle da populacao de animais domesticos.',
  'Comprometo-me a cumprir toda a legislacao vigente, municipal, estadual e federal relativa a posse de animais.',
  'Declaro-me, assim, ciente das normas acima, as quais aceito, assinando o presente Termo de Responsabilidade, assumindo plenamente os deveres que dele constam.',
]

export function AnimalDetailsPage() {
  const { id } = useParams()
  const { isAuthenticated, user } = useAuth()
  const [animal, setAnimal] = useState<AnimalResponse | null>(null)
  const [photos, setPhotos] = useState<AnimalPhotoResponse[]>([])
  const [adoptionMessage, setAdoptionMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [adoptionErrorMessage, setAdoptionErrorMessage] = useState('')
  const [adoptionSuccessMessage, setAdoptionSuccessMessage] = useState('')
  const [hasReadAdoptionTerms, setHasReadAdoptionTerms] = useState(false)
  const [acceptsAdoptionTerms, setAcceptsAdoptionTerms] = useState(false)
  const [pendingTermsAcceptance, setPendingTermsAcceptance] = useState(false)
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmittingAdoptionRequest, setIsSubmittingAdoptionRequest] =
    useState(false)

  const animalId = Number(id)

  function handleTermsScroll(event: UIEvent<HTMLDivElement>) {
    const termsElement = event.currentTarget
    const reachedEnd =
      termsElement.scrollTop + termsElement.clientHeight >=
      termsElement.scrollHeight - 8

    if (reachedEnd) {
      setHasReadAdoptionTerms(true)
    }
  }

  function openTermsModal() {
    setPendingTermsAcceptance(acceptsAdoptionTerms)
    setIsTermsModalOpen(true)
  }

  function closeTermsModal() {
    setIsTermsModalOpen(false)
  }

  function confirmTermsAcceptance() {
    setAcceptsAdoptionTerms(true)
    setPendingTermsAcceptance(false)
    setIsTermsModalOpen(false)
  }

  useEffect(() => {
    async function loadAnimalDetails() {
      if (!animalId) {
        setErrorMessage('Animal nao encontrado.')
        setIsLoading(false)
        return
      }

      try {
        const [animalResponse, photosResponse] = await Promise.all([
          getAnimalById(animalId),
          getAnimalPhotos(animalId),
        ])

        setAnimal(animalResponse)
        setPhotos(photosResponse.content)
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error))
      } finally {
        setIsLoading(false)
      }
    }

    loadAnimalDetails()
  }, [animalId])

  async function handleAdoptionRequestSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAdoptionErrorMessage('')
    setAdoptionSuccessMessage('')

    if (!animal) {
      return
    }

    if (!isAuthenticated) {
      setAdoptionErrorMessage('Faca login para solicitar a adocao.')
      return
    }

    if (user?.userId === animal.userId) {
      setAdoptionErrorMessage('Voce nao pode solicitar adocao do proprio animal.')
      return
    }

    if (!hasReadAdoptionTerms || !acceptsAdoptionTerms) {
      setAdoptionErrorMessage(
        'Leia o termo de responsabilidade ate o final e marque o aceite para continuar.',
      )
      return
    }

    setIsSubmittingAdoptionRequest(true)

    try {
      await createAdoptionRequest({
        animalId: animal.id,
        message: adoptionMessage.trim() || undefined,
      })

      setAdoptionMessage('')
      setAcceptsAdoptionTerms(false)
      setPendingTermsAcceptance(false)
      setHasReadAdoptionTerms(false)
      setAdoptionSuccessMessage('Solicitacao de adocao enviada com sucesso.')
    } catch (error) {
      setAdoptionErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsSubmittingAdoptionRequest(false)
    }
  }

  if (isLoading) {
    return (
      <section className="page">
        <p>Carregando animal...</p>
      </section>
    )
  }

  if (errorMessage || !animal) {
    return (
      <section className="page">
        <p className="form-error">{errorMessage || 'Animal nao encontrado.'}</p>
        <div className="actions">
          <Link className="button button--secondary" to="/animals">
            Voltar para animais
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="animal-details">
      <div className="animal-details__media">
        <AnimalPhotoCarousel animalName={animal.animalName} photos={photos} />
      </div>

      <div className="animal-details__content">
        <div>
          <p className="eyebrow">{formatAnimalStatus(animal.status)}</p>
          <h1>{animal.animalName}</h1>
          <p>
            {animal.species}
            {animal.breed ? ` - ${animal.breed}` : ''}
          </p>
        </div>

        <dl className="animal-details__facts">
          <div>
            <dt>Idade</dt>
            <dd>{formatAnimalAge(animal.ageValue, animal.ageUnit)}</dd>
          </div>
          <div>
            <dt>Porte</dt>
            <dd>{formatAnimalSize(animal.animalSize)}</dd>
          </div>
          <div>
            <dt>Sexo</dt>
            <dd>{formatAnimalSex(animal.sex)}</dd>
          </div>
          <div>
            <dt>Peso</dt>
            <dd>{formatAnimalWeight(animal.weightKg)}</dd>
          </div>
          <div>
            <dt>Vacinado</dt>
            <dd>{formatYesNo(animal.vaccinated)}</dd>
          </div>
          <div>
            <dt>Castrado</dt>
            <dd>{formatYesNo(animal.neutered)}</dd>
          </div>
          <div>
            <dt>Localizacao</dt>
            <dd>{formatAnimalLocation(animal)}</dd>
          </div>
          <div>
            <dt>Responsavel</dt>
            <dd>{formatAnimalOwnerName(animal.ownerName)}</dd>
          </div>
        </dl>

        <div className="animal-details__description">
          <h2>Descricao</h2>
          <p>{animal.description || 'Sem descricao informada.'}</p>
        </div>

        <form className="adoption-request-panel" onSubmit={handleAdoptionRequestSubmit}>
          <div>
            <h2>Solicitar adocao</h2>
            <p>Envie uma mensagem para o responsavel pelo animal.</p>
          </div>

          {!isAuthenticated && (
            <p className="form-error">Voce precisa entrar para solicitar adocao.</p>
          )}

          {user?.userId === animal.userId && (
            <p className="empty-state">
              Este animal foi cadastrado por voce.
            </p>
          )}

          <div className="form-field">
            <label htmlFor="adoptionMessage">
              Conte por que voce quer adotar esse animal
            </label>
            <textarea
              id="adoptionMessage"
              value={adoptionMessage}
              onChange={(event) => setAdoptionMessage(event.target.value)}
              maxLength={500}
              rows={4}
              disabled={!isAuthenticated || user?.userId === animal.userId}
            />
          </div>

          <div className="adoption-terms-summary">
            <div>
              <h3>Termo de responsabilidade</h3>
              <p>
                Leia e aceite o termo para habilitar o envio da solicitacao.
              </p>
            </div>

            <button
              className="button button--secondary"
              type="button"
              disabled={!isAuthenticated || user?.userId === animal.userId}
              onClick={openTermsModal}
            >
              {acceptsAdoptionTerms ? 'Termo aceito' : 'Ler termo'}
            </button>
          </div>

          {adoptionErrorMessage && (
            <p className="form-error">{adoptionErrorMessage}</p>
          )}
          {adoptionSuccessMessage && (
            <p className="form-success">{adoptionSuccessMessage}</p>
          )}

          <button
            className="button"
            type="submit"
            disabled={
              !isAuthenticated ||
              user?.userId === animal.userId ||
              !hasReadAdoptionTerms ||
              !acceptsAdoptionTerms ||
              isSubmittingAdoptionRequest
            }
          >
            {isSubmittingAdoptionRequest
              ? 'Enviando solicitacao...'
              : 'Solicitar adocao'}
          </button>
        </form>

        {isTermsModalOpen && (
          <div
            className="modal-backdrop"
            role="presentation"
            onClick={closeTermsModal}
          >
            <section
              className="terms-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="termsModalTitle"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="terms-modal__header">
                <div>
                  <p className="eyebrow">Adocao responsavel</p>
                  <h2 id="termsModalTitle">Termo de responsabilidade</h2>
                </div>
                <button
                  className="terms-modal__close"
                  type="button"
                  onClick={closeTermsModal}
                  aria-label="Fechar termo"
                >
                  ×
                </button>
              </div>

              <div
                className="terms-modal__content"
                onScroll={handleTermsScroll}
                tabIndex={0}
              >
                {adoptionResponsibilityTerms.map((term) => (
                  <p key={term}>{term}</p>
                ))}
              </div>

              <div className="terms-modal__footer">
                <label className="adoption-terms__acceptance">
                  <input
                    type="checkbox"
                    checked={pendingTermsAcceptance}
                    disabled={!hasReadAdoptionTerms}
                    onChange={(event) =>
                      setPendingTermsAcceptance(event.target.checked)
                    }
                  />
                  <span>
                    Li e aceito o termo de responsabilidade pela adocao.
                  </span>
                </label>

                {!hasReadAdoptionTerms && (
                  <p className="field-hint">
                    Role ate o final do termo para liberar o aceite.
                  </p>
                )}

                <div className="actions">
                  <button
                    className="button"
                    type="button"
                    disabled={!hasReadAdoptionTerms || !pendingTermsAcceptance}
                    onClick={confirmTermsAcceptance}
                  >
                    Confirmar aceite
                  </button>
                  <button
                    className="button button--secondary"
                    type="button"
                    onClick={closeTermsModal}
                  >
                    Voltar
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        <div className="actions">
          <Link className="button button--secondary" to="/animals">
            Voltar
          </Link>
        </div>
      </div>
    </section>
  )
}
